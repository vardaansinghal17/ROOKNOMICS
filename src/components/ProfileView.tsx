import { useEffect, useState } from 'react';
import {
  Mail, Calendar, Activity, TrendingUp, Award, LogOut, ArrowLeft,
  ShieldCheck, Loader2, ChevronRight, Clock, BarChart2, Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/api';
import type { AuthUser } from '@/lib/api';

// ── Types ────────────────────────────────────────────────────────────────────

interface UserStats {
  totalSimulations: number;
  avgReturn: number;
  bestPerformance: number;
}

interface SimPerformance {
  totalReturn: number;
  benchmarkReturn: number;
  sharpeRatio: number;
  numberOfTrades: number;
  maxDrawdown: number;
  winRate: number;
  finalValue: number;
  profitFactor: number;
}

interface SimVerdict {
  status: 'OUTPERFORMED' | 'UNDERPERFORMED' | 'NO_SIGNIFICANT_DIFFERENCE' | 'STRATEGY_INACTIVE';
  summary: string;
  insights: string[];
}

interface SimStrategy {
  symbol: string;
  startDate: string;
  endDate: string;
  capital: number;
  activeRules: string[];
}

interface Simulation {
  _id: string;
  strategy: SimStrategy;
  performance: SimPerformance;
  verdict: SimVerdict;
  createdAt: string;
}

interface ProfileViewProps {
  setCurrentView: (view: string) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 14 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] as any },
});

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function verdictMeta(status: SimVerdict['status']) {
  switch (status) {
    case 'OUTPERFORMED':
      return { label: 'OUTPERFORMED',  color: 'text-emerald-400', ring: 'border-emerald-400/20', glow: 'hover:border-emerald-400/30' };
    case 'UNDERPERFORMED':
      return { label: 'UNDERPERFORMED', color: 'text-rose-400',    ring: 'border-rose-400/20',    glow: 'hover:border-rose-400/30' };
    case 'NO_SIGNIFICANT_DIFFERENCE':
      return { label: 'NEUTRAL',        color: 'text-amber-400',   ring: 'border-amber-400/20',   glow: 'hover:border-amber-400/30' };
    default:
      return { label: 'INACTIVE',       color: 'text-zinc-500',    ring: 'border-zinc-600/20',    glow: 'hover:border-zinc-500/30' };
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SimCard({ sim, onClick }: { sim: Simulation; onClick: () => void }) {
  const meta   = verdictMeta(sim.verdict.status);
  const ret    = sim.performance.totalReturn;
  const retPos = ret >= 0;

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`w-full text-left border bg-[#0B0B0B] px-4 py-4 transition-all duration-200 ${meta.ring} ${meta.glow} hover:bg-[#0E0E0E]`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: symbol + date */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-[#EAEAEA] tracking-wide">
              {sim.strategy.symbol}
            </span>
            <span className={`text-[9px] uppercase tracking-[0.15em] font-medium px-1.5 py-0.5 border ${meta.ring} ${meta.color}`}>
              {meta.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#4A4A4A]">
            <Clock size={9} />
            <span>{relativeTime(sim.createdAt)}</span>
            <span className="text-[#2A2A2A]">·</span>
            <span>
              {new Date(sim.strategy.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              {' – '}
              {new Date(sim.strategy.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Right: return + arrow */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className={`text-lg font-bold leading-none ${retPos ? 'text-emerald-400' : 'text-rose-400'}`}>
              {retPos ? '+' : ''}{ret.toFixed(2)}%
            </p>
            <p className="text-[10px] text-[#3A3A3A] mt-0.5">total return</p>
          </div>
          <ChevronRight size={12} className="text-[#3A3A3A]" />
        </div>
      </div>

      {/* Bottom stats row */}
      <div className="mt-3 pt-3 border-t border-[#0F0F0F] flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <BarChart2 size={9} className="text-[#3A3A3A]" />
          <span className="text-[10px] text-[#4A4A4A]">
            Sharpe <span className="text-[#7A7A7A]">{sim.performance.sharpeRatio?.toFixed(2) ?? '—'}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap size={9} className="text-[#3A3A3A]" />
          <span className="text-[10px] text-[#4A4A4A]">
            Trades <span className="text-[#7A7A7A]">{sim.performance.numberOfTrades ?? '—'}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[10px] text-[#3A3A3A]">
            vs index{' '}
            <span className={ret >= sim.performance.benchmarkReturn ? 'text-emerald-400/70' : 'text-rose-400/70'}>
              {ret >= sim.performance.benchmarkReturn ? '+' : ''}
              {(ret - sim.performance.benchmarkReturn).toFixed(2)}%
            </span>
          </span>
        </div>
      </div>
    </motion.button>
  );
}

function SimDetail({ sim, onBack }: { sim: Simulation; onBack: () => void }) {
  const meta   = verdictMeta(sim.verdict.status);
  const ret    = sim.performance.totalReturn;
  const retPos = ret >= 0;

  const metrics = [
    { label: 'Total Return',      value: `${ret >= 0 ? '+' : ''}${ret.toFixed(2)}%`,                        color: retPos ? 'text-emerald-400' : 'text-rose-400' },
    { label: 'Benchmark Return',  value: `${sim.performance.benchmarkReturn >= 0 ? '+' : ''}${sim.performance.benchmarkReturn.toFixed(2)}%`, color: 'text-[#CACACA]' },
    { label: 'Sharpe Ratio',      value: sim.performance.sharpeRatio?.toFixed(2) ?? '—',                     color: 'text-[#CACACA]' },
    { label: 'Max Drawdown',      value: `${sim.performance.maxDrawdown?.toFixed(2) ?? '—'}%`,               color: 'text-rose-400/80' },
    { label: 'Win Rate',          value: `${sim.performance.winRate?.toFixed(1) ?? '—'}%`,                   color: 'text-[#CACACA]' },
    { label: 'Trades',            value: String(sim.performance.numberOfTrades ?? '—'),                      color: 'text-[#CACACA]' },
    { label: 'Profit Factor',     value: sim.performance.profitFactor?.toFixed(2) ?? '—',                    color: 'text-[#CACACA]' },
    { label: 'Final Value',       value: `$${sim.performance.finalValue?.toLocaleString('en-US', { maximumFractionDigits: 0 }) ?? '—'}`, color: 'text-[#CACACA]' },
  ];

  return (
    <motion.div {...fadeUp(0)}>
      {/* Back */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#5F5F5F] transition-colors hover:text-[#EAEAEA]"
      >
        <ArrowLeft size={12} /> Back to history
      </button>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#5F5F5F] mb-1">Simulation</p>
          <h2 className="text-2xl font-bold text-[#EAEAEA]">{sim.strategy.symbol}</h2>
          <p className="text-xs text-[#5F5F5F] mt-0.5">
            {new Date(sim.strategy.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {' – '}
            {new Date(sim.strategy.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            <span className="text-[#3A3A3A]"> · </span>
            {relativeTime(sim.createdAt)}
          </p>
        </div>
        <span className={`text-[9px] uppercase tracking-[0.15em] font-medium px-2 py-1 border ${meta.ring} ${meta.color}`}>
          {meta.label}
        </span>
      </div>

      {/* Verdict summary */}
      {sim.verdict.summary && (
        <div className="mb-6 border border-[#141414] bg-[#080808] px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#4A4A4A] mb-1.5">Verdict</p>
          <p className="text-sm text-[#AAAAAA] leading-relaxed">{sim.verdict.summary}</p>
        </div>
      )}

      {/* Metrics grid */}
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#5F5F5F] mb-3">Performance</p>
        <div className="grid grid-cols-2 gap-px bg-[#0F0F0F]">
          {metrics.map(({ label, value, color }) => (
            <div key={label} className="bg-[#080808] px-4 py-3">
              <p className="text-[10px] text-[#4A4A4A] mb-1">{label}</p>
              <p className={`text-base font-semibold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      {sim.verdict.insights?.length > 0 && (
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#5F5F5F] mb-3">Insights</p>
          <ul className="space-y-2">
            {sim.verdict.insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[#6A6A6A]">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[#3A3A3A]" />
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Strategy config */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#5F5F5F] mb-3">Strategy</p>
        <div className="border border-[#141414] bg-[#080808] divide-y divide-[#0F0F0F]">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-xs text-[#5A5A5A]">Capital</span>
            <span className="text-xs text-[#CACACA]">${sim.strategy.capital?.toLocaleString()}</span>
          </div>
          <div className="flex items-start justify-between px-4 py-3">
            <span className="text-xs text-[#5A5A5A]">Rules</span>
            <div className="flex flex-wrap justify-end gap-1 max-w-[60%]">
              {sim.strategy.activeRules?.map((r) => (
                <span key={r} className="text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5 border border-[#1A1A1A] text-[#5A5A5A]">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProfileView({ setCurrentView }: ProfileViewProps) {
  const { user: cachedUser, handleLogout, fetchCurrentUser, isMeLoading } = useAuth();

  const [liveUser,    setLiveUser]    = useState<AuthUser | null>(null);
  const [stats,       setStats]       = useState<UserStats | null>(null);
  const [meError,     setMeError]     = useState(false);

  const [simulations,   setSimulations]   = useState<Simulation[]>([]);
  const [simsLoading,   setSimsLoading]   = useState(true);
  const [simsError,     setSimsError]     = useState(false);
  const [selectedSim,   setSelectedSim]   = useState<Simulation | null>(null);

  useEffect(() => {
    fetchCurrentUser()
      .unwrap()
      .then((freshUser) => setLiveUser(freshUser))
      .catch(() => setMeError(true));

    apiRequest<{ stats: UserStats }>('/user/stats')
      .then((data) => setStats(data.stats))
      .catch(() => {});

    apiRequest<{ simulations: Simulation[] }>('/simulations')
      .then((data) => setSimulations(data.simulations ?? []))
      .catch(() => setSimsError(true))
      .finally(() => setSimsLoading(false));
  }, []);

  const user      = liveUser ?? cachedUser;
  const initials  = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';
  const avatarUrl = user?.avatar ?? null;
  const joinedDate =
    user && (user as any).createdAt
      ? new Date((user as any).createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : null;

  // ── Simulation detail view ──
  if (selectedSim) {
    return (
      <div className="min-h-screen" style={{ background: '#050505' }}>
        <div className="mx-auto max-w-2xl px-6 py-16">
          <SimDetail sim={selectedSim} onBack={() => setSelectedSim(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#050505' }}>
      <div className="mx-auto max-w-2xl px-6 py-16">

        {/* Page header */}
        <motion.div {...fadeUp(0)}>
          <button
            onClick={() => setCurrentView('landing')}
            className="mb-8 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#5F5F5F] transition-colors hover:text-[#EAEAEA]"
          >
            <ArrowLeft size={12} />
            Back
          </button>
          <p className="mb-1 text-[10px] uppercase tracking-[0.35em] text-[#5F5F5F]">Account</p>
          <h1 className="text-3xl font-bold text-[#EAEAEA]">Profile</h1>
        </motion.div>

        {meError && !isMeLoading && (
          <motion.p {...fadeUp(0.05)} className="mt-4 text-[11px] text-[#5F5F5F]">
            Could not refresh session. Showing cached data.
          </motion.p>
        )}

        {/* User identity */}
        <motion.div
          {...fadeUp(0.06)}
          className="mb-10 mt-10 flex items-center gap-5 border-b border-[#111111] pb-8"
        >
          <div className="relative flex-shrink-0">
            {isMeLoading && !liveUser ? (
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#1A1A1A] bg-[#0A0A0A]">
                <Loader2 size={18} className="animate-spin text-[#3A3A3A]" />
              </div>
            ) : avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.name ?? 'avatar'}
                className="h-14 w-14 rounded-full border border-[#1A1A1A] object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/10 text-base font-bold text-emerald-300">
                {initials}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-emerald-400/30 bg-[#050505]">
              <ShieldCheck size={9} className="text-emerald-400" />
            </span>
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-[#EAEAEA]">
              {user?.name ?? <span className="text-[#3A3A3A]">—</span>}
            </h2>
            <p className="truncate text-sm text-[#7A7A7A]">{user?.email}</p>
          </div>
        </motion.div>

        {/* Account Info */}
        <motion.div {...fadeUp(0.1)} className="mb-10">
          <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-[#5F5F5F]">Account Info</p>
          <div className="divide-y divide-[#0F0F0F]">
            <div className="flex items-center justify-between py-3.5">
              <div className="flex items-center gap-3 text-sm text-[#6A6A6A]">
                <Mail size={13} />
                Email
              </div>
              <span className="text-sm text-[#CACACA]">{user?.email ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between py-3.5">
              <div className="flex items-center gap-3 text-sm text-[#6A6A6A]">
                <Calendar size={13} />
                Member since
              </div>
              <span className="text-sm text-[#CACACA]">
                {joinedDate ?? <span className="text-[#3A3A3A]">—</span>}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Strategy Stats */}
        <motion.div {...fadeUp(0.15)} className="mb-10">
          <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-[#5F5F5F]">Strategy Stats</p>
          <div className="grid grid-cols-3 gap-3">

            <div className="border border-[#141414] bg-[#080808] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Activity size={11} className="text-[#4A4A4A]" />
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#4A4A4A]">Simulations</span>
              </div>
              <p className="text-2xl font-bold text-[#EAEAEA]">
                {stats?.totalSimulations != null
                  ? stats.totalSimulations
                  : <span className="text-xl text-[#2A2A2A]">—</span>
                }
              </p>
            </div>

            <div className="border border-[#141414] bg-[#080808] p-4">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp size={11} className="text-[#4A4A4A]" />
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#4A4A4A]">Avg Return</span>
              </div>
              <p className="text-2xl font-bold">
                {stats?.avgReturn != null ? (
                  <span className={stats.avgReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {stats.avgReturn >= 0 ? '+' : ''}{stats.avgReturn.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-xl text-[#2A2A2A]">—</span>
                )}
              </p>
            </div>

            <div className="border border-[#141414] bg-[#080808] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Award size={11} className="text-[#4A4A4A]" />
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#4A4A4A]">Best Run</span>
              </div>
              <p className="text-2xl font-bold">
                {stats?.bestPerformance != null ? (
                  <span className="text-emerald-400">+{stats.bestPerformance.toFixed(1)}%</span>
                ) : (
                  <span className="text-xl text-[#2A2A2A]">—</span>
                )}
              </p>
            </div>
          </div>

          {stats == null && (
            <p className="mt-3 text-[11px] text-[#2A2A2A]">
              Run a backtest to populate your stats.
            </p>
          )}
        </motion.div>

        {/* Simulation History */}
        <motion.div {...fadeUp(0.2)} className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#5F5F5F]">Simulation History</p>
            {simulations.length > 0 && (
              <span className="text-[10px] text-[#3A3A3A]">{simulations.length} run{simulations.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          {simsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[88px] border border-[#0F0F0F] bg-[#0B0B0B] animate-pulse" />
              ))}
            </div>
          ) : simsError ? (
            <p className="text-[12px] text-[#3A3A3A]">Failed to load simulations.</p>
          ) : simulations.length === 0 ? (
            <div className="border border-[#0F0F0F] bg-[#080808] px-6 py-8 text-center">
              <p className="text-sm text-[#3A3A3A] mb-4">No simulations yet. Run your first strategy.</p>
              <button
                onClick={() => setCurrentView('builder')}
                className="text-[11px] uppercase tracking-[0.2em] border border-[#1A1A1A] px-4 py-2 text-[#6A6A6A] transition-colors hover:border-emerald-400/20 hover:text-emerald-400"
              >
                Go to Builder
              </button>
            </div>
          ) : (
            <div className="space-y-px">
              <AnimatePresence>
                {simulations.map((sim) => (
                  <SimCard
                    key={sim._id}
                    sim={sim}
                    onClick={() => setSelectedSim(sim)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div {...fadeUp(0.25)}>
          <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-[#5F5F5F]">Actions</p>
          <button
            onClick={() => { handleLogout(); setCurrentView('landing'); }}
            className="flex items-center gap-3 border border-[#141414] bg-[#080808] px-5 py-3 text-sm text-[#6A6A6A] transition-all hover:border-rose-400/20 hover:bg-rose-400/5 hover:text-rose-300"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </motion.div>

      </div>
    </div>
  );
}
