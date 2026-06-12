"use client";

import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import {
  fetchHeroData,
  fetchFeatures,
  fetchStats,
  fetchNews,
  fetchEvents,
  fetchTestimonials,
  fetchFAQ,
  fetchAnnouncements,
} from '@/services/api';

// Generic fetcher with error handling
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    throw error;
  }
  return response.json();
};

export function useHeroData() {
  const { data, error, isLoading, mutate } = useSWR('hero', fetchHeroData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // 1 minute
  });
  
  return { 
    heroData: data, 
    error, 
    isLoading,
    refetch: mutate 
  };
}

export function useFeatures() {
  const { data, error, isLoading, mutate } = useSWR('features', fetchFeatures, {
    revalidateOnFocus: false,
    dedupingInterval: 300000, // 5 minutes
  });
  
  return { 
    features: data?.features || [], 
    error, 
    isLoading,
    refetch: mutate 
  };
}

export function useStats() {
  const { data, error, isLoading, mutate } = useSWR('statistics', fetchStats, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
  });
  
  return { 
    stats: data?.statistics || [], 
    error, 
    isLoading,
    refetch: mutate 
  };
}

export function useNews(category?: string) {
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.hasMore) return null;
    return `news-${pageIndex}-${category || 'all'}`;
  };

  const { data, error, size, setSize, isLoading, isValidating } = useSWRInfinite(
    getKey,
    (key) => {
      const [, pageIndex] = key.split('-');
      return fetchNews(parseInt(pageIndex) + 1, 6, category);
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const news = data ? data.flatMap(page => page.news) : [];
  const hasMore = data ? data[data.length - 1]?.hasMore : false;
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isReachingEnd = !isLoadingMore && !hasMore;

  return {
    news,
    error,
    isLoading: isLoading || isValidating,
    isLoadingMore,
    isReachingEnd,
    loadMore: () => setSize(size + 1),
    size,
  };
}

export function useEvents() {
  const { data, error, isLoading, mutate } = useSWR('events', fetchEvents, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
  
  return { 
    events: data?.events || [], 
    error, 
    isLoading,
    refetch: mutate 
  };
}

export function useTestimonials() {
  const { data, error, isLoading, mutate } = useSWR('testimonials', fetchTestimonials, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
  });
  
  return { 
    testimonials: data?.testimonials || [], 
    error, 
    isLoading,
    refetch: mutate 
  };
}

export function useFAQ() {
  const { data, error, isLoading, mutate } = useSWR('faq', fetchFAQ, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
  });
  
  return { 
    faq: data?.faq || [], 
    error, 
    isLoading,
    refetch: mutate 
  };
}

export function useAnnouncements() {
  const { data, error, isLoading, mutate } = useSWR('announcements', fetchAnnouncements, {
    revalidateOnFocus: true,
    refreshInterval: 60000, // Refresh every minute
    dedupingInterval: 30000,
  });
  
  return { 
    announcements: data?.announcements || [], 
    error, 
    isLoading,
    refetch: mutate 
  };
}