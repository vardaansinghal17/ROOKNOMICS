import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from 'recharts'

interface SeriesDay {
  date:  string
  value: number
}

interface Trade {
  date:   string
  action: 'BUY' | 'SELL'
  price:  number
}

interface Props {
  portfolioSeries: SeriesDay[]
  tradeLog:        Trade[]
}

export function TradeMarkerChart({ portfolioSeries, tradeLog }: Props) {

  // Build a map of trade dates for quick lookup
  const tradeMap: Record<string, Trade> = {}
  for (const trade of tradeLog) {
    tradeMap[trade.date] = trade
  }

  // Add trade info to each day so Recharts can render markers
  const data = portfolioSeries.map(day => ({
    date:   day.date,
    value:  day.value,
    trade:  tradeMap[day.date] ?? null,
    // Only set a marker value on trade days — null days get no dot
    marker: tradeMap[day.date] ? day.value : null
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>

        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          dy={15}
          tickFormatter={(date) => date.slice(0, 4)}
        />

        <YAxis
          tickFormatter={(value) => `$${value.toLocaleString()}`}
          tick={{ fontSize: 12, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          dx={-10}
        />

        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const d = payload[0].payload
            return (
              <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-4 min-w-[200px]">
                <p className="text-slate-500 text-xs font-semibold mb-3 uppercase tracking-wider">{d.date}</p>
                <div className="flex items-center justify-between gap-4 mb-3">
                  <span className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span className="text-slate-700 text-sm font-medium">Portfolio Val</span>
                  </span>
                  <span className="text-slate-900 font-bold text-sm">${d.value.toLocaleString()}</span>
                </div>
                {d.trade && (
                  <div className={`mt-2 inline-flex items-center justify-center w-full px-3 py-2 rounded-lg text-xs font-bold tracking-wide ${d.trade.action === 'BUY' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                    {d.trade.action} SIGNAL AT ${d.trade.price.toFixed(2)}
                  </div>
                )}
              </div>
            )
          }}
        />

        {/* Portfolio line */}
        <Line
          type="monotone"
          dataKey="value"
          stroke="#6366f1"
          strokeWidth={2}
          dot={false}
          activeDot={false}
          name="Portfolio"
        />

        {/* Trade markers — colored dots on buy/sell days */}
        <Scatter dataKey="marker" name="Trades">
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={
                entry.trade?.action === 'BUY'  ? '#10b981' :   // emerald-500 for buy
                entry.trade?.action === 'SELL' ? '#f43f5e' :   // rose-500 for sell
                'transparent'
              }
            />
          ))}
        </Scatter>

      </ComposedChart>
    </ResponsiveContainer>
  )
}