import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart2,
  ChevronRight,
  Cpu,
  GitBranch,
  Lightbulb,
  LogIn,
  Menu,
  Search,
  Shield,
  TrendingDown,
  TrendingUp,
  X,
  XIcon,
} from 'lucide-react'
import { conceptCards } from '@/data/mockData'
import LandingView from '@/components/LandingView'
import BuilderView from '@/components/BuilderView'
import AuthDialog from '@/components/AuthDialog'
import {
  ResultsDashboard,
  type DashboardMetrics,
  type RiskStats,
  type SeriesDay,
  type TradeRow,
} from '@/components/ResultDashboard'
import type { RootState } from '@/store'

type ViewType = 'landing' | 'builder' | 'results' | 'learn'
type BacktestResult = Record<string, unknown>
type UnknownRecord = Record<string, unknown>
type CandidateArray = {
  key: string
  value: unknown[]
}

const iconMap: Record<string, React.ElementType> = {
  TrendingUp,
  Activity,
  TrendingDown,
  BarChart2,
  Cpu,
  Shield,
  GitBranch,
  AlertTriangle,
  Award,
}

const filterTabs = ['All', 'Indicators', 'Risk', 'Strategy', 'Market Basics']

const emptyMetrics: DashboardMetrics = {
  totalReturn: 0,
  annualizedReturn: 0,
  maxDrawdown: 0,
  winRate: null,
  sharpeRatio: 0,
  avgTradeDurationDays: null,
  totalTrades: 0,
  tradingFees: 0,
}

const emptyRiskStats: RiskStats = {
  beta: 0,
  alpha: 0,
  var5: 0,
  radarData: [
    { metric: 'Returns', strategy: 0, benchmark: 0 },
    { metric: 'Stability', strategy: 0, benchmark: 0 },
    { metric: 'Drawdown', strategy: 0, benchmark: 0 },
    { metric: 'Costs', strategy: 0, benchmark: 0 },
    { metric: 'Simplicity', strategy: 0, benchmark: 0 },
  ],
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[%,$]/g, '').trim())
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function asNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = asNumber(value, Number.NaN)
  return Number.isFinite(parsed) ? parsed : null
}

function normaliseDate(value: unknown, fallbackIndex: number): string {
  if (typeof value === 'string' && value.trim()) {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
    return value
  }
  return `Point-${fallbackIndex + 1}`
}

function readArray<T = Record<string, unknown>>(source: BacktestResult | null, keys: string[]): T[] {
  for (const candidate of getCandidateObjects(source)) {
    for (const key of keys) {
      const value = candidate[key]
      if (Array.isArray(value)) return value as T[]
    }
  }
  return []
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getCandidateObjects(source: BacktestResult | null): UnknownRecord[] {
  if (!source) return []

  const candidates: UnknownRecord[] = []
  const seen = new Set<UnknownRecord>()
  const queue: UnknownRecord[] = [source]
  const priorityKeys = ['data', 'result', 'results', 'backtest', 'payload']

  while (queue.length) {
    const current = queue.shift()
    if (!current || seen.has(current)) continue

    seen.add(current)
    candidates.push(current)

    for (const key of priorityKeys) {
      const nested = current[key]
      if (isRecord(nested) && !seen.has(nested)) {
        queue.push(nested)
      }
    }
  }

  return candidates
}

function getCandidateArrays(source: BacktestResult | null): CandidateArray[] {
  const arrays: CandidateArray[] = []

  for (const candidate of getCandidateObjects(source)) {
    for (const [key, value] of Object.entries(candidate)) {
      if (Array.isArray(value)) {
        arrays.push({ key, value })
      }
    }
  }

  return arrays
}

function keyMatches(key: string, patterns: string[]) {
  const lowered = key.toLowerCase()
  return patterns.some((pattern) => lowered.includes(pattern))
}

function firstNumericField(row: UnknownRecord, preferredKeys: string[]) {
  for (const key of preferredKeys) {
    if (row[key] !== undefined) {
      const parsed = asNumber(row[key], Number.NaN)
      if (Number.isFinite(parsed)) return parsed
    }
  }

  for (const [key, value] of Object.entries(row)) {
    if (['date', 'time', 'timestamp', 'datetime', 'label', 'month'].includes(key.toLowerCase())) continue
    const parsed = asNumber(value, Number.NaN)
    if (Number.isFinite(parsed)) return parsed
  }

  return Number.NaN
}

function arrayToSeries(rows: unknown[], preferredValueKeys: string[]): SeriesDay[] {
  const objectRows = rows.filter(isRecord)

  if (objectRows.length) {
    const points = objectRows.map((row, index) => ({
      date: normaliseDate(
        row.date ?? row.datetime ?? row.timestamp ?? row.time ?? row.label ?? row.month,
        index
      ),
      value: firstNumericField(row, preferredValueKeys),
    })).filter((point) => Number.isFinite(point.value))

    return sortSeries(points)
  }

  const primitiveRows = rows
    .map((value, index) => ({
      date: `Point-${index + 1}`,
      value: asNumber(value, Number.NaN),
    }))
    .filter((point) => Number.isFinite(point.value))

  return primitiveRows
}

function objectMapToSeries(source: BacktestResult | null, keys: string[]): SeriesDay[] {
  for (const candidate of getCandidateObjects(source)) {
    for (const key of keys) {
      const value = candidate[key]
      if (isRecord(value)) {
        const points = Object.entries(value)
          .map(([date, raw]) => ({
            date: normaliseDate(date, 0),
            value: asNumber(raw, Number.NaN),
          }))
          .filter((point) => Number.isFinite(point.value))

        if (points.length) return sortSeries(points)
      }
    }
  }

  return []
}

function sortSeries(points: SeriesDay[]) {
  return [...points].sort((a, b) => {
    const left = new Date(a.date).getTime()
    const right = new Date(b.date).getTime()
    if (Number.isNaN(left) || Number.isNaN(right)) return a.date.localeCompare(b.date)
    return left - right
  })
}

function extractSeries(source: BacktestResult | null, keys: string[], valueKeys: string[]): SeriesDay[] {
  const rows = readArray<Record<string, unknown>>(source, keys)
  if (rows.length) {
    const points = rows
      .map((row, index) => {
        let value = Number.NaN
        for (const key of valueKeys) {
          if (row[key] !== undefined) {
            value = asNumber(row[key], Number.NaN)
            break
          }
        }

        if (!Number.isFinite(value)) {
          value = firstNumericField(row, valueKeys)
        }

        return {
          date: normaliseDate(
            row.date ?? row.datetime ?? row.timestamp ?? row.label ?? row.month,
            index
          ),
          value,
        }
      })
      .filter((point) => Number.isFinite(point.value))

    if (points.length) return sortSeries(points)
  }

  const objectMapSeries = objectMapToSeries(source, keys)
  if (objectMapSeries.length) return objectMapSeries

  const fallbackArray = getCandidateArrays(source).find(({ key, value }) =>
    keyMatches(key, keys.map((entry) => entry.toLowerCase())) ||
    keyMatches(key, ['portfolio', 'equity', 'strategy', 'user', 'benchmark', 'sp500', 'index'])
  )

  if (fallbackArray) {
    const series = arrayToSeries(fallbackArray.value, valueKeys)
    if (series.length) return series
  }

  return []
}

function extractCombinedDataSeries(
  source: BacktestResult | null,
  seriesType: 'strategy' | 'benchmark'
): SeriesDay[] {
  const rows = readArray<Record<string, unknown>>(source, ['combinedData'])
  if (!rows.length) return []

  const valueCandidates = seriesType === 'strategy'
    ? ['strategy', 'portfolio', 'portfolioValue', 'user', 'value', 'equity']
    : ['benchmark', 'benchmarkValue', 'sp500', 'index', 'buyHold', 'value']

  const points = rows
    .map((row, index) => ({
      date: normaliseDate(
        row.date ?? row.datetime ?? row.timestamp ?? row.time ?? row.label ?? row.month,
        index
      ),
      value: firstNumericField(row, valueCandidates),
    }))
    .filter((point) => Number.isFinite(point.value))

  return sortSeries(points)
}

function seriesReturnValues(series: SeriesDay[]) {
  const returns: number[] = []
  for (let index = 1; index < series.length; index += 1) {
    const previous = series[index - 1].value
    const current = series[index].value
    if (previous > 0 && current > 0) {
      returns.push((current - previous) / previous)
    }
  }
  return returns
}

function percentile(values: number[], p: number) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.max(0, Math.min(sorted.length - 1, Math.floor(p * (sorted.length - 1))))
  return sorted[index]
}

function mean(values: number[]) {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function standardDeviation(values: number[]) {
  if (values.length < 2) return 0
  const average = mean(values)
  const variance = mean(values.map((value) => (value - average) ** 2))
  return Math.sqrt(variance)
}

function covariance(left: number[], right: number[]) {
  if (!left.length || left.length !== right.length) return 0
  const leftMean = mean(left)
  const rightMean = mean(right)
  return mean(left.map((value, index) => (value - leftMean) * (right[index] - rightMean)))
}

function calculateTotalReturn(series: SeriesDay[]) {
  if (series.length < 2 || series[0].value === 0) return 0
  return ((series[series.length - 1].value / series[0].value) - 1) * 100
}

function calculateAnnualizedReturn(series: SeriesDay[]) {
  if (series.length < 2 || series[0].value <= 0) return 0
  const firstDate = new Date(series[0].date)
  const lastDate = new Date(series[series.length - 1].date)
  const years = !Number.isNaN(firstDate.getTime()) && !Number.isNaN(lastDate.getTime())
    ? Math.max((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25), 1 / 365.25)
    : Math.max(series.length / 252, 1 / 252)

  return ((series[series.length - 1].value / series[0].value) ** (1 / years) - 1) * 100
}

function calculateMaxDrawdown(series: SeriesDay[]) {
  if (!series.length) return 0
  let peak = series[0].value
  let maxDrawdown = 0

  for (const point of series) {
    peak = Math.max(peak, point.value)
    if (peak > 0) {
      const drawdown = ((point.value - peak) / peak) * 100
      maxDrawdown = Math.min(maxDrawdown, drawdown)
    }
  }

  return maxDrawdown
}

function calculateSharpeRatio(series: SeriesDay[]) {
  const returns = seriesReturnValues(series)
  const volatility = standardDeviation(returns)
  if (!returns.length || volatility === 0) return 0
  return (mean(returns) / volatility) * Math.sqrt(252)
}

function inferTradePnl(trade: TradeRow) {
  if (trade.pnl !== null && trade.pnl !== undefined) return trade.pnl
  if (trade.returnPct !== null && trade.returnPct !== undefined && trade.shares && trade.price) {
    const costBasis = trade.price * trade.shares
    return costBasis * (trade.returnPct / 100)
  }
  return null
}

function calculateWinRate(trades: TradeRow[]) {
  const resolved = trades
    .map((trade) => inferTradePnl(trade))
    .filter((value): value is number => value !== null)

  if (!resolved.length) return null
  const winners = resolved.filter((value) => value > 0).length
  return (winners / resolved.length) * 100
}

function calculateAverageTradeDuration(trades: TradeRow[]) {
  const durations: number[] = []
  let lastBuy: Date | null = null

  for (const trade of trades) {
    const parsed = new Date(trade.date)
    if (Number.isNaN(parsed.getTime())) continue

    if (trade.action === 'BUY') {
      lastBuy = parsed
    } else if (trade.action === 'SELL' && lastBuy) {
      const days = (parsed.getTime() - lastBuy.getTime()) / (1000 * 60 * 60 * 24)
      if (days >= 0) durations.push(days)
      lastBuy = null
    }
  }

  return durations.length ? mean(durations) : null
}

function calculateBetaAlpha(strategySeries: SeriesDay[], benchmarkSeries: SeriesDay[]) {
  const strategyReturns = seriesReturnValues(strategySeries)
  const benchmarkReturns = seriesReturnValues(benchmarkSeries)
  const alignedLength = Math.min(strategyReturns.length, benchmarkReturns.length)
  if (alignedLength < 2) return { beta: 0, alpha: 0 }

  const strategy = strategyReturns.slice(-alignedLength)
  const benchmark = benchmarkReturns.slice(-alignedLength)
  const benchmarkVariance = standardDeviation(benchmark) ** 2
  const beta = benchmarkVariance === 0 ? 0 : covariance(strategy, benchmark) / benchmarkVariance
  const alphaDaily = mean(strategy) - beta * mean(benchmark)

  return {
    beta,
    alpha: alphaDaily * 252 * 100,
  }
}

function mapScore(value: number, min: number, max: number) {
  if (max === min) return 50
  const normalized = ((value - min) / (max - min)) * 100
  return Math.max(0, Math.min(100, normalized))
}

function buildRiskStats(
  portfolioMetrics: DashboardMetrics,
  benchmarkMetrics: DashboardMetrics,
  portfolioSeries: SeriesDay[],
  benchmarkSeries: SeriesDay[]
): RiskStats {
  const { beta, alpha } = calculateBetaAlpha(portfolioSeries, benchmarkSeries)
  const returns = seriesReturnValues(portfolioSeries).map((value) => value * 100)
  const var5 = percentile(returns, 0.05)

  const radarData = [
    {
      metric: 'Returns',
      strategy: mapScore(portfolioMetrics.totalReturn, -100, Math.max(portfolioMetrics.totalReturn, benchmarkMetrics.totalReturn, 1)),
      benchmark: mapScore(benchmarkMetrics.totalReturn, -100, Math.max(portfolioMetrics.totalReturn, benchmarkMetrics.totalReturn, 1)),
    },
    {
      metric: 'Stability',
      strategy: mapScore(portfolioMetrics.sharpeRatio, -1, Math.max(portfolioMetrics.sharpeRatio, benchmarkMetrics.sharpeRatio, 1)),
      benchmark: mapScore(benchmarkMetrics.sharpeRatio, -1, Math.max(portfolioMetrics.sharpeRatio, benchmarkMetrics.sharpeRatio, 1)),
    },
    {
      metric: 'Drawdown',
      strategy: mapScore(-portfolioMetrics.maxDrawdown, 0, Math.max(-portfolioMetrics.maxDrawdown, -benchmarkMetrics.maxDrawdown, 1)),
      benchmark: mapScore(-benchmarkMetrics.maxDrawdown, 0, Math.max(-portfolioMetrics.maxDrawdown, -benchmarkMetrics.maxDrawdown, 1)),
    },
    {
      metric: 'Costs',
      strategy: mapScore(-portfolioMetrics.tradingFees, -Math.max(portfolioMetrics.tradingFees, benchmarkMetrics.tradingFees, 1), 0),
      benchmark: mapScore(-benchmarkMetrics.tradingFees, -Math.max(portfolioMetrics.tradingFees, benchmarkMetrics.tradingFees, 1), 0),
    },
    {
      metric: 'Simplicity',
      strategy: mapScore(-portfolioMetrics.totalTrades, -Math.max(portfolioMetrics.totalTrades, benchmarkMetrics.totalTrades, 1), 0),
      benchmark: mapScore(-benchmarkMetrics.totalTrades, -Math.max(portfolioMetrics.totalTrades, benchmarkMetrics.totalTrades, 1), 0),
    },
  ]

  return {
    beta,
    alpha,
    var5,
    radarData,
  }
}

function buildTradeLog(source: BacktestResult | null, portfolioSeries: SeriesDay[]): TradeRow[] {
  let rows = readArray<Record<string, unknown>>(source, ['tradeLog', 'trade_log', 'trades', 'tradeHistory'])
  if (!rows.length) {
    const fallback = getCandidateArrays(source).find(({ key, value }) =>
      keyMatches(key, ['trade', 'order', 'signal']) && value.some(isRecord)
    )
    rows = fallback ? (fallback.value.filter(isRecord) as Record<string, unknown>[]) : []
  }
  const cumulativeByDate = new Map(portfolioSeries.map((point) => [point.date, point.value]))

  return rows.map((row, index) => {
    const date = normaliseDate(row.date ?? row.datetime ?? row.timestamp, index)
    const action = String(row.action ?? row.side ?? row.type).toUpperCase() === 'SELL' ? 'SELL' : 'BUY'
    const price = asNumber(row.price ?? row.executionPrice ?? row.fillPrice)
    const shares = asNullableNumber(row.shares ?? row.quantity ?? row.qty ?? row.units)
    const pnl = asNullableNumber(row.pnl ?? row.profit ?? row.realizedPnl)
    const returnPct = asNullableNumber(row.returnPct ?? row.return_pct ?? row.return ?? row.roi)
    const cumulative = asNullableNumber(row.cumulative ?? row.runningEquity ?? row.portfolioValue)
      ?? cumulativeByDate.get(date)
      ?? null

    return {
      date,
      action,
      price,
      shares,
      pnl,
      returnPct,
      cumulative,
    }
  })
}

function buildMetrics(
  metricsSource: Record<string, unknown> | null,
  series: SeriesDay[],
  trades: TradeRow[],
  fallbackTradeCount: number,
  fallbackOverrides?: Partial<DashboardMetrics>
): DashboardMetrics {
  const totalReturn = metricsSource
    ? asNumber(metricsSource.totalReturn ?? metricsSource.total_return ?? metricsSource.returnPct ?? metricsSource.return_percent, fallbackOverrides?.totalReturn ?? calculateTotalReturn(series))
    : (fallbackOverrides?.totalReturn ?? calculateTotalReturn(series))
  const annualizedReturn = metricsSource
    ? asNumber(metricsSource.annualizedReturn ?? metricsSource.annualized_return, fallbackOverrides?.annualizedReturn ?? calculateAnnualizedReturn(series))
    : (fallbackOverrides?.annualizedReturn ?? calculateAnnualizedReturn(series))
  const maxDrawdown = metricsSource
    ? asNumber(metricsSource.maxDrawdown ?? metricsSource.max_drawdown ?? metricsSource.drawdownPct, fallbackOverrides?.maxDrawdown ?? calculateMaxDrawdown(series))
    : (fallbackOverrides?.maxDrawdown ?? calculateMaxDrawdown(series))
  const sharpeRatio = metricsSource
    ? asNumber(metricsSource.sharpeRatio ?? metricsSource.sharpe_ratio ?? metricsSource.sharpe, fallbackOverrides?.sharpeRatio ?? calculateSharpeRatio(series))
    : (fallbackOverrides?.sharpeRatio ?? calculateSharpeRatio(series))
  const winRate = metricsSource && (metricsSource.winRate !== undefined || metricsSource.win_rate !== undefined)
    ? asNullableNumber(metricsSource.winRate ?? metricsSource.win_rate)
    : (fallbackOverrides?.winRate ?? calculateWinRate(trades))
  const avgTradeDurationDays = metricsSource && (metricsSource.avgTradeDuration !== undefined || metricsSource.avg_trade_duration !== undefined)
    ? asNullableNumber(metricsSource.avgTradeDuration ?? metricsSource.avg_trade_duration)
    : (fallbackOverrides?.avgTradeDurationDays ?? calculateAverageTradeDuration(trades))
  const totalTrades = metricsSource
    ? asNumber(metricsSource.totalTrades ?? metricsSource.total_trades ?? metricsSource.tradeCount, fallbackOverrides?.totalTrades ?? fallbackTradeCount)
    : (fallbackOverrides?.totalTrades ?? fallbackTradeCount)
  const tradingFees = metricsSource
    ? asNumber(metricsSource.tradingFees ?? metricsSource.trading_fees ?? metricsSource.feesPaid ?? metricsSource.fees, fallbackOverrides?.tradingFees ?? 0)
    : (fallbackOverrides?.tradingFees ?? 0)

  return {
    totalReturn,
    annualizedReturn,
    maxDrawdown,
    winRate,
    sharpeRatio,
    avgTradeDurationDays,
    totalTrades,
    tradingFees,
  }
}

function getMetricsSource(source: BacktestResult | null, keys: string[]) {
  for (const candidate of getCandidateObjects(source)) {
    for (const key of keys) {
      const value = candidate[key]
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as Record<string, unknown>
      }
    }
  }

  for (const candidate of getCandidateObjects(source)) {
    for (const [key, value] of Object.entries(candidate)) {
      if (!isRecord(value)) continue
      if (keyMatches(key, ['metric', 'stats', 'summary', 'performance'])) {
        return value
      }
    }
  }

  return null
}

function getBenchmarkSummary(source: BacktestResult | null) {
  for (const candidate of getCandidateObjects(source)) {
    const value = candidate.benchmark
    if (isRecord(value)) return value
  }
  return null
}

function getResultsData(source: BacktestResult | null) {
  const combinedPortfolioSeries = extractCombinedDataSeries(source, 'strategy')
  const combinedBenchmarkSeries = extractCombinedDataSeries(source, 'benchmark')

  const portfolioSeries = combinedPortfolioSeries.length ? combinedPortfolioSeries : extractSeries(
    source,
    ['combinedData', 'portfolioSeries', 'portfolio_series', 'equityCurve', 'equity_curve', 'portfolio'],
    ['value', 'portfolioValue', 'equity', 'close']
  )
  const benchmarkSeries = combinedBenchmarkSeries.length ? combinedBenchmarkSeries : extractSeries(
    source,
    ['combinedData', 'benchmarkSeries', 'benchmark_series', 'benchmarkCurve', 'benchmark_curve', 'benchmark', 'sp500'],
    ['value', 'benchmarkValue', 'equity', 'close']
  )
  const tradeLog = buildTradeLog(source, portfolioSeries)
  const benchmarkSummary = getBenchmarkSummary(source)

  const portfolioMetrics = buildMetrics(
    getMetricsSource(source, ['portfolioMatrics', 'portfolioMetrics', 'portfolio_metrics', 'strategyMetrics', 'strategy_metrics', 'metrics']),
    portfolioSeries,
    tradeLog,
    tradeLog.length
  )
  const benchmarkMetrics = buildMetrics(
    getMetricsSource(source, ['benchmarkMatrics', 'benchmarkMetrics', 'benchmark_metrics', 'sp500Metrics', 'sp500_metrics']),
    benchmarkSeries,
    [],
    benchmarkSeries.length ? 1 : 0,
    {
      totalReturn: benchmarkSummary ? asNumber(benchmarkSummary.benchmark, calculateTotalReturn(benchmarkSeries)) : undefined,
      totalTrades: 1,
    }
  )

  const riskStats = portfolioSeries.length && benchmarkSeries.length
    ? buildRiskStats(portfolioMetrics, benchmarkMetrics, portfolioSeries, benchmarkSeries)
    : emptyRiskStats

  return {
    portfolioSeries,
    benchmarkSeries,
    tradeLog,
    portfolioMetrics: portfolioSeries.length ? portfolioMetrics : emptyMetrics,
    benchmarkMetrics: benchmarkSeries.length ? benchmarkMetrics : emptyMetrics,
    riskStats,
    parsedDataAvailable: Boolean(
      portfolioSeries.length ||
      benchmarkSeries.length ||
      tradeLog.length
    ),
  }
}

function getRawDataPreview(source: BacktestResult | null) {
  if (!source) return null
  try {
    return JSON.stringify(source, null, 2)
  } catch {
    return String(source)
  }
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('landing')
  const [expandedConcept, setExpandedConcept] = useState<string | null>(null)
  const [learnFilter, setLearnFilter] = useState('All')
  const [learnSearch, setLearnSearch] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  const backtestState = useSelector((state: RootState) => state.backtest)

  const resultsData = useMemo(
    () => getResultsData(backtestState.data as BacktestResult | null),
    [backtestState.data]
  )

  const filteredConcepts = useMemo(() => {
    return conceptCards.filter((card) => {
      const matchFilter =
        learnFilter === 'All' ||
        card.category === learnFilter ||
        card.tags.includes(learnFilter)
      const searchTerm = learnSearch.toLowerCase()
      const matchSearch =
        !learnSearch ||
        card.title.toLowerCase().includes(searchTerm) ||
        card.body.toLowerCase().includes(searchTerm)

      return matchFilter && matchSearch
    })
  }, [learnFilter, learnSearch])

  const expandedCard = expandedConcept
    ? conceptCards.find((card) => card.id === expandedConcept) ?? null
    : null

  return (
    <div className="min-h-screen bg-slate-50 noise-bg relative">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('landing')}>
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <BarChart2 size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-slate-900 text-lg">ROOKNOMICS</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {(['landing', 'builder', 'results', 'learn'] as ViewType[]).map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  currentView === view
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                {view === 'landing' ? 'Home' : view === 'builder' ? 'Builder' : view === 'results' ? 'Results' : 'Learn'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAuth(true)}
              className="hidden md:flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 transition-colors px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-600"
            >
              <LogIn size={14} /> Sign In
            </button>
            <button className="md:hidden text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <XIcon size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-slate-50/95 backdrop-blur-xl px-6 py-3 flex flex-col gap-2">
            {(['landing', 'builder', 'results', 'learn'] as ViewType[]).map((view) => (
              <button
                key={view}
                onClick={() => {
                  setCurrentView(view)
                  setMobileMenuOpen(false)
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium text-left transition-all ${
                  currentView === view ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
                }`}
              >
                {view === 'landing' ? 'Home' : view === 'builder' ? 'Builder' : view === 'results' ? 'Results' : 'Learn'}
              </button>
            ))}
            <button
              onClick={() => {
                setShowAuth(true)
                setMobileMenuOpen(false)
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-left text-indigo-600"
            >
              Sign In
            </button>
          </div>
        )}
      </nav>

      <AuthDialog open={showAuth} onClose={() => setShowAuth(false)} />

      <div className="relative z-10 pt-16">
        {currentView === 'landing' && (
          <LandingView
            setCurrentView={(view: string) => setCurrentView(view as ViewType)}
            setShowAuth={setShowAuth}
          />
        )}
        {currentView === 'builder' && (
          <BuilderView setCurrentView={(view: string) => setCurrentView(view as ViewType)} />
        )}
        {currentView === 'results' && (
          <ResultsDashboard
            {...resultsData}
            loading={backtestState.loading}
            error={backtestState.error}
            hasBacktestData={Boolean(backtestState.data)}
            rawDataPreview={getRawDataPreview(backtestState.data as BacktestResult | null)}
          />
        )}
        {currentView === 'learn' && (
          <LearnView
            concepts={filteredConcepts}
            filter={learnFilter}
            setFilter={setLearnFilter}
            search={learnSearch}
            setSearch={setLearnSearch}
            expandedCard={expandedCard}
            setExpandedConcept={setExpandedConcept}
            setCurrentView={setCurrentView}
          />
        )}
      </div>
    </div>
  )
}

function LearnView({ concepts, filter, setFilter, search, setSearch, expandedCard, setExpandedConcept, setCurrentView }: any) {
  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-slate-900">Learning Hub</h1>
        <p className="text-slate-600 mt-1">Understand the concepts behind your strategy in plain English.</p>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 w-full max-w-md flex items-center gap-3 mt-4">
          <Search size={18} className="text-slate-500" />
          <input
            className="bg-transparent text-slate-800 placeholder-slate-500 outline-none w-full text-sm"
            placeholder="Search concepts..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap mt-4 mb-8">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                filter === tab
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-800 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto px-6 pb-12">
        {concepts.map((card: any) => {
          const Icon = iconMap[card.icon] || TrendingUp
          const diffColor =
            card.difficulty === 'Beginner'
              ? 'bg-emerald-100 text-emerald-600'
              : card.difficulty === 'Intermediate'
                ? 'bg-amber-100 text-amber-600'
                : 'bg-rose-100 text-rose-600'

          return (
            <div
              key={card.id}
              onClick={() => setExpandedConcept(card.id)}
              className="bg-white border border-slate-200/80 rounded-[2rem] p-8 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col"
            >
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
                  <span key={tag} className="bg-slate-100 border border-slate-200 text-slate-600 font-medium text-xs px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-8 pt-4 border-t border-slate-200/60 text-indigo-600 text-sm group-hover:text-indigo-700 flex items-center gap-1 font-bold tracking-wide uppercase">
                Read More <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )
        })}
      </div>

      {expandedCard && (
        <>
          <div className="fixed inset-0 bg-slate-900/20 z-40 backdrop-blur-sm" onClick={() => setExpandedConcept(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white border-l border-slate-200 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out translate-x-0 flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = iconMap[expandedCard.icon] || TrendingUp
                  return <Icon size={22} className="text-indigo-600" />
                })()}
                <h2 className="text-xl font-bold text-slate-900">{expandedCard.title}</h2>
              </div>
              <button onClick={() => setExpandedConcept(null)} className="text-slate-600 hover:text-slate-800 transition-colors p-1">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex items-center gap-3 mb-6">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    expandedCard.difficulty === 'Beginner'
                      ? 'bg-emerald-100 text-emerald-600'
                      : expandedCard.difficulty === 'Intermediate'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-rose-100 text-rose-600'
                  }`}
                >
                  {expandedCard.difficulty}
                </span>
                <span className="text-slate-500 text-xs">~3 min read</span>
              </div>
              <div className="space-y-4">
                {expandedCard.fullText.map((paragraph: string, index: number) => (
                  <p key={index} className="text-slate-700 text-sm leading-7">{paragraph}</p>
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
                    {expandedCard.related.map((relatedId: string) => {
                      const relatedCard = conceptCards.find((card) => card.id === relatedId)
                      return relatedCard ? (
                        <button
                          key={relatedId}
                          onClick={() => setExpandedConcept(relatedId)}
                          className="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors"
                        >
                          {relatedCard.title}
                        </button>
                      ) : null
                    })}
                  </div>
                </div>
              )}
              <button
                onClick={() => {
                  setExpandedConcept(null)
                  setCurrentView('builder')
                }}
                className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-colors text-sm"
              >
                Apply This in the Builder {'->'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
