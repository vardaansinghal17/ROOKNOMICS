import { useState, useEffect, useCallback, useRef } from 'react';
import { NewsArticle, UseMarketNewsReturn } from '../types/news';

const API_KEY = import.meta.env.VITE_FINNHUB_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

export function useMarketNews(): UseMarketNewsReturn {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTicker, setActiveTicker] = useState<string>('');
  
  // Cache for fallback
  const cachedNews = useRef<NewsArticle[]>([]);

  const fetchNews = useCallback(async (ticker: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let url = '';
      if (!ticker) {
        url = `${BASE_URL}/news?category=general&token=${API_KEY}`;
      } else {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        const formatDate = (date: Date) => date.toISOString().split('T')[0];
        
        url = `${BASE_URL}/company-news?symbol=${ticker}&from=${formatDate(thirtyDaysAgo)}&to=${formatDate(today)}&token=${API_KEY}`;
      }

      const res = await fetch(url);
      
      if (res.status === 401) {
        throw new Error('Invalid API key');
      } else if (res.status === 429) {
        throw new Error('Rate limit reached');
      } else if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }

      const data = await res.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid API response format');
      }
      
      // Filter out empty headlines, no image, or generic logos, and map to NewsArticle
      const mappedData: NewsArticle[] = data
        .filter((item: any) => {
          if (!item.headline || item.headline.trim() === '') return false;
          if (!item.image) return false;
          if (item.image.includes('finnhub/logo') || item.image.includes('reuters_logo')) return false;
          return true;
        })
        .map((item: any) => {
          return {
            id: item.id,
            headline: item.headline,
            summary: item.summary,
            source: item.source,
            url: item.url,
            image: item.image,
            datetime: item.datetime,
            category: item.category,
            related: item.related || (ticker ? ticker : '')
          };
        });
        
      // For general news we just want top 12. For company news, let's also limit to 12 just in case, or show all. The prompt says "Show top 12 articles" for general. 
      const finalData = (!ticker) ? mappedData.slice(0, 12) : mappedData;
      
      setNews(finalData);
      cachedNews.current = finalData;
      
    } catch (err: any) {
      setError(err.message || 'Network error');
      if (cachedNews.current.length > 0) {
        setNews(cachedNews.current);
      } else {
        setNews([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced fetch when ticker changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNews(activeTicker);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeTicker, fetchNews]);

  // Auto-refresh interval (every 30 minutes) for general news 
  useEffect(() => {
    if (activeTicker !== '') return; // Only auto-refresh general news

    const interval = setInterval(() => {
      fetchNews('');
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [activeTicker, fetchNews]);

  const refetch = useCallback(() => {
    fetchNews(activeTicker);
  }, [activeTicker, fetchNews]);

  return {
    news,
    loading,
    error,
    activeTicker,
    setActiveTicker,
    refetch
  };
}
