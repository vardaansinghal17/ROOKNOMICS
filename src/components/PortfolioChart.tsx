// src/components/PortfolioChart.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface SeriesDay {
  date:  string
  value: number
}

interface Props {
  portfolioSeries: SeriesDay[]
  benchmarkSeries: SeriesDay[]
}

export function PortfolioChart({ portfolioSeries, benchmarkSeries }: Props) {

  // Merge both series into one array by date
  // Recharts needs one array where each entry has both values
  const combined = portfolioSeries.map((day, i) => ({
    date:      day.date,
    strategy:  day.value,
    benchmark: benchmarkSeries[i]?.value ?? null
  }))

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={combined}>

        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          // Only show one label per year to avoid crowding
          tickFormatter={(date) => date.slice(0, 4)}
        />

        <YAxis
          // Format as dollars
          tickFormatter={(value) => `$${value.toLocaleString()}`}
          tick={{ fontSize: 11 }}
        />

        <Tooltip
          formatter={(value: number) => `$${value.toLocaleString()}`}
          labelFormatter={(label) => `Date: ${label}`}
        />

        <Legend />

        {/* Your strategy line — blue */}
        <Line
          type="monotone"
          dataKey="strategy"
          stroke="#3B8BD4"
          strokeWidth={2}
          dot={false}        // no dots on every point — too noisy over 3000 days
          name="Your strategy"
        />

        {/* S&P 500 benchmark line — gray */}
        <Line
          type="monotone"
          dataKey="benchmark"
          stroke="#888780"
          strokeWidth={2}
          dot={false}
          name="S&P 500 index"
          strokeDasharray="5 5"  // dashed so it's visually distinct
        />

      </LineChart>
    </ResponsiveContainer>
  )
}