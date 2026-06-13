import { useState, useRef, useMemo, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

// --- Types ---
interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

// --- Data Generation ---
const generateData = (count: number): CandleData[] => {
  const data: CandleData[] = [];
  let currentPrice = 1000;
  for (let i = 0; i < count; i++) {
    const volatility = 20 + i * 0.5;
    const trend = 5;
    const open = currentPrice;
    const isBull = Math.random() > 0.45;
    const move = (Math.random() * volatility) + (isBull ? trend : -trend * 0.5);
    const close = open + (isBull ? move : -move);
    const wickHigh = Math.max(open, close) + Math.random() * (volatility * 0.8);
    const wickLow = Math.min(open, close) - Math.random() * (volatility * 0.8);
    data.push({ time: `Month ${i + 1}`, open, high: wickHigh, low: wickLow, close });
    currentPrice = close;
  }
  return data;
};

const CHART_DATA = generateData(90);

const COLOR_BULL = '#388E5E';
const COLOR_BULL_GLOW = 'rgba(56, 142, 94, 0.4)';
const COLOR_BEAR = '#AB484D';
const COLOR_BEAR_GLOW = 'rgba(171, 72, 77, 0.4)';
const TICK_COLOR = 'rgba(255, 255, 255, 0.05)';
const CHART_W = 800;
const CHART_H = 380;
const PADDING_Y = 40;
const PADDING_X = 16;

// --- Animated Candle ---
function AnimatedCandle({
  data, index, total, progress, x, yOpen, yClose, yHigh, yLow, width, isActive,
}: {
  data: CandleData; index: number; total: number; progress: any;
  x: number; yOpen: number; yClose: number; yHigh: number; yLow: number;
  width: number; isActive: boolean;
}) {
  const isBull = data.close >= data.open;
  const color = isBull ? COLOR_BULL : COLOR_BEAR;
  const glowColor = isBull ? COLOR_BULL_GLOW : COLOR_BEAR_GLOW;
  const startReveal = index / total;
  const endReveal = Math.min(1, (index + 0.8) / total);
  const opacity = useTransform(progress, [startReveal, endReveal], [0, 1]);
  const scaleY = useTransform(progress, [startReveal, endReveal], [0.5, 1]);
  const yOffset = useTransform(progress, [startReveal, endReveal], [8, 0]);
  const bodyTop = Math.min(yOpen, yClose);
  const bodyBottom = Math.max(yOpen, yClose);
  const bodyHeight = Math.max(1, bodyBottom - bodyTop);

  return (
    <motion.g style={{ opacity, y: yOffset }}>
      <motion.line
        x1={x + width / 2} y1={yHigh}
        x2={x + width / 2} y2={yLow}
        stroke={color} strokeWidth={1}
        style={{ scaleY }} className="origin-center"
      />
      <motion.rect
        x={x} y={bodyTop} width={width} height={bodyHeight}
        fill={color} rx={0}
        style={{ scaleY }} className="origin-center"
      />
      {isActive && (
        <motion.rect
          x={x - 2} y={bodyTop - 2} width={width + 4} height={bodyHeight + 4}
          fill="none" stroke={glowColor} strokeWidth={3} rx={0}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ scaleY }} className="origin-center blur-[1px]"
        />
      )}
    </motion.g>
  );
}

// --- Chart Widget (right column) ---
function ChartWidget({ setCurrentView }: { setCurrentView?: (v: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end center'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (latest <= 0) setActiveIndex(-1);
    else setActiveIndex(Math.min(Math.floor(latest * CHART_DATA.length), CHART_DATA.length - 1));
  });

  const { minPrice, maxPrice, linePath } = useMemo(() => {
    let min = Infinity, max = -Infinity;
    CHART_DATA.forEach(d => {
      if (d.low < min) min = d.low;
      if (d.high > max) max = d.high;
    });
    const range = max - min;
    min -= range * 0.1;
    max += range * 0.1;
    const workW = CHART_W - PADDING_X * 2;
    const workH = CHART_H - PADDING_Y * 2;
    const gap = workW / CHART_DATA.length;
    const w = gap * 0.6;
    const getY = (p: number) => CHART_H - PADDING_Y - ((p - min) / (max - min)) * workH;
    let path = '';
    CHART_DATA.forEach((d, i) => {
      const x = PADDING_X + i * gap + w / 2;
      const y = getY(d.close);
      if (i === 0) path += `M ${x} ${y} `;
      else path += `L ${x} ${y} `;
    });
    return { minPrice: min, maxPrice: max, linePath: path };
  }, []);

  const workingW = CHART_W - PADDING_X * 2;
  const workingH = CHART_H - PADDING_Y * 2;
  const candleGap = workingW / CHART_DATA.length;
  const candleWidth = candleGap * 0.6;
  const getY = (val: number) => CHART_H - PADDING_Y - ((val - minPrice) / (maxPrice - minPrice)) * workingH;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const curX = ((e.clientX - rect.left) / rect.width) * CHART_W;
    const rawIdx = Math.floor((curX - PADDING_X) / candleGap);
    const clamped = Math.max(0, Math.min(CHART_DATA.length - 1, rawIdx));
    setHoveredIndex(clamped <= activeIndex ? clamped : null);
  };

  const highlightIdx = hoveredIndex !== null ? hoveredIndex : activeIndex;
  const highlightData = highlightIdx >= 0 && highlightIdx < CHART_DATA.length ? CHART_DATA[highlightIdx] : null;

  return (
    <div ref={containerRef} className="w-full flex flex-col bg-[#050505] border border-[#1A1A1A]">
      {/* Chart header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
        <span className="text-[9px] tracking-[0.2em] text-[#7A7A7A] uppercase font-medium">S&P 500 Reproduction</span>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[8px] tracking-[0.15em] text-[#7A7A7A]">RANGE</span>
            <span className="text-[10px] font-mono text-[#EAEAEA]">2000–2024</span>
          </div>
          <div className="w-px bg-[#1A1A1A]" />
          <div className="flex flex-col items-end">
            <span className="text-[8px] tracking-[0.15em] text-[#7A7A7A]">ENGINE</span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              ACTIVE <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            </span>
          </div>
        </div>
      </div>

      {/* OHLC tooltip row */}
      <div className="min-h-[32px] px-4 py-2 flex items-center border-b border-[#0F0F0F]">
        <AnimatePresence mode="popLayout">
          {highlightData ? (
            <motion.div
              key="ohlc"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="flex items-center gap-4"
            >
              <span className="text-[9px] text-[#7A7A7A] font-mono bg-[#0B0B0B] px-1.5 py-0.5 border border-[#1A1A1A]">
                {highlightData.time}
              </span>
              {[
                { l: 'O', v: highlightData.open.toFixed(0), c: 'text-[#EAEAEA]' },
                { l: 'H', v: highlightData.high.toFixed(0), c: 'text-[#388E5E]' },
                { l: 'L', v: highlightData.low.toFixed(0), c: 'text-[#AB484D]' },
                { l: 'C', v: highlightData.close.toFixed(0), c: highlightData.close >= highlightData.open ? 'text-[#388E5E]' : 'text-[#AB484D]' },
              ].map(({ l, v, c }) => (
                <div key={l} className="flex gap-1 items-baseline">
                  <span className="text-[8px] text-[#7A7A7A]">{l}</span>
                  <span className={`text-[10px] font-mono font-bold ${c}`}>{v}</span>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[9px] text-[#3A3A3A] font-mono tracking-wider"
            >
              SCROLL TO REVEAL ↓
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="w-full cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
            const y = PADDING_Y + p * workingH;
            const price = maxPrice - p * (maxPrice - minPrice);
            return (
              <g key={i}>
                <line x1={0} y1={y} x2={CHART_W} y2={y} stroke={TICK_COLOR} strokeDasharray="3 3" />
                <text x={CHART_W - 4} y={y - 4} fill="rgba(255,255,255,0.15)" fontSize="9" fontFamily="monospace" textAnchor="end">
                  {price.toFixed(0)}
                </text>
              </g>
            );
          })}

          <motion.path
            d={linePath}
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth={1.5}
            style={{ pathLength: scrollYProgress }}
          />

          {CHART_DATA.map((d, i) => (
            <AnimatedCandle
              key={i}
              data={d} index={i} total={CHART_DATA.length}
              progress={scrollYProgress}
              x={PADDING_X + i * candleGap}
              width={candleWidth}
              yOpen={getY(d.open)} yClose={getY(d.close)}
              yHigh={getY(d.high)} yLow={getY(d.low)}
              isActive={i === activeIndex}
            />
          ))}

          {highlightIdx >= 0 && (
            <line
              x1={PADDING_X + highlightIdx * candleGap + candleWidth / 2} y1={0}
              x2={PADDING_X + highlightIdx * candleGap + candleWidth / 2} y2={CHART_H}
              stroke="rgba(255,255,255,0.08)" strokeWidth={1}
            />
          )}
        </svg>
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_30px_rgba(5,5,5,0.7)]" />
      </div>
    </div>
  );
}

// --- Main Export: Two-Column Section ---
export default function ScrollCandlestickChart({ setCurrentView }: { setCurrentView?: (v: string) => void }) {
  return (
    <section className="relative z-10 border-t border-[#1A1A1A] bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* ── LEFT: Copy ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="lg:col-span-5 flex flex-col"
          >
            {/* Label */}
            <p className="text-[10px] tracking-[0.3em] text-[#7A7A7A] uppercase font-medium mb-5">
              Simulation Timeline
            </p>

            {/* Headline */}
            <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-black tracking-[-0.04em] text-[#EAEAEA] leading-[0.95] mb-5">
              S&P 500<br />
              <span className="text-emerald-400">Reproduction.</span>
            </h2>

            {/* Body */}
            <p className="text-[#7A7A7A] text-sm leading-relaxed font-light mb-8 max-w-sm">
              Scroll to watch 20 years of market history unfold — candle by candle. Every tick, every signal, every move simulated with institutional precision.
            </p>

            {/* Stats bar */}
            <div className="flex items-center gap-3 mb-10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#4A4A4A] uppercase">
                90 Candles · 20 Yrs · Live Engine
              </span>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-[#1A1A1A] mb-8" />

            {/* Metric pills */}
            <div className="grid grid-cols-2 gap-px mb-10" style={{ background: '#1A1A1A' }}>
              {[
                { tag: 'DATA RANGE', val: '2000–2024' },
                { tag: 'CANDLES', val: '90 BARS' },
                { tag: 'LATENCY', val: '<1MS' },
                { tag: 'ENGINE', val: 'ACTIVE' },
              ].map(({ tag, val }) => (
                <div key={tag} className="bg-[#050505] px-4 py-3">
                  <p className="text-[8px] tracking-[0.2em] text-[#7A7A7A] uppercase mb-1">{tag}</p>
                  <p className="text-[11px] font-mono text-[#EAEAEA] font-medium">{val}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            {setCurrentView && (
              <button
                id="chart-section-run-sim"
                onClick={() => setCurrentView('builder')}
                className="group self-start flex items-center gap-3 px-6 py-3 bg-emerald-400 text-[#050505] text-xs font-bold tracking-widest uppercase hover:bg-emerald-300 transition-all duration-200"
                style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}
              >
                RUN SIMULATION
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            )}
          </motion.div>

          {/* ── RIGHT: Chart Widget ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
            className="lg:col-span-7"
          >
            <ChartWidget setCurrentView={setCurrentView} />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
