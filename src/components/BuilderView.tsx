import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, RotateCcw, Info, DollarSign, ChevronDown,
  TrendingUp, Activity, TrendingDown, Sliders,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { runBacktest } from '@/store/backtestSlice';
import { clearBacktest } from '@/store/backtestSlice';
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../store/index'

interface BuilderViewProps {
  setCurrentView: (v: string) => void;
}

/* ── RULE BLOCK ─────────────────────────────────────── */
function RuleBlock({
  id,
  label,
  tag,
  icon: Icon,
  enabled,
  onToggle,
  children,
}: {
  id: string;
  label: string;
  tag: string;
  icon: React.ElementType;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative border border-[#1A1A1A] hover:border-[#2A2A2A] transition-colors duration-200"
      style={{ background: '#0B0B0B' }}
    >
      {/* Rule header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-4">
          <div className="w-px h-5 bg-emerald-400/30" />
          <p className="text-[9px] tracking-[0.25em] text-[#7A7A7A] uppercase font-medium">{tag}</p>
          <div className="flex items-center gap-2">
            <Icon size={13} className={enabled ? 'text-emerald-400' : 'text-[#2A2A2A]'} />
            <span className="text-sm font-medium text-[#EAEAEA]">{label}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div onClick={(e) => e.stopPropagation()}>
            <Switch
              checked={enabled}
              onCheckedChange={onToggle}
              className="scale-75"
            />
          </div>
          <ChevronDown
            size={14}
            className={`text-[#7A7A7A] transition-transform duration-200 ${open ? '' : '-rotate-90'}`}
          />
        </div>
      </div>

      {/* Rule body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className={`px-5 pb-5 border-t border-[#1A1A1A] pt-5 ${!enabled ? 'opacity-30 pointer-events-none' : ''}`}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left accent glow when enabled */}
      {enabled && (
        <div className="absolute left-0 top-0 w-px h-full bg-emerald-400/30" />
      )}
    </motion.div>
  );
}

/* ── METRIC SLIDER ROW ───────────────────────────────── */
function MetricRow({
  label,
  value,
  sub,
  min,
  max,
  step,
  onChange,
  color = 'text-[#EAEAEA]',
}: {
  label: string;
  value: number;
  sub?: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  color?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs text-[#7A7A7A]">
          {label}
          {sub && <span className="ml-1 text-[10px] text-[#7A7A7A]/60">{sub}</span>}
        </label>
        <span className={`text-sm font-mono font-medium ${color}`}>{value}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );
}

/* ── DARK INPUT ──────────────────────────────────────── */
function DarkInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-[9px] tracking-[0.2em] text-[#7A7A7A] uppercase mb-2 block">{label}</label>
      <input
        {...props}
        className="w-full bg-[#050505] border border-[#1A1A1A] text-[#EAEAEA] text-sm px-3 py-2.5 font-mono placeholder-[#2A2A2A] outline-none focus:border-emerald-400/40 transition-colors duration-200"
        style={{ appearance: 'none' }}
      />
    </div>
  );
}

/* ── SUMMARY ROW ─────────────────────────────────────── */
function SummaryRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-[#1A1A1A] last:border-0">
      <span className="text-[10px] tracking-[0.15em] text-[#7A7A7A] uppercase">{label}</span>
      <span className={`text-xs font-mono font-medium ${accent ? 'text-emerald-400' : 'text-[#EAEAEA]'}`}>{value}</span>
    </div>
  );
}

/* ── BUILDER VIEW ────────────────────────────────────── */
export default function BuilderView({ setCurrentView }: BuilderViewProps) {
  const [symbol, setSymbol] = useState('AAPL');
  const [startDate, setStartDate] = useState('2015-01-01');
  const [endDate, setEndDate] = useState('2023-12-31');
  const [rsiPeriod, setRsiPeriod] = useState(14);
  const [rsiBuy, setRsiBuy] = useState(30);
  const [rsiSell, setRsiSell] = useState(70);
  const [maShort, setMaShort] = useState(50);
  const [maLong, setMaLong] = useState(200);
  const [maType, setMaType] = useState('SMA');
  const [useMA, setUseMA] = useState(true);
  const [useRSI, setUseRSI] = useState(true);
  const [initialCapital, setInitialCapital] = useState(10000);
  const [stopLoss, setStopLoss] = useState(false);
  const [stopLossPercent, setStopLossPercent] = useState(10);
  const [takeProfit, setTakeProfit] = useState(false);
  const [takeProfitPercent, setTakeProfitPercent] = useState(20);
  const [isRunning, setIsRunning] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const formatMonthYear = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const handleRunBacktest = async () => {
    const activeRules = [];
    if (useMA) activeRules.push('MA Crossover');
    if (useRSI) activeRules.push('RSI Entry');
    if (stopLoss) activeRules.push('Stop Loss');

    const rulesConfig = {
      rsi: { enabled: useRSI, period: rsiPeriod, buyBelow: rsiBuy, sellAbove: rsiSell },
      maCross: { enabled: useMA, type: maType, fastPeriod: maShort, slowPeriod: maLong },
    };

    dispatch(clearBacktest());
    setIsRunning(true);
    try {
      await dispatch(runBacktest({ symbol, startDate, endDate, capital: initialCapital, activeRules, rulesConfig })).unwrap();
      setCurrentView('results');
    } catch (err) {
      console.error('Backtest failed', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setSymbol('AAPL');
    setStartDate('2015-01-01');
    setEndDate('2023-12-31');
    setRsiPeriod(14);
    setRsiBuy(30);
    setRsiSell(70);
    setMaShort(50);
    setMaLong(200);
    setMaType('SMA');
    setUseMA(true);
    setUseRSI(true);
    setInitialCapital(10000);
    setStopLoss(false);
    setStopLossPercent(10);
    setTakeProfit(false);
    setTakeProfitPercent(20);
  };

  const tradingDays = startDate && endDate
    ? Math.max(0, Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000 * 5 / 7))
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-px h-4 bg-emerald-400/60" />
          <p className="text-[11px] tracking-[0.25em] text-[#7A7A7A] uppercase font-medium">RULE CONFIGURATION</p>
        </div>
        <h1 className="text-4xl font-black tracking-[-0.04em] text-[#EAEAEA]">Strategy Builder</h1>
        <p className="text-[#7A7A7A] mt-2 text-sm font-light">
          Configure parameters and simulate against 20 years of S&P 500 history.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT: RULE BLOCKS ────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Asset + Date */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="border border-[#1A1A1A] p-5"
            style={{ background: '#0B0B0B' }}
          >
            <p className="text-[9px] tracking-[0.25em] text-[#7A7A7A] uppercase mb-4">ASSET · PERIOD</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <DarkInput
                label="SYMBOL"
                type="text"
                value={symbol}
                onChange={(e) => setSymbol((e.target as HTMLInputElement).value.toUpperCase())}
                placeholder="AAPL"
              />
              <DarkInput
                label="START DATE"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate((e.target as HTMLInputElement).value)}
              />
              <DarkInput
                label="END DATE"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate((e.target as HTMLInputElement).value)}
              />
            </div>
            {tradingDays > 0 && (
              <p className="text-[10px] font-mono text-[#7A7A7A] mt-3">
                ≈ {tradingDays.toLocaleString()} TRADING DAYS
                {symbol && <span className="text-emerald-400 ml-2">· {symbol}</span>}
              </p>
            )}
          </motion.div>

          {/* RSI Rule */}
          <RuleBlock
            id="rsi"
            label="RSI — Relative Strength Index"
            tag="MOMENTUM RULE"
            icon={TrendingUp}
            enabled={useRSI}
            onToggle={setUseRSI}
          >
            <div className="space-y-5">
              <MetricRow
                label="RSI Period"
                value={rsiPeriod}
                sub="days"
                min={5}
                max={30}
                step={1}
                onChange={setRsiPeriod}
              />
              <div className="grid grid-cols-2 gap-6">
                <MetricRow
                  label="Buy Below"
                  value={rsiBuy}
                  sub="(oversold)"
                  min={10}
                  max={50}
                  step={1}
                  onChange={setRsiBuy}
                  color="text-emerald-400"
                />
                <MetricRow
                  label="Sell Above"
                  value={rsiSell}
                  sub="(overbought)"
                  min={50}
                  max={95}
                  step={1}
                  onChange={setRsiSell}
                  color="text-red-400"
                />
              </div>
              <div className="flex items-start gap-2 border border-[#1A1A1A] p-3">
                <Info size={11} className="text-[#7A7A7A] mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-[#7A7A7A] leading-relaxed">
                  BUY when RSI &lt; {rsiBuy} (oversold signal). SELL when RSI &gt; {rsiSell} (overbought signal). Period: {rsiPeriod} days.
                </p>
              </div>
            </div>
          </RuleBlock>

          {/* MA Crossover Rule */}
          <RuleBlock
            id="ma"
            label="MA Crossover — Golden / Death Cross"
            tag="TREND RULE"
            icon={Activity}
            enabled={useMA}
            onToggle={setUseMA}
          >
            <div className="space-y-5">
              <div>
                <p className="text-[10px] tracking-[0.15em] text-[#7A7A7A] uppercase mb-2">MA Type</p>
                <Select value={maType} onValueChange={setMaType}>
                  <SelectTrigger className="bg-[#050505] border-[#1A1A1A] text-[#EAEAEA] text-xs font-mono w-44 rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0B0B0B] border-[#1A1A1A] rounded-none">
                    <SelectItem value="SMA" className="text-[#EAEAEA] text-xs font-mono focus:bg-[#1A1A1A] focus:text-emerald-400">SMA — Simple</SelectItem>
                    <SelectItem value="EMA" className="text-[#EAEAEA] text-xs font-mono focus:bg-[#1A1A1A] focus:text-emerald-400">EMA — Exponential</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <MetricRow
                  label="Short Period"
                  value={maShort}
                  sub="days"
                  min={10}
                  max={100}
                  step={5}
                  onChange={setMaShort}
                  color="text-emerald-400"
                />
                <MetricRow
                  label="Long Period"
                  value={maLong}
                  sub="days"
                  min={100}
                  max={400}
                  step={10}
                  onChange={setMaLong}
                  color="text-[#EAEAEA]"
                />
              </div>
              <div className="flex items-start gap-2 border border-[#1A1A1A] p-3">
                <Info size={11} className="text-[#7A7A7A] mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-[#7A7A7A] leading-relaxed">
                  BUY on Golden Cross ({maShort}d crosses above {maLong}d {maType}). SELL on Death Cross (opposite).
                </p>
              </div>
            </div>
          </RuleBlock>

          {/* Risk Management */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.3 }}
            className="border border-[#1A1A1A] p-5"
            style={{ background: '#0B0B0B' }}
          >
            <div className="flex items-center gap-3 mb-5">
              <TrendingDown size={13} className="text-red-400" />
              <p className="text-[9px] tracking-[0.25em] text-[#7A7A7A] uppercase font-medium">RISK MANAGEMENT</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-[#1A1A1A]">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={stopLoss}
                    onCheckedChange={(v) => setStopLoss(v as boolean)}
                    className="border-[#2A2A2A] data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                  />
                  <div>
                    <p className="text-xs text-[#EAEAEA] font-medium">Stop-Loss</p>
                    <p className="text-[10px] text-[#7A7A7A]">Auto-exit on position loss</p>
                  </div>
                </div>
                {stopLoss && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-red-400">-{stopLossPercent}%</span>
                    <div className="w-24">
                      <Slider value={[stopLossPercent]} onValueChange={(v) => setStopLossPercent(v[0])} min={2} max={30} step={1} />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={takeProfit}
                    onCheckedChange={(v) => setTakeProfit(v as boolean)}
                    className="border-[#2A2A2A] data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  />
                  <div>
                    <p className="text-xs text-[#EAEAEA] font-medium">Take-Profit</p>
                    <p className="text-[10px] text-[#7A7A7A]">Auto-exit on gain target</p>
                  </div>
                </div>
                {takeProfit && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-emerald-400">+{takeProfitPercent}%</span>
                    <div className="w-24">
                      <Slider value={[takeProfitPercent]} onValueChange={(v) => setTakeProfitPercent(v[0])} min={5} max={50} step={1} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT: SUMMARY PANEL ─────────────────── */}
        <div className="space-y-4">
          {/* Capital */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="border border-[#1A1A1A] p-5"
            style={{ background: '#0B0B0B' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={13} className="text-emerald-400" />
              <p className="text-[9px] tracking-[0.25em] text-[#7A7A7A] uppercase">CAPITAL · FEES</p>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-[#7A7A7A]">Starting Capital</span>
              <span className="text-sm font-mono font-medium text-emerald-400">${initialCapital.toLocaleString()}</span>
            </div>
            <Slider
              value={[initialCapital]}
              onValueChange={(v) => setInitialCapital(v[0])}
              min={1000}
              max={100000}
              step={1000}
            />
            <p className="text-[10px] text-[#7A7A7A] mt-3">
              Fee structure: 0.1% per trade (slippage included)
            </p>
          </motion.div>

          {/* Strategy Summary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="border border-[#1A1A1A] p-5"
            style={{ background: '#0B0B0B' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sliders size={13} className="text-[#7A7A7A]" />
              <p className="text-[9px] tracking-[0.25em] text-[#7A7A7A] uppercase">RULE SUMMARY</p>
            </div>
            <div className="space-y-0">
              <SummaryRow label="ASSET" value={symbol || '—'} />
              <SummaryRow
                label="PERIOD"
                value={startDate && endDate ? `${formatMonthYear(startDate)} — ${formatMonthYear(endDate)}` : '—'}
              />
              {useRSI && <SummaryRow label="RSI" value={`<${rsiBuy} / >${rsiSell} (${rsiPeriod}d)`} accent />}
              {useMA && <SummaryRow label="MA CROSS" value={`${maType} ${maShort}/${maLong}`} accent />}
              {stopLoss && <SummaryRow label="STOP-LOSS" value={`-${stopLossPercent}%`} />}
              {takeProfit && <SummaryRow label="TAKE-PROFIT" value={`+${takeProfitPercent}%`} />}
              <SummaryRow label="CAPITAL" value={`$${initialCapital.toLocaleString()}`} />
            </div>

            {!useRSI && !useMA && (
              <div className="flex items-start gap-2 border border-red-900/40 bg-red-950/20 p-3 mt-4">
                <Info size={11} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-red-400">Enable at least one indicator to run simulation.</p>
              </div>
            )}
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="space-y-3"
          >
            <button
              id="builder-run-backtest"
              onClick={handleRunBacktest}
              disabled={(!useRSI && !useMA) || !symbol || !startDate || !endDate || isRunning}
              className="w-full flex items-center justify-center gap-2 py-4 text-sm font-bold tracking-wider transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: isRunning ? '#0B2A1A' : '#34d399',
                color: isRunning ? '#34d399' : '#050505',
                clipPath: isRunning ? 'none' : 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
              }}
            >
              {isRunning ? (
                <>
                  <div className="w-3 h-3 border border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  SIMULATING...
                </>
              ) : (
                <>
                  <Play size={13} />
                  RUN SIMULATION
                </>
              )}
            </button>
            <button
              id="builder-reset"
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 py-3 text-xs font-medium tracking-wider text-[#7A7A7A] border border-[#1A1A1A] hover:border-[#2A2A2A] hover:text-[#EAEAEA] transition-all duration-200"
            >
              <RotateCcw size={11} />
              RESET DEFAULTS
            </button>
          </motion.div>

          {/* Analysis note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.3 }}
            className="border border-[#1A1A1A] p-4"
          >
            <p className="text-[9px] tracking-[0.2em] text-[#7A7A7A] uppercase mb-2">ANALYSIS OUTPUT</p>
            <p className="text-[10px] text-[#7A7A7A] leading-relaxed font-light">
              Increasing parameter complexity raises the risk of curve-fitting. Simple rules tend to generalize better across unseen market conditions.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
