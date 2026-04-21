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
import { TradeMarkerChart } from './TradeMarkerChart'
import { MetricsComparisonChart } from './MetricsComparisonChart'
import { Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, scaleUp } from '@/lib/animations'

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
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Verdict banner */}
      <motion.div 
        variants={scaleUp} 
        initial="hidden" 
        animate="visible" 
        className={`p-6 md:p-8 rounded-[2.5rem] mb-10 flex flex-col md:flex-row md:items-center gap-6 border shadow-sm ${strategyWon ? 'bg-emerald-50 border-emerald-200/60' : 'bg-rose-50 border-rose-200/60'}`}
      >
        <div className={`w-16 h-16 flex items-center justify-center rounded-[1.5rem] shrink-0 border ${strategyWon ? 'bg-white border-emerald-100 text-emerald-600 shadow-[0_8px_16px_rgba(16,185,129,0.1)]' : 'bg-white border-rose-100 text-rose-600 shadow-[0_8px_16px_rgba(244,63,94,0.1)]'}`}>
          {strategyWon ? <Trophy size={28} strokeWidth={1.5} /> : <AlertTriangle size={28} strokeWidth={1.5} />}
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
      </motion.div>

      {/* Summary metric cards */}
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-12"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {[
          { label: 'Your return', value: `+${portfolioMetrics.totalReturn}%`, highlight: true },
          { label: 'Index return', value: `+${benchmarkMetrics.totalReturn}%` },
          { label: 'Max drawdown', value: `${portfolioMetrics.maxDrawdown}%` },
          { label: 'Total trades', value: portfolioMetrics.totalTrades },
        ].map(card => (
          <motion.div variants={fadeUp} key={card.label} className="bg-white border border-slate-200/80 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">{card.label}</p>
            <p className={`text-3xl md:text-4xl font-extrabold tracking-tight ${card.highlight ? 'text-indigo-600' : 'text-slate-900'}`}>{card.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <motion.div 
        className="space-y-8"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        <motion.div variants={fadeUp} className="bg-white border border-slate-200/80 rounded-[2.5rem] p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8 tracking-tight">Portfolio vs S&P 500 Over Time</h2>
          <PortfolioChart portfolioSeries={portfolioSeries} benchmarkSeries={benchmarkSeries} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div variants={fadeUp} className="bg-white border border-slate-200/80 rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-8 tracking-tight">When You Traded</h2>
            <TradeMarkerChart portfolioSeries={portfolioSeries} tradeLog={tradeLog} />
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white border border-slate-200/80 rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-8 tracking-tight">Performance Deep Dive</h2>
            <MetricsComparisonChart portfolioMetrics={portfolioMetrics} benchmarkMetrics={benchmarkMetrics} />
          </motion.div>
        </div>
      </motion.div>

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
  )
}
