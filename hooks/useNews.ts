"use client";

import { useQuery } from "@tanstack/react-query";
import { NewsArticle, NewsFilters, NewsTopic } from "@/types/news";

interface UseNewsOptions {
  topic?: NewsTopic;
  query?: string;
  filters?: NewsFilters;
  enabled?: boolean;
}

export function useNews({ topic, query, filters, enabled = true }: UseNewsOptions) {
  return useQuery<NewsArticle[]>({
    queryKey: ["news", topic, query, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (topic) params.append("topic", topic);
      if (query) params.append("q", query);
      if (filters?.sources) params.append("sources", filters.sources.join(","));
      if (filters?.date) params.append("date", filters.date);
      if (filters?.country) params.append("country", filters.country);
      if (filters?.language) params.append("language", filters.language);

      const response = await fetch(`/api/news?${params.toString()}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch news");
      }

      return data.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTrendingNews(country: string = "us") {
  return useQuery<NewsArticle[]>({
    queryKey: ["news", "trending", country],
    queryFn: async () => {
      const response = await fetch(`/api/news/trending?country=${country}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch trending news");
      }

      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}


