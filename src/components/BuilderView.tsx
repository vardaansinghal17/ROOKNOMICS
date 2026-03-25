import { useState } from 'react';
import {
  Settings, TrendingUp, TrendingDown, Activity, Sliders,
  Play, RotateCcw, Info, ChevronDown, DollarSign,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface BuilderViewProps {
  setCurrentView: (v: string) => void;
}

export default function BuilderView({ setCurrentView }: BuilderViewProps) {
  const [symbol, setSymbol] = useState('AAPL');
  const [startDate, setStartDate] = useState('2015-01-01');
  const [endDate, setEndDate] = useState('2023-12-31');
  const [rsiPeriod, setRsiPeriod] = useState(14);
  const [rsiBuy, setRsiBuy] = useState(30);
  const [rsiSell, setRsiSell] = useState(70);
  const [maShort, setMaShort] = useState(50);
  const [maLong, setMaLong] = useState(200);
  const [useMA, setUseMA] = useState(true);
  const [useRSI, setUseRSI] = useState(true);
  const [initialCapital, setInitialCapital] = useState(10000);

  const formatMonthYear = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  const [stopLoss, setStopLoss] = useState(false);
  const [stopLossPercent, setStopLossPercent] = useState(10);
  const [takeProfit, setTakeProfit] = useState(false);
  const [takeProfitPercent, setTakeProfitPercent] = useState(20);

  const handleRunBacktest = () => {
    setCurrentView('results');
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
    setUseMA(true);
    setUseRSI(true);
    setInitialCapital(10000);
    setStopLoss(false);
    setStopLossPercent(10);
    setTakeProfit(false);
    setTakeProfitPercent(20);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Strategy Builder</h1>
        <p className="text-slate-600 mt-1">Configure your trading parameters and run a 20-year backtest against the S&P 500.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Indicators */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/50 rounded-2xl p-6">
            <label className="text-slate-900 font-semibold text-sm mb-2 block">Stock Symbol</label>
            <Input 
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. AAPL, GOOGL, TSLA" 
              className="uppercase"
            />
            <p className="text-slate-500 text-xs mt-2">Enter any valid US stock ticker symbol</p>
          </div>

          <div className="bg-white border border-slate-200/50 rounded-2xl p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-900 font-semibold text-sm mb-2 block">Start Date</label>
                <Input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-slate-900 font-semibold text-sm mb-2 block">End Date</label>
                <Input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            {startDate && endDate && (
              <p className="text-slate-500 text-xs mt-3">
                Approx. {Math.max(0, Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24) * 5 / 7)).toLocaleString()} trading days
              </p>
            )}
          </div>

          {/* RSI Config */}
          <div className="bg-white border border-slate-200/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="rounded-xl p-2.5 bg-indigo-100">
                  <TrendingUp size={18} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-slate-900 font-semibold">RSI (Relative Strength Index)</h2>
                  <p className="text-slate-500 text-xs">Momentum oscillator · Buy low, sell high</p>
                </div>
              </div>
              <Switch checked={useRSI} onCheckedChange={setUseRSI} />
            </div>

            <div className={`space-y-5 ${!useRSI ? 'opacity-40 pointer-events-none' : ''}`}>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-slate-600 text-sm">RSI Period</label>
                  <span className="text-slate-800 text-sm font-medium">{rsiPeriod} days</span>
                </div>
                <Slider value={[rsiPeriod]} onValueChange={v => setRsiPeriod(v[0])} min={5} max={30} step={1} className="w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-slate-600 text-sm flex items-center gap-1">
                      Buy Below <span className="text-emerald-600 text-xs">(Oversold)</span>
                    </label>
                    <span className="text-emerald-600 text-sm font-medium">{rsiBuy}</span>
                  </div>
                  <Slider value={[rsiBuy]} onValueChange={v => setRsiBuy(v[0])} min={10} max={50} step={1} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-slate-600 text-sm flex items-center gap-1">
                      Sell Above <span className="text-rose-600 text-xs">(Overbought)</span>
                    </label>
                    <span className="text-rose-600 text-sm font-medium">{rsiSell}</span>
                  </div>
                  <Slider value={[rsiSell]} onValueChange={v => setRsiSell(v[0])} min={50} max={95} step={1} />
                </div>
              </div>
              <div className="bg-slate-100/50 rounded-xl p-3 flex items-start gap-2">
                <Info size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-500 text-xs leading-relaxed">
                  Buy when RSI drops below {rsiBuy} (stock looks oversold). Sell when RSI rises above {rsiSell} (stock looks overbought).
                </p>
              </div>
            </div>
          </div>

          {/* Moving Average Config */}
          <div className="bg-white border border-slate-200/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="rounded-xl p-2.5 bg-cyan-100">
                  <Activity size={18} className="text-cyan-600" />
                </div>
                <div>
                  <h2 className="text-slate-900 font-semibold">Moving Average Crossover</h2>
                  <p className="text-slate-500 text-xs">Trend-following · Golden Cross / Death Cross</p>
                </div>
              </div>
              <Switch checked={useMA} onCheckedChange={setUseMA} />
            </div>

            <div className={`space-y-5 ${!useMA ? 'opacity-40 pointer-events-none' : ''}`}>
              <p className="text-slate-500 text-xs leading-relaxed">Using Simple Moving Average (SMA)</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-slate-600 text-sm">Short Period</label>
                    <span className="text-cyan-600 text-sm font-medium">{maShort} days</span>
                  </div>
                  <Slider value={[maShort]} onValueChange={v => setMaShort(v[0])} min={10} max={100} step={5} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-slate-600 text-sm">Long Period</label>
                    <span className="text-cyan-600 text-sm font-medium">{maLong} days</span>
                  </div>
                  <Slider value={[maLong]} onValueChange={v => setMaLong(v[0])} min={100} max={400} step={10} />
                </div>
              </div>
              <div className="bg-slate-100/50 rounded-xl p-3 flex items-start gap-2">
                <Info size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-500 text-xs leading-relaxed">
                  Buy when the {maShort}-day SMA crosses above the {maLong}-day SMA (Golden Cross). Sell on the opposite (Death Cross).
                </p>
              </div>
            </div>
          </div>

          {/* Risk Management */}
          <div className="bg-white border border-slate-200/50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="rounded-xl p-2.5 bg-rose-100">
                <TrendingDown size={18} className="text-rose-600" />
              </div>
              <div>
                <h2 className="text-slate-900 font-semibold">Risk Management</h2>
                <p className="text-slate-500 text-xs">Stop-loss and take-profit rules</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-100/40 rounded-xl">
                <div className="flex items-center gap-3">
                  <Checkbox checked={stopLoss} onCheckedChange={(v) => setStopLoss(v as boolean)} />
                  <div>
                    <p className="text-slate-800 text-sm font-medium">Stop-Loss</p>
                    <p className="text-slate-500 text-xs">Auto-sell if position drops by threshold</p>
                  </div>
                </div>
                {stopLoss && (
                  <div className="flex items-center gap-2">
                    <span className="text-rose-600 text-sm font-medium">-{stopLossPercent}%</span>
                    <Slider value={[stopLossPercent]} onValueChange={v => setStopLossPercent(v[0])} min={2} max={30} step={1} className="w-24" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-100/40 rounded-xl">
                <div className="flex items-center gap-3">
                  <Checkbox checked={takeProfit} onCheckedChange={(v) => setTakeProfit(v as boolean)} />
                  <div>
                    <p className="text-slate-800 text-sm font-medium">Take-Profit</p>
                    <p className="text-slate-500 text-xs">Auto-sell if position gains by threshold</p>
                  </div>
                </div>
                {takeProfit && (
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 text-sm font-medium">+{takeProfitPercent}%</span>
                    <Slider value={[takeProfitPercent]} onValueChange={v => setTakeProfitPercent(v[0])} min={5} max={50} step={1} className="w-24" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Summary & Actions */}
        <div className="space-y-6">
          {/* Capital & Fees */}
          <div className="bg-white border border-slate-200/50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={18} className="text-indigo-600" />
              <h2 className="text-slate-900 font-semibold">Capital & Fees</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-slate-600 text-sm">Starting Capital</label>
                  <span className="text-slate-800 text-sm font-medium">${initialCapital.toLocaleString()}</span>
                </div>
                <Slider value={[initialCapital]} onValueChange={v => setInitialCapital(v[0])} min={1000} max={100000} step={1000} />
              </div>
            </div>
          </div>

          {/* Strategy Summary */}
          <div className="bg-white border border-slate-200/50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sliders size={18} className="text-indigo-600" />
              <h2 className="text-slate-900 font-semibold">Strategy Summary</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Symbol</span>
                <span className="text-slate-800">{symbol || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Period</span>
                <span className="text-slate-800">{startDate && endDate ? `${formatMonthYear(startDate)} — ${formatMonthYear(endDate)}` : '—'}</span>
              </div>
              {useRSI && (
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-600">RSI</span>
                  <span className="text-slate-800">Buy &lt;{rsiBuy}, Sell &gt;{rsiSell} ({rsiPeriod}d)</span>
                </div>
              )}
              {useMA && (
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-600">MA Cross</span>
                  <span className="text-slate-800">SMA {maShort}/{maLong}</span>
                </div>
              )}
              {stopLoss && (
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-600">Stop-Loss</span>
                  <span className="text-rose-600">-{stopLossPercent}%</span>
                </div>
              )}
              {takeProfit && (
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-600">Take-Profit</span>
                  <span className="text-emerald-600">+{takeProfitPercent}%</span>
                </div>
              )}
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Capital</span>
                <span className="text-slate-800">${initialCapital.toLocaleString()}</span>
              </div>
            </div>
            {!useRSI && !useMA && (
              <div className="bg-amber-500/10 border border-amber-200 rounded-xl p-3 mt-4 flex items-start gap-2">
                <Info size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-amber-800/80 text-xs">Enable at least one indicator to run a backtest.</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleRunBacktest}
              disabled={(!useRSI && !useMA) || !symbol || !startDate || !endDate}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-[0_0_30px_rgba(99,102,241,0.2)]"
            >
              <Play size={16} /> Run Backtest
            </button>
            <button
              onClick={handleReset}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm border border-slate-200"
            >
              <RotateCcw size={14} /> Reset to Defaults
            </button>
          </div>

          {/* Tip */}
          <div className="bg-indigo-500/10 border border-indigo-200 rounded-xl p-4">
            <p className="text-indigo-800/80 text-xs leading-relaxed">
              <strong className="text-indigo-700">Pro tip:</strong> The more parameters you tweak, the more likely you're overfitting to historical data. Simple strategies are usually more robust.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
