import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, ExternalLink,
  TrendingUp, TrendingDown, Activity, GitBranch, Layers, Star,
  BarChart2, Maximize2, RefreshCw, Shield, Target, Sliders, Scale,
  Zap, AlertTriangle, Percent, RotateCcw, Rocket, ArrowLeftRight,
  Clock, Calendar, BarChart, Sun, Navigation, PieChart, Package,
  Award, DollarSign, Droplets, Brain, AlertCircle,
} from 'lucide-react';
import { useLearnSearch } from '@/hooks/useLearnSearch';
import { GlossaryTerm, GlossaryCategory } from '@/types/learn';
import { glossaryTerms } from '@/data/glossary';

// ── Icon map ────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  TrendingUp, TrendingDown, Activity, GitBranch, Layers, Star,
  BarChart2, Maximize2, RefreshCw, Shield, Target, Sliders, Scale,
  Zap, AlertTriangle, Percent, RotateCcw, Rocket, ArrowLeftRight,
  Clock, Calendar, BarChart, Sun, Navigation, PieChart, Package,
  Award, DollarSign, Droplets, Brain, AlertCircle, X,
};

// ── Category colours ─────────────────────────────────────────────────────────
const CAT_COLORS: Record<GlossaryCategory, { bg: string; icon: string; pill: string; pillText: string }> = {
  indicator: { bg: 'bg-[#ede9fe]', icon: 'text-[#5b4cf0]', pill: 'bg-[#ede9fe]', pillText: 'text-[#5b4cf0]' },
  risk: { bg: 'bg-[#ffe4e8]', icon: 'text-[#e1294b]', pill: 'bg-[#ffe4e8]', pillText: 'text-[#e1294b]' },
  strategy: { bg: 'bg-[#d1fae5]', icon: 'text-[#0d9e6e]', pill: 'bg-[#d1fae5]', pillText: 'text-[#0d9e6e]' },
  market: { bg: 'bg-[#e0f2fe]', icon: 'text-sky-700', pill: 'bg-[#e0f2fe]', pillText: 'text-sky-700' },
  metric: { bg: 'bg-[#fef3c7]', icon: 'text-amber-600', pill: 'bg-[#fef3c7]', pillText: 'text-amber-600' },
  psychology: { bg: 'bg-[#fdf4ff]', icon: 'text-purple-700', pill: 'bg-[#fdf4ff]', pillText: 'text-purple-700' },
};

const DIFF_COLORS: Record<string, string> = {
  beginner: 'bg-[#d1fae5] text-[#0d9e6e]',
  intermediate: 'bg-[#fef3c7] text-amber-700',
  advanced: 'bg-[#ffe4e8] text-[#e1294b]',
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
  return glossaryTerms.filter((t) => t.category === cat).length;
}

// ── Animation variants ────────────────────────────────────────────────────────
const pageVariant = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const cardGrid = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const cardItem = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const dropDown = { hidden: { opacity: 0, y: -8, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.15 } }, exit: { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.1 } } };
const wikiCard = { hidden: { opacity: 0, scale: 0.98 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } } };

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4">
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .sk { background:linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%);background-size:200% 100%;animation:shimmer 1.5s infinite; }
      `}</style>
      <div className="flex justify-between items-center">
        <div className="w-11 h-11 sk rounded-xl" />
        <div className="w-20 h-5 sk rounded-full" />
      </div>
      <div className="h-5 w-3/4 sk rounded-lg" />
      <div className="h-4 w-full sk rounded" />
      <div className="h-4 w-5/6 sk rounded" />
      <div className="h-4 w-4/6 sk rounded" />
      <div className="flex gap-2 mt-2">
        <div className="h-4 w-14 sk rounded-full" />
        <div className="h-4 w-14 sk rounded-full" />
        <div className="h-4 w-14 sk rounded-full" />
      </div>
    </div>
  );
}

// ── Concept Card ──────────────────────────────────────────────────────────────
function ConceptCard({ term, onClick }: { term: GlossaryTerm; onClick: () => void }) {
  const colors = CAT_COLORS[term.category];
  const IconComp = ICON_MAP[term.icon] ?? TrendingUp;
  const firstTwo = term.definition.split('. ').slice(0, 2).join('. ') + '.';

  return (
    <motion.div
      variants={cardItem}
      onClick={onClick}
      className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#c4bafc] hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col gap-3"
    >
      {/* Icon + badges row */}
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
          <IconComp size={20} className={colors.icon} strokeWidth={2} />
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${colors.pill} ${colors.pillText}`}>
            {term.category}
          </span>
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${DIFF_COLORS[term.difficulty]}`}>
            {term.difficulty}
          </span>
        </div>
      </div>

      {/* Term name */}
      <div>
        <p className="font-bold text-gray-900 text-[17px] leading-snug">{term.term}</p>
        <p className="text-gray-400 text-[12px] mt-0.5">{term.fullName}</p>
      </div>

      {/* Definition preview */}
      <p className="text-gray-500 text-[13px] line-clamp-3 leading-relaxed flex-1">{firstTwo}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {term.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="bg-gray-100 text-gray-500 text-[11px] px-2 py-0.5 rounded-full">{tag}</span>
        ))}
      </div>

      {/* Read more row */}
      <div className="flex items-center justify-between mt-auto pt-1 border-t border-gray-100">
        <span className="text-[#5b4cf0] text-[13px] font-semibold">Read more →</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.bg}`}>
          <IconComp size={14} className={colors.icon} />
        </div>
      </div>
    </motion.div>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────
function DetailPanel({
  term,
  onClose,
  onNavigate,
  onNavigateToBuilder,
}: {
  term: GlossaryTerm;
  onClose: () => void;
  onNavigate: (t: GlossaryTerm) => void;
  onNavigateToBuilder: () => void;
}) {
  const colors = CAT_COLORS[term.category];
  const IconComp = ICON_MAP[term.icon] ?? TrendingUp;

  const relatedTerms = term.related
    .map((id) => glossaryTerms.find((t) => t.id === id))
    .filter(Boolean) as GlossaryTerm[];

  return (
    <>
      {/* Overlay */}
      <motion.div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-white border-l border-gray-100 z-50 shadow-[-8px_0_40px_rgba(0,0,0,0.1)] overflow-y-auto"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Sticky header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
                <IconComp size={18} className={colors.icon} />
              </div>
              <span className="font-bold text-gray-900 text-lg">{term.term}</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2 ml-1">
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${colors.pill} ${colors.pillText}`}>
              {term.category}
            </span>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${DIFF_COLORS[term.difficulty]}`}>
              {term.difficulty}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* What is it */}
          <section>
            <p className="text-[11px] font-semibold text-gray-400 tracking-widest uppercase mb-2">What Is It?</p>
            <p className="text-gray-700 text-[14px] leading-[1.75]">{term.definition}</p>
          </section>

          {/* How to use */}
          <section>
            <p className="text-[11px] font-semibold text-gray-400 tracking-widest uppercase mb-2">How To Use It</p>
            <div className="bg-[#ede9fe] rounded-r-xl rounded-bl-xl border-l-4 border-[#5b4cf0] p-4">
              <p className="text-[#3c3489] text-[13px] leading-relaxed">{term.howToUse}</p>
            </div>
          </section>

          {/* Example */}
          <section>
            <p className="text-[11px] font-semibold text-gray-400 tracking-widest uppercase mb-2">Example</p>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-600 text-[13px] leading-relaxed font-mono">{term.example}</p>
            </div>
          </section>

          {/* Related concepts */}
          {relatedTerms.length > 0 && (
            <section>
              <p className="text-[11px] font-semibold text-gray-400 tracking-widest uppercase mb-2">Related Concepts</p>
              <div className="flex flex-col gap-2">
                {relatedTerms.map((rt) => {
                  const rc = CAT_COLORS[rt.category];
                  const RIcon = ICON_MAP[rt.icon] ?? TrendingUp;
                  const snippet = rt.definition.split(' ').slice(0, 8).join(' ') + '…';
                  return (
                    <button
                      key={rt.id}
                      onClick={() => onNavigate(rt)}
                      className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3 cursor-pointer hover:bg-[#ede9fe] hover:border-[#c4bafc] transition-all text-left w-full"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${rc.bg}`}>
                        <RIcon size={14} className={rc.icon} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-gray-800">{rt.term}</p>
                        <p className="text-[11px] text-gray-500 truncate">{snippet}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Tags */}
          <section>
            <p className="text-[11px] font-semibold text-gray-400 tracking-widest uppercase mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {term.tags.map((tag) => (
                <span key={tag} className="bg-gray-100 text-gray-500 text-[12px] px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          </section>

        </div>
      </motion.div>
    </>
  );
}

// ── Main Learn page ──────────────────────────────────────────────────────────
interface LearnPageProps {
  setCurrentView: (v: string) => void;
}

export default function LearnPage({ setCurrentView }: LearnPageProps) {
  const {
    query, setQuery,
    activeCategory, setActiveCategory,
    results, suggestions,
    isWikiLoading, wikiResult, wikiError,
    selectedTerm, setSelectedTerm,
    totalCount, filteredCount,
  } = useLearnSearch();

  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleSuggestionClick(s: string) {
    setQuery(s);
    setShowSuggestions(false);
  }

  function highlightMatch(text: string) {
    if (!query) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-[#5b4cf0] font-bold">{text.slice(idx, idx + query.length)}</span>
        {text.slice(idx + query.length)}
      </>
    );
  }

  const hasResults = results.length > 0;
  const showWikiLoading = isWikiLoading && !hasResults;
  const showWikiResult = !isWikiLoading && wikiResult && !hasResults;
  const showError = !isWikiLoading && !wikiResult && wikiError && !hasResults;

  // Loosely related glossary terms for wiki fallback
  const looselyRelated = wikiResult
    ? glossaryTerms
      .filter((t) =>
        t.tags.some((tag) => query.toLowerCase().split(' ').some((w) => tag.includes(w))) ||
        t.definition.toLowerCase().includes(query.toLowerCase().split(' ')[0])
      )
      .slice(0, 3)
    : [];

  return (
    <motion.div
      className="max-w-7xl mx-auto px-6 py-8"
      variants={pageVariant}
      initial="hidden"
      animate="visible"
    >
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Learn</h1>
          <p className="text-slate-600 mt-1">
            Search any market concept, indicator, or strategy — plain English explanations
          </p>
        </div>

        <div className="flex items-center gap-2 sm:flex-shrink-0">
          <span className="bg-[#ede9fe] text-[#5b4cf0] text-[13px] font-semibold px-3 py-1.5 rounded-full">
            {totalCount} concepts
          </span>
          {filteredCount !== totalCount && (
            <span className="bg-gray-100 text-gray-600 text-[13px] font-semibold px-3 py-1.5 rounded-full">
              {filteredCount} showing
            </span>
          )}
        </div>
      </div>

      {/* ── Search bar ── */}
      <div className="relative mb-4">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 w-full flex items-center gap-3 shadow-sm hover:border-indigo-300 transition-colors focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            className="bg-transparent text-slate-800 placeholder-slate-400 outline-none w-full text-sm"
            placeholder="Search RSI, drawdown, momentum..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
          />
          {query && (
            <button onClick={() => { setQuery(''); setShowSuggestions(false); }} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Autocomplete */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              ref={dropdownRef}
              variants={dropDown}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden"
            >
              {suggestions.map((s) => (
                <button
                  key={s}
                  onMouseDown={() => handleSuggestionClick(s)}
                  className="w-full px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-left"
                >
                  <Search size={13} className="text-gray-300 flex-shrink-0" />
                  <span className="text-gray-700 text-[14px]">{highlightMatch(s)}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Category chips ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORY_CHIPS.map((chip) => {
          const isActive = activeCategory === chip.value;
          const count = getCategoryCount(chip.value);
          return (
            <button
              key={chip.value}
              onClick={() => setActiveCategory(chip.value)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all ${isActive
                  ? 'bg-[#5b4cf0] text-white shadow-[0_2px_8px_rgba(91,76,240,0.3)]'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
            >
              {chip.label}
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Results label ── */}
      <div className="flex items-center gap-2 mb-5 text-[14px]">
        {!query && !activeCategory ? (
          <>
            <span className="text-slate-600 font-medium">All financial concepts</span>
            <span className="bg-indigo-50 text-indigo-700 text-[12px] font-semibold px-2.5 py-0.5 rounded-full border border-indigo-100">
              {totalCount}
            </span>
          </>
        ) : showWikiLoading ? (
          <span className="text-slate-500 flex items-center gap-2">
            <svg className="animate-spin w-4 h-4 text-[#5b4cf0]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Searching wider knowledge base...
          </span>
        ) : query ? (
          <span className="text-slate-600">
            Showing results for:{' '}
            <span className="text-[#5b4cf0] font-semibold">"{query}"</span>
          </span>
        ) : (
          <span className="text-slate-600 font-medium capitalize">{activeCategory}</span>
        )}
      </div>

      {/* ── Main content ── */}

      {/* State 1 — glossary results */}
      {hasResults && (
        <motion.div
          key={activeCategory + query}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={cardGrid}
          initial="hidden"
          animate="visible"
        >
          {results.map((term) => (
            <ConceptCard key={term.id} term={term} onClick={() => setSelectedTerm(term)} />
          ))}
        </motion.div>
      )}

      {/* State 3 — Wikipedia loading */}
      {showWikiLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* State 2 — Wikipedia result */}
      {showWikiResult && wikiResult && (
        <div className="space-y-6">
          <motion.div
            variants={wikiCard}
            initial="hidden"
            animate="visible"
            className="bg-[#ede9fe]/30 border border-[#c4bafc] rounded-2xl p-6"
          >
            {/* Wikipedia header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-[#5b4cf0] rounded-full flex items-center justify-center">
                <span className="text-white text-[11px] font-black">W</span>
              </div>
              <span className="text-[#5b4cf0] text-[12px] font-semibold">From Wikipedia</span>
              <ExternalLink size={12} className="text-[#5b4cf0]" />
            </div>

            {/* Content with optional thumbnail */}
            <div className="overflow-hidden">
              {wikiResult.thumbnail && (
                <img
                  src={wikiResult.thumbnail}
                  alt={wikiResult.title}
                  className="float-right ml-4 mb-2 w-32 h-24 object-cover rounded-xl"
                />
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{wikiResult.title}</h2>
              <p className="text-gray-600 text-[14px] leading-relaxed">{wikiResult.extract}</p>
            </div>

            <div className="clear-both pt-4">
              <a
                href={wikiResult.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5b4cf0] font-semibold text-[13px] hover:underline inline-flex items-center gap-1"
              >
                Read full article on Wikipedia → <ExternalLink size={12} />
              </a>
            </div>
          </motion.div>

          {/* Related glossary terms below wiki card */}
          {looselyRelated.length > 0 && (
            <div>
              <p className="text-[12px] font-semibold text-gray-400 mb-3 uppercase tracking-widest">
                Related concepts in ROOKNOMICS:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {looselyRelated.map((term) => (
                  <ConceptCard key={term.id} term={term} onClick={() => setSelectedTerm(term)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* State 4 — no results + wiki error */}
      {showError && (
        <div className="text-center py-16">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Search size={48} className="text-gray-200" />
          </div>
          <h3 className="text-gray-700 font-semibold text-lg mb-2">No results for "{query}"</h3>
          <p className="text-gray-500 text-[14px] max-w-xs mx-auto">{wikiError}</p>
          <p className="text-gray-400 text-[13px] mt-4 mb-3">Try:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['RSI', 'Drawdown', 'Sharpe Ratio', 'Backtesting', 'Bull Market'].map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="bg-white border border-gray-200 text-gray-600 text-[13px] font-medium px-3 py-1.5 rounded-full hover:border-[#c4bafc] hover:text-[#5b4cf0] transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Detail panel */}
      <AnimatePresence>
        {selectedTerm && (
          <DetailPanel
            key={selectedTerm.id}
            term={selectedTerm}
            onClose={() => setSelectedTerm(null)}
            onNavigate={(t) => setSelectedTerm(t)}
            onNavigateToBuilder={() => { setSelectedTerm(null); setCurrentView('builder'); }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
