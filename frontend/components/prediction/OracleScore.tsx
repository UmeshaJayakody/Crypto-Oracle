"use client";

import { OracleSignals } from "@/lib/api";
import { clsx } from "clsx";

interface Props {
  signals: OracleSignals;
}

function scoreColor(combined: number): string {
  const s = (combined + 1) / 2 * 100; // convert -1..+1 to 0..100
  if (s >= 70) return "#10b981";
  if (s >= 55) return "#00d4ff";
  if (s >= 45) return "#6b7280";
  if (s >= 30) return "#f59e0b";
  return "#f43f5e";
}

function scoreLabel(combined: number): string {
  const s = (combined + 1) / 2 * 100;
  if (s >= 70) return "STRONG BULL";
  if (s >= 55) return "BULLISH";
  if (s >= 45) return "NEUTRAL";
  if (s >= 30) return "BEARISH";
  return "STRONG BEAR";
}

export function OracleScore({ signals }: Props) {
  const scoreNorm  = Math.round((signals.combined_signal + 1) / 2 * 100);
  const color      = scoreColor(signals.combined_signal);
  const label      = scoreLabel(signals.combined_signal);

  // SVG arc: circumference of r=40 circle ≈ 251.3
  const CIRCUMFERENCE = 251.3;
  const offset = CIRCUMFERENCE - (scoreNorm / 100) * CIRCUMFERENCE;

  return (
    <div className="bg-oracle-card border border-oracle-border rounded-lg p-4 text-center">
      <div className="text-oracle-muted text-xs font-mono uppercase tracking-wider mb-3">
        Oracle Score
      </div>

      <div className="relative inline-flex items-center justify-center">
        <svg width="120" height="120" viewBox="0 0 100 100">
          {/* Background track */}
          <circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke="#1e1e2e"
            strokeWidth="8"
          />
          {/* Score arc */}
          <circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-bold" style={{ color }}>
            {scoreNorm}
          </span>
          <span className="text-xs font-mono mt-0.5" style={{ color }}>
            {label}
          </span>
        </div>
      </div>

      <div className="mt-2 text-oracle-muted text-xs font-mono">
        Confidence: {signals.confidence_pct.toFixed(1)}%
      </div>
      <div className="mt-1 text-oracle-muted text-xs font-mono capitalize">
        {signals.signal_strength} signal
      </div>
    </div>
  );
}
