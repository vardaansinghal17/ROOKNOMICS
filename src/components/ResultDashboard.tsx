import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Clock3,
  Gavel,
  Info,
  List,
  PieChart,
} from 'lucide-react'
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'
import { PortfolioChart } from './PortfolioChart'

export interface SeriesDay {
  date: string
  value: number
}

export interface TradeRow {
  date: string
  action: 'BUY' | 'SELL'
  price: number
  shares?: number | null
  pnl?: number | null
  returnPct?: number | null
  cumulative?: number | null
}

export interface DashboardMetrics {
  totalReturn: number
  annualizedReturn: number
  maxDrawdown: number
  winRate: number | null
  sharpeRatio: number
  avgTradeDurationDays: number | null
  totalTrades: number
  tradingFees: number
}

export interface RiskStats {
  beta: number
  alpha: number
  var5: number
  radarData: Array<{
    metric: string
    strategy: number
    benchmark: number
  }>
}

interface ResultsDashboardProps {
  portfolioSeries: SeriesDay[]
  benchmarkSeries: SeriesDay[]
  tradeLog: TradeRow[]
  portfolioMetrics: DashboardMetrics
  benchmarkMetrics: DashboardMetrics
  riskStats: RiskStats
  loading?: boolean
  error?: string | null
  hasBacktestData: boolean
  parsedDataAvailable?: boolean
  rawDataPreview?: string | null
}

function formatSignedPercent(value: number, digits = 1) {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(digits)}%`
}

function formatPercent(value: number | null, digits = 1) {
  if (value === null || Number.isNaN(value)) return 'N/A'
  return `${value.toFixed(digits)}%`
}

function formatCurrency(value: number | null, digits = 0) {
  if (value === null || Number.isNaN(value)) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

function metricColor(value: number, positiveIsGood = true) {
  if (value === 0) return 'text-slate-900'
  if (positiveIsGood) {
    return value > 0 ? 'text-rose-600' : 'text-emerald-600'
  }
  return value < 0 ? 'text-rose-600' : 'text-emerald-600'
}

function tradeColor(value: number | null) {
  if (value === null || Number.isNaN(value)) return 'text-slate-500'
  if (value > 0) return 'text-emerald-600'
  if (value < 0) return 'text-rose-600'
  return 'text-slate-600'
}

export function ResultsDashboard({
  portfolioSeries,
  benchmarkSeries,
  tradeLog,
  portfolioMetrics,
  benchmarkMetrics,
  riskStats,
  loading = false,
  error = null,
  hasBacktestData,
  parsedDataAvailable = true,
  rawDataPreview = null,
}: ResultsDashboardProps) {
  const [metricTab, setMetricTab] = useState<'strategy' | 'sp500'>('strategy')
  const activeMetrics = metricTab === 'strategy' ? portfolioMetrics : benchmarkMetrics
  const returnGap = portfolioMetrics.totalReturn - benchmarkMetrics.totalReturn
  const strategyWon = returnGap > 0

  const tradeRows = useMemo(() => tradeLog.slice(0, 8), [tradeLog])

  const metricRows = [
    {
      label: 'Total Return',
      value: formatSignedPercent(activeMetrics.totalReturn),
      color: metricColor(activeMetrics.totalReturn),
    },
    {
      label: 'Annualized Return',
      value: formatSignedPercent(activeMetrics.annualizedReturn, 2),
      color: metricColor(activeMetrics.annualizedReturn),
    },
    {
      label: 'Max Drawdown',
      value: formatSignedPercent(activeMetrics.maxDrawdown),
      color: 'text-rose-600',
      note: '(Largest peak-to-trough fall)',
    },
    {
      label: 'Win Rate',
      value: activeMetrics.winRate === null ? 'N/A' : formatPercent(activeMetrics.winRate),
      color: 'text-slate-900',
    },
    {
      label: 'Sharpe Ratio',
      value: activeMetrics.sharpeRatio.toFixed(2),
      color: 'text-slate-900',
    },
    {
      label: 'Avg Trade Duration',
      value: activeMetrics.avgTradeDurationDays === null ? 'N/A' : `${Math.round(activeMetrics.avgTradeDurationDays)} days`,
      color: 'text-slate-900',
    },
    {
      label: 'Total Trades',
      value: String(activeMetrics.totalTrades),
      color: 'text-slate-900',
    },
    {
      label: 'Trading Fees Paid',
      value: formatCurrency(activeMetrics.tradingFees),
      color: activeMetrics.tradingFees > 0 ? 'text-rose-600' : 'text-slate-900',
    },
  ]

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 max-w-7xl mx-auto px-6 pb-12 pt-8">
      <div className="xl:col-span-3 space-y-6">
        <div className="bg-white border border-slate-200/70 rounded-[2rem] p-6 shadow-[0_30px_80px_rgba(148,163,184,0.12)]">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h2 className="text-slate-900 font-semibold text-lg">Portfolio Value Over Time</h2>
              <p className="text-slate-600 text-sm">
                Monthly equity curve · {portfolioSeries.length} data points
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-rose-500/15 text-rose-600 border border-rose-200 text-xs px-3 py-1 rounded-full">Your Strategy</span>
              <span className="bg-emerald-500/15 text-emerald-700 border border-emerald-200 text-xs px-3 py-1 rounded-full">S&P 500 (Buy & Hold)</span>
            </div>
          </div>
          <div className="mt-6">
            <PortfolioChart portfolioSeries={portfolioSeries} benchmarkSeries={benchmarkSeries} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-[2rem] p-6 shadow-[0_30px_80px_rgba(148,163,184,0.12)]">
          <div className="flex items-center gap-3 mb-5">
            <List size={18} className="text-indigo-600" />
            <h2 className="text-slate-900 font-semibold text-lg">Trade History</h2>
            <span className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full">
              {portfolioMetrics.totalTrades} trades
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100/70 text-slate-600 text-xs uppercase tracking-wide">
                  {['Date', 'Action', 'Price', 'Shares', 'P&L', 'Return', 'Cumulative'].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-left font-medium">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tradeRows.map((trade, index) => (
                  <tr key={`${trade.date}-${trade.action}-${index}`} className="border-t border-slate-200/70">
                    <td className="px-4 py-4 text-slate-700">{trade.date}</td>
                    <td className={`px-4 py-4 font-medium ${trade.action === 'BUY' ? 'text-indigo-600' : 'text-amber-600'}`}>
                      {trade.action}
                    </td>
                    <td className="px-4 py-4 text-slate-700">{formatCurrency(trade.price, 2)}</td>
                    <td className="px-4 py-4 text-slate-700">
                      {trade.shares === null || trade.shares === undefined ? '-' : trade.shares.toLocaleString()}
                    </td>
                    <td className={`px-4 py-4 font-medium ${tradeColor(trade.pnl ?? null)}`}>
                      {trade.pnl === null || trade.pnl === undefined ? '-' : formatCurrency(trade.pnl, 0)}
                    </td>
                    <td className={`px-4 py-4 font-medium ${tradeColor(trade.returnPct ?? null)}`}>
                      {trade.returnPct === null || trade.returnPct === undefined ? '-' : formatSignedPercent(trade.returnPct)}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {trade.cumulative === null || trade.cumulative === undefined ? '-' : formatCurrency(trade.cumulative, 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <span className="text-slate-500 text-xs">
              Showing {tradeRows.length} of {portfolioMetrics.totalTrades} trades
            </span>
            <span className="text-indigo-600 text-xs">View All</span>
          </div>
        </div>
      </div>

      <div className="xl:col-span-1 space-y-6">
        <div className="bg-white border border-slate-200/70 rounded-[2rem] p-6 shadow-[0_30px_80px_rgba(148,163,184,0.12)]">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-indigo-600" />
            <h2 className="text-slate-900 font-semibold">Performance Metrics</h2>
          </div>

          <div className="flex gap-2 mb-5">
            <button
              onClick={() => setMetricTab('strategy')}
              className={`text-xs px-3 py-2 rounded-full transition-all ${
                metricTab === 'strategy'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              Your Strategy
            </button>
            <button
              onClick={() => setMetricTab('sp500')}
              className={`text-xs px-3 py-2 rounded-full transition-all ${
                metricTab === 'sp500'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              S&P 500
            </button>
          </div>

          <div>
            {metricRows.map((row, index) => (
              <div key={row.label} className={`flex justify-between gap-4 py-4 ${index < metricRows.length - 1 ? 'border-b border-slate-200' : ''}`}>
                <div className="text-slate-600 text-sm flex items-center gap-1">
                  <span>{row.label}</span>
                  {row.label === 'Total Return' && metricTab === 'sp500' && <Info size={12} className="text-slate-400" />}
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${row.color}`}>{row.value}</span>
                  {row.note && <p className="text-slate-500 text-xs mt-0.5">{row.note}</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex gap-2">
              <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800 text-xs leading-relaxed">
                After fees and taxes, your strategy returned {formatSignedPercent(portfolioMetrics.totalReturn)} vs the S&P&apos;s {formatSignedPercent(benchmarkMetrics.totalReturn)}.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-slate-50 border border-indigo-200 rounded-[2rem] p-6 shadow-[0_30px_80px_rgba(99,102,241,0.12)]">
          <div className="flex items-center gap-2 mb-4">
            <Gavel size={16} className="text-indigo-600" />
            <span className="text-indigo-600 text-xs font-bold tracking-[0.2em]">THE VERDICT</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0 bg-rose-50 border border-rose-200 rounded-2xl p-4">
              <p className="text-rose-600 text-[11px] font-bold tracking-[0.2em] mb-2 break-words">YOUR STRATEGY</p>
              <p className="text-3xl sm:text-4xl leading-none font-bold text-rose-700 break-words">{formatSignedPercent(portfolioMetrics.totalReturn, 0)}</p>
              <p className="text-slate-500 text-xs mt-2">Total Return</p>
            </div>
            <div className="min-w-0 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 relative overflow-hidden">
              {!strategyWon && (
                <span className="absolute top-3 right-3 max-w-[72px] bg-emerald-500 text-white text-[10px] leading-none font-bold px-2 py-1 rounded-full text-center">
                  WINNER
                </span>
              )}
              <p className="text-emerald-700 text-[11px] font-bold tracking-[0.18em] mb-2 break-words pr-12">S&amp;P 500</p>
              <p className="text-3xl sm:text-4xl leading-none font-bold text-emerald-700 break-words">{formatSignedPercent(benchmarkMetrics.totalReturn, 0)}</p>
              <p className="text-slate-500 text-xs mt-2">Total Return</p>
            </div>
          </div>
          <p className="text-slate-700 text-sm text-center mt-5 leading-relaxed">
            {strategyWon ? 'Your strategy beat the index by ' : 'The index beat your strategy by '}
            <span className="text-indigo-600 font-semibold">{formatSignedPercent(Math.abs(returnGap), 1)}</span>
            {' '}over this backtest period.
          </p>
          <p className="text-indigo-600 text-sm text-center mt-3">Learn why -&gt;</p>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-[2rem] p-6 shadow-[0_30px_80px_rgba(148,163,184,0.12)]">
          <div className="flex items-center gap-2 mb-5">
            <PieChart size={18} className="text-indigo-600" />
            <h2 className="text-slate-900 font-semibold">Risk Analysis</h2>
          </div>

          <div className="h-72 px-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={riskStats.radarData} cx="50%" cy="52%" outerRadius="68%">
                <PolarGrid stroke="rgba(148,163,184,0.35)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                <Radar dataKey="strategy" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.14} />
                <Radar dataKey="benchmark" stroke="#10b981" fill="#10b981" fillOpacity={0.18} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <span className="text-slate-600 text-xs text-center bg-slate-100/60 rounded-xl py-3 px-2">
              Beta: {riskStats.beta.toFixed(2)}
            </span>
            <span className="text-slate-600 text-xs text-center bg-slate-100/60 rounded-xl py-3 px-2">
              Alpha: {riskStats.alpha.toFixed(1)}%
            </span>
            <span className="text-slate-600 text-xs text-center bg-slate-100/60 rounded-xl py-3 px-2">
              VaR (5%): {riskStats.var5.toFixed(1)}%
            </span>
          </div>
        </div>

        {loading && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-sm text-indigo-700">
            Calculating your backtest results...
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!hasBacktestData && !loading && !error && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-600 flex gap-2">
            <Clock3 size={16} className="mt-0.5 text-slate-500" />
            <span>Run a backtest in the Builder to populate this dashboard with real Redux data.</span>
          </div>
        )}

        {hasBacktestData && !parsedDataAvailable && !loading && !error && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 space-y-2">
            <div className="flex gap-2">
              <AlertTriangle size={16} className="mt-0.5 text-amber-600" />
              <span>Backtest data was received, but the results screen could not map the payload into charts yet.</span>
            </div>
            {rawDataPreview && (
              <pre className="text-xs text-slate-700 bg-white/70 border border-amber-100 rounded-xl p-3 overflow-auto max-h-48 whitespace-pre-wrap break-all">
                {rawDataPreview}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
