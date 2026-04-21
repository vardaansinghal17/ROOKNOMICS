import { useState, useEffect, useRef, useCallback } from 'react';
import { GlossaryTerm, WikiResult, UseLearnSearchReturn } from '@/types/learn';
import { glossaryTerms } from '@/data/glossary';

const FINANCE_KEYWORDS = [
  'stock', 'market', 'invest', 'trading', 'financial',
  'fund', 'portfolio', 'asset', 'return', 'risk',
  'equity', 'bond', 'price', 'economic', 'capital',
  'securities', 'exchange', 'broker', 'dividend', 'shares',
  'nasdaq', 'nyse', 'futures', 'options', 'hedge',
  'volatility', 'liquidity', 'derivative', 'commodity',
  'index', 'indices', 'rally', 'correction', 'circuit',
  'halt', 'suspension', 'regulation', 'sec', 'fed'
];

function isFinanceRelated(text: string): boolean {
  const lower = text.toLowerCase();
  return FINANCE_KEYWORDS.some((kw) => lower.includes(kw));
}

export function useLearnSearch(): UseLearnSearchReturn {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [isWikiLoading, setIsWikiLoading] = useState(false);
  const [wikiResult, setWikiResult] = useState<WikiResult | null>(null);
  const [wikiError, setWikiError] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

  const wikiDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── CLIENT-SIDE FILTERING ───────────────────────────────────────────────
  const results: GlossaryTerm[] = (() => {
    let filtered = glossaryTerms;

    if (activeCategory) {
      filtered = filtered.filter((t) => t.category === activeCategory);
    }

    if (!query) return filtered;

    const q = query.toLowerCase();

    const exactTerm: GlossaryTerm[] = [];
    const fullNameMatch: GlossaryTerm[] = [];
    const definitionMatch: GlossaryTerm[] = [];

    filtered.forEach((t) => {
      const termLower = t.term.toLowerCase();
      const fullNameLower = t.fullName.toLowerCase();
      const defLower = t.definition.toLowerCase();
      const tagMatch = t.tags.some((tag) => tag.toLowerCase().includes(q));
      const catMatch = t.category.toLowerCase().includes(q);

      if (termLower.includes(q)) {
        exactTerm.push(t);
      } else if (fullNameLower.includes(q)) {
        fullNameMatch.push(t);
      } else if (defLower.includes(q) || tagMatch || catMatch) {
        definitionMatch.push(t);
      }
    });

    return [...exactTerm, ...fullNameMatch, ...definitionMatch];
  })();

  // ── AUTOCOMPLETE SUGGESTIONS ────────────────────────────────────────────
  const suggestions: string[] = (() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    const seen = new Set<string>();
    const out: string[] = [];

    glossaryTerms.forEach((t) => {
      if (t.term.toLowerCase().includes(q) && !seen.has(t.term)) {
        seen.add(t.term);
        out.push(t.term);
      }
    });

    glossaryTerms.forEach((t) => {
      if (t.fullName.toLowerCase().includes(q) && !seen.has(t.fullName)) {
        seen.add(t.fullName);
        out.push(t.fullName);
      }
    });

    return out.slice(0, 6);
  })();

  // ── WIKIPEDIA FALLBACK ──────────────────────────────────────────────────
  const fetchWikiWithFallback = useCallback(async (q: string) => {
    const variants = [
      `${q} stock market`,
      `${q} finance`,
      `${q} trading`,
      q
    ]
    for (const variant of variants) {
      try {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(variant)}`)
        if (!res.ok) continue
        const data = await res.json()
        if (data.type?.includes('not_found')) continue
        const extract: string = data.extract || ''
        if (isFinanceRelated(extract)) {
          return {
            title: data.title, extract,
            url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(q)}`,
            thumbnail: data.thumbnail?.source
          }
        }
      } catch { continue }
    }
    return null
  }, [])

  const fetchWiki = useCallback(async (q: string) => {
    setIsWikiLoading(true)
    setWikiResult(null)
    setWikiError(null)
    const result = await fetchWikiWithFallback(q)
    if (result) {
      setWikiResult(result)
    } else {
      setWikiError('No finance-related results found for that term. Try searching for indicators, strategies, or metrics.')
    }
    setIsWikiLoading(false)
  }, [fetchWikiWithFallback]);

  useEffect(() => {
    // Clear wiki state when query changes
    setWikiResult(null);
    setWikiError(null);

    if (wikiDebounceRef.current) clearTimeout(wikiDebounceRef.current);

    // Only trigger Wikipedia when glossary has no results and query is >= 3 chars
    if (query.length >= 3 && results.length === 0) {
      wikiDebounceRef.current = setTimeout(() => {
        fetchWiki(query);
      }, 500);
    }

    return () => {
      if (wikiDebounceRef.current) clearTimeout(wikiDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeCategory]);

  // ── ESC KEY CLOSES PANEL ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedTerm(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return {
    query,
    setQuery,
    activeCategory,
    setActiveCategory,
    results,
    suggestions,
    isWikiLoading,
    wikiResult,
    wikiError,
    selectedTerm,
    setSelectedTerm,
    totalCount: glossaryTerms.length,
    filteredCount: results.length,
  };
}
