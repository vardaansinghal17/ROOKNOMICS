import { useState } from 'react';
import {
  BarChart2, TrendingUp, Shield, Zap, ArrowRight, Play,
  CheckCircle, ChevronRight, Star,
} from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer,
} from 'recharts';

const miniChartData = Array.from({ length: 40 }, (_, i) => ({
  x: i,
  user: 10000 + Math.sin(i * 0.3) * 2000 + i * 50,
  sp500: 10000 + i * 200 + Math.sin(i * 0.15) * 800,
}));

const features = [
  {
    icon: Zap,
    iconBg: 'bg-indigo-500/15',
    title: 'Instant Backtesting',
    desc: 'Test your strategy against 20 years of S&P 500 data in seconds.',
  },
  {
    icon: TrendingUp,
    iconBg: 'bg-emerald-500/15',
    title: 'Real Comparisons',
    desc: 'See exactly how your strategy stacks up against simple buy-and-hold.',
  },
  {
    icon: Shield,
    iconBg: 'bg-rose-500/15',
    title: 'Risk Analysis',
    desc: 'Understand drawdowns, Sharpe ratios, and hidden costs before risking real money.',
  },
];

const testimonials = [
  { name: 'Alex M.', role: 'Retail Investor', text: 'I was convinced my RSI strategy was genius. BacktestIQ showed me the S&P beat it by 285 percentage points. Humbling, but it saved me thousands.', stars: 5 },
  { name: 'Sarah K.', role: 'Finance Student', text: 'The Learning Hub alone is worth it. Finally understood Sharpe ratios and why passive investing wins for most people.', stars: 5 },
  { name: 'David L.', role: 'Day Trader', text: 'Painful truth delivered beautifully. The verdict panel hit different when you see your strategy vs the index side by side.', stars: 4 },
];

interface LandingViewProps {
  setCurrentView: (v: string) => void;
  setShowAuth: (v: boolean) => void;
}

export default function LandingView({ setCurrentView, setShowAuth }: LandingViewProps) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-600/15 border border-indigo-500/30 rounded-full px-4 py-1.5 mb-6">
              <Zap size={14} className="text-indigo-400" />
              <span className="text-indigo-300 text-xs font-medium">Free backtesting tool · No signup required</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-100 leading-tight mb-6" style={{ fontFamily: 'Syne' }}>
              Think you can beat the{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">market?</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-lg">
              Build a trading strategy using RSI, moving averages, and more—then watch it go head-to-head against the S&P 500 over 20 years of real data.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setCurrentView('builder')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-[0_0_30px_rgba(99,102,241,0.3)]"
              >
                Build Your Strategy <ArrowRight size={16} />
              </button>
              <button
                onClick={() => setCurrentView('results')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-6 py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm border border-slate-700"
              >
                <Play size={14} /> See Demo Results
              </button>
            </div>
            <div className="flex items-center gap-6 mt-8 text-slate-500 text-xs">
              <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-500" /> Free forever</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-500" /> No sign-up needed</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-500" /> 20 years of data</span>
            </div>
          </div>

          {/* App preview mockup */}
          <div className="relative">
            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 shadow-2xl shadow-indigo-500/5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-rose-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <span className="text-slate-500 text-xs ml-2">backtestiq.app</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-slate-400 text-xs">Your Strategy vs S&P 500</p>
                  <p className="text-slate-100 text-lg font-bold">+47% <span className="text-slate-500 text-sm font-normal">vs</span> <span className="text-emerald-400">+332%</span></p>
                </div>
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">S&P WINS</span>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={miniChartData}>
                    <defs>
                      <linearGradient id="heroUser" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="heroSp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="user" stroke="#f43f5e" strokeWidth={1.5} fill="url(#heroUser)" />
                    <Area type="monotone" dataKey="sp500" stroke="#10b981" strokeWidth={2} fill="url(#heroSp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Floating badges */}
            <div className="absolute -top-3 -right-3 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 shadow-lg">
              <p className="text-rose-400 text-xs font-bold">Max Drawdown</p>
              <p className="text-slate-100 text-sm font-bold">-38.4%</p>
            </div>
            <div className="absolute -bottom-3 -left-3 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 shadow-lg">
              <p className="text-indigo-400 text-xs font-bold">Sharpe Ratio</p>
              <p className="text-slate-100 text-sm font-bold">0.82</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-slate-100 text-center mb-3" style={{ fontFamily: 'Syne' }}>
          Everything you need to test your trading thesis
        </h2>
        <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
          No spreadsheets, no coding, no BS. Just honest results.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300 group">
              <div className={`rounded-xl p-3 inline-flex mb-4 ${f.iconBg}`}>
                <f.icon size={22} className="text-slate-200" strokeWidth={1.5} />
              </div>
              <h3 className="text-slate-100 font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-slate-100 text-center mb-12" style={{ fontFamily: 'Syne' }}>
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Configure Your Strategy', desc: 'Set RSI thresholds, moving average periods, and risk parameters.' },
            { step: '02', title: 'Run the Backtest', desc: 'We simulate your strategy against 20 years of S&P 500 historical data.' },
            { step: '03', title: 'Face the Verdict', desc: 'See exactly how your strategy compares to simple buy-and-hold indexing.' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-400 font-bold text-sm">{s.step}</span>
              </div>
              <h3 className="text-slate-100 font-semibold mb-2">{s.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              {i < 2 && <ChevronRight size={16} className="text-slate-600 mx-auto mt-4 rotate-90 md:rotate-0 hidden md:block" />}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-slate-100 text-center mb-12" style={{ fontFamily: 'Syne' }}>
          What traders are saying
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
              <div>
                <p className="text-slate-100 text-sm font-semibold">{t.name}</p>
                <p className="text-slate-500 text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-slate-100 mb-4" style={{ fontFamily: 'Syne' }}>
          Ready to test your edge?
        </h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Most strategies look great on paper. Let's see if yours survives 20 years of real market data.
        </p>
        <button
          onClick={() => setCurrentView('builder')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 text-sm shadow-[0_0_40px_rgba(99,102,241,0.3)] inline-flex items-center gap-2"
        >
          Start Building <ArrowRight size={16} />
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
              <BarChart2 size={12} className="text-white" />
            </div>
            <span className="text-slate-500 text-sm">BacktestIQ © 2024</span>
          </div>
          <div className="flex gap-6 text-slate-500 text-sm">
            <button onClick={() => setCurrentView('learn')} className="hover:text-slate-300 transition-colors">Learn</button>
            <button onClick={() => setCurrentView('builder')} className="hover:text-slate-300 transition-colors">Builder</button>
            <button onClick={() => setCurrentView('results')} className="hover:text-slate-300 transition-colors">Results</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
