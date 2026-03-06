"use client";

import { useState } from "react";
import useSWR from "swr";
import { getNews, getFearGreed, NewsArticle, FearGreedData } from "@/lib/api";
import { NewsCard } from "@/components/news/NewsCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { formatPct } from "@/lib/formatters";

type Filter = "all" | "bullish" | "bearish" | "neutral";

export default function NewsPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const { data: articles = [], isLoading } = useSWR<NewsArticle[]>(
    "news:all",
    () => getNews("bitcoin", 24, 50),
    { refreshInterval: 300_000 }
  );

  const { data: fearGreed } = useSWR<FearGreedData>(
    "feargreed",
    getFearGreed,
    { refreshInterval: 3_600_000 }
  );

  const filtered = articles.filter((a) => {
    if (filter === "all") return true;
    return a.sentiment_label === filter;
  });

  const avgSentiment = articles.length
    ? articles.reduce((s, a) => s + a.sentiment_score, 0) / articles.length
    : 0;

  const fgColor = (v: number) => {
    if (v >= 70) return "text-oracle-emerald";
    if (v >= 55) return "text-oracle-cyan";
    if (v >= 45) return "text-oracle-muted";
    if (v >= 30) return "text-oracle-amber";
    return "text-oracle-rose";
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-oracle-text">News Intelligence</h1>
        <div className="text-sm text-oracle-muted font-mono">
          Auto-refreshes every 5 minutes
        </div>
      </div>

      {/* Global Sentiment Bar */}
      <div className="bg-oracle-card border border-oracle-border rounded-lg p-4 flex items-center gap-6">
        <div>
          <div className="text-xs text-oracle-muted uppercase tracking-wide mb-1">Aggregate Sentiment</div>
          <div className={`font-mono text-2xl font-semibold ${avgSentiment >= 0.05 ? "text-oracle-emerald" : avgSentiment <= -0.05 ? "text-oracle-rose" : "text-oracle-muted"}`}>
            {formatPct(avgSentiment * 100, 1)}
          </div>
        </div>

        <div className="h-8 w-px bg-oracle-border" />

        <div>
          <div className="text-xs text-oracle-muted uppercase tracking-wide mb-1">Fear & Greed</div>
          <div className={`font-mono text-2xl font-semibold ${fgColor(fearGreed?.value ?? 50)}`}>
            {fearGreed?.value ?? "—"}
            <span className="text-sm ml-2">{fearGreed?.label}</span>
          </div>
        </div>

        <div className="h-8 w-px bg-oracle-border" />

        <div>
          <div className="text-xs text-oracle-muted uppercase tracking-wide mb-1">Articles</div>
          <div className="font-mono text-2xl font-semibold text-oracle-text">{articles.length}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "bullish", "bearish", "neutral"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded text-sm font-mono capitalize transition-colors ${
              filter === f
                ? f === "bullish" ? "bg-oracle-emerald/20 text-oracle-emerald border border-oracle-emerald/40"
                  : f === "bearish" ? "bg-oracle-rose/20 text-oracle-rose border border-oracle-rose/40"
                  : "bg-oracle-cyan/20 text-oracle-cyan border border-oracle-cyan/40"
                : "bg-oracle-card text-oracle-muted border border-oracle-border hover:border-oracle-cyan/30"
            }`}
          >
            {f === "all" ? `All (${articles.length})` : f}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((article, i) => (
            <NewsCard key={i} article={article} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center text-oracle-muted py-12">
              No {filter} articles found in the last 24 hours.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
