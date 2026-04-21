import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Activity,
  GitBranch,
  Layers,
  Star,
  BarChart2,
  Maximize2,
  RefreshCw,
  Shield,
  Target,
  Sliders,
  Scale,
  Zap,
  AlertTriangle,
  Percent,
  RotateCcw,
  Rocket,
  ArrowLeftRight,
  Clock,
  Calendar,
  BarChart,
  Sun,
  Navigation,
  PieChart,
  Package,
  Award,
  DollarSign,
  Droplets,
  Brain,
  AlertCircle,
} from 'lucide-react';
import { useLearnSearch } from '@/hooks/useLearnSearch';
import { glossaryTerms } from '@/data/glossary';
import type { GlossaryCategory, GlossaryTerm } from '@/types/learn';

const ICON_MAP: Record<string, React.ElementType> = {
  TrendingUp,
  TrendingDown,
  Activity,
  GitBranch,
  Layers,
  Star,
  BarChart2,
  Maximize2,
  RefreshCw,
  Shield,
  Target,
  Sliders,
  Scale,
  Zap,
  AlertTriangle,
  Percent,
  RotateCcw,
  Rocket,
  ArrowLeftRight,
  Clock,
  Calendar,
  BarChart,
  Sun,
  Navigation,
  PieChart,
  Package,
  Award,
  DollarSign,
  Droplets,
  Brain,
  AlertCircle,
  X,
};

const CAT_COLORS: Record<
  GlossaryCategory,
  { bg: string; icon: string; pill: string; pillText: string; border: string }
> = {
  indicator: {
    bg: 'bg-[#111827]',
    icon: 'text-emerald-400',
    pill: 'bg-emerald-400/10',
    pillText: 'text-emerald-300',
    border: 'border-emerald-400/20',
  },
  risk: {
    bg: 'bg-[#1A1111]',
    icon: 'text-rose-400',
    pill: 'bg-rose-400/10',
    pillText: 'text-rose-300',
    border: 'border-rose-400/20',
  },
  strategy: {
    bg: 'bg-[#0F1713]',
    icon: 'text-cyan-300',
    pill: 'bg-cyan-400/10',
    pillText: 'text-cyan-300',
    border: 'border-cyan-400/20',
  },
  market: {
    bg: 'bg-[#11151C]',
    icon: 'text-sky-300',
    pill: 'bg-sky-400/10',
    pillText: 'text-sky-300',
    border: 'border-sky-400/20',
  },
  metric: {
    bg: 'bg-[#19160F]',
    icon: 'text-amber-300',
    pill: 'bg-amber-400/10',
    pillText: 'text-amber-300',
    border: 'border-amber-400/20',
  },
  psychology: {
    bg: 'bg-[#15111B]',
    icon: 'text-fuchsia-300',
    pill: 'bg-fuchsia-400/10',
    pillText: 'text-fuchsia-300',
    border: 'border-fuchsia-400/20',
  },
};

const DIFF_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20',
  intermediate: 'bg-amber-400/10 text-amber-300 border border-amber-400/20',
  advanced: 'bg-rose-400/10 text-rose-300 border border-rose-400/20',
};

const CATEGORY_CHIPS = [
  { label: 'All', value: '' },
  { label: 'Indicators', value: 'indicator' },
  { label: 'Risk', value: 'risk' },
  { label: 'Strategies', value: 'strategy' },
  { label: 'Markets', value: 'market' },
  { label: 'Metrics', value: 'metric' },
  { label: 'Psychology', value: 'psychology' },
];

function getCategoryCount(cat: string) {
  if (!cat) return glossaryTerms.length;
  return glossaryTerms.filter((term) => term.category === cat).length;
}

const pageVariant = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const cardGrid = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const dropDown = {
  hidden: { opacity: 0, y: -8, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.1 } },
};

const wikiCard = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[#1A1A1A] bg-[#0B0B0B] p-5 space-y-4">
      <style>
        {
          '@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} } .sk { background:linear-gradient(90deg,#0f0f0f 25%,#171717 50%,#0f0f0f 75%);background-size:200% 100%;animation:shimmer 1.5s infinite; }'
        }
      </style>
      <div className="flex items-center justify-between">
        <div className="sk h-11 w-11 rounded-xl" />
        <div className="sk h-5 w-20 rounded-full" />
      </div>
      <div className="sk h-5 w-3/4 rounded-lg" />
      <div className="sk h-4 w-full rounded" />
      <div className="sk h-4 w-5/6 rounded" />
      <div className="sk h-4 w-4/6 rounded" />
      <div className="mt-2 flex gap-2">
        <div className="sk h-4 w-14 rounded-full" />
        <div className="sk h-4 w-14 rounded-full" />
        <div className="sk h-4 w-14 rounded-full" />
      </div>
    </div>
  );
}

function ConceptCard({ term, onClick }: { term: GlossaryTerm; onClick: () => void }) {
  const colors = CAT_COLORS[term.category];
  const IconComp = ICON_MAP[term.icon] ?? TrendingUp;
  const firstTwo = `${term.definition.split('. ').slice(0, 2).join('. ')}.`;

  return (
    <motion.div
      variants={cardItem}
      onClick={onClick}
      className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-[#1A1A1A] bg-[#0B0B0B] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#2A2A2A]"
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border ${colors.bg} ${colors.border}`}>
          <IconComp size={20} className={colors.icon} strokeWidth={2} />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${colors.pill} ${colors.pillText} ${colors.border}`}>
            {term.category}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${DIFF_COLORS[term.difficulty]}`}>
            {term.difficulty}
          </span>
        </div>
      </div>

      <div>
        <p className="text-[17px] font-bold leading-snug text-[#EAEAEA]">{term.term}</p>
        <p className="mt-0.5 text-[12px] text-[#6E6E6E]">{term.fullName}</p>
      </div>

      <p className="line-clamp-3 flex-1 text-[13px] leading-relaxed text-[#9A9A9A]">{firstTwo}</p>

      <div className="flex flex-wrap gap-1.5">
        {term.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-[#1A1A1A] bg-[#111111] px-2 py-0.5 text-[11px] text-[#7A7A7A]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-[#1A1A1A] pt-3">
        <span className="text-[13px] font-semibold text-emerald-300">Read more</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${colors.bg} ${colors.border}`}>
          <IconComp size={14} className={colors.icon} />
        </div>
      </div>
    </motion.div>
  );
}

function DetailPanel({
  term,
  onClose,
  onNavigate,
}: {
  term: GlossaryTerm;
  onClose: () => void;
  onNavigate: (t: GlossaryTerm) => void;
}) {
  const colors = CAT_COLORS[term.category];
  const IconComp = ICON_MAP[term.icon] ?? TrendingUp;

  const relatedTerms = term.related
    .map((id) => glossaryTerms.find((item) => item.id === id))
    .filter(Boolean) as GlossaryTerm[];

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="fixed right-0 top-0 z-50 h-full w-full max-w-[480px] overflow-y-auto border-l border-[#1A1A1A] bg-[#070707] shadow-[-8px_0_40px_rgba(0,0,0,0.45)]"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="sticky top-0 z-10 border-b border-[#1A1A1A] bg-[#070707]/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border ${colors.bg} ${colors.border}`}>
                <IconComp size={18} className={colors.icon} />
              </div>
              <span className="text-lg font-bold text-[#EAEAEA]">{term.term}</span>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1A1A1A] bg-[#111111] text-[#7A7A7A] transition-colors hover:border-[#2A2A2A]"
            >
              <X size={16} />
            </button>
          </div>
          <div className="ml-1 mt-2 flex items-center gap-2">
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${colors.pill} ${colors.pillText} ${colors.border}`}>
              {term.category}
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${DIFF_COLORS[term.difficulty]}`}>
              {term.difficulty}
            </span>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6">
          <section>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#6E6E6E]">What Is It?</p>
            <p className="text-[14px] leading-[1.75] text-[#BDBDBD]">{term.definition}</p>
          </section>

          <section>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#6E6E6E]">How To Use It</p>
            <div className="rounded-bl-xl rounded-r-xl border-l-4 border-emerald-400/60 bg-[#0D1512] p-4">
              <p className="text-[13px] leading-relaxed text-[#CDEDDD]">{term.howToUse}</p>
            </div>
          </section>

          <section>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#6E6E6E]">Example</p>
            <div className="rounded-xl border border-[#1A1A1A] bg-[#101010] p-4">
              <p className="font-mono text-[13px] leading-relaxed text-[#9A9A9A]">{term.example}</p>
            </div>
          </section>

          {relatedTerms.length > 0 && (
            <section>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#6E6E6E]">Related Concepts</p>
              <div className="flex flex-col gap-2">
                {relatedTerms.map((relatedTerm) => {
                  const relatedColors = CAT_COLORS[relatedTerm.category];
                  const RelatedIcon = ICON_MAP[relatedTerm.icon] ?? TrendingUp;
                  const snippet = `${relatedTerm.definition.split(' ').slice(0, 8).join(' ')}...`;

                  return (
                    <button
                      key={relatedTerm.id}
                      onClick={() => onNavigate(relatedTerm)}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-[#1A1A1A] bg-[#101010] p-3 text-left transition-all hover:border-[#2A2A2A]"
                    >
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border ${relatedColors.bg} ${relatedColors.border}`}>
                        <RelatedIcon size={14} className={relatedColors.icon} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[#EAEAEA]">{relatedTerm.term}</p>
                        <p className="truncate text-[11px] text-[#7A7A7A]">{snippet}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <section>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#6E6E6E]">Tags</p>
            <div className="flex flex-wrap gap-2">
              {term.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#1A1A1A] bg-[#101010] px-3 py-1 text-[12px] text-[#7A7A7A]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        </div>
      </motion.div>
    </>
  );
}

interface LearnPageProps {
  setCurrentView: (v: string) => void;
}

export default function LearnPage({ setCurrentView: _setCurrentView }: LearnPageProps) {
  const {
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
    totalCount,
    filteredCount,
  } = useLearnSearch();

  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleSuggestionClick(suggestion: string) {
    setQuery(suggestion);
    setShowSuggestions(false);
  }

  function highlightMatch(text: string) {
    if (!query) return <>{text}</>;

    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return <>{text}</>;

    return (
      <>
        {text.slice(0, index)}
        <span className="font-bold text-emerald-300">{text.slice(index, index + query.length)}</span>
        {text.slice(index + query.length)}
      </>
    );
  }

  const hasResults = results.length > 0;
  const showWikiLoading = isWikiLoading && !hasResults;
  const showWikiResult = !isWikiLoading && wikiResult && !hasResults;
  const showError = !isWikiLoading && !wikiResult && wikiError && !hasResults;

  const looselyRelated = wikiResult
    ? glossaryTerms
        .filter(
          (term) =>
            term.tags.some((tag) => query.toLowerCase().split(' ').some((word) => tag.includes(word))) ||
            term.definition.toLowerCase().includes(query.toLowerCase().split(' ')[0])
        )
        .slice(0, 3)
    : [];

  return (
    <motion.div
      className="mx-auto max-w-7xl px-6 py-8"
      variants={pageVariant}
      initial="hidden"
      animate="visible"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <div className="h-4 w-px bg-emerald-400/60" />
            <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#7A7A7A]">Knowledge Base</p>
          </div>
          <h1 className="text-4xl font-black tracking-[-0.04em] text-[#EAEAEA]">Learn</h1>
          <p className="mt-2 text-sm font-light text-[#7A7A7A]">
            Search any market concept, indicator, or strategy - plain English explanations
          </p>
        </div>

        <div className="flex items-center gap-2 sm:flex-shrink-0">
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[13px] font-semibold text-emerald-300">
            {totalCount} concepts
          </span>
          {filteredCount !== totalCount && (
            <span className="rounded-full border border-[#1A1A1A] bg-[#111111] px-3 py-1.5 text-[13px] font-semibold text-[#9A9A9A]">
              {filteredCount} showing
            </span>
          )}
        </div>
      </div>

      <div className="relative mb-4">
        <div className="flex w-full items-center gap-3 rounded-xl border border-[#1A1A1A] bg-[#0B0B0B] px-4 py-3 transition-colors hover:border-[#2A2A2A]">
          <Search size={16} className="flex-shrink-0 text-[#7A7A7A]" />
          <input
            ref={inputRef}
            className="w-full bg-transparent text-sm text-[#EAEAEA] outline-none placeholder:text-[#555]"
            placeholder="Search RSI, drawdown, momentum..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setShowSuggestions(false);
              }}
              className="flex-shrink-0 text-[#555] transition-colors hover:text-[#EAEAEA]"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              ref={dropdownRef}
              variants={dropDown}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-[#1A1A1A] bg-[#0B0B0B] shadow-lg"
            >
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onMouseDown={() => handleSuggestionClick(suggestion)}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left hover:bg-[#111111]"
                >
                  <Search size={13} className="flex-shrink-0 text-[#555]" />
                  <span className="text-[14px] text-[#BDBDBD]">{highlightMatch(suggestion)}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORY_CHIPS.map((chip) => {
          const isActive = activeCategory === chip.value;
          const count = getCategoryCount(chip.value);

          return (
            <button
              key={chip.value}
              onClick={() => setActiveCategory(chip.value)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all ${
                isActive
                  ? 'border border-emerald-400/25 bg-emerald-400/10 text-emerald-300 shadow-[0_2px_10px_rgba(16,185,129,0.15)]'
                  : 'border border-[#1A1A1A] bg-[#0B0B0B] text-[#7A7A7A] hover:border-[#2A2A2A] hover:text-[#EAEAEA]'
              }`}
            >
              {chip.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                  isActive ? 'bg-emerald-400/15 text-emerald-200' : 'bg-[#111111] text-[#7A7A7A]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mb-5 flex items-center gap-2 text-[14px]">
        {!query && !activeCategory ? (
          <>
            <span className="font-medium text-[#7A7A7A]">All financial concepts</span>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 text-[12px] font-semibold text-emerald-300">
              {totalCount}
            </span>
          </>
        ) : showWikiLoading ? (
          <span className="flex items-center gap-2 text-[#7A7A7A]">
            <svg className="h-4 w-4 animate-spin text-emerald-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Searching wider knowledge base...
          </span>
        ) : query ? (
          <span className="text-[#7A7A7A]">
            Showing results for <span className="font-semibold text-emerald-300">"{query}"</span>
          </span>
        ) : (
          <span className="font-medium capitalize text-[#7A7A7A]">{activeCategory}</span>
        )}
      </div>

      {hasResults && (
        <motion.div
          key={activeCategory + query}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          variants={cardGrid}
          initial="hidden"
          animate="visible"
        >
          {results.map((term) => (
            <ConceptCard key={term.id} term={term} onClick={() => setSelectedTerm(term)} />
          ))}
        </motion.div>
      )}

      {showWikiLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <SkeletonCard key={item} />
          ))}
        </div>
      )}

      {showWikiResult && wikiResult && (
        <div className="space-y-6">
          <motion.div
            variants={wikiCard}
            initial="hidden"
            animate="visible"
            className="rounded-2xl border border-[#1A1A1A] bg-[#0B0B0B] p-6"
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10">
                <span className="text-[11px] font-black text-emerald-300">W</span>
              </div>
              <span className="text-[12px] font-semibold text-emerald-300">From Wikipedia</span>
              <ExternalLink size={12} className="text-emerald-300" />
            </div>

            <div className="overflow-hidden">
              {wikiResult.thumbnail && (
                <img
                  src={wikiResult.thumbnail}
                  alt={wikiResult.title}
                  className="mb-2 ml-4 float-right h-24 w-32 rounded-xl border border-[#1A1A1A] object-cover"
                />
              )}
              <h2 className="mb-3 text-2xl font-bold text-[#EAEAEA]">{wikiResult.title}</h2>
              <p className="text-[14px] leading-relaxed text-[#9A9A9A]">{wikiResult.extract}</p>
            </div>

            <div className="clear-both pt-4">
              <a
                href={wikiResult.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-emerald-400 hover:underline"
              >
                Read full article on Wikipedia
                <ExternalLink size={12} />
              </a>
            </div>
          </motion.div>

          {looselyRelated.length > 0 && (
            <div>
              <p className="mb-3 text-[12px] font-semibold uppercase tracking-widest text-[#6E6E6E]">
                Related concepts in ROOKNOMICS:
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {looselyRelated.map((term) => (
                  <ConceptCard key={term.id} term={term} onClick={() => setSelectedTerm(term)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showError && (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
            <Search size={48} className="text-[#1F1F1F]" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-[#EAEAEA]">No results for "{query}"</h3>
          <p className="mx-auto max-w-xs text-[14px] text-[#7A7A7A]">{wikiError}</p>
          <p className="mb-3 mt-4 text-[13px] text-[#555]">Try:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['RSI', 'Drawdown', 'Sharpe Ratio', 'Backtesting', 'Bull Market'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setQuery(suggestion)}
                className="rounded-full border border-[#1A1A1A] bg-[#0B0B0B] px-3 py-1.5 text-[13px] font-medium text-[#7A7A7A] transition-all hover:border-[#2A2A2A] hover:text-emerald-300"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedTerm && (
          <DetailPanel
            key={selectedTerm.id}
            term={selectedTerm}
            onClose={() => setSelectedTerm(null)}
            onNavigate={(term) => setSelectedTerm(term)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
