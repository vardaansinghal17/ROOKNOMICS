import { PortfolioChart } from './PortfolioChart'
import { TradeMarkerChart } from './TradeMarkerChart'
import { MetricsComparisonChart } from './MetricsComparisonChart'
import { Trophy, AlertTriangle } from 'lucide-react'

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
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Verdict banner */}
      <div className={`p-6 md:p-8 rounded-[2.5rem] mb-10 flex flex-col md:flex-row md:items-center gap-6 border shadow-sm ${weWon ? 'bg-emerald-50 border-emerald-200/60' : 'bg-rose-50 border-rose-200/60'}`}>
        <div className={`w-16 h-16 flex items-center justify-center rounded-[1.5rem] shrink-0 border ${weWon ? 'bg-white border-emerald-100 text-emerald-600 shadow-[0_8px_16px_rgba(16,185,129,0.1)]' : 'bg-white border-rose-100 text-rose-600 shadow-[0_8px_16px_rgba(244,63,94,0.1)]'}`}>
          {weWon ? <Trophy size={28} strokeWidth={1.5} /> : <AlertTriangle size={28} strokeWidth={1.5} />}
        </div>
        <div>
          <h3 className={`text-2xl font-extrabold tracking-tight mb-2 ${weWon ? 'text-emerald-950' : 'text-rose-950'}`}>
            {weWon ? 'Your strategy defeated the market.' : 'The index defeated your strategy.'}
          </h3>
          <p className={`text-lg font-medium ${weWon ? 'text-emerald-700' : 'text-rose-700'}`}>
            {weWon
              ? `You achieved +${portfolioMetrics.totalReturn}% return against the S&P 500's +${benchmarkMetrics.totalReturn}%.`
              : `Your strategy returned +${portfolioMetrics.totalReturn}% against the S&P 500's +${benchmarkMetrics.totalReturn}%.`}
          </p>
        </div>
      </div>

      {/* Summary metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
        {[
          { label: 'Your return', value: `+${portfolioMetrics.totalReturn}%`, highlight: true },
          { label: 'Index return', value: `+${benchmarkMetrics.totalReturn}%` },
          { label: 'Max drawdown', value: `${portfolioMetrics.maxDrawdown}%` },
          { label: 'Total trades', value: portfolioMetrics.totalTrades },
        ].map(card => (
          <div key={card.label} className="bg-white border border-slate-200/80 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">{card.label}</p>
            <p className={`text-3xl md:text-4xl font-extrabold tracking-tight ${card.highlight ? 'text-indigo-600' : 'text-slate-900'}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="space-y-8">
        <div className="bg-white border border-slate-200/80 rounded-[2.5rem] p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8 tracking-tight">Portfolio vs S&P 500 Over Time</h2>
          <PortfolioChart portfolioSeries={portfolioSeries} benchmarkSeries={benchmarkSeries} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-slate-200/80 rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-8 tracking-tight">When You Traded</h2>
            <TradeMarkerChart portfolioSeries={portfolioSeries} tradeLog={tradeLog} />
          </div>

          <div className="bg-white border border-slate-200/80 rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-8 tracking-tight">Performance Deep Dive</h2>
            <MetricsComparisonChart portfolioMetrics={portfolioMetrics} benchmarkMetrics={benchmarkMetrics} />
          </div>
        </div>
      </div>

    </div>
  )
}