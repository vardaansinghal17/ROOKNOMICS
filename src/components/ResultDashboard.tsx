// src/components/ResultsDashboard.tsx
import { PortfolioChart        } from './PortfolioChart'
import { TradeMarkerChart      } from './TradeMarkerChart'
import { MetricsComparisonChart} from './MetricsComparisonChart'

interface SeriesDay { date: string; value: number }
interface Trade     { date: string; action: 'BUY' | 'SELL'; price: number }
interface Metrics   { totalReturn: number; maxDrawdown: number; sharpeRatio: number; totalTrades: number }

interface Props {
  portfolioSeries:  SeriesDay[]
  benchmarkSeries:  SeriesDay[]
  tradeLog:         Trade[]
  portfolioMetrics: Metrics
  benchmarkMetrics: Metrics
}

export function ResultsDashboard({
  portfolioSeries,
  benchmarkSeries,
  tradeLog,
  portfolioMetrics,
  benchmarkMetrics
}: Props) {

  // Did our strategy beat the benchmark?
  const weWon = portfolioMetrics.totalReturn > benchmarkMetrics.totalReturn

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>

      {/* Verdict banner */}
      <div style={{
        padding: '1rem 1.5rem',
        borderRadius: 12,
        marginBottom: '2rem',
        background: weWon ? '#E1F5EE' : '#FCEBEB',
        color:      weWon ? '#085041' : '#501313',
        fontWeight: 500,
        fontSize: 16
      }}>
        {weWon
          ? `Your strategy won — +${portfolioMetrics.totalReturn}% vs S&P 500's +${benchmarkMetrics.totalReturn}%`
          : `S&P 500 won — your strategy returned +${portfolioMetrics.totalReturn}% vs index's +${benchmarkMetrics.totalReturn}%`
        }
      </div>

      {/* Summary metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: '2rem' }}>
        {[
          { label: 'Your return',    value: `${portfolioMetrics.totalReturn}%`  },
          { label: 'Index return',   value: `${benchmarkMetrics.totalReturn}%`  },
          { label: 'Max drawdown',   value: `${portfolioMetrics.maxDrawdown}%`  },
          { label: 'Total trades',   value: portfolioMetrics.totalTrades         },
        ].map(card => (
          <div key={card.label} style={{
            background: '#f5f4f0',
            borderRadius: 8,
            padding: '1rem',
          }}>
            <p style={{ fontSize: 12, color: '#5f5e5a', margin: '0 0 4px' }}>{card.label}</p>
            <p style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Chart 1 — Portfolio vs benchmark over time */}
      <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: '1rem' }}>
        Portfolio vs S&P 500 over time
      </h2>
      <PortfolioChart
        portfolioSeries={portfolioSeries}
        benchmarkSeries={benchmarkSeries}
      />

      {/* Chart 2 — Trade markers */}
      <h2 style={{ fontSize: 15, fontWeight: 500, margin: '2rem 0 1rem' }}>
        When your strategy bought and sold
      </h2>
      <TradeMarkerChart
        portfolioSeries={portfolioSeries}
        tradeLog={tradeLog}
      />

      {/* Chart 3 — Side by side metrics */}
      <h2 style={{ fontSize: 15, fontWeight: 500, margin: '2rem 0 1rem' }}>
        Performance comparison
      </h2>
      <MetricsComparisonChart
        portfolioMetrics={portfolioMetrics}
        benchmarkMetrics={benchmarkMetrics}
      />

    </div>
  )
}