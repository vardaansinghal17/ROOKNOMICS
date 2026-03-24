import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  ArrowDownLeft, ArrowUpRight, TrendingDown, TrendingUp, List,
  Activity, AlertTriangle, Gavel, PieChart, Info, Search,
  ChevronRight, Award, Shield,
  Cpu, GitBranch, BarChart2, X, Lightbulb, Menu, XIcon, LogIn,
} from 'lucide-react';
import {
  generateEquityData, tradeHistory, radarData, conceptCards,
  metricsStrategy, metricsSP500,
} from '@/data/mockData';
import LandingView from '@/components/LandingView';
import BuilderView from '@/components/BuilderView';
import AuthDialog from '@/components/AuthDialog';

type ViewType = 'landing' | 'builder' | 'results' | 'learn';

const iconMap: Record<string, React.ElementType> = {
  TrendingUp, Activity, TrendingDown, BarChart2, Cpu, Shield, GitBranch, AlertTriangle, Award,
};

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [metricTab, setMetricTab] = useState<'strategy' | 'sp500'>('strategy');
  const [expandedConcept, setExpandedConcept] = useState<string | null>(null);
  const [learnFilter, setLearnFilter] = useState('All');
  const [learnSearch, setLearnSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const equityData = useMemo(() => generateEquityData(), []);
  const metrics = metricTab === 'strategy' ? metricsStrategy : metricsSP500;

  const filteredConcepts = useMemo(() => {
    return conceptCards.filter(c => {
      const matchFilter = learnFilter === 'All' || c.category === learnFilter || c.tags.includes(learnFilter);
      const matchSearch = !learnSearch || c.title.toLowerCase().includes(learnSearch.toLowerCase()) || c.body.toLowerCase().includes(learnSearch.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [learnFilter, learnSearch]);

  const expandedCard = expandedConcept ? conceptCards.find(c => c.id === expandedConcept) : null;

  return (
    <div className="min-h-screen bg-slate-50 noise-bg relative">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('landing')}>
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <BarChart2 size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-slate-900 text-lg">ROOKNOMICS</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {(['landing', 'builder', 'results', 'learn'] as ViewType[]).map(v => (
              <button key={v} onClick={() => setCurrentView(v)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${currentView === v ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:text-slate-800'}`}>
                {v === 'landing' ? 'Home' : v === 'builder' ? 'Builder' : v === 'results' ? 'Results' : 'Learn'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAuth(true)} className="hidden md:flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 transition-colors px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-600">
              <LogIn size={14} /> Sign In
            </button>
            <button className="md:hidden text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <XIcon size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-slate-50/95 backdrop-blur-xl px-6 py-3 flex flex-col gap-2">
            {(['landing', 'builder', 'results', 'learn'] as ViewType[]).map(v => (
              <button key={v} onClick={() => { setCurrentView(v); setMobileMenuOpen(false); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium text-left transition-all ${currentView === v ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'}`}>
                {v === 'landing' ? 'Home' : v === 'builder' ? 'Builder' : v === 'results' ? 'Results' : 'Learn'}
              </button>
            ))}
            <button onClick={() => { setShowAuth(true); setMobileMenuOpen(false); }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-left text-indigo-600">
              Sign In
            </button>
          </div>
        )}
      </nav>

      <AuthDialog open={showAuth} onClose={() => setShowAuth(false)} />

      <div className="relative z-10 pt-16">
        {currentView === 'landing' && <LandingView setCurrentView={(v: string) => setCurrentView(v as ViewType)} setShowAuth={setShowAuth} />}
        {currentView === 'builder' && <BuilderView setCurrentView={(v: string) => setCurrentView(v as ViewType)} />}
        {currentView === 'results' && <ResultsView equityData={equityData} metrics={metrics} metricTab={metricTab} setMetricTab={setMetricTab} setCurrentView={setCurrentView} />}
        {currentView === 'learn' && <LearnView concepts={filteredConcepts} filter={learnFilter} setFilter={setLearnFilter} search={learnSearch} setSearch={setLearnSearch} expandedCard={expandedCard} setExpandedConcept={setExpandedConcept} setCurrentView={setCurrentView} />}
      </div>
    </div>
  );
}

/* ─── RESULTS VIEW ────────────────────────────────────────────── */

function ResultsView({ equityData, metrics, metricTab, setMetricTab, setCurrentView }: any) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 max-w-7xl mx-auto px-6 pb-12 pt-8">
      {/* Chart area */}
      <div className="xl:col-span-3">
        <PerformanceChart data={equityData} />
        <TradeHistoryTable />
      </div>
      {/* Sidebar */}
      <div className="xl:col-span-1 space-y-6">
        <PerformanceMetrics metrics={metrics} tab={metricTab} setTab={setMetricTab} />
        <VerdictPanel setCurrentView={setCurrentView} />
        <RiskAnalysis />
      </div>
    </div>
  );
}

/* ─── PERFORMANCE CHART ───────────────────────────────────────── */

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const monthIdx = label as number;
  const year = 2004 + Math.floor(monthIdx / 12);
  const month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][monthIdx % 12];
  return (
    <div className="bg-white/95 border border-slate-200 rounded-xl p-3 text-sm">
      <p className="text-slate-600 text-xs mb-1">{month} {year}</p>
      <p className="text-rose-700">Your Strategy: ${payload[0]?.value?.toLocaleString()}</p>
      <p className="text-emerald-700">S&P 500: ${payload[1]?.value?.toLocaleString()}</p>
    </div>
  );
}

function PerformanceChart({ data }: { data: any[] }) {
  const annotations = [
    { icon: ArrowDownLeft, color: 'text-rose-600', label: 'Oct 2008: -38%' },
    { icon: ArrowUpRight, color: 'text-emerald-600', label: 'Mar 2013: +28%' },
    { icon: TrendingDown, color: 'text-rose-600', label: 'Mar 2020: -24%' },
    { icon: TrendingUp, color: 'text-emerald-600', label: 'Dec 2023: +26%' },
  ];

  return (
    <div className="bg-white border border-slate-200/50 rounded-2xl p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-slate-900 font-semibold text-lg">Portfolio Value Over Time</h2>
          <p className="text-slate-600 text-sm">Monthly equity curve · 240 data points</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-rose-500/20 text-rose-700 border border-rose-200 text-xs px-2.5 py-1 rounded-full">Your Strategy</span>
          <span className="bg-emerald-500/20 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded-full">S&P 500 (Buy & Hold)</span>
        </div>
      </div>
      <div className="mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sp500Gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v: number) => {
              if (v % 24 === 0) {
                const labels = ["'04","'06","'08","'10","'12","'14","'16","'18","'20","'22","'24"];
                return labels[v / 24] || '';
              }
              return '';
            }} interval={23} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="user" stroke="#f43f5e" strokeWidth={2} fill="url(#userGradient)" fillOpacity={1} />
            <Area type="monotone" dataKey="sp500" stroke="#10b981" strokeWidth={2.5} fill="url(#sp500Gradient)" fillOpacity={1} />
            <ReferenceLine x={54} stroke="#f43f5e" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "2008 Crisis", fill: "#f43f5e", fontSize: 11 }} />
            <ReferenceLine x={144} stroke="#6366f1" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "COVID", fill: "#818cf8", fontSize: 11 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        {annotations.map((a, i) => (
          <div key={i} className="bg-slate-100/60 border border-slate-200/40 rounded-xl px-3 py-2 flex items-center gap-2 cursor-pointer hover:border-indigo-500/40 text-xs text-slate-700 transition-all duration-300">
            <a.icon size={14} className={a.color} />
            <span>{a.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── TRADE HISTORY ───────────────────────────────────────────── */

function TradeHistoryTable() {
  return (
    <div className="bg-white border border-slate-200/50 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <List size={18} className="text-indigo-600" />
        <h2 className="text-slate-900 font-semibold text-lg">Trade History</h2>
        <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full ml-2">214 trades</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100/50 text-slate-600 text-xs uppercase tracking-wide">
              {['Date','Action','Price','Shares','P&L','Return','Cumulative'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tradeHistory.map((row, i) => (
              <tr key={i} className={`border-t border-slate-200/50 ${i % 2 === 0 ? 'bg-slate-100/20' : ''}`}>
                <td className="px-3 py-2.5 text-slate-700">{row.date}</td>
                <td className={`px-3 py-2.5 font-medium ${row.action === 'BUY' ? 'text-indigo-600' : 'text-amber-600'}`}>{row.action}</td>
                <td className="px-3 py-2.5 text-slate-700">{row.price}</td>
                <td className="px-3 py-2.5 text-slate-700">{row.shares}</td>
                <td className={`px-3 py-2.5 font-medium ${row.positive === true ? 'text-emerald-600' : row.positive === false ? 'text-rose-600' : 'text-slate-500'}`}>{row.pnl}</td>
                <td className={`px-3 py-2.5 ${row.positive === true ? 'text-emerald-600' : row.positive === false ? 'text-rose-600' : 'text-slate-500'}`}>{row.ret}</td>
                <td className="px-3 py-2.5 text-slate-700">{row.cum}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <span className="text-slate-500 text-xs">Showing 8 of 214 trades</span>
        <span className="text-indigo-600 text-xs cursor-pointer hover:text-indigo-700 transition-colors">View All</span>
      </div>
    </div>
  );
}

/* ─── PERFORMANCE METRICS ─────────────────────────────────────── */

function PerformanceMetrics({ metrics, tab, setTab }: any) {
  const isStrategy = tab === 'strategy';
  const rows = [
    { label: 'Total Return', value: metrics.totalReturn, color: isStrategy ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-bold' },
    { label: 'Annualized Return', value: metrics.annualizedReturn, color: isStrategy ? 'text-rose-700' : 'text-emerald-700' },
    { label: 'Max Drawdown', value: metrics.maxDrawdown, color: 'text-rose-600', note: '(During 2008-09 crisis)' },
    { label: 'Win Rate', value: metrics.winRate, color: 'text-slate-900' },
    { label: 'Sharpe Ratio', value: metrics.sharpeRatio, color: 'text-slate-900' },
    { label: 'Avg Trade Duration', value: metrics.avgTradeDuration, color: 'text-slate-700' },
    { label: 'Total Trades', value: metrics.totalTrades, color: 'text-slate-700' },
    { label: 'Trading Fees Paid', value: metrics.tradingFees, color: metrics.tradingFees.startsWith('-') ? 'text-rose-600' : 'text-slate-700' },
  ];

  return (
    <div className="bg-white border border-slate-200/50 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={18} className="text-indigo-600" />
        <h2 className="text-slate-900 font-semibold">Performance Metrics</h2>
      </div>
      <div className="flex gap-2 mb-4">
        {(['strategy', 'sp500'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${tab === t ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-600 border border-transparent hover:text-slate-800'}`}>
            {t === 'strategy' ? 'Your Strategy' : 'S&P 500'}
          </button>
        ))}
      </div>
      <div className="space-y-0">
        {rows.map((r, i) => (
          <div key={i} className={`flex justify-between items-center py-3 ${i < rows.length - 1 ? 'border-b border-slate-200' : ''}`}>
            <span className="text-slate-600 text-sm flex items-center gap-1">
              {r.label}
              {r.label === 'Total Return' && !isStrategy && <Info size={12} className="text-slate-500" />}
            </span>
            <div className="text-right">
              <span className={`text-sm ${r.color}`}>{r.value}</span>
              {r.note && <p className="text-slate-500 text-xs">{r.note}</p>}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-amber-500/10 border border-amber-200 rounded-xl p-4 mt-4">
        <div className="flex gap-2">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-amber-800/80 text-xs leading-relaxed">
            After fees and taxes, your strategy returned +47% vs the S&P's +332% over 20 years.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── VERDICT ─────────────────────────────────────────────────── */

function VerdictPanel({ setCurrentView }: { setCurrentView: (v: ViewType) => void }) {
  return (
    <div className="bg-gradient-to-br from-white to-slate-50 border-2 border-indigo-200 shadow-[0_0_40px_rgba(99,102,241,0.12)] rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Gavel size={16} className="text-indigo-600" />
        <span className="text-indigo-600 text-xs font-bold tracking-widest">THE VERDICT</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
          <p className="text-rose-600 text-xs font-bold tracking-wider mb-2">YOUR STRATEGY</p>
          <p className="text-3xl font-bold text-rose-700">+47%</p>
          <p className="text-slate-500 text-xs">Total Return</p>
          <TrendingDown size={18} className="text-rose-600 mt-2" />
        </div>
        <div className="bg-emerald-500/5 border border-emerald-200 rounded-xl p-4 relative">
          <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">WINNER</span>
          <p className="text-emerald-600 text-xs font-bold tracking-wider mb-2">S&P 500</p>
          <p className="text-3xl font-bold text-emerald-700">+332%</p>
          <p className="text-slate-500 text-xs">Total Return</p>
          <TrendingUp size={18} className="text-emerald-600 mt-2" />
        </div>
      </div>
      <p className="text-slate-700 text-sm text-center mt-4 leading-relaxed">
        The index beat your strategy by <span className="text-indigo-600 font-semibold">285 percentage points</span> over 20 years—without a single trade.
      </p>
      <p className="text-indigo-600 text-sm cursor-pointer mt-2 text-center hover:text-indigo-700 transition-colors" onClick={() => setCurrentView('learn')}>
        Learn why →
      </p>
    </div>
  );
}

/* ─── RISK ANALYSIS ───────────────────────────────────────────── */

function RiskAnalysis() {
  const badges = ['Beta: 0.89', 'Alpha: -1.2%', 'VaR (5%): -3.8%'];
  return (
    <div className="bg-white border border-slate-200/50 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <PieChart size={18} className="text-indigo-600" />
        <h2 className="text-slate-900 font-semibold">Risk Analysis</h2>
      </div>
      <div className="flex justify-center">
        <ResponsiveContainer width={220} height={220}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(0,0,0,0.1)" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <PolarRadiusAxis tick={false} domain={[0, 100]} axisLine={false} />
            <Radar name="Strategy" dataKey="strategy" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} />
            <Radar name="S&P 500" dataKey="sp500" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {badges.map(b => (
          <span key={b} className="text-slate-600 text-xs text-center bg-slate-100/50 rounded-lg py-1.5 px-1">{b}</span>
        ))}
      </div>
    </div>
  );
}

/* ─── LEARN VIEW ──────────────────────────────────────────────── */

const filterTabs = ['All', 'Indicators', 'Risk', 'Strategy', 'Market Basics'];

function LearnView({ concepts, filter, setFilter, search, setSearch, expandedCard, setExpandedConcept, setCurrentView }: any) {
  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-slate-900">Learning Hub</h1>
        <p className="text-slate-600 mt-1">Understand the concepts behind your strategy—in plain English.</p>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 w-full max-w-md flex items-center gap-3 mt-4">
          <Search size={18} className="text-slate-500" />
          <input className="bg-transparent text-slate-800 placeholder-slate-500 outline-none w-full text-sm" placeholder="Search concepts..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap mt-4 mb-8">
          {filterTabs.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${filter === t ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-800 hover:bg-slate-200'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto px-6 pb-12">
        {concepts.map((card: any) => {
          const Icon = iconMap[card.icon] || TrendingUp;
          const diffColor = card.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-600' : card.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600';
          return (
            <div key={card.id} onClick={() => setExpandedConcept(card.id)}
              className="bg-white border border-slate-200/80 rounded-[2rem] p-8 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className={`rounded-xl p-3 inline-flex ${card.iconBg} shadow-inner`}>
                  <Icon size={24} className="text-slate-800" strokeWidth={1.5} />
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${diffColor}`}>{card.difficulty}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{card.title}</h3>
              <p className="text-slate-600 text-base leading-relaxed flex-1">{card.body}</p>
              <div className="flex flex-wrap gap-2 mt-6">
                {card.tags.map((tag: string) => (
                  <span key={tag} className="bg-slate-100 border border-slate-200 text-slate-600 font-medium text-xs px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
              <div className="mt-8 pt-4 border-t border-slate-200/60 text-indigo-600 text-sm group-hover:text-indigo-700 flex items-center gap-1 font-bold tracking-wide uppercase">
                Read More <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-out detail panel */}
      {expandedCard && (
        <>
          <div className="fixed inset-0 bg-slate-900/20 z-40 backdrop-blur-sm" onClick={() => setExpandedConcept(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white border-l border-slate-200 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out translate-x-0 flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                {(() => { const Icon = iconMap[expandedCard.icon] || TrendingUp; return <Icon size={22} className="text-indigo-600" />; })()}
                <h2 className="text-xl font-bold text-slate-900">{expandedCard.title}</h2>
              </div>
              <button onClick={() => setExpandedConcept(null)} className="text-slate-600 hover:text-slate-800 transition-colors p-1"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex items-center gap-3 mb-6">
                <span className={`text-xs px-2 py-0.5 rounded-full ${expandedCard.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-600' : expandedCard.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>{expandedCard.difficulty}</span>
                <span className="text-slate-500 text-xs">~3 min read</span>
              </div>
              <div className="space-y-4">
                {expandedCard.fullText.map((p: string, i: number) => (
                  <p key={i} className="text-slate-700 text-sm leading-7">{p}</p>
                ))}
              </div>
              <div className="bg-indigo-500/10 border border-indigo-200 rounded-xl p-4 mt-6">
                <div className="flex gap-2">
                  <Lightbulb size={16} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                  <p className="text-indigo-800 text-sm font-medium">{expandedCard.takeaway}</p>
                </div>
              </div>
              {expandedCard.related && (
                <div className="mt-6">
                  <p className="text-slate-600 text-sm font-medium mb-2">Related Concepts</p>
                  <div className="flex gap-2 flex-wrap">
                    {expandedCard.related.map((rid: string) => {
                      const rc = conceptCards.find(c => c.id === rid);
                      return rc ? (
                        <button key={rid} onClick={() => setExpandedConcept(rid)} className="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors">{rc.title}</button>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              <button onClick={() => { setExpandedConcept(null); setCurrentView('builder'); }}
                className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-colors text-sm">
                Apply This in the Builder →
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
