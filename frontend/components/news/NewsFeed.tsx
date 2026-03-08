"use client";

import { useState } from "react";
import { useNews } from "@/lib/hooks/useNews";
import { NewsCard } from "./NewsCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

type Filter = "all" | "bullish" | "bearish" | "neutral";

interface Props {
  coinId:    string;
  hoursBack?: number;
}

export function NewsFeed({ coinId, hoursBack = 12 }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const { articles, loading } = useNews(coinId, hoursBack);

  const filtered = articles.filter((a) => filter === "all" || a.sentiment_label === filter);

  return (
    <div className="flex flex-col h-full">
      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.05]" style={{ background: 'rgba(255,255,255,0.015)' }}>
        {(["all", "bullish", "bearish", "neutral"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono capitalize transition-colors ${
              filter === f
                ? f === "bullish" ? "bg-emerald-400/15 text-emerald-400 border border-emerald-400/25"
                  : f === "bearish" ? "bg-rose-400/15 text-rose-400 border border-rose-400/25"
                  : "bg-cyan-400/15 text-cyan-400 border border-cyan-400/25"
                : "text-white/30 hover:text-white/60 border border-transparent"
            }`}
          >
            {f === "all" ? `All (${articles.length})` : f.toUpperCase()}
          </button>
        ))}
        <span className="ml-auto text-white/20 text-[10px] font-mono">News Intelligence</span>
      </div>

      {/* Articles */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-28" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center text-white/25 text-sm py-12">
            No {filter !== "all" ? filter : ""} news in the last {hoursBack}h.
          </div>
        ) : (
          filtered.map((article, i) => (
            <NewsCard key={i} article={article} compact />
          ))
        )}
      </div>
    </div>
  );
}
