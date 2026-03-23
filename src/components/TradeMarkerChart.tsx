// src/components/TradeMarkerChart.tsx
import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
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
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data}>

        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickFormatter={(date) => date.slice(0, 4)}
        />

        <YAxis
          tickFormatter={(value) => `$${value.toLocaleString()}`}
          tick={{ fontSize: 11 }}
        />

        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const d = payload[0].payload
            return (
              <div style={{ background: 'white', border: '1px solid #eee', padding: 8, fontSize: 12 }}>
                <p>{d.date}</p>
                <p>Value: ${d.value.toLocaleString()}</p>
                {d.trade && (
                  <p style={{ color: d.trade.action === 'BUY' ? '#1D9E75' : '#E24B4A', fontWeight: 500 }}>
                    {d.trade.action} at ${d.trade.price.toFixed(2)}
                  </p>
                )}
              </div>
            )
          }}
        />

        {/* Portfolio line */}
        <Line
          type="monotone"
          dataKey="value"
          stroke="#3B8BD4"
          strokeWidth={2}
          dot={false}
          name="Portfolio"
        />

        {/* Trade markers — colored dots on buy/sell days */}
        <Scatter dataKey="marker" name="Trades">
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={
                entry.trade?.action === 'BUY'  ? '#1D9E75' :   // green for buy
                entry.trade?.action === 'SELL' ? '#E24B4A' :   // red for sell
                'transparent'
              }
            />
          ))}
        </Scatter>

      </ComposedChart>
    </ResponsiveContainer>
  )
}