import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
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
  const combined = portfolioSeries.map((day, i) => ({
    date:      day.date,
    strategy:  day.value,
    benchmark: benchmarkSeries[i]?.value ?? null
  }))

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={combined} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          dy={15}
          // Only show one label per year to avoid crowding
          tickFormatter={(date) => date.slice(0, 4)}
        />

        <YAxis
          // Format as dollars
          tickFormatter={(value) => `$${value.toLocaleString()}`}
          tick={{ fontSize: 12, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          dx={-10}
        />

        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            return (
              <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-4">
                <p className="text-slate-500 text-xs font-semibold mb-3 uppercase tracking-wider">{label}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-6">
                    <span className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <span className="text-slate-700 text-sm font-medium">Your Strategy</span>
                    </span>
                    <span className="text-slate-900 font-bold text-sm">${payload[0].value.toLocaleString()}</span>
                  </div>
                  {payload[1] && (
                    <div className="flex items-center justify-between gap-6">
                      <span className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                        <span className="text-slate-700 text-sm font-medium">S&P 500</span>
                      </span>
                      <span className="text-slate-900 font-bold text-sm">${payload[1].value.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          }}
        />

        <Legend 
          iconType="circle"
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => <span className="text-slate-600 text-sm font-medium">{value === 'Your strategy' ? 'Your strategy' : 'S&P 500 index'}</span>}
        />

        {/* Your strategy line — indigo */}
        <Line
          type="monotone"
          dataKey="strategy"
          stroke="#6366f1"
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
          name="Your strategy"
        />

        {/* S&P 500 benchmark line — slate */}
        <Line
          type="monotone"
          dataKey="benchmark"
          stroke="#94a3b8"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#94a3b8', stroke: '#fff', strokeWidth: 1 }}
          name="S&P 500 index"
          strokeDasharray="6 6"
        />

      </LineChart>
    </ResponsiveContainer>
  )
}