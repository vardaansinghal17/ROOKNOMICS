import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import {
  ArrowRight, Play, BarChart2, TrendingUp, Shield, Zap,
  Activity, GitBranch, ChevronRight,
} from 'lucide-react';
import {
} from 'recharts';
import ScrollCandlestickChart from './ScrollCandlestickChart';

/* ── MOCK DATA ─────────────────────────────────────── */
const miniChartData = Array.from({ length: 50 }, (_, i) => ({
  x: i,
  user: 10000 + Math.sin(i * 0.3) * 2000 + i * 60,
  sp500: 10000 + i * 260 + Math.sin(i * 0.15) * 600,
}));

const features = [
  {
    label: 'BACKTESTING',
    icon: Zap,
    title: 'Simulation Engine',
    desc: 'Test your strategy against 20 years of market data. Every tick, every signal, every trade — simulated with precision.',
  },
  {
    label: 'COMPARISON',
    icon: TrendingUp,
    title: 'Index Benchmark',
    desc: 'Quantified comparison against S&P 500 buy-and-hold. No guesswork. Pure performance differential.',
  },
  {
    label: 'RISK PROFILE',
    icon: Shield,
    title: 'Risk Metrics',
    desc: 'Sharpe ratio, max drawdown, VaR. Understand the cost of every decision before real capital is at stake.',
  },
  {
    label: 'RULE ENGINE',
    icon: GitBranch,
    title: 'Logic Builder',
    desc: 'Configure RSI, MA crossover, stop-loss, and take-profit rules. Code-free, precision-first.',
  },
];

const steps = [
  {
    num: '01',
    tag: 'CONFIGURE',
    title: 'Define Your Rules',
    desc: 'Set RSI thresholds, moving average crossover periods, and risk parameters. Each rule becomes part of an executable strategy.',
  },
  {
    num: '02',
    tag: 'EXECUTE',
    title: 'Run Simulation',
    desc: 'The engine processes 20 years of price data, executes every signal, accounts for trading fees, and outputs an equity curve.',
  },
  {
    num: '03',
    tag: 'ANALYZE',
    title: 'Face the Verdict',
    desc: 'See how your strategy compares to passive indexing. Sharpe ratio, drawdown, and total return — all measured and ranked.',
  },
];

const stats = [
  { label: 'DATA RANGE', value: '2000–2024' },
  { label: 'ENGINE', value: 'ACTIVE' },
  { label: 'LATENCY', value: '<1MS' },
  { label: 'STATUS', value: 'ONLINE' },
];

/* ── ANIMATED NUMBER COUNTER ───────────────────────── */
function AnimatedNumber({ value, suffix = '' }: { value: string; suffix?: string }) {
  return (
    <span className="inline-block count-up">{value}{suffix}</span>
  );
}

/* ── SYSTEM META TAG ───────────────────────────────── */
function SysTag({ label, value, live = false }: { label: string; value: string; live?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] tracking-[0.2em] text-[#7A7A7A] font-medium uppercase">{label}</span>
      <span className="text-[10px] text-[#1A1A1A]">·</span>
      <span className={`text-[10px] font-mono font-medium tracking-wider ${live ? 'text-emerald-400' : 'text-[#EAEAEA]'}`}>
        {value}
      </span>
      {live && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot" />}
    </div>
  );
}

/* ── CUSTOM TOOLTIP ────────────────────────────────── */
function DarkTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0B0B0B] border border-[#1A1A1A] px-3 py-2 text-xs font-mono">
      <p className="text-[#7A7A7A] mb-1">EQUITY</p>
      <p className="text-emerald-400">INDEX: ${Math.round(payload[1]?.value || 0).toLocaleString()}</p>
      <p className="text-[#EAEAEA]">STRATEGY: ${Math.round(payload[0]?.value || 0).toLocaleString()}</p>
    </div>
  );
}

/* ── CSS CREDIT CARD ───────────────────────────────── */
function CSSCreditCard({ offset = false }: { offset?: boolean }) {
  return (
    <div
      className="relative w-full select-none"
      style={{
        aspectRatio: '85.6 / 54',
        borderRadius: '12px',
        background: offset
          ? 'linear-gradient(135deg, #1C1C1C 0%, #111 100%)'
          : 'linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 60%, #121212 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: offset
          ? '0 8px 40px rgba(0,0,0,0.6)'
          : '0 24px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04)',
        overflow: 'hidden',
      }}
    >
      {/* Surface light sheen */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
      }} />

      {/* Top strip */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
      }} />

      {!offset && (
        <>
          {/* Brand name */}
          <div className="absolute top-[14%] left-[6%]">
            <span style={{
              fontSize: 'clamp(7px, 1.2vw, 11px)',
              letterSpacing: '0.22em',
              color: 'rgba(255,255,255,0.55)',
              fontFamily: 'Space Grotesk, monospace',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}>ROOKNOMICS</span>
          </div>

          {/* Contactless symbol top-right */}
          <div className="absolute top-[14%] right-[6%] flex flex-col gap-[2px] items-center">
            {[12, 9, 6].map((w, i) => (
              <div key={i} style={{
                width: `${w}px`, height: '1.5px',
                borderRadius: '2px',
                background: 'rgba(255,255,255,0.3)',
              }} />
            ))}
          </div>

          {/* EMV Chip */}
          <div className="absolute" style={{ top: '36%', left: '6%' }}>
            <div style={{
              width: 'clamp(28px, 5vw, 40px)',
              height: 'clamp(20px, 3.5vw, 28px)',
              borderRadius: '4px',
              background: 'linear-gradient(135deg, #C8A84B 0%, #E8CC6A 35%, #B8943B 65%, #D4AF50 100%)',
              border: '1px solid rgba(255,220,80,0.4)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Chip grid lines */}
              <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr 1fr' }}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} style={{ border: '0.5px solid rgba(0,0,0,0.2)' }} />
                ))}
              </div>
              {/* Center contact */}
              <div style={{
                position: 'absolute', top: '25%', left: '25%', right: '25%', bottom: '25%',
                background: 'linear-gradient(135deg, #E8CC6A, #C8A84B)',
                borderRadius: '1px',
              }} />
            </div>
          </div>

          {/* Card number placeholder */}
          <div className="absolute" style={{ bottom: '28%', left: '6%', display: 'flex', gap: '8px' }}>
            {[4, 4, 4, 4].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '2px' }}>
                {Array.from({ length: _ }).map((__, j) => (
                  <div key={j} style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                  }} />
                ))}
              </div>
            ))}
          </div>

          {/* Cardholder name */}
          <div className="absolute" style={{ bottom: '12%', left: '6%' }}>
            <div style={{
              width: '80px', height: '6px', borderRadius: '2px',
              background: 'rgba(255,255,255,0.15)',
            }} />
          </div>

          {/* Dual circle logo (bottom right) */}
          <div className="absolute" style={{ bottom: '12%', right: '6%', display: 'flex' }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%',
              background: 'rgba(200,168,75,0.7)',
            }} />
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%',
              background: 'rgba(200,168,75,0.45)',
              marginLeft: '-8px',
            }} />
          </div>

          {/* Bottom edge glow */}
          <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none" style={{
            background: 'linear-gradient(to top, rgba(245,197,66,0.03), transparent)',
          }} />
        </>
      )}
    </div>
  );
}

/* ── CARD SHOWCASE SECTION ─────────────────────────── */
function CardShowcaseSection({ setCurrentView }: { setCurrentView: (v: string) => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const cardY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const cardRotateX = useTransform(scrollYProgress, [0, 0.4, 1], [14, 0, -6]);
  const cardRotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-4, 0, 3]);
  const cardScale = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0.85, 1, 1, 0.96]);
  const glowOpacity = useTransform(scrollYProgress, [0.1, 0.45, 0.85], [0, 0.4, 0]);
  const borderOpacity = useTransform(scrollYProgress, [0.05, 0.3, 0.8, 1], [0.08, 0.5, 0.5, 0.08]);
  const scanLineY = useTransform(scrollYProgress, [0.08, 0.92], ['0%', '100%']);

  return (
    <section ref={sectionRef} className="relative z-10 border-t border-[#1A1A1A] bg-[#050505] overflow-hidden">
      {/* Section ambient glow */}
      <div
        className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[40%] h-[80%] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(245,197,66,0.03) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          {/* ── LEFT: Copy ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-5 flex flex-col"
          >
            <p className="text-[10px] tracking-[0.35em] text-[#7A7A7A] uppercase font-medium mb-5">
              The Instrument
            </p>
            <h2 className="text-[clamp(2rem,4vw,3.4rem)] font-black tracking-[-0.04em] text-[#EAEAEA] leading-[0.93] mb-6">
              Built for those<br />
              who <span className="text-[#F5C542]">outperform.</span>
            </h2>
            <p className="text-[#7A7A7A] text-sm leading-relaxed font-light mb-8 max-w-xs">
              Every decision made by elite traders demands tools engineered to match. Precision-grade. Minimal. Uncompromising.
            </p>

            <div className="space-y-3 mb-10">
              {[
                'Institutional-grade execution',
                'Real-time market data feeds',
                'Risk-adjusted position sizing',
                'Zero-latency signal routing',
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-3">
                  <span className="w-1 h-1 bg-[#F5C542] flex-shrink-0" />
                  <span className="text-[11px] font-mono tracking-[0.12em] text-[#5A5A5A] uppercase">{feat}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-px mb-10" style={{ background: '#1A1A1A' }}>
              {[
                { tag: 'MEMBERS', val: 'ELITE ONLY' },
                { tag: 'RETURNS', val: 'VERIFIED' },
                { tag: 'UPTIME', val: '99.99%' },
                { tag: 'SUPPORT', val: '24 / 7' },
              ].map(({ tag, val }) => (
                <div key={tag} className="bg-[#050505] px-4 py-3">
                  <p className="text-[8px] tracking-[0.2em] text-[#7A7A7A] uppercase mb-1">{tag}</p>
                  <p className="text-[11px] font-mono text-[#EAEAEA] font-medium">{val}</p>
                </div>
              ))}
            </div>

            <button
              id="card-section-apply"
              onClick={() => setCurrentView('builder')}
              className="group self-start flex items-center gap-3 px-6 py-3 border border-[#F5C542]/30 text-[#F5C542] text-xs font-bold tracking-widest uppercase hover:border-[#F5C542] hover:bg-[#F5C542]/5 transition-all duration-200"
            >
              APPLY FOR ACCESS
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </motion.div>

          {/* ── RIGHT: Cinematic Card Frame ── */}
          <div className="lg:col-span-7 flex items-center justify-center" style={{ perspective: '1200px' }}>
            <motion.div
              className="relative w-full max-w-lg"
              style={{ y: cardY, rotateX: cardRotateX, rotateY: cardRotateY, scale: cardScale, transformStyle: 'preserve-3d' }}
            >
              {/* Gold border frame */}
              <motion.div
                className="absolute -inset-4 pointer-events-none"
                style={{ opacity: borderOpacity, border: '1px solid rgba(245,197,66,1)' }}
              />

              {/* Corner brackets */}
              {[
                'top-0 left-0 border-t border-l',
                'top-0 right-0 border-t border-r',
                'bottom-0 left-0 border-b border-l',
                'bottom-0 right-0 border-b border-r',
              ].map((cls, i) => (
                <div key={i} className={`absolute -m-4 w-6 h-6 border-[#F5C542]/70 pointer-events-none ${cls}`} />
              ))}

              {/* Frame bg with grid */}
              <div className="relative overflow-hidden p-6 pb-12" style={{
                background: '#0A0A0A',
                backgroundImage: 'linear-gradient(rgba(245,197,66,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(245,197,66,0.025) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}>

                {/* Gold scan line (scroll-driven) */}
                <motion.div
                  className="absolute left-0 right-0 h-px z-30 pointer-events-none"
                  style={{
                    top: scanLineY,
                    background: 'linear-gradient(90deg, transparent, rgba(245,197,66,0.5) 20%, rgba(245,197,66,1) 50%, rgba(245,197,66,0.5) 80%, transparent)',
                    boxShadow: '0 0 10px 2px rgba(245,197,66,0.25)',
                  }}
                />

                {/* Glow bloom */}
                <motion.div
                  className="absolute inset-0 pointer-events-none z-10"
                  style={{
                    opacity: glowOpacity,
                    background: 'radial-gradient(ellipse at 60% 50%, rgba(245,197,66,0.1) 0%, transparent 65%)',
                  }}
                />

                {/* ── Card stack ── */}
                <div className="relative z-20">
                  {/* Back card (offset) */}
                  <div style={{ position: 'absolute', top: '14px', left: '14px', right: '-14px', zIndex: 1, opacity: 0.6 }}>
                    <CSSCreditCard offset />
                  </div>

                  {/* Front card */}
                  <motion.div
                    style={{ position: 'relative', zIndex: 2 }}
                    whileHover={{ rotateY: -5, rotateX: 3, scale: 1.02 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    <CSSCreditCard />
                  </motion.div>
                </div>

                {/* Bottom status bar */}
                <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2 border-t border-[#F5C542]/10"
                  style={{ background: 'rgba(5,5,5,0.9)' }}>
                  <span className="text-[9px] font-mono tracking-[0.25em] text-[#3A3A3A] uppercase">Rooknomics Black · Elite</span>
                  <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1.5 tracking-[0.2em]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ACTIVE
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ── WEALTH ACCUMULATION SECTION ───────────────────── */
function WealthAccumulationSection({ setCurrentView }: { setCurrentView: (v: string) => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Dynamic scroll transforms for the cinematic coin stack
  const imageY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.05, 0.85]);
  const imageRotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);
  const imageRotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-10, 0, 15]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3]);
  const glowOpacity = useTransform(scrollYProgress, [0.1, 0.5, 0.9], [0, 0.4, 0]);

  return (
    <section ref={sectionRef} className="relative z-10 border-t border-[#1A1A1A] bg-[#050505] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-5 flex flex-col"
          >
            <p className="text-[10px] tracking-[0.35em] text-[#7A7A7A] uppercase font-medium mb-5">
              The Accumulation
            </p>
            <h2 className="text-[clamp(2rem,4vw,3.4rem)] font-black tracking-[-0.04em] text-[#EAEAEA] leading-[0.93] mb-6">
              Growth through<br />
              calculated <span className="text-[#F5C542]">patience.</span>
            </h2>
            <p className="text-[#7A7A7A] text-sm leading-relaxed font-light mb-8 max-w-sm">
              True wealth is not built on impulse. It is engineered through systematic compounding, risk-adjusted parameters, and the refusal to succumb to emotional variance.
            </p>

            <div className="flex items-center gap-6 mb-10">
               <div className="flex flex-col gap-1">
                 <span className="text-[9px] tracking-[0.2em] text-[#7A7A7A] uppercase">Yield Goal</span>
                 <span className="text-xl font-mono text-[#F5C542] tracking-wider">+14.2%</span>
               </div>
               <div className="w-px h-8 bg-[#1A1A1A]" />
               <div className="flex flex-col gap-1">
                 <span className="text-[9px] tracking-[0.2em] text-[#7A7A7A] uppercase">Time Horizon</span>
                 <span className="text-xl font-mono text-white/90 tracking-wider">LONG</span>
               </div>
               <div className="w-px h-8 bg-[#1A1A1A]" />
               <div className="flex flex-col gap-1">
                 <span className="text-[9px] tracking-[0.2em] text-[#7A7A7A] uppercase">Variance</span>
                 <span className="text-xl font-mono text-white/90 tracking-wider">LOW</span>
               </div>
            </div>

            <button
              onClick={() => setCurrentView('builder')}
              className="group self-start flex items-center gap-3 px-6 py-3 border border-[#F5C542]/30 text-[#F5C542] text-xs font-bold tracking-widest uppercase hover:border-[#F5C542] hover:bg-[#F5C542]/5 transition-all duration-200"
            >
              SIMULATE RETURNS
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </motion.div>

          {/* Right: Cinematic Scroll-Driven Coin Stack */}
          <div className="lg:col-span-7 flex items-center justify-center relative pointer-events-none" style={{ perspective: '1200px' }}>
            {/* Scroll-linked background glow */}
            <motion.div
              className="absolute inset-0 z-0"
              style={{
                opacity: glowOpacity,
                background: 'radial-gradient(ellipse at 50% 50%, rgba(245,197,66,0.18) 0%, transparent 60%)',
              }}
            />

            <motion.div
              style={{ 
                y: imageY, 
                scale: imageScale,
                rotateX: imageRotateX,
                rotateY: imageRotateY,
                opacity: imageOpacity,
                transformStyle: 'preserve-3d'
              }}
              className="relative w-full max-w-lg z-10 flex justify-center"
            >
              <img
                src="/gold-coin-stack.png"
                alt="Wealth Accumulation"
                className="w-full h-auto object-contain block drop-shadow-2xl"
                style={{ 
                  filter: 'contrast(1.08) brightness(1.05)',
                  // The key to a seamless blend: a radial gradient mask that feathers the edges completely
                  WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 40%, transparent 75%)',
                  maskImage: 'radial-gradient(ellipse at 50% 50%, black 40%, transparent 75%)'
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── PROTOCOL SECTION (EXECUTION PIPELINE) ─────────── */
function ProtocolSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 60%', 'end 70%'],
  });

  const stepsData = [
    {
      num: '01',
      tag: 'CONFIGURE',
      title: 'Define Your Rules',
      desc: 'Establish trigger thresholds, crossover periods, and risk caps. Every metric binds to an executable logic parameter.',
      meta: 'PARAMS: SECURED',
    },
    {
      num: '02',
      tag: 'EXECUTE',
      title: 'Run Simulation',
      desc: 'The core processes two decades of historical price action, executing absolute signals instantly without emotional latency.',
      meta: 'DATA RANGE: 20Y',
    },
    {
      num: '03',
      tag: 'ANALYZE',
      title: 'Face the Verdict',
      desc: 'Empirical comparison against passive indexing. Sharpe ratio, max drawdown, and true alpha are isolated and ranked.',
      meta: 'STATUS: VERIFIED',
    },
  ];

  return (
    <section className="relative z-10 border-t border-[#1A1A1A] py-32 bg-[#050505] overflow-hidden">
      {/* Background texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.015]" 
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      <div className="max-w-7xl mx-auto px-6" ref={containerRef}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* Left panel */}
          <div className="lg:col-span-4 lg:sticky top-32">
            <div className="relative pl-8">
              {/* Glowing vertical line */}
              <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-gradient-to-b from-emerald-400 via-emerald-400/20 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.4)]" />
              
              <p className="text-[10px] tracking-[0.35em] text-[#7A7A7A] mb-4 uppercase font-medium">PROTOCOL</p>
              <h2 className="text-[clamp(2.5rem,5vw,3.5rem)] font-black tracking-[-0.04em] text-[#EAEAEA] leading-[0.9] mb-6">
                Execution<br />Pipeline.
              </h2>
              <p className="text-[#7A7A7A] text-sm leading-relaxed font-light">
                A definitive, three-phase systematic engine. No bloat. No noise. Pure execution logic.
              </p>
            </div>
          </div>

          {/* Right panel: Steps */}
          <div className="lg:col-span-8 relative mt-8 lg:mt-0">
            {/* The vertical progress line connecting the steps */}
            <div className="absolute left-[27px] top-6 bottom-16 w-[2px] bg-[#1A1A1A] z-0 hidden md:block" />
            <motion.div 
              className="absolute left-[27px] top-6 bottom-16 w-[2px] bg-gradient-to-b from-emerald-400 to-emerald-400/10 origin-top shadow-[0_0_10px_rgba(52,211,153,0.5)] z-0 hidden md:block"
              style={{ scaleY: scrollYProgress }}
            />

            <div className="space-y-12">
              {stepsData.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, delay: i * 0.15, ease: 'easeOut' }}
                  className="group relative flex flex-col md:flex-row gap-8 items-start bg-[#050505] p-6 md:p-8 border border-transparent hover:border-[#1A1A1A] hover:bg-[#080808] transition-all duration-300 overflow-hidden"
                >
                  {/* Subtle hover glow inside the card */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-emerald-400/[0.03] to-transparent transition-opacity duration-500 pointer-events-none" />
                  
                  {/* Horizontal animated line on hover */}
                  <div className="absolute top-0 left-0 h-[1px] w-0 bg-emerald-400/40 group-hover:w-full transition-all duration-700 ease-out" />

                  {/* Step number */}
                  <div className="flex-shrink-0 relative z-10 bg-[#050505] md:bg-transparent">
                    <span className="text-xs font-mono text-emerald-400/40 group-hover:text-emerald-400 group-hover:shadow-[0_0_15px_rgba(52,211,153,0.4)] transition-all duration-300 tracking-[0.2em] px-2 py-1 bg-[#111] border border-[#222]">
                      {s.num}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 relative z-10 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                      <p className="text-[10px] tracking-[0.25em] text-[#7A7A7A] uppercase group-hover:text-[#A0A0A0] transition-colors">{s.tag}</p>
                      
                      {/* Meta indicator */}
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-[#5A5A5A] tracking-wider uppercase bg-[#111] px-2 py-0.5">{s.meta}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-[#EAEAEA] mb-3 tracking-tight group-hover:text-white transition-colors">{s.title}</h3>
                    <p className="text-sm text-[#7A7A7A] font-light leading-relaxed mb-6">{s.desc}</p>

                    {/* Divider line inside step */}
                    <div className="h-px w-full bg-gradient-to-r from-[#1A1A1A] to-transparent group-hover:from-emerald-400/20 transition-all duration-300" />
                  </div>

                  {/* Right Animated Arrow */}
                  <div className="hidden sm:flex flex-shrink-0 mt-8 relative z-10">
                    <div className="w-8 h-8 rounded-full border border-[#1A1A1A] group-hover:border-emerald-400/30 flex items-center justify-center bg-[#050505] transition-all duration-300 overflow-hidden">
                      <ArrowRight size={14} className="text-[#3A3A3A] group-hover:text-emerald-400 transform -translate-x-1 group-hover:translate-x-0 transition-all duration-300" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ── LANDING VIEW ──────────────────────────────────── */
interface LandingViewProps {
  setCurrentView: (v: string) => void;
  setShowAuth: (v: boolean) => void;
}

export default function LandingView({ setCurrentView, setShowAuth }: LandingViewProps) {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 800], [0, 120]);
  const [bootComplete, setBootComplete] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBootComplete(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#050505' }}>
      {/* Subtle scan line */}
      <div className="scan-line" />

      {/* Grid background - removed for cinematic look */}

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative w-full min-h-[90vh] lg:h-screen border-b border-[#1A1A1A] bg-[#050505] flex flex-col justify-center overflow-hidden pt-[10vh] lg:pt-0">
        
        {/* Subtle noise texture */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.015]" 
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />

        <div className="relative z-20 max-w-7xl w-full mx-auto px-6 h-full flex flex-col lg:flex-row items-center justify-between">
          
          {/* ── LEFT SIDE (TEXT CONTENT ~55%) ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-[55%] flex flex-col justify-center pt-8 pb-12 lg:py-0 relative z-30 flex-shrink-0"
          >
            {/* System init label */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: bootComplete ? 1 : 0, y: bootComplete ? 0 : 10 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex items-center gap-3 mb-8"
            >
              <span className="text-[11px] tracking-[0.25em] text-[#7A7A7A] font-medium uppercase">
                SYSTEM ACTIVE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542] status-dot shadow-[0_0_10px_rgba(245,197,66,0.5)]" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="text-[clamp(3.5rem,7vw,6.5rem)] font-black leading-[0.95] tracking-[-0.04em] text-[#FFFFFF] mb-2 drop-shadow-lg"
            >
              BEAT THE INDEX.
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
              className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold tracking-tight text-[#F5C542] mb-6 drop-shadow-md"
            >
              OUTPERFORM IF YOU CAN.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
              className="text-[#EAEAEA]/80 text-lg leading-relaxed mb-12 max-w-md font-light"
            >
              Test your strategy against decades of market data.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                id="hero-build-strategy"
                onClick={() => setCurrentView('builder')}
                className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-[#F5C542] text-[#050505] text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:bg-[#FFD666] shadow-[0_0_20px_rgba(245,197,66,0.15)] hover:shadow-[0_0_35px_rgba(245,197,66,0.35)]"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}
              >
                RUN SIMULATION
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              <button
                id="hero-view-demo"
                onClick={() => setCurrentView('results')}
                className="flex items-center justify-center gap-3 px-8 py-4 border border-white/20 text-white text-sm font-medium tracking-widest uppercase hover:border-white hover:bg-white/5 transition-all duration-300 backdrop-blur-sm"
              >
                <Play size={13} className="text-[#F5C542]" />
                VIEW DEMO
              </button>
            </motion.div>
          </motion.div>

          {/* ── RIGHT SIDE (VISUAL CONTAINER ~45%) ── */}
          <div className="w-full lg:w-[50vw] lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 flex items-center justify-end pointer-events-none z-10 lg:h-[90vh] h-[45vh] mt-[-20px] lg:mt-0 relative">
            
            {/* Blending edges for seamless integration */}
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#050505] to-transparent z-20" />
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#050505] to-transparent z-20" />
            <div className="absolute inset-x-0 top-0 h-1/6 bg-gradient-to-b from-[#050505] to-transparent z-20" />

            {/* Scroll parallax wrapper */}
            <motion.div
              style={{ y: y1 }}
              className="relative w-full h-full"
            >
              {/* Floating animation wrapper */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity }}
                className="relative w-full h-full flex items-center justify-end"
              >
                {/* Backglow block shadow */}
                <div className="absolute right-[5%] top-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-[#F5C542]/[0.02] blur-[100px] rounded-full" />

                <img 
                  src="/fintech-terminal.png" 
                  alt="System Terminal Interface" 
                  className="w-full h-full object-contain object-right lg:object-cover sm:object-right opacity-85 mix-blend-screen scale-[1.08] lg:scale-[1.12] -mr-[5%] lg:-mr-[10%]"
                  style={{ filter: 'brightness(0.75) contrast(1.15) sepia(0.1) hue-rotate(-10deg)' }}
                />
              </motion.div>
            </motion.div>
          </div>

        </div>

        {/* Bottom Metadata */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 0.8, delay: 0.7 }}
           className="hidden md:flex absolute bottom-8 left-12 items-center gap-6 z-40"
        >
           <div className="flex flex-col gap-1">
             <span className="text-[9px] tracking-[0.2em] text-[#7A7A7A] uppercase">DATA RANGE</span>
             <span className="text-[10px] font-mono text-white/90 tracking-wider">2000–2024</span>
           </div>
           <div className="w-px h-6 bg-white/10" />
           <div className="flex flex-col gap-1">
             <span className="text-[9px] tracking-[0.2em] text-[#7A7A7A] uppercase">ENGINE</span>
             <span className="text-[10px] font-mono text-[#F5C542] tracking-wider flex items-center gap-2">
               LIVE <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542] status-dot" />
             </span>
           </div>
           <div className="w-px h-6 bg-white/10" />
           <div className="flex flex-col gap-1">
             <span className="text-[9px] tracking-[0.2em] text-[#7A7A7A] uppercase">LATENCY</span>
             <span className="text-[10px] font-mono text-white/90 tracking-wider">&lt;1MS</span>
           </div>
        </motion.div>
      </section>


      {/* ── PREMIUM CARD SHOWCASE ────────────────────── */}
      <CardShowcaseSection setCurrentView={setCurrentView} />

      {/* ── SIMULATION TIMELINE ──────────────────────── */}
      <ScrollCandlestickChart setCurrentView={setCurrentView} />

      {/* ── PERFORMANCE STATEMENT ──────────────────────── */}
      <section className="relative z-10 border-t border-[#1A1A1A] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center"
          >
            <p className="text-[11px] tracking-[0.3em] text-[#7A7A7A] mb-6 uppercase">PERFORMANCE</p>
            <h2 className="text-[clamp(2rem,6vw,5rem)] font-black tracking-[-0.04em] text-[#EAEAEA] leading-[0.95] max-w-4xl mx-auto">
              Your Strategy vs<br />
              <span className="text-emerald-400">The Market.</span>
            </h2>
            <p className="text-[#7A7A7A] mt-6 max-w-xl mx-auto text-base font-light leading-relaxed">
              The index beats most strategies over 20 years — without a single trade. Understanding why is the first step.
            </p>
          </motion.div>

          {/* Big stat row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-px mt-16 border border-[#1A1A1A]"
            style={{ background: '#1A1A1A' }}
          >
            {[
              { tag: 'RETURN %', value: '+47%', label: 'Strategy Total Return', note: '20 year period' },
              { tag: 'DRAWDOWN', value: '-38.4%', label: 'Maximum Drawdown', note: 'Peak-to-trough' },
              { tag: 'SHARPE RATIO', value: '0.82', label: 'Risk-Adjusted Return', note: 'Annualized' },
            ].map((m, i) => (
              <div key={i} className="bg-[#050505] px-8 py-10 group hover:bg-[#0B0B0B] transition-colors duration-200">
                <p className="text-[9px] tracking-[0.25em] text-[#7A7A7A] uppercase mb-2 font-medium">{m.tag}</p>
                <p className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-tight text-[#EAEAEA] leading-none mb-2">
                  {m.value}
                </p>
                <p className="text-sm text-[#7A7A7A] font-light">{m.label}</p>
                <p className="text-[10px] text-[#7A7A7A]/60 mt-1 tracking-wider uppercase">{m.note}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── WEALTH ACCUMULATION ───────────────────────── */}
      <WealthAccumulationSection setCurrentView={setCurrentView} />

      {/* ── CAPABILITIES ───────────────────────────────── */}
      <section className="relative z-10 border-t border-[#1A1A1A] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45 }}
            className="mb-14"
          >
            <p className="text-[11px] tracking-[0.3em] text-[#7A7A7A] mb-4 uppercase">CAPABILITIES</p>
            <h2 className="text-4xl lg:text-5xl font-black tracking-[-0.04em] text-[#EAEAEA] max-w-2xl leading-tight">
              Built for precision.<br />Not decoration.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: '#1A1A1A' }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="bg-[#050505] p-8 group hover:bg-[#0B0B0B] transition-all duration-250 cursor-default relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-6">
                    <p className="text-[9px] tracking-[0.25em] text-[#7A7A7A] uppercase font-medium">{f.label}</p>
                    <Icon size={16} className="text-[#2A2A2A] group-hover:text-emerald-400/50 transition-colors duration-250" />
                  </div>
                  <h3 className="text-xl font-bold text-[#EAEAEA] mb-3 tracking-tight">{f.title}</h3>
                  <p className="text-[#7A7A7A] text-sm leading-relaxed font-light">{f.desc}</p>
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-emerald-400/0 group-hover:bg-emerald-400/15 transition-all duration-300" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── EXECUTION PIPELINE (HOW IT WORKS) ──────────── */}
      <ProtocolSection />

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="relative z-10 border-t border-[#1A1A1A] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="relative border border-[#1A1A1A] p-12 lg:p-20 text-center overflow-hidden"
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-emerald-400/30" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-emerald-400/30" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-emerald-400/30" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-emerald-400/30" />

            <p className="text-[11px] tracking-[0.3em] text-[#7A7A7A] mb-6 uppercase">READY TO EXECUTE</p>
            <h2 className="text-[clamp(2.5rem,7vw,5rem)] font-black tracking-[-0.04em] text-[#EAEAEA] leading-[0.95] mb-6">
              Test your edge.
            </h2>
            <p className="text-[#7A7A7A] max-w-md mx-auto mb-10 font-light">
              Most strategies look great on paper. Find out if yours survives 20 years of real market conditions.
            </p>
            <button
              id="cta-build-strategy"
              onClick={() => setCurrentView('builder')}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-emerald-400 text-[#050505] font-bold text-sm tracking-wide hover:bg-emerald-300 transition-all duration-200"
              style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}
            >
              START SIMULATION
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-[#1A1A1A] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center border border-emerald-400/40">
              <BarChart2 size={11} className="text-emerald-400" />
            </div>
            <span className="text-[#7A7A7A] text-xs font-medium tracking-[0.15em]">ROOKNOMICS © 2024</span>
          </div>
          <div className="flex gap-8">
            {[
              { label: 'LEARN', view: 'learn' },
              { label: 'BUILDER', view: 'builder' },
              { label: 'RESULTS', view: 'results' },
              { label: 'NEWS', view: 'news' },
            ].map((l) => (
              <button
                key={l.view}
                onClick={() => setCurrentView(l.view)}
                className="text-[10px] tracking-[0.2em] text-[#7A7A7A] hover:text-[#EAEAEA] transition-colors duration-200 uppercase"
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
