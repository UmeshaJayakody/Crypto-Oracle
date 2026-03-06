"use client";

import { NewsArticle } from "@/lib/api";
import { formatDateSL } from "@/lib/formatters";
import { clsx } from "clsx";

interface Props {
  articles:    NewsArticle[];
  days:        number;
  startDate:   string;
}

function sentimentColor(score: number): string {
  if (score >  0.6) return "bg-emerald-500";
  if (score >  0.2) return "bg-emerald-700";
  if (score > -0.2) return "bg-gray-600";
  if (score > -0.6) return "bg-red-700";
  return "bg-red-500";
}

function sentimentTooltip(score: number): string {
  if (score >  0.6) return "Strong Bullish";
  if (score >  0.2) return "Mild Bullish";
  if (score > -0.2) return "Neutral";
  if (score > -0.6) return "Mild Bearish";
  return "Strong Bearish";
}

export function SentimentBand({ articles, days, startDate }: Props) {
  const start = new Date(startDate);

  // Group articles by day
  const dayMap: Record<string, number[]> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dayMap[key] = [];
  }

  for (const a of articles) {
    const key = a.published.slice(0, 10);
    if (key in dayMap) dayMap[key].push(a.sentiment_score);
  }

  const cells = Object.entries(dayMap).map(([date, scores]) => ({
    date,
    avg: scores.length ? scores.reduce((s, v) => s + v, 0) / scores.length : 0,
    count: scores.length,
  }));

  return (
    <div className="flex h-6 rounded overflow-hidden border border-oracle-border" title="Daily news sentiment">
      {cells.map((cell) => (
        <div
          key={cell.date}
          className={clsx("flex-1 cursor-help transition-opacity hover:opacity-80", sentimentColor(cell.avg))}
          title={`${formatDateSL(cell.date + "T00:00:00")}: ${sentimentTooltip(cell.avg)} (${cell.avg.toFixed(2)}) — ${cell.count} articles`}
        />
      ))}
    </div>
  );
}
