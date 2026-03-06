"use client";

import useSWR from "swr";
import { getNews, NewsArticle } from "../api";

export function useNews(coinId: string, hoursBack: number = 12) {
  const { data, error, isLoading, mutate } = useSWR<NewsArticle[]>(
    coinId ? `news:${coinId}:${hoursBack}` : null,
    () => getNews(coinId, hoursBack),
    { refreshInterval: 300_000 }
  );

  return {
    articles:  data ?? [],
    loading:   isLoading,
    error:     error?.message ?? null,
    refresh:   mutate,
  };
}
