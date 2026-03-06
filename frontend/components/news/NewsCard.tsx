import { NewsArticle } from "@/lib/api";
import { formatTimeAgo } from "@/lib/formatters";
import { SentimentPill } from "./SentimentPill";
import { SourceBadge } from "./SourceBadge";

interface Props {
  article: NewsArticle;
  compact?: boolean;
}

export function NewsCard({ article, compact = false }: Props) {
  const horizonColor = {
    immediate: "text-oracle-rose",
    short:     "text-oracle-amber",
    long:      "text-oracle-muted",
  }[article.impact_horizon] ?? "text-oracle-muted";

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-oracle-card border border-oracle-border rounded-lg p-3 hover:border-oracle-cyan/40 transition-colors group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <SourceBadge source={article.source} />
          <span className="text-oracle-muted text-xs font-mono">
            {formatTimeAgo(article.published)}
          </span>
        </div>
        <SentimentPill label={article.sentiment_label} score={article.sentiment_score} />
      </div>

      <h3 className="text-oracle-text text-sm font-medium group-hover:text-oracle-cyan transition-colors leading-snug mb-1">
        {article.title}
      </h3>

      {!compact && article.summary && (
        <p className="text-oracle-muted text-xs leading-relaxed line-clamp-2 mb-2">
          {article.summary}
        </p>
      )}

      <div className="flex items-center gap-3 text-xs font-mono">
        <span className={horizonColor}>
          {article.impact_horizon} impact
        </span>
        {article.affected_coins.length > 0 && (
          <span className="text-oracle-muted">
            {article.affected_coins.slice(0, 3).map((c) => c.toUpperCase()).join(", ")}
          </span>
        )}
      </div>
    </a>
  );
}
