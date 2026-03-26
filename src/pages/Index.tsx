import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/animations';
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
  ArrowDownLeft,
  ArrowUpRight,
  List,
  Gavel,
  PieChart,
  Info,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  ReferenceLine,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import type { DashboardMetrics, SeriesDay, TradeRow } from '@/components/ResultDashboard';

export type BacktestResult = Record<string, unknown>;
export type UnknownRecord = Record<string, unknown>;
export type CandidateArray = { key: string; value: any };

import LandingView from '@/components/LandingView';
import BuilderView from '@/components/BuilderView';
import AuthDialog from '@/components/AuthDialog';
import {
  generateEquityData, tradeHistory, radarData, conceptCards,
  metricsStrategy, metricsSP500,
} from '@/data/mockData';
import LearnPage from '@/pages/Learn';
import { useMarketNews } from '@/hooks/useMarketNews';
import { formatNewsDate, getPlaceholderGradient } from '@/utils/newsHelpers';


type ViewType = 'landing' | 'builder' | 'results' | 'news' | 'learn';

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

  const [metricTab, setMetricTab] = useState<'strategy' | 'sp500'>('strategy')

  const equityData = useMemo(() => {
    if (resultsData.parsedDataAvailable) {
      return resultsData.portfolioSeries.map((p, i) => ({
        month: i,
        user: p.value,
        sp500: resultsData.benchmarkSeries[i]?.value ?? 10000,
        label: p.date || ''
      }));
    }
    return generateEquityData();
  }, [resultsData]);

  const metrics = resultsData.parsedDataAvailable
    ? (metricTab === 'strategy' ? resultsData.portfolioMetrics : resultsData.benchmarkMetrics)
    : (metricTab === 'strategy' ? metricsStrategy : metricsSP500);

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
            {(['landing', 'builder', 'results', 'news', 'learn'] as ViewType[]).map(v => (
              <button key={v} onClick={() => setCurrentView(v)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${currentView === v ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:text-slate-800'}`}>
                {v === 'landing' ? 'Home' : v === 'builder' ? 'Builder' : v === 'results' ? 'Results' : v === 'news' ? 'News' : 'Learn'}
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
            {(['landing', 'builder', 'results', 'news', 'learn'] as ViewType[]).map(v => (
              <button key={v} onClick={() => { setCurrentView(v); setMobileMenuOpen(false); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium text-left transition-all ${currentView === v ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'}`}>
                {v === 'landing' ? 'Home' : v === 'builder' ? 'Builder' : v === 'results' ? 'Results' : v === 'news' ? 'News' : 'Learn'}
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
        {currentView === 'landing' && <LandingView setCurrentView={(v: string) => setCurrentView(v as ViewType)} setShowAuth={setShowAuth} />}
        {currentView === 'builder' && <BuilderView setCurrentView={(v: string) => setCurrentView(v as ViewType)} />}
        {currentView === 'results' && <ResultsView equityData={equityData} metrics={metrics} metricTab={metricTab} setMetricTab={setMetricTab} setCurrentView={setCurrentView} />}
        {currentView === 'news' && <NewsView setCurrentView={setCurrentView} />}
        {currentView === 'learn' && <LearnPage setCurrentView={(v: string) => setCurrentView(v as ViewType)} />}
      </div>
    </div>
  );
}

/* ─── RESULTS VIEW ────────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ResultsView({ equityData, metrics, metricTab, setMetricTab, setCurrentView }: any) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 max-w-7xl mx-auto px-6 pb-12 pt-8">
      {/* Chart area */}
      <div className="xl:col-span-3">
        <PerformanceChart data={equityData} />
        <TradeHistoryTable />
      </div>
      {/* Sidebar */}
      <div className="xl:col-span-1 space-y-6">
        <PerformanceMetrics metrics={metrics} tab={metricTab} setTab={setMetricTab} />
        <VerdictPanel setCurrentView={setCurrentView} />
        <RiskAnalysis />
      </div>
    </div>
  );
}

/* ─── PERFORMANCE CHART ───────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const monthIdx = label as number;
  const year = 2004 + Math.floor(monthIdx / 12);
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][monthIdx % 12];
  return (
    <div className="bg-white/95 border border-slate-200 rounded-xl p-3 text-sm">
      <p className="text-slate-600 text-xs mb-1">{month} {year}</p>
      <p className="text-rose-700">Your Strategy: ${payload[0]?.value?.toLocaleString()}</p>
      <p className="text-emerald-700">S&P 500: ${payload[1]?.value?.toLocaleString()}</p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PerformanceChart({ data }: { data: any[] }) {
  const annotations = [
    { icon: ArrowDownLeft, color: 'text-rose-600', label: 'Oct 2008: -38%' },
    { icon: ArrowUpRight, color: 'text-emerald-600', label: 'Mar 2013: +28%' },
    { icon: TrendingDown, color: 'text-rose-600', label: 'Mar 2020: -24%' },
    { icon: TrendingUp, color: 'text-emerald-600', label: 'Dec 2023: +26%' },
  ];

  return (
    <div className="bg-white border border-slate-200/50 rounded-2xl p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-slate-900 font-semibold text-lg">Portfolio Value Over Time</h2>
          <p className="text-slate-600 text-sm">Monthly equity curve · 240 data points</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-rose-500/20 text-rose-700 border border-rose-200 text-xs px-2.5 py-1 rounded-full">Your Strategy</span>
          <span className="bg-emerald-500/20 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded-full">S&P 500 (Buy & Hold)</span>
        </div>
      </div>
      <div className="mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sp500Gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v: number) => {
              if (v % 24 === 0) {
                const labels = ["'04", "'06", "'08", "'10", "'12", "'14", "'16", "'18", "'20", "'22", "'24"];
                return labels[v / 24] || '';
              }
              return '';
            }} interval={23} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="user" stroke="#f43f5e" strokeWidth={2} fill="url(#userGradient)" fillOpacity={1} />
            <Area type="monotone" dataKey="sp500" stroke="#10b981" strokeWidth={2.5} fill="url(#sp500Gradient)" fillOpacity={1} />
            <ReferenceLine x={54} stroke="#f43f5e" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "2008 Crisis", fill: "#f43f5e", fontSize: 11 }} />
            <ReferenceLine x={144} stroke="#6366f1" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "COVID", fill: "#818cf8", fontSize: 11 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        {annotations.map((a, i) => (
          <div key={i} className="bg-slate-100/60 border border-slate-200/40 rounded-xl px-3 py-2 flex items-center gap-2 cursor-pointer hover:border-indigo-500/40 text-xs text-slate-700 transition-all duration-300">
            <a.icon size={14} className={a.color} />
            <span>{a.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── TRADE HISTORY ───────────────────────────────────────────── */

function TradeHistoryTable() {
  return (
    <div className="bg-white border border-slate-200/50 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <List size={18} className="text-indigo-600" />
        <h2 className="text-slate-900 font-semibold text-lg">Trade History</h2>
        <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full ml-2">214 trades</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100/50 text-slate-600 text-xs uppercase tracking-wide">
              {['Date', 'Action', 'Price', 'Shares', 'P&L', 'Return', 'Cumulative'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tradeHistory.map((row, i) => (
              <tr key={i} className={`border-t border-slate-200/50 ${i % 2 === 0 ? 'bg-slate-100/20' : ''}`}>
                <td className="px-3 py-2.5 text-slate-700">{row.date}</td>
                <td className={`px-3 py-2.5 font-medium ${row.action === 'BUY' ? 'text-indigo-600' : 'text-amber-600'}`}>{row.action}</td>
                <td className="px-3 py-2.5 text-slate-700">{row.price}</td>
                <td className="px-3 py-2.5 text-slate-700">{row.shares}</td>
                <td className={`px-3 py-2.5 font-medium ${row.positive === true ? 'text-emerald-600' : row.positive === false ? 'text-rose-600' : 'text-slate-500'}`}>{row.pnl}</td>
                <td className={`px-3 py-2.5 ${row.positive === true ? 'text-emerald-600' : row.positive === false ? 'text-rose-600' : 'text-slate-500'}`}>{row.ret}</td>
                <td className="px-3 py-2.5 text-slate-700">{row.cum}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <span className="text-slate-500 text-xs">Showing 8 of 214 trades</span>
        <span className="text-indigo-600 text-xs cursor-pointer hover:text-indigo-700 transition-colors">View All</span>
      </div>
    </div>
  );
}

/* ─── PERFORMANCE METRICS ─────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PerformanceMetrics({ metrics, tab, setTab }: any) {
  const isStrategy = tab === 'strategy';
  const rows = [
    { label: 'Total Return', value: metrics.totalReturn, color: isStrategy ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-bold' },
    { label: 'Annualized Return', value: metrics.annualizedReturn, color: isStrategy ? 'text-rose-700' : 'text-emerald-700' },
    { label: 'Max Drawdown', value: metrics.maxDrawdown, color: 'text-rose-600', note: '(During 2008-09 crisis)' },
    { label: 'Win Rate', value: metrics.winRate, color: 'text-slate-900' },
    { label: 'Sharpe Ratio', value: metrics.sharpeRatio, color: 'text-slate-900' },
    { label: 'Avg Trade Duration', value: metrics.avgTradeDuration, color: 'text-slate-700' },
    { label: 'Total Trades', value: metrics.totalTrades, color: 'text-slate-700' },
    { label: 'Trading Fees Paid', value: metrics.tradingFees, color: metrics.tradingFees.startsWith('-') ? 'text-rose-600' : 'text-slate-700' },
  ];

  return (
    <div className="bg-white border border-slate-200/50 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={18} className="text-indigo-600" />
        <h2 className="text-slate-900 font-semibold">Performance Metrics</h2>
      </div>
      <div className="flex gap-2 mb-4">
        {(['strategy', 'sp500'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${tab === t ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-600 border border-transparent hover:text-slate-800'}`}>
            {t === 'strategy' ? 'Your Strategy' : 'S&P 500'}
          </button>
        ))}
      </div>
      <div className="space-y-0">
        {rows.map((r, i) => (
          <div key={i} className={`flex justify-between items-center py-3 ${i < rows.length - 1 ? 'border-b border-slate-200' : ''}`}>
            <span className="text-slate-600 text-sm flex items-center gap-1">
              {r.label}
              {r.label === 'Total Return' && !isStrategy && <Info size={12} className="text-slate-500" />}
            </span>
            <div className="text-right">
              <span className={`text-sm ${r.color}`}>{r.value}</span>
              {r.note && <p className="text-slate-500 text-xs">{r.note}</p>}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-amber-500/10 border border-amber-200 rounded-xl p-4 mt-4">
        <div className="flex gap-2">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-amber-800/80 text-xs leading-relaxed">
            After fees and taxes, your strategy returned +47% vs the S&P's +332% over 20 years.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── VERDICT ─────────────────────────────────────────────────── */

function VerdictPanel({ setCurrentView }: { setCurrentView: (v: ViewType) => void }) {
  return (
    <div className="bg-gradient-to-br from-white to-slate-50 border-2 border-indigo-200 shadow-[0_0_40px_rgba(99,102,241,0.12)] rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Gavel size={16} className="text-indigo-600" />
        <span className="text-indigo-600 text-xs font-bold tracking-widest">THE VERDICT</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
          <p className="text-rose-600 text-xs font-bold tracking-wider mb-2">YOUR STRATEGY</p>
          <p className="text-3xl font-bold text-rose-700">+47%</p>
          <p className="text-slate-500 text-xs">Total Return</p>
          <TrendingDown size={18} className="text-rose-600 mt-2" />
        </div>
        <div className="bg-emerald-500/5 border border-emerald-200 rounded-xl p-4 relative">
          <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">WINNER</span>
          <p className="text-emerald-600 text-xs font-bold tracking-wider mb-2">S&P 500</p>
          <p className="text-3xl font-bold text-emerald-700">+332%</p>
          <p className="text-slate-500 text-xs">Total Return</p>
          <TrendingUp size={18} className="text-emerald-600 mt-2" />
        </div>
      </div>
      <p className="text-slate-700 text-sm text-center mt-4 leading-relaxed">
        The index beat your strategy by <span className="text-indigo-600 font-semibold">285 percentage points</span> over 20 years—without a single trade.
      </p>
      <p className="text-indigo-600 text-sm cursor-pointer mt-2 text-center hover:text-indigo-700 transition-colors" onClick={() => setCurrentView('news')}>
        Read related market news →
      </p>
    </div>
  );
}

/* ─── RISK ANALYSIS ───────────────────────────────────────────── */

function RiskAnalysis() {
  const badges = ['Beta: 0.89', 'Alpha: -1.2%', 'VaR (5%): -3.8%'];
  return (
    <div className="bg-white border border-slate-200/50 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <PieChart size={18} className="text-indigo-600" />
        <h2 className="text-slate-900 font-semibold">Risk Analysis</h2>
      </div>
      <div className="flex justify-center">
        <ResponsiveContainer width={220} height={220}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(0,0,0,0.1)" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <PolarRadiusAxis tick={false} domain={[0, 100]} axisLine={false} />
            <Radar name="Strategy" dataKey="strategy" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} />
            <Radar name="S&P 500" dataKey="sp500" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {badges.map(b => (
          <span key={b} className="text-slate-600 text-xs text-center bg-slate-100/50 rounded-lg py-1.5 px-1">{b}</span>
        ))}
      </div>
    </div>
  )
}

/* ─── NEWS VIEW ───────────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function NewsView({ setCurrentView }: any) {
  const { news, loading, error, activeTicker, setActiveTicker, refetch } = useMarketNews();
  const [searchInput, setSearchInput] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [lastUpdatedText, setLastUpdatedText] = useState('Updated just now');

  // Sync activeTicker to searchInput so chips update the bar
  useEffect(() => {
    setSearchInput(activeTicker);
  }, [activeTicker]);

  // Handle ticker input change with uppercase
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setSearchInput(val);
    setActiveTicker(val);
  };

  const clearSearch = () => {
    setSearchInput('');
    setActiveTicker('');
  };

  // Auto-refresh text timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diffMins = Math.floor((now.getTime() - lastUpdated.getTime()) / 60000);
      if (diffMins === 0) {
        setLastUpdatedText('Updated just now');
      } else {
        setLastUpdatedText(`Updated ${diffMins} min ago`);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  // When news changes, update lastUpdated
  useEffect(() => {
    if (!loading && !error) {
      setLastUpdated(new Date());
      setLastUpdatedText('Updated just now');
    }
  }, [loading, error, news]);

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-slate-900">Market News</h1>
        <p className="text-slate-600 mt-1">Live updates and company-specific headlines.</p>

        {/* Ticker Search Bar */}
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 w-full max-w-md flex items-center gap-3 mt-4 mb-8 relative shadow-sm hover:border-indigo-300 transition-colors focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
          <Search size={18} className="text-slate-500" />
          <input
            className="bg-transparent text-slate-800 placeholder-slate-400 outline-none w-full text-sm font-medium"
            placeholder="Search by ticker — AAPL, TSLA, SPY..."
            value={searchInput}
            onChange={handleInputChange}
          />
          {searchInput && (
            <button onClick={clearSearch} className="text-slate-400 hover:text-slate-600 p-1 flex-shrink-0 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Feed Mode Indicator & Labels */}
        <div className="flex justify-between items-end mb-6 border-b border-slate-200/60 pb-3 mt-4">
          <div>
            <div className="flex items-center gap-2">
              {!activeTicker ? (
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                  <h2 className="text-lg font-bold text-slate-900">General Market News</h2>
                </>
              ) : (
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  Showing news for: <span className="text-indigo-600">{activeTicker}</span>
                  {!loading && news && (
                    <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-bold ml-1 border border-indigo-100 shadow-sm">
                      {news.length} {news.length === 1 ? 'article' : 'articles'}
                    </span>
                  )}
                </h2>
              )}
            </div>
            {!activeTicker && (
              <p className="text-xs text-slate-500 font-medium mt-1.5 opacity-80 flex items-center gap-1.5">
                <span className="inline-block w-4">↻</span> Auto-refreshes every 30 min <span className="text-slate-300 mx-1">|</span> {lastUpdatedText}
              </p>
            )}
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        {error ? (
          <div className="bg-white border border-rose-200 rounded-2xl p-8 max-w-lg mx-auto text-center mt-12 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-slate-900 font-bold text-lg mb-2">Couldn't load news right now</h3>
            <p className="text-slate-600 text-sm mb-6 bg-slate-50 inline-block px-4 py-2 rounded-lg font-mono border border-slate-100">{error}</p>
            <div>
              <button onClick={refetch} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg active:scale-95">
                Try Again
              </button>
            </div>
            {news.length > 0 && (
              <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-sm font-medium flex items-center justify-center gap-2 shadow-inner">
                <Activity size={16} />
                Showing cached results below
              </div>
            )}
          </div>
        ) : null}

        {error && news.length > 0 && <div className="mt-8" />}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white border border-slate-200/80 rounded-[2rem] overflow-hidden h-[420px] flex flex-col pt-0 shadow-sm relative">
                <style>{`
                  @keyframes shimmer {
                    0% { background-position: -200% 0 }
                    100% { background-position: 200% 0 }
                  }
                  .shimmer-bg {
                    background: linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                  }
                `}</style>
                <div className="h-48 w-full shimmer-bg border-b border-slate-100" />
                <div className="p-6 flex-1 flex flex-col justify-center gap-4">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-1/4 shimmer-bg rounded-full" />
                    <div className="h-5 w-16 shimmer-bg rounded-md" />
                  </div>
                  <div className="h-6 w-full shimmer-bg rounded-lg mt-2" />
                  <div className="h-6 w-3/4 shimmer-bg rounded-lg" />
                  <div className="h-4 w-full shimmer-bg rounded mt-4" />
                  <div className="h-4 w-5/6 shimmer-bg rounded mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : !loading && news.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-slate-50 border border-slate-200 rounded-[2rem] mt-6 shadow-inner"
          >
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-sm">
              <Search size={28} className="text-slate-400" />
            </div>
            <h3 className="text-slate-600 text-lg font-medium">
              {activeTicker ? `No recent news available for ${activeTicker}` : 'No news available right now'}
            </h3>
            {activeTicker && (
              <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">Try typing another ticker symbol or select from the quick picks above.</p>
            )}
            {activeTicker && (
              <button onClick={clearSearch} className="mt-6 text-indigo-600 text-sm font-bold hover:text-indigo-800 transition-colors bg-white px-4 py-2 rounded-xl border border-indigo-100 shadow-sm">
                Return to general market news
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {news.map((article) => (
              <motion.div
                key={article.id}
                variants={fadeUp}
                onClick={() => window.open(article.url, '_blank')}
                className="bg-white border border-slate-200/80 rounded-[2rem] hover:border-indigo-300 hover:shadow-xl transition-all duration-400 cursor-pointer group flex flex-col overflow-hidden relative"
              >
                {/* Thumbnail Image */}
                <div className="h-48 w-full relative overflow-hidden bg-slate-100 flex-shrink-0 border-b border-slate-100">
                  {article.image ? (
                    <img
                      src={article.image}
                      alt={article.headline}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        e.currentTarget.parentElement!.style.background = getPlaceholderGradient(article.source);
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full" style={{ background: getPlaceholderGradient(article.source) }} />
                  )}
                  {/* Source Badge */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-slate-100/50">
                    <span className="text-[10px] font-bold text-slate-800 tracking-wider uppercase">{article.source}</span>
                  </div>
                  {/* Hover External Link icon */}
                  <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-lg">
                    <ExternalLink size={16} className="text-white" />
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col bg-gradient-to-br from-white to-slate-50/50">
                  {/* Date & Category */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-500 text-xs font-semibold tracking-wide flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                      {formatNewsDate(article.datetime)}
                    </span>
                    <span className="bg-indigo-50 text-indigo-700 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-sm border border-indigo-100/50">
                      {article.category}
                    </span>
                  </div>

                  {/* Headline */}
                  <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors duration-300" title={article.headline}>
                    {article.headline}
                  </h3>

                  {/* Summary */}
                  <p className="text-slate-600 text-sm leading-relaxed flex-1 line-clamp-3">
                    {article.summary}
                  </p>

                  {/* Related Ticker Pill at bottom */}
                  {article.related && (
                    <div className="mt-5 pt-4 border-t border-slate-200/60 flex flex-wrap gap-2">
                      {article.related.split(',').slice(0, 3).map(ticker => (
                        <span key={ticker} className="bg-emerald-50 text-emerald-700 border border-emerald-100/50 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded font-bold shadow-sm">
                          {ticker.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </>
  )
}
