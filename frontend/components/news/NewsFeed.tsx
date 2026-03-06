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
      <div className="flex items-center gap-1 px-3 py-2 border-b border-oracle-border bg-oracle-surface">
        {(["all", "bullish", "bearish", "neutral"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded text-xs font-mono capitalize transition-colors ${
              filter === f
                ? f === "bullish" ? "bg-oracle-emerald/20 text-oracle-emerald"
                  : f === "bearish" ? "bg-oracle-rose/20 text-oracle-rose"
                  : "bg-oracle-cyan/20 text-oracle-cyan"
                : "text-oracle-muted hover:text-oracle-text"
            }`}
          >
            {f === "all" ? `ALL (${articles.length})` : f.toUpperCase()}
          </button>
        ))}
        <span className="ml-auto text-oracle-muted text-xs font-mono">
          News Intelligence
        </span>
      </div>

      {/* Articles */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-24" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center text-oracle-muted text-sm py-8">
            No {filter !== "all" ? filter : ""} news found in the last {hoursBack}h.
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
