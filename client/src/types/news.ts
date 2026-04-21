export type NewsArticle = {
  id: number
  headline: string
  summary: string
  source: string
  url: string
  image: string
  datetime: number
  category: string
  related: string
}

export type UseMarketNewsReturn = {
  news: NewsArticle[]
  loading: boolean
  error: string | null
  activeTicker: string
  setActiveTicker: (ticker: string) => void
  refetch: () => void
}
