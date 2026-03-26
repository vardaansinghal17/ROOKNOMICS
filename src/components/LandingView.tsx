import { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { fadeUp, staggerContainer, scaleUp } from '@/lib/animations';
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
    iconBg: 'bg-indigo-100',
    title: 'Instant Backtesting',
    desc: 'Test your strategy against 20 years of S&P 500 data in seconds. No coding, no spreadsheets, just pure insight.',
  },
  {
    icon: TrendingUp,
    iconBg: 'bg-emerald-100',
    title: 'Real Comparisons',
    desc: 'See exactly how your strategy stacks up against simple buy-and-hold.',
  },
  {
    icon: Shield,
    iconBg: 'bg-rose-100',
    title: 'Risk Analysis',
    desc: 'Understand drawdowns, Sharpe ratios, and hidden costs before risking real money.',
  },
];

const testimonials = [
  { name: 'Alex M.', role: 'Retail Investor', text: 'I was convinced my RSI strategy was genius. ROOKNOMICS showed me the S&P beat it by 285 percentage points. Humbling, but it saved me thousands in potential mistakes.', stars: 5 },
  { name: 'Sarah K.', role: 'Finance Student', text: 'The Learning Hub alone is worth it. Finally understood Sharpe ratios and why passive investing wins.', stars: 5 },
  { name: 'David L.', role: 'Day Trader', text: 'Painful truth delivered beautifully. The verdict panel hits different when you see your strategy vs the index.', stars: 4 },
];

interface LandingViewProps {
  setCurrentView: (v: string) => void;
  setShowAuth: (v: boolean) => void;
}

export default function LandingView({ setCurrentView, setShowAuth }: LandingViewProps) {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Visual flair - blurred blobs */}
      <motion.div style={{ y: y1 }} className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-[100%] pointer-events-none -z-10" />
      <motion.div style={{ y: y2 }} className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-[100%] pointer-events-none -z-10" />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 lg:pt-32 lg:pb-24">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <div className="relative z-10">

            <motion.h1 variants={fadeUp} className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
              Think you can beat the{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent relative">
                market?

              </span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-slate-600 text-lg md:text-xl leading-relaxed mb-10 max-w-lg font-medium">
              Build a custom trading strategy using technical indicators—then watch it go head-to-head against the S&P 500 over 20 years of real market data.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setCurrentView('builder')}
                className="bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 text-base shadow-lg shadow-indigo-600/20"
              >
                Build Your Strategy <ArrowRight size={18} />
              </button>
              <button
                onClick={() => setCurrentView('results')}
                className="bg-white hover:bg-slate-50 text-slate-800 font-bold px-8 py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 text-base border-2 border-slate-200 hover:border-slate-300 shadow-sm"
              >
                <Play size={16} className="text-indigo-600" /> See How It Looks
              </button>
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-6 mt-10 text-slate-600 text-sm font-medium">
              <span className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Free forever</span>
              <span className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> No signup required</span>
              <span className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> 20 years of data</span>
            </motion.div>
          </div>

          {/* App preview mockup - refined */}
          <motion.div variants={scaleUp} className="relative z-10 lg:ml-auto w-full max-w-[500px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-[2.5rem] transform rotate-3 scale-[1.03] -z-10 blur-sm" />
            <div className="bg-white border border-slate-200/80 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-slate-400 text-xs font-medium ml-2 tracking-wide">ROOKNOMICS.app</span>
                </div>
              </div>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Your Strategy vs S&P 500</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-slate-900 text-3xl font-extrabold tracking-tight">+47%</p>
                    <span className="text-slate-400 text-sm font-medium">vs</span>
                    <p className="text-emerald-600 text-xl font-bold">+332%</p>
                  </div>
                </div>
                <div className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mb-1 border border-emerald-200">S&P WINS</div>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={miniChartData}>
                    <defs>
                      <linearGradient id="heroUser" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="heroSp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="user" stroke="#f43f5e" strokeWidth={2} fill="url(#heroUser)" />
                    <Area type="monotone" dataKey="sp500" stroke="#10b981" strokeWidth={3} fill="url(#heroSp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Floating badges with animation */}
            <div className="absolute -top-6 -right-6 bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-rose-500" />
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Max Drawdown</p>
              </div>
              <p className="text-slate-900 text-lg font-bold">-38.4%</p>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={14} className="text-indigo-500" />
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Sharpe Ratio</p>
              </div>
              <p className="text-slate-900 text-lg font-bold">0.82</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features - Bento Box Style */}
      <section className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <motion.div 
          className="mb-16 text-center lg:text-left lg:max-w-2xl"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Everything you need to test your trading thesis
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed">
            No spreadsheets, no coding, no BS. Just honest results visualized beautifully to save you from costly mistakes.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 grid-flow-row-dense"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((f, i) => {
            const isLarge = i === 0;
            return (
              <motion.div variants={fadeUp} key={i} whileHover={{ scale: 1.05, y: -5 }} className={`bg-white border border-slate-200/60 p-8 lg:p-10 rounded-[2rem] hover:border-indigo-300 transition-all duration-500 group relative overflow-hidden shadow-sm hover:shadow-2xl flex flex-col ${isLarge ? 'lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-white to-indigo-50/50 justify-center' : 'lg:col-span-1'}`}>
                <div className="absolute -right-10 -top-10 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                  <f.icon size={isLarge ? 240 : 160} />
                </div>
                <div className={`rounded-2xl p-4 inline-flex mb-8 self-start ${f.iconBg} shadow-inner`}>
                  <f.icon size={28} className="text-slate-800" strokeWidth={1.5} />
                </div>
                <h3 className={`${isLarge ? 'text-3xl lg:text-4xl' : 'text-xl'} text-slate-900 font-bold mb-4 tracking-tight`}>{f.title}</h3>
                <p className={`text-slate-600 leading-relaxed ${isLarge ? 'text-xl max-w-lg' : 'text-base'}`}>{f.desc}</p>
                {isLarge && (
                  <div className="mt-12 pt-6 border-t border-slate-200/60 flex items-center text-indigo-600 font-semibold gap-2 group-cursor cursor-pointer w-max">
                    Explore builder capabilities <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* How it works - Vertical Stepper */}
      <section className="bg-slate-50/50 border-y border-slate-200 py-24 relative z-10">
        <motion.div 
          className="max-w-6xl mx-auto px-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative">
            <div className="lg:col-span-5 lg:sticky lg:top-32 text-center lg:text-left mb-8 lg:mb-0">
              <motion.div variants={fadeUp}>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                  How it works
                </h2>
                <p className="text-slate-600 text-lg">Three simple steps to reality-check your strategy.</p>
              </motion.div>
            </div>

            <div className="relative lg:col-span-7">
              {/* Connecting line */}
              <div className="hidden md:block absolute left-[31px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-indigo-200 via-rose-200 to-emerald-200" />

            {[
              { step: '1', title: 'Configure Your Strategy', desc: 'Set RSI thresholds, moving average crossover periods, and risk management parameters without writing a single line of code.' },
              { step: '2', title: 'Run the Backtest', desc: 'We instantly simulate your specific strategy against 20 years of S&P 500 historical data, accounting for trading fees.' },
              { step: '3', title: 'Face the Verdict', desc: 'See exactly how your strategy compares to a simple buy-and-hold indexing approach in a side-by-side performance review.' },
            ].map((s, i) => (
              <motion.div variants={fadeUp} key={i} className="relative flex flex-col md:flex-row gap-6 md:gap-10 mb-16 last:mb-0 group">
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center flex-shrink-0 z-10 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-indigo-400 group-hover:shadow-indigo-500/20">
                  <span className="text-indigo-600 font-black text-xl">{s.step}</span>
                </div>
                <div className="pt-3 bg-white px-8 py-6 rounded-3xl border border-slate-200/60 shadow-sm flex-1 hover:shadow-md transition-shadow">
                  <h3 className="text-xl text-slate-900 font-bold mb-3 tracking-tight">{s.title}</h3>
                  <p className="text-slate-600 text-base leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Testimonials - Marquee Scroll */}
      <section className="py-16 pb-12 relative z-10 overflow-hidden bg-slate-50/50 border-t border-slate-200/50">
        <motion.div 
          className="mb-12 text-center max-w-7xl mx-auto px-6"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            What traders are saying
          </h2>
          <p className="text-slate-600 text-lg">Don't just take our word for it. See what others have built.</p>
        </motion.div>

        <div className="relative flex overflow-x-hidden group py-4" style={{ '--duration': '40s' } as React.CSSProperties}>
          <div className="flex animate-marquee hover:[animation-play-state:paused] w-max gap-8 pr-8">
            {/* Mathematically perfect loop: total width contains 2N items and 2N gaps, so -50% transform shifts exactly N sets */}
            {[...testimonials, ...testimonials, ...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="w-[350px] md:w-[420px] shrink-0 bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm hover:shadow-lg transition-transform hover:-translate-y-1 flex flex-col justify-between cursor-default">
                <div>
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} size={16} className="text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-slate-700 leading-relaxed mb-8 italic text-base">"{t.text}"</p>
                </div>
                <div className="flex items-center gap-4 border-t border-slate-100 pt-6 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-lg">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-slate-900 text-sm font-bold">{t.name}</p>
                    <p className="text-slate-500 text-sm font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Fading gradient edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[15%] bg-gradient-to-r from-slate-50 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[15%] bg-gradient-to-l from-slate-50 to-transparent z-10" />
        </div>
      </section>

      {/* CTA Layered */}
      <section className="px-6 py-8 relative z-10 pt-16">
        <motion.div 
          className="max-w-4xl mx-auto bg-slate-100 rounded-[3rem] p-10 lg:p-16 text-center relative overflow-hidden shadow-xl shadow-slate-200/50 border-2 border-white backdrop-blur-sm"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/50 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Ready to test your edge?
            </h2>
            <p className="text-slate-600 text-lg lg:text-xl mb-10 max-w-xl mx-auto font-medium">
              Most strategies look great on paper. Find out if yours survives 20 years of real market conditions.
            </p>
            <button
              onClick={() => setCurrentView('builder')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-10 py-5 rounded-2xl transition-all duration-300 text-lg shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] inline-flex items-center gap-3 hover:-translate-y-1"
            >
              Start Building Now <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <BarChart2 size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-slate-600 font-bold text-sm tracking-wide">ROOKNOMICS © 2024</span>
          </div>
          <div className="flex gap-8 text-slate-500 text-sm font-medium">
            <button onClick={() => setCurrentView('learn')} className="hover:text-indigo-600 transition-colors">Learning Hub</button>
            <button onClick={() => setCurrentView('builder')} className="hover:text-indigo-600 transition-colors">Strategy Builder</button>
            <button onClick={() => setCurrentView('results')} className="hover:text-indigo-600 transition-colors">Demo Results</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
