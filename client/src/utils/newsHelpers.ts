export function formatNewsDate(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60))
    return diffMins <= 1 ? 'Just now' : `${diffMins} mins ago`
  }
  
  if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
  }
  
  if (diffDays === 1) {
    return 'Yesterday'
  }
  
  if (diffDays < 7) {
    return `${diffDays} days ago`
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function getPlaceholderGradient(source: string): string {
  if (!source) return 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'
  
  let hash = 0
  for (let i = 0; i < source.length; i++) {
    hash = source.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const gradients = [
    'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', // Indigo to Purple
    'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)', // Blue to Teal
    'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', // Amber to Red
    'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', // Emerald to Blue
    'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'  // Pink to Violet
  ]
  
  const index = Math.abs(hash) % gradients.length
  return gradients[index]
}
