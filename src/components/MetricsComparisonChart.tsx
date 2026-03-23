import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
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
      name:      'Return %',
      strategy:  portfolioMetrics.totalReturn,
      benchmark: benchmarkMetrics.totalReturn
    },
    {
      name:      'Drawdown %',
      strategy:  portfolioMetrics.maxDrawdown,
      benchmark: benchmarkMetrics.maxDrawdown
    },
    {
      name:      'Sharpe',
      strategy:  portfolioMetrics.sharpeRatio,
      benchmark: benchmarkMetrics.sharpeRatio
    }
  ]

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} barCategoryGap="25%">

        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} dx={-10} />

        <Tooltip
          cursor={{ fill: '#f8fafc' }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            return (
              <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-4">
                <p className="text-slate-500 text-xs font-semibold mb-3 uppercase tracking-wider">{payload[0].payload.name}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-6">
                    <span className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <span className="text-slate-700 text-sm font-medium">Your Strategy</span>
                    </span>
                    <span className="text-slate-900 font-bold text-sm">{payload[0].value.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      <span className="text-slate-700 text-sm font-medium">S&P 500</span>
                    </span>
                    <span className="text-slate-900 font-bold text-sm">{(payload[1]?.value || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )
          }}
        />

        <Legend
          iconType="circle"
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => <span className="text-slate-600 text-sm font-medium">{value === 'strategy' ? 'Your strategy' : 'S&P 500'}</span>}
        />

        {/* Your strategy bars — indigo */}
        <Bar dataKey="strategy" fill="#6366f1" radius={[6, 6, 0, 0]} />

        {/* S&P 500 bars — slate */}
        <Bar dataKey="benchmark" fill="#cbd5e1" radius={[6, 6, 0, 0]} />

      </BarChart>
    </ResponsiveContainer>
  )
}