import { NewsArticle } from "@/lib/api";
import { formatTimeAgo } from "@/lib/formatters";
import { SentimentPill } from "./SentimentPill";
import { SourceBadge } from "./SourceBadge";

interface Props {
  article: NewsArticle;
  compact?: boolean;
}

export function NewsCard({ article, compact = false }: Props) {
  const affectedCoins = Array.isArray(article.affected_coins) ? article.affected_coins : [];

  const horizonColor = {
    immediate: "text-rose-400",
    short:     "text-amber-400",
    long:      "text-white/30",
  }[article.impact_horizon] ?? "text-white/30";

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block glass rounded-2xl p-5 group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <SourceBadge source={article.source} />
          <span className="text-white/25 text-[10px] font-mono">
            {formatTimeAgo(article.published)}
          </span>
        </div>
        <SentimentPill label={article.sentiment_label} score={article.sentiment_score ?? undefined} />
      </div>

      <h3 className="text-white/85 text-sm font-medium group-hover:text-white transition-colors leading-snug mb-2">
        {article.title}
      </h3>

      {!compact && article.summary && (
        <p className="text-white/35 text-xs leading-relaxed line-clamp-2 mb-3">
          {article.summary}
        </p>
      )}

      <div className="flex items-center gap-3 text-[10px] font-mono">
        <span className={horizonColor}>{article.impact_horizon} impact</span>
        {affectedCoins.length > 0 && (
          <span className="text-white/25">
            {affectedCoins.slice(0, 3).map((c) => c.toUpperCase()).join(", ")}
          </span>
        )}
      </div>
    </a>
  );
}
