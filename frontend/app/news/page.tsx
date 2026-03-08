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
    if (v >= 70) return "text-emerald-400";
    if (v >= 55) return "text-cyan-400";
    if (v >= 45) return "text-white/45";
    if (v >= 30) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-white/85">News Intelligence</h1>
        <span className="text-[10px] text-white/25 font-mono">auto-refresh 5 min</span>
      </div>

      {/* Global Sentiment Bar */}
      <div className="glass-static rounded-2xl px-6 py-5 flex items-center gap-8">
        <div>
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.18em] mb-1.5">Aggregate Sentiment</p>
          <p className={`font-mono text-2xl font-semibold tabular-nums ${
            avgSentiment >= 0.05 ? "text-emerald-400" : avgSentiment <= -0.05 ? "text-rose-400" : "text-white/45"
          }`}>{formatPct(avgSentiment * 100, 1)}</p>
        </div>

        <div className="h-10 w-px bg-white/[0.06]" />

        <div>
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.18em] mb-1.5">Fear & Greed</p>
          <p className={`font-mono text-2xl font-semibold tabular-nums ${fgColor(fearGreed?.value ?? 50)}`}>
            {fearGreed?.value ?? "—"}
            <span className="text-sm font-normal text-white/35 ml-2">{fearGreed?.label}</span>
          </p>
        </div>

        <div className="h-10 w-px bg-white/[0.06]" />

        <div>
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.18em] mb-1.5">Articles</p>
          <p className="font-mono text-2xl font-semibold text-white/75 tabular-nums">{articles.length}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "bullish", "bearish", "neutral"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-mono capitalize transition-all ${
              filter === f
                ? f === "bullish" ? "bg-emerald-400/15 text-emerald-400 border border-emerald-400/35"
                  : f === "bearish" ? "bg-rose-400/15 text-rose-400 border border-rose-400/35"
                  : "bg-cyan-400/15 text-cyan-400 border border-cyan-400/35"
                : "border border-white/[0.08] text-white/35 hover:text-white/60 hover:border-white/20"
            }`}
          >
            {f === "all" ? `All (${articles.length})` : f}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-36" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((article, i) => (
            <NewsCard key={i} article={article} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center text-white/25 font-mono text-sm py-16">
              No {filter} articles in the last 24h
            </div>
          )}
        </div>
      )}
    </div>
  );
}
