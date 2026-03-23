// src/components/MetricsComparisonChart.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'

interface Metrics {
  totalReturn:  number
  maxDrawdown:  number
  sharpeRatio:  number
  totalTrades:  number
}

interface Props {
  portfolioMetrics: Metrics
  benchmarkMetrics: Metrics
}

export function MetricsComparisonChart({ portfolioMetrics, benchmarkMetrics }: Props) {

  // Structure the data so each metric is one group of two bars
  const data = [
    {
      name:      'Total return %',
      strategy:  portfolioMetrics.totalReturn,
      benchmark: benchmarkMetrics.totalReturn
    },
    {
      name:      'Max drawdown %',
      strategy:  portfolioMetrics.maxDrawdown,
      benchmark: benchmarkMetrics.maxDrawdown
    },
    {
      name:      'Sharpe ratio',
      strategy:  portfolioMetrics.sharpeRatio,
      benchmark: benchmarkMetrics.sharpeRatio
    }
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} barCategoryGap="30%">

        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 11 }} />

        <Tooltip
          formatter={(value: number, name: string) => [
            value.toFixed(2),
            name === 'strategy' ? 'Your strategy' : 'S&P 500'
          ]}
        />

        <Legend
          formatter={(value) => value === 'strategy' ? 'Your strategy' : 'S&P 500'}
        />

        {/* Your strategy bars — blue */}
        <Bar dataKey="strategy" fill="#3B8BD4" radius={[4, 4, 0, 0]} />

        {/* S&P 500 bars — gray */}
        <Bar dataKey="benchmark" fill="#888780" radius={[4, 4, 0, 0]} />

      </BarChart>
    </ResponsiveContainer>
  )
}