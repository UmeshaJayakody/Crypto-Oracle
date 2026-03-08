import { clsx } from "clsx";

interface Props {
  label?: string | null;
  score?: number;
  size?:  "sm" | "md";
}

export function SentimentPill({ label, score, size = "sm" }: Props) {
  const safeLabel = typeof label === "string" && label.trim().length > 0 ? label : "neutral";
  const norm = safeLabel.toLowerCase();

  const styles = {
    bullish: "pill-bull",
    bearish: "pill-bear",
    neutral: "pill-neut",
  }[norm] ?? "pill-neut";

  return (
    <span className={clsx(
      "inline-flex items-center gap-1 rounded-lg font-mono capitalize font-medium",
      size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
      styles,
    )}>
      {norm === "bullish" ? "▲" : norm === "bearish" ? "▼" : "●"}
      {safeLabel}
      {score !== undefined && (
        <span className="opacity-60 ml-0.5">{score >= 0 ? "+" : ""}{score.toFixed(2)}</span>
      )}
    </span>
  );
}
