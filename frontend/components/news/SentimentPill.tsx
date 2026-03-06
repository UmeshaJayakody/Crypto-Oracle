import { clsx } from "clsx";

interface Props {
  label:  string;
  score?: number;
  size?:  "sm" | "md";
}

export function SentimentPill({ label, score, size = "sm" }: Props) {
  const norm = label.toLowerCase();

  const styles = {
    bullish: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    bearish: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    neutral: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  }[norm] ?? "bg-gray-500/15 text-gray-400 border-gray-500/30";

  return (
    <span className={clsx(
      "inline-flex items-center gap-1 border rounded font-mono capitalize",
      size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm",
      styles,
    )}>
      {norm === "bullish" ? "▲" : norm === "bearish" ? "▼" : "●"}
      {label}
      {score !== undefined && (
        <span className="opacity-70">
          {score >= 0 ? "+" : ""}{score.toFixed(2)}
        </span>
      )}
    </span>
  );
}
