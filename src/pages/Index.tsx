import { useState, useMemo, useEffect } from 'react';
import type { ChangeEvent, ElementType } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useAuth } from '@/hooks/useAuth';
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
  LogOut,
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
import type { DashboardMetrics, RiskStats, SeriesDay, TradeRow } from '@/components/ResultDashboard';

export type BacktestResult = Record<string, unknown>;
export type UnknownRecord = Record<string, unknown>;
export type CandidateArray = { key: string; value: any };

import LandingView from '@/components/LandingView';
import BuilderView from '@/components/BuilderView';
import AuthDialog from '@/components/AuthDialog';
import ProfileView from '@/components/ProfileView';
import {
  generateEquityData, tradeHistory, radarData, conceptCards,
  metricsStrategy, metricsSP500,
} from '@/data/mockData';
import LearnPage from '@/pages/Learn';
import { useMarketNews } from '@/hooks/useMarketNews';
import { formatNewsDate, getPlaceholderGradient } from '@/utils/newsHelpers';


type ViewType = 'landing' | 'builder' | 'results' | 'news' | 'learn' | 'profile';

const iconMap: Record<string, ElementType> = {
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

function readDateField(row: UnknownRecord) {
  return (
    row.date ??
    row.Date ??
    row.datetime ??
    row.dateTime ??
    row.timestamp ??
    row.time ??
    row.label ??
    row.month
  )
}

function normaliseDate(value: unknown, fallbackIndex: number): string {
  if (typeof value === 'string' && value.trim()) {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
    return value
  }
  return 'Point-' + (fallbackIndex + 1)
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

    for (const [key, value] of Object.entries(current)) {
      if (priorityKeys.includes(key)) continue
      if (isRecord(value) && !seen.has(value)) {
        queue.push(value)
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
      date: normaliseDate(readDateField(row), index),
      value: firstNumericField(row, preferredValueKeys),
    })).filter((point) => Number.isFinite(point.value))

    return sortSeries(points)
  }

  const primitiveRows = rows
    .map((value, index) => ({
      date: 'Point-' + (index + 1),
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
          date: normaliseDate(readDateField(row), index),
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
      date: normaliseDate(readDateField(row), index),
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
    const date = normaliseDate(readDateField(row), index)
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

function buildPortfolioSeriesFromTradeLog(trades: TradeRow[], startingCapital = 10000): SeriesDay[] {
  if (!trades.length) return []

  let runningValue = startingCapital

  const points = trades.map((trade, index) => {
    if (trade.cumulative !== null && trade.cumulative !== undefined && Number.isFinite(trade.cumulative)) {
      runningValue = trade.cumulative
    } else if (trade.pnl !== null && trade.pnl !== undefined && Number.isFinite(trade.pnl)) {
      runningValue += trade.pnl
    }

    return {
      date: normaliseDate(trade.date, index),
      value: runningValue,
    }
  })

  return sortSeries(points.filter((point) => Number.isFinite(point.value) && point.value > 0))
}

function buildBenchmarkSeriesFromReturn(
  portfolioSeries: SeriesDay[],
  benchmarkReturn: number,
  startingCapital: number
): SeriesDay[] {
  if (!portfolioSeries.length || !Number.isFinite(startingCapital) || startingCapital <= 0) return []

  const finalValue = startingCapital * (1 + benchmarkReturn / 100)
  const lastIndex = Math.max(1, portfolioSeries.length - 1)

  return portfolioSeries.map((point, index) => {
    const progress = index / lastIndex
    return {
      date: point.date,
      value: startingCapital + (finalValue - startingCapital) * progress,
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
  const totalReturn = fallbackOverrides?.totalReturn ?? (
    metricsSource
      ? asNumber(metricsSource.totalReturn ?? metricsSource.total_return ?? metricsSource.returnPct ?? metricsSource.return_percent, calculateTotalReturn(series))
      : calculateTotalReturn(series)
  )
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
  const isBench = keys.some(k => k.toLowerCase().includes('benchmark') || k.toLowerCase().includes('sp500'))
  
  for (const candidate of getCandidateObjects(source)) {
    if (isBench && isRecord(candidate.benchmark)) return candidate.benchmark as Record<string, unknown>
    if (!isBench && isRecord(candidate.strategy)) return candidate.strategy as Record<string, unknown>
    
    if (isRecord(candidate.performance)) {
      if (isBench) {
        if (isRecord(candidate.performance.benchmark)) return candidate.performance.benchmark as Record<string, unknown>
        if (isRecord(candidate.performance.sp500)) return candidate.performance.sp500 as Record<string, unknown>
      } else {
        if (isRecord(candidate.performance.strategy)) return candidate.performance.strategy as Record<string, unknown>
        if (isRecord(candidate.performance.portfolio)) return candidate.performance.portfolio as Record<string, unknown>
      }
    }
  }

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

function getExplicitBenchmarkReturn(source: BacktestResult | null): number | null {
  for (const candidate of getCandidateObjects(source)) {
    const direct = asNullableNumber(
      candidate.benchmarkReturn ??
      candidate.benchmark_return ??
      candidate.sp500Return ??
      candidate.sp500_return ??
      candidate.buyHoldReturn ??
      candidate.buy_hold_return
    )
    if (direct !== null) return direct

    const benchmark = candidate.benchmark
    if (isRecord(benchmark)) {
      const nested = asNullableNumber(
        benchmark.totalReturn ??
        benchmark.total_return ??
        benchmark.returnPct ??
        benchmark.return_percent ??
        benchmark.benchmark ??
        benchmark.sp500 ??
        benchmark.buyHold
      )
      if (nested !== null) return nested
    }

    const performance = candidate.performance
    if (isRecord(performance)) {
      const nested = performance.benchmark ?? performance.sp500 ?? performance.buyHold
      if (isRecord(nested)) {
        const value = asNullableNumber(
          nested.totalReturn ??
          nested.total_return ??
          nested.returnPct ??
          nested.return_percent
        )
        if (value !== null) return value
      }
    }
  }

  return null
}

function getResultsData(source: BacktestResult | null) {
  const combinedPortfolioSeries = extractCombinedDataSeries(source, 'strategy')
  const combinedBenchmarkSeries = extractCombinedDataSeries(source, 'benchmark')

  const extractedPortfolioSeries = combinedPortfolioSeries.length ? combinedPortfolioSeries : extractSeries(
    source,
    ['combinedData', 'portfolioSeries', 'portfolio_series', 'equityCurve', 'equity_curve', 'portfolio'],
    ['value', 'portfolioValue', 'equity', 'close']
  )
  const extractedBenchmarkSeries = combinedBenchmarkSeries.length ? combinedBenchmarkSeries : extractSeries(
    source,
    ['combinedData', 'benchmarkSeries', 'benchmark_series', 'benchmarkCurve', 'benchmark_curve', 'benchmark', 'sp500'],
    ['value', 'benchmarkValue', 'equity', 'close']
  )
  const tradeLog = buildTradeLog(source, extractedPortfolioSeries)
  const portfolioSeries = extractedPortfolioSeries.length
    ? extractedPortfolioSeries
    : buildPortfolioSeriesFromTradeLog(tradeLog)
  const benchmarkSummary = getBenchmarkSummary(source)
  const explicitBenchmarkReturn = getExplicitBenchmarkReturn(source)

  const portfolioMetrics = buildMetrics(
    getMetricsSource(source, ['portfolioMatrics', 'portfolioMetrics', 'portfolio_metrics', 'strategyMetrics', 'strategy_metrics', 'metrics']),
    portfolioSeries,
    tradeLog,
    tradeLog.length
  )
  const benchmarkMetrics = buildMetrics(
    getMetricsSource(source, ['benchmarkMatrics', 'benchmarkMetrics', 'benchmark_metrics', 'sp500Metrics', 'sp500_metrics']),
    extractedBenchmarkSeries,
    [],
    extractedBenchmarkSeries.length ? 1 : 0,
    {
      totalReturn: explicitBenchmarkReturn ?? (benchmarkSummary ? asNumber(benchmarkSummary.benchmark, calculateTotalReturn(extractedBenchmarkSeries)) : undefined),
      totalTrades: 1,
    }
  )
  const portfolioStart = portfolioSeries[0]?.value ?? 10000
  const benchmarkSeries = extractedBenchmarkSeries.length
    ? extractedBenchmarkSeries
    : buildBenchmarkSeriesFromReturn(portfolioSeries, benchmarkMetrics.totalReturn, portfolioStart)

  const riskStats = portfolioSeries.length && benchmarkSeries.length
    ? buildRiskStats(portfolioMetrics, benchmarkMetrics, portfolioSeries, benchmarkSeries)
    : emptyRiskStats

  return {
    portfolioSeries,
    benchmarkSeries,
    tradeLog,
    portfolioMetrics,
    benchmarkMetrics,
    riskStats,
    parsedDataAvailable: Boolean(
      portfolioSeries.length ||
      benchmarkSeries.length ||
      tradeLog.length ||
      (portfolioMetrics.totalReturn !== undefined && portfolioMetrics.totalReturn !== null)
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
  const [authContext, setAuthContext] = useState<'gate' | undefined>(undefined)
  const [pendingView, setPendingView] = useState<ViewType | null>(null)

  const { isLoggedIn, user, handleLogout, fetchCurrentUser, token } = useAuth()

  // On mount: if a token exists, validate it server-side via GET /api/auth/me.
  // This catches expired tokens and refreshes user data after a page reload.
  useEffect(() => {
    if (token) fetchCurrentUser();
  }, [])

  // When login succeeds while a protected view is pending, navigate there
  useEffect(() => {
    if (isLoggedIn && pendingView) {
      setCurrentView(pendingView)
      setPendingView(null)
      setShowAuth(false)
    }
  }, [isLoggedIn])

  // If user logs out while on builder or profile, send them home
  useEffect(() => {
    if (!isLoggedIn && (currentView === 'builder' || currentView === 'profile')) {
      setCurrentView('landing')
    }
  }, [isLoggedIn])

  // Auth-guarded navigation — intercept protected views
  const handleNavigate = (view: ViewType) => {
    if (view === 'builder' && !isLoggedIn) {
      setPendingView('builder')
      setAuthContext('gate')
      setShowAuth(true)
      setMobileMenuOpen(false)
      return
    }
    setCurrentView(view)
    setMobileMenuOpen(false)
  }

  const userInitials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const backtestState = useSelector((state: RootState) => state.backtest)

  const resultsData = useMemo(
    () => getResultsData(backtestState.data as BacktestResult | null),
    [backtestState.data]
  )

  const [metricTab, setMetricTab] = useState<'strategy' | 'sp500'>('strategy')

  const equityData = useMemo(() => {
    if (resultsData.parsedDataAvailable && resultsData.portfolioSeries.length > 0) {
      return resultsData.portfolioSeries.map((p, i) => ({
        month: i,
        user: p.value,
        sp500: resultsData.benchmarkSeries[i]?.value ?? 10000,
        label: p.date || ''
      }));
    }
    return null; // no fallback to fake data
  }, [resultsData]);

  const metrics = metricTab === 'strategy' ? resultsData.portfolioMetrics : resultsData.benchmarkMetrics;

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

  const navLabels: Record<ViewType, string> = {
    landing: 'HOME', builder: 'BUILDER', results: 'RESULTS', news: 'NEWS', learn: 'LEARN', profile: 'PROFILE',
  };

  return (
    <div className="min-h-screen relative" style={{ background: '#050505', color: '#EAEAEA' }}>
      {/* Scan line */}
      <div className="scan-line" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1A1A1A]" style={{ background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('landing')}>
            <div className="w-5 h-5 border border-emerald-400/40 flex items-center justify-center">
              <BarChart2 size={10} className="text-emerald-400" strokeWidth={2.5} />
            </div>
            <span className="font-black text-[#EAEAEA] text-sm tracking-[0.15em]">ROOKNOMICS</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {(['landing', 'builder', 'results', 'news', 'learn'] as ViewType[]).map(v => (
              <button key={v} onClick={() => handleNavigate(v)}
                className={
                  'text-[10px] tracking-[0.2em] font-medium transition-colors duration-200 ' +
                  (currentView === v ? 'text-emerald-400' : 'text-[#7A7A7A] hover:text-[#EAEAEA]')
                }>
                {navLabels[v]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => handleNavigate('profile')}
                  className={
                    'flex items-center gap-2 text-[10px] tracking-[0.2em] transition-colors duration-200 ' +
                    (currentView === 'profile' ? 'text-emerald-400' : 'text-[#7A7A7A] hover:text-[#EAEAEA]')
                  }
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/10 text-[9px] font-bold text-emerald-300">
                    {userInitials}
                  </span>
                  <span>{user?.name?.split(' ')[0]?.toUpperCase() ?? 'PROFILE'}</span>
                </button>
                <button
                  onClick={() => { handleLogout(); setCurrentView('landing'); }}
                  className="hidden md:flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-[#7A7A7A] hover:text-rose-400 transition-colors border border-[#1A1A1A] hover:border-rose-400/20 px-3 py-1.5"
                  title="Sign out"
                >
                  <LogOut size={11} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setAuthContext(undefined); setShowAuth(true); }}
                className="hidden md:flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-[#7A7A7A] hover:text-[#EAEAEA] transition-colors border border-[#1A1A1A] hover:border-[#2A2A2A] px-3 py-1.5"
              >
                <LogIn size={11} /> SIGN IN
              </button>
            )}
            <button className="md:hidden text-[#7A7A7A]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <XIcon size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#1A1A1A] px-6 py-4 flex flex-col gap-3" style={{ background: '#050505' }}>
            {(['landing', 'builder', 'results', 'news', 'learn'] as ViewType[]).map(v => (
              <button key={v} onClick={() => handleNavigate(v)}
                className={
                  'text-xs tracking-[0.2em] text-left py-2 transition-colors ' +
                  (currentView === v ? 'text-emerald-400' : 'text-[#7A7A7A]')
                }>
                {navLabels[v]}
              </button>
            ))}
            <div className="mt-1 border-t border-[#111111] pt-3">
              {isLoggedIn ? (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleNavigate('profile')}
                    className="flex items-center gap-2 text-xs tracking-[0.2em] text-[#7A7A7A]"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/10 text-[8px] font-bold text-emerald-300">
                      {userInitials}
                    </span>
                    PROFILE
                  </button>
                  <button
                    onClick={() => { handleLogout(); setCurrentView('landing'); }}
                    className="text-xs tracking-[0.2em] text-[#5F5F5F] hover:text-rose-400 transition-colors"
                  >
                    SIGN OUT
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setAuthContext(undefined); setShowAuth(true); setMobileMenuOpen(false); }}
                  className="text-xs tracking-[0.2em] text-[#7A7A7A]"
                >
                  SIGN IN
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthDialog
        open={showAuth}
        context={authContext}
        onClose={() => {
          setShowAuth(false);
          setAuthContext(undefined);
          if (pendingView) setPendingView(null);
        }}
      />

      <div className="relative z-10 pt-12">
        {currentView === 'landing' && <LandingView setCurrentView={(v: string) => setCurrentView(v as ViewType)} setShowAuth={setShowAuth} />}
        {currentView === 'builder' && (
          isLoggedIn
            ? <BuilderView setCurrentView={(v: string) => setCurrentView(v as ViewType)} />
            : null
        )}
        {currentView === 'results' && <ResultsView equityData={equityData} metrics={metrics} metricTab={metricTab} setMetricTab={setMetricTab} setCurrentView={setCurrentView} resultsData={resultsData} />}
        {currentView === 'news' && <NewsView setCurrentView={setCurrentView} />}
        {currentView === 'learn' && <LearnPage setCurrentView={(v: string) => setCurrentView(v as ViewType)} />}
        {currentView === 'profile' && isLoggedIn && <ProfileView setCurrentView={(v: string) => setCurrentView(v as ViewType)} />}
      </div>
    </div>
  );
}

/* ─── RESULTS VIEW ────────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ResultsView({ equityData, metrics, metricTab, setMetricTab, setCurrentView, resultsData }: any) {
  return (
    <div className="max-w-7xl mx-auto px-6 pb-16 pt-8">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-px h-4 bg-emerald-400/60" />
        <p className="text-[11px] tracking-[0.25em] text-[#7A7A7A] uppercase font-medium">SIMULATION ENGINE</p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="xl:col-span-3 space-y-4">
          <PerformanceChart data={equityData} isDynamic={resultsData?.parsedDataAvailable && resultsData?.portfolioSeries?.length > 0} hasData={!!equityData} />
          <TradeHistoryTable tradeLog={resultsData?.tradeLog} hasData={resultsData?.parsedDataAvailable} />
        </div>
        <div className="xl:col-span-1 space-y-4">
          <PerformanceMetrics metrics={metrics} tab={metricTab} setTab={setMetricTab} />
          <VerdictPanel setCurrentView={setCurrentView} resultsData={resultsData} />
          <RiskAnalysis riskStats={resultsData?.riskStats} />
        </div>
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
    <div className="border border-[#1A1A1A] px-3 py-2 text-xs font-mono" style={{ background: '#0B0B0B' }}>
      <p className="text-[#7A7A7A] mb-1 tracking-wider">{month} {year}</p>
      <p className="text-[#EAEAEA]/70">{'STRATEGY: $' + (payload[0]?.value?.toLocaleString() ?? '')}</p>
      <p className="text-emerald-400">{'INDEX: $' + (payload[1]?.value?.toLocaleString() ?? '')}</p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PerformanceChart({ data, isDynamic, hasData }: { data: any[] | null; isDynamic?: boolean; hasData?: boolean }) {
  // Empty state — no backtest run yet
  if (!hasData || !data) {
    return (
      <div className="border border-[#1A1A1A] p-6" style={{ background: '#0B0B0B' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <p className="text-[9px] tracking-[0.25em] text-[#7A7A7A] uppercase mb-1">EQUITY CURVE</p>
            <h2 className="text-lg font-bold text-[#EAEAEA] tracking-tight">Portfolio Value Over Time</h2>
          </div>
        </div>
        <div className="h-72 flex flex-col items-center justify-center border border-dashed border-[#1A1A1A]">
          <Activity size={24} className="text-[#2A2A2A] mb-3" />
          <p className="text-[11px] font-mono text-[#3A3A3A] tracking-wider">AWAITING SIMULATION DATA</p>
          <p className="text-[10px] text-[#2A2A2A] mt-1">Run a backtest to populate the equity curve</p>
        </div>
      </div>
    );
  }

  // Compute dynamic event badges from real data
  const firstLabel = data[0]?.label;
  const lastLabel = data[data.length - 1]?.label;
  const startYear = firstLabel ? new Date(firstLabel).getFullYear() : null;
  const endYear = lastLabel ? new Date(lastLabel).getFullYear() : null;

  let maxDrop = 0;
  let maxRise = 0;
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1].user;
    const curr = data[i].user;
    if (prev > 0) {
      const chg = ((curr - prev) / prev) * 100;
      if (chg < maxDrop) maxDrop = chg;
      if (chg > maxRise) maxRise = chg;
    }
  }

  const events = [
    startYear && { icon: Activity, color: 'text-[#7A7A7A]', label: 'START ' + startYear },
    endYear && { icon: Activity, color: 'text-[#7A7A7A]', label: 'END ' + endYear },
    maxDrop < -1 && { icon: TrendingDown, color: 'text-red-400', label: 'MAX DROP ' + maxDrop.toFixed(1) + '%' },
    maxRise > 1 && { icon: TrendingUp, color: 'text-emerald-400', label: 'MAX GAIN +' + maxRise.toFixed(1) + '%' },
  ].filter(Boolean) as { icon: ElementType; color: string; label: string }[];

  const xDataKey = isDynamic ? 'label' : 'month';
  const xTickFormatter = isDynamic
    ? (v: string) => { try { return "'" + new Date(v).getFullYear().toString().slice(2); } catch { return ''; } }
    : (v: number) => { if (v % 24 === 0) { const l = ["'04",'06','08','10','12','14','16','18','20','22','24']; return l[v / 24] || ''; } return ''; };
  const xInterval = isDynamic ? Math.max(1, Math.floor(data.length / 8)) : 23;

  return (
    <div className="border border-[#1A1A1A] p-6" style={{ background: '#0B0B0B' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <p className="text-[9px] tracking-[0.25em] text-[#7A7A7A] uppercase mb-1">EQUITY CURVE</p>
          <h2 className="text-lg font-bold text-[#EAEAEA] tracking-tight">Portfolio Value Over Time</h2>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2"><div className="w-5 h-px bg-[#EAEAEA]/50" /><span className="text-[10px] text-[#7A7A7A] tracking-wider">STRATEGY</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-px bg-emerald-400" /><span className="text-[10px] text-[#7A7A7A] tracking-wider">S&P 500</span></div>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EAEAEA" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#EAEAEA" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sp500Gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="#1A1A1A" />
            <XAxis dataKey={xDataKey} tick={{ fill: '#7A7A7A', fontSize: 10, fontFamily: 'monospace' }} tickFormatter={xTickFormatter as any} interval={xInterval} axisLine={{ stroke: '#1A1A1A' }} tickLine={false} />
            <YAxis tick={{ fill: '#7A7A7A', fontSize: 10, fontFamily: 'monospace' }} tickFormatter={(v: number) => '$' + Math.round(v / 1000) + 'k'} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip isDynamic={isDynamic} />} />
            <Area type="monotone" dataKey="user" stroke="#EAEAEA" strokeWidth={1.5} fill="url(#userGradient)" fillOpacity={1} strokeOpacity={0.6} />
            <Area type="monotone" dataKey="sp500" stroke="#34d399" strokeWidth={2} fill="url(#sp500Gradient)" fillOpacity={1} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {events.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {events.map((e, i) => (
            <div key={i} className="flex items-center gap-1.5 border border-[#1A1A1A] px-2.5 py-1.5 text-[10px] tracking-wider cursor-default hover:border-[#2A2A2A] transition-colors">
              <e.icon size={11} className={e.color} />
              <span className="text-[#7A7A7A]">{e.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TradeHistoryTable({ tradeLog = [], hasData }: { tradeLog?: any[]; hasData?: boolean }) {
  const displayTrades = hasData && tradeLog.length > 0 ? tradeLog : tradeHistory

  return (
    <div className="border border-[#1A1A1A] p-5" style={{ background: '#0B0B0B' }}>
      <div className="flex items-center gap-3 mb-5">
        <List size={13} className="text-[#7A7A7A]" />
        <p className="text-[9px] tracking-[0.25em] text-[#7A7A7A] uppercase">TRADE LOG</p>
        <span className="text-[9px] font-mono text-emerald-400 border border-emerald-400/20 px-2 py-0.5">
          {displayTrades.length} TRADES
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1A1A1A]">
              {['DATE', 'ACTION', 'PRICE', 'SHARES', 'P&L', 'RETURN', 'CUMULATIVE'].map((heading) => (
                <th key={heading} className="px-3 py-2 text-left text-[9px] tracking-[0.15em] text-[#7A7A7A] font-medium">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayTrades.slice(0, 8).map((row, index) => (
              <tr key={index} className="border-b border-[#1A1A1A]/60">
                <td className="px-3 py-2.5 text-[10px] font-mono text-[#7A7A7A]">{row.date}</td>
                <td className="px-3 py-2.5 text-[10px] font-mono text-[#EAEAEA]">{row.action}</td>
                <td className="px-3 py-2.5 text-[10px] font-mono text-[#EAEAEA]">{row.price ?? '-'}</td>
                <td className="px-3 py-2.5 text-[10px] font-mono text-[#7A7A7A]">{row.shares ?? '-'}</td>
                <td className="px-3 py-2.5 text-[10px] font-mono text-[#7A7A7A]">{row.pnl ?? row.profit ?? '-'}</td>
                <td className="px-3 py-2.5 text-[10px] font-mono text-[#7A7A7A]">{row.returnPct ?? row.ret ?? '-'}</td>
                <td className="px-3 py-2.5 text-[10px] font-mono text-[#EAEAEA]">{row.cumulative ?? row.cum ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PerformanceMetrics({
  metrics,
  tab,
  setTab,
}: {
  metrics: any
  tab: 'strategy' | 'sp500'
  setTab: (tab: 'strategy' | 'sp500') => void
}) {
  const rows = [
    { label: 'TOTAL RETURN', value: metrics?.totalReturn ?? '-' },
    { label: 'ANNUALIZED', value: metrics?.annualizedReturn ?? '-' },
    { label: 'MAX DRAWDOWN', value: metrics?.maxDrawdown ?? '-' },
    { label: 'WIN RATE', value: metrics?.winRate ?? '-' },
    { label: 'SHARPE RATIO', value: metrics?.sharpeRatio ?? '-' },
    { label: 'AVG DURATION', value: metrics?.avgTradeDuration ?? metrics?.avgTradeDurationDays ?? '-' },
    { label: 'TOTAL TRADES', value: metrics?.totalTrades ?? '-' },
    { label: 'FEES PAID', value: metrics?.tradingFees ?? '-' },
  ]

  return (
    <div className="border border-[#1A1A1A] p-5" style={{ background: '#0B0B0B' }}>
      <p className="text-[9px] tracking-[0.25em] text-[#7A7A7A] uppercase mb-4">METRICS</p>
      <div className="flex gap-2 mb-4">
        {(['strategy', 'sp500'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={
              'text-[9px] tracking-[0.15em] px-3 py-1.5 transition-all ' +
              (tab === key
                ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30'
                : 'text-[#7A7A7A] border border-[#1A1A1A] hover:text-[#EAEAEA]')
            }
          >
            {key === 'strategy' ? 'STRATEGY' : 'S&P 500'}
          </button>
        ))}
      </div>
      <div>
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-[#1A1A1A] last:border-0">
            <span className="text-[9px] tracking-[0.15em] text-[#7A7A7A] uppercase">{row.label}</span>
            <span className="text-xs font-mono font-medium text-[#EAEAEA]">{String(row.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function VerdictPanel({
  setCurrentView,
  resultsData,
}: {
  setCurrentView: (v: ViewType) => void
  resultsData?: any
}) {
  const backtestState = useSelector((state: RootState) => state.backtest)
  const data = backtestState.data as Record<string, unknown> | null

  const verdictData = data && typeof data === 'object' && 'verdict' in data
    ? (data.verdict as Record<string, unknown> | null)
    : null
  const strategyReturn = Number(resultsData?.portfolioMetrics?.totalReturn ?? 0)
  const benchmarkReturn = Number(resultsData?.benchmarkMetrics?.totalReturn ?? 0)
  const returnGap = strategyReturn - benchmarkReturn
  const strategyWon = returnGap > 0

  const status = typeof verdictData?.status === 'string'
    ? verdictData.status
    : strategyWon
      ? 'OUTPERFORMED'
      : 'UNDERPERFORMED'

  const summary = typeof verdictData?.summary === 'string'
    ? verdictData.summary
    : strategyWon
      ? `The strategy beat the benchmark by ${returnGap.toFixed(2)} percentage points.`
      : `The strategy trails the benchmark by ${Math.abs(returnGap).toFixed(2)} percentage points.`

  const insights = Array.isArray(verdictData?.insights)
    ? verdictData.insights.map((entry) => String(entry))
    : []

  return (
    <div className="border border-[#1A1A1A] p-5" style={{ background: '#0B0B0B' }}>
      <p className="text-[9px] tracking-[0.25em] text-[#7A7A7A] uppercase mb-4">VERDICT</p>
      <div className={'border p-4 mb-4 ' + (strategyWon ? 'border-emerald-400/20 bg-emerald-400/[0.04]' : 'border-[#F5C542]/20 bg-[#F5C542]/[0.04]')}>
        <p className={'text-sm font-black tracking-widest uppercase ' + (strategyWon ? 'text-emerald-400' : 'text-[#F5C542]')}>
          {status}
        </p>
      </div>
      <p className="text-[12px] text-[#EAEAEA] leading-relaxed mb-4">
        {summary}
      </p>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className={'border p-4 ' + (strategyWon ? 'border-emerald-400/20 bg-emerald-400/[0.02]' : 'border-[#1A1A1A]')}>
          <p className="text-[9px] tracking-[0.2em] text-[#7A7A7A] uppercase mb-2">STRATEGY</p>
          <p className={'text-2xl font-black font-mono tracking-tight ' + (strategyWon ? 'text-emerald-400' : 'text-[#EAEAEA]')}>
            {(strategyReturn > 0 ? '+' : '') + strategyReturn.toFixed(2) + '%'}
          </p>
        </div>
        <div className={'border p-4 ' + (!strategyWon ? 'border-[#F5C542]/20 bg-[#F5C542]/[0.02]' : 'border-[#1A1A1A]')}>
          <p className="text-[9px] tracking-[0.2em] text-[#7A7A7A] uppercase mb-2">S&P 500</p>
          <p className={'text-2xl font-black font-mono tracking-tight ' + (!strategyWon ? 'text-[#F5C542]' : 'text-[#EAEAEA]')}>
            {(benchmarkReturn > 0 ? '+' : '') + benchmarkReturn.toFixed(2) + '%'}
          </p>
        </div>
      </div>
      {insights.length > 0 && (
        <div className="space-y-3 mb-5">
          {insights.slice(0, 3).map((insight, index) => (
            <p key={index} className="text-[11px] text-[#7A7A7A] leading-[1.6]">
              {insight}
            </p>
          ))}
        </div>
      )}
      <button onClick={() => setCurrentView('builder')} className="text-[10px] tracking-[0.2em] text-[#7A7A7A] hover:text-emerald-400 transition-colors uppercase font-medium">
        Refine Strategy
      </button>
    </div>
  )
}

function RiskAnalysis({ riskStats }: { riskStats?: RiskStats }) {
  const dataToUse = riskStats?.radarData?.length ? riskStats.radarData : radarData
  const badges = riskStats
    ? [
        { l: 'BETA', v: Number(riskStats.beta ?? 0).toFixed(2) },
        { l: 'ALPHA', v: Number(riskStats.alpha ?? 0).toFixed(1) + '%' },
        { l: 'VAR (5%)', v: Number(riskStats.var5 ?? 0).toFixed(1) + '%' },
      ]
    : [
        { l: 'BETA', v: '0.89' },
        { l: 'ALPHA', v: '-1.2%' },
        { l: 'VAR (5%)', v: '-3.8%' },
      ]

  return (
    <div className="border border-[#1A1A1A] p-5" style={{ background: '#0B0B0B' }}>
      <p className="text-[9px] tracking-[0.25em] text-[#7A7A7A] uppercase mb-4">RISK PROFILE</p>
      <div className="flex justify-center">
        <ResponsiveContainer width={200} height={200}>
          <RadarChart data={dataToUse}>
            <PolarGrid stroke="#1A1A1A" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: '#7A7A7A', fontFamily: 'monospace' }} />
            <PolarRadiusAxis tick={false} domain={[0, 100]} axisLine={false} />
            <Radar name="Strategy" dataKey="strategy" stroke="#EAEAEA" fill="#EAEAEA" fillOpacity={0.06} strokeWidth={1} />
            <Radar name="S&P 500" dataKey="benchmark" stroke="#34d399" fill="#34d399" fillOpacity={0.1} strokeWidth={1.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        {badges.map((badge) => (
          <div key={badge.l} className="border border-[#1A1A1A] px-2 py-2 text-center">
            <p className="text-[8px] text-[#7A7A7A] tracking-wider mb-1">{badge.l}</p>
            <p className="text-xs font-mono text-[#EAEAEA]">{badge.v}</p>
          </div>
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
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
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
        setLastUpdatedText('Updated ' + diffMins + ' min ago');
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
                <style>{'@keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } } .shimmer-bg { background: linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }'}</style>
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
              {activeTicker ? 'No recent news available for ' + activeTicker : 'No news available right now'}
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
