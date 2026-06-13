import {
  Area,
  AreaChart,
  CartesianGrid,
  type TooltipProps,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { ArrowDownLeft, ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react'

interface SeriesDay {
  date: string
  value: number
}

interface Props {
  portfolioSeries: SeriesDay[]
  benchmarkSeries: SeriesDay[]
}

interface ChartPoint {
  date: string
  strategy: number
  benchmark: number | null
}

interface NotableBadge {
  label: string
  value: string
  tone: 'rose' | 'emerald'
  icon: typeof ArrowDownLeft
}

function parseDate(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatAxisDate(value: string) {
  const parsed = parseDate(value)
  if (!parsed) return value
  return `'${String(parsed.getFullYear()).slice(-2)}`
}

function formatTooltipDate(value: string) {
  const parsed = parseDate(value)
  if (!parsed) return value
  return parsed.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function formatBadgeDate(value: string) {
  const parsed = parseDate(value)
  if (!parsed) return value
  return parsed.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function monthDifference(left: Date, right: Date) {
  return Math.abs((left.getFullYear() - right.getFullYear()) * 12 + (left.getMonth() - right.getMonth()))
}

function findNearestDate<T extends { date: string }>(data: T[], target: string, maxMonths = 6) {
  const targetDate = parseDate(target)
  if (!targetDate) return null

  let best: T | null = null
  let bestDistance = Number.POSITIVE_INFINITY

  for (const point of data) {
    const pointDate = parseDate(point.date)
    if (!pointDate) continue
    const distance = monthDifference(pointDate, targetDate)
    if (distance < bestDistance) {
      best = point
      bestDistance = distance
    }
  }

  return bestDistance <= maxMonths ? best : null
}

function findWindow(data: Array<{ date: string }>, start: string, end: string) {
  const startPoint = findNearestDate(data, start, 12)
  const endPoint = findNearestDate(data, end, 12)
  if (!startPoint || !endPoint) return null
  return { start: startPoint.date, end: endPoint.date }
}

function asNumber(value: ValueType | undefined) {
  return typeof value === 'number' ? value : Number(value ?? 0)
}

function buildBadges(strategySeries: SeriesDay[]): NotableBadge[] {
  if (strategySeries.length < 2) return []

  let biggestDrop = { index: 1, pct: Number.POSITIVE_INFINITY }
  let biggestGain = { index: 1, pct: Number.NEGATIVE_INFINITY }

  for (let index = 1; index < strategySeries.length; index += 1) {
    const previous = strategySeries[index - 1].value
    const current = strategySeries[index].value
    if (previous <= 0) continue

    const changePct = ((current - previous) / previous) * 100
    if (changePct < biggestDrop.pct) biggestDrop = { index, pct: changePct }
    if (changePct > biggestGain.pct) biggestGain = { index, pct: changePct }
  }

  const oneYearAgoIndex = Math.max(0, strategySeries.length - 13)
  const oneYearAgo = strategySeries[oneYearAgoIndex]
  const latest = strategySeries[strategySeries.length - 1]
  const trailingYearReturn =
    oneYearAgo.value > 0 ? ((latest.value - oneYearAgo.value) / oneYearAgo.value) * 100 : 0

  const badges: NotableBadge[] = [
    {
      label: formatBadgeDate(strategySeries[biggestDrop.index].date),
      value: `${biggestDrop.pct > 0 ? '+' : ''}${biggestDrop.pct.toFixed(1)}%`,
      tone: 'rose',
      icon: biggestDrop.pct <= -8 ? ArrowDownLeft : TrendingDown,
    },
    {
      label: formatBadgeDate(strategySeries[biggestGain.index].date),
      value: `${biggestGain.pct > 0 ? '+' : ''}${biggestGain.pct.toFixed(1)}%`,
      tone: 'emerald',
      icon: biggestGain.pct >= 8 ? ArrowUpRight : TrendingUp,
    },
  ]

  const covidPoint = findNearestDate(strategySeries, '2020-03-01', 3)
  if (covidPoint) {
    const covidIndex = strategySeries.findIndex((point) => point.date === covidPoint.date)
    const prevIndex = Math.max(0, covidIndex - 1)
    const previous = strategySeries[prevIndex]?.value ?? covidPoint.value
    const covidReturn = previous > 0 ? ((covidPoint.value - previous) / previous) * 100 : 0
    badges.push({
      label: formatBadgeDate(covidPoint.date),
      value: `${covidReturn > 0 ? '+' : ''}${covidReturn.toFixed(1)}%`,
      tone: covidReturn >= 0 ? 'emerald' : 'rose',
      icon: covidReturn >= 0 ? TrendingUp : TrendingDown,
    })
  }

  badges.push({
    label: formatBadgeDate(latest.date),
    value: `${trailingYearReturn > 0 ? '+' : ''}${trailingYearReturn.toFixed(1)}%`,
    tone: trailingYearReturn >= 0 ? 'emerald' : 'rose',
    icon: trailingYearReturn >= 0 ? ArrowUpRight : ArrowDownLeft,
  })

  return badges.slice(0, 4)
}

export function PortfolioChart({ portfolioSeries, benchmarkSeries }: Props) {
  const benchmarkByDate = new Map(benchmarkSeries.map((day) => [day.date, day.value]))
  const combined: ChartPoint[] = portfolioSeries.map((day) => ({
    date: day.date,
    strategy: day.value,
    benchmark: benchmarkByDate.get(day.date) ?? null,
  }))

  const yMax = Math.max(
    ...combined.flatMap((point) => [point.strategy || 0, point.benchmark || 0]),
    1
  )

  const crisisWindow = findWindow(combined, '2008-09-01', '2009-03-01')
  const covidWindow = findWindow(combined, '2020-02-01', '2020-06-01')
  const notableBadges = buildBadges(portfolioSeries)
  const lastPoint = combined[combined.length - 1]?.date

  return (
    <div>
      <ResponsiveContainer width="100%" height={420}>
        <AreaChart data={combined} margin={{ top: 12, right: 10, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="strategyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="benchmarkFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" />

          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={30}
            tickFormatter={formatAxisDate}
          />

          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
            domain={[0, Math.ceil(yMax / 5000) * 5000]}
          />

        <Tooltip
          content={({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
            if (!active || !payload?.length) return null

            return (
                <div className="bg-white/95 border border-slate-200 shadow-xl rounded-2xl p-4 min-w-[220px]">
                  <p className="text-slate-500 text-xs font-semibold mb-3 uppercase tracking-wider">
                    {formatTooltipDate(String(label))}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-6">
                    <span className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      Your Strategy
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      ${asNumber(payload[0]?.value).toLocaleString()}
                    </span>
                  </div>
                  {payload[1] && (
                      <div className="flex items-center justify-between gap-6">
                        <span className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        S&amp;P 500
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        ${asNumber(payload[1]?.value).toLocaleString()}
                      </span>
                    </div>
                  )}
                  </div>
                </div>
              )
            }}
          />

          {crisisWindow && (
            <>
              <ReferenceArea x1={crisisWindow.start} x2={crisisWindow.end} fill="#fda4af" fillOpacity={0.06} />
              <ReferenceLine
                x={crisisWindow.start}
                stroke="#fb7185"
                strokeDasharray="5 5"
                strokeOpacity={0.8}
                label={{ value: '2008 Crisis', position: 'insideTop', fill: '#f43f5e', fontSize: 12 }}
              />
            </>
          )}

          {covidWindow && (
            <>
              <ReferenceArea x1={covidWindow.start} x2={covidWindow.end} fill="#a5b4fc" fillOpacity={0.06} />
              <ReferenceLine
                x={covidWindow.start}
                stroke="#818cf8"
                strokeDasharray="5 5"
                strokeOpacity={0.8}
                label={{ value: 'COVID', position: 'insideTop', fill: '#6366f1', fontSize: 12 }}
              />
            </>
          )}

          {lastPoint && (
            <ReferenceLine
              x={lastPoint}
              stroke="#cbd5e1"
              strokeDasharray="4 4"
              strokeOpacity={0.4}
            />
          )}

          <Area
            type="monotone"
            dataKey="strategy"
            stroke="#f43f5e"
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="url(#strategyFill)"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="benchmark"
            stroke="#10b981"
            strokeWidth={2.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="url(#benchmarkFill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      {notableBadges.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-5">
          {notableBadges.map((badge) => {
            const Icon = badge.icon
            const toneClasses = badge.tone === 'emerald'
              ? 'text-emerald-700 border-emerald-100 bg-slate-50'
              : 'text-rose-700 border-rose-100 bg-slate-50'

            return (
              <div
                key={`${badge.label}-${badge.value}`}
                className={`rounded-2xl border px-4 py-3 flex items-center gap-3 text-sm shadow-sm ${toneClasses}`}
              >
                <Icon size={15} />
                <span className="text-slate-700">{badge.label}: {badge.value}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
