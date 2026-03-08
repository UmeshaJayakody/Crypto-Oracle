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

  const CIRCUMFERENCE = 251.3;
  const offset = CIRCUMFERENCE - (scoreNorm / 100) * CIRCUMFERENCE;

  return (
    <div className="glass-static rounded-2xl p-6 text-center">
      <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] mb-5">Oracle Score</p>

      <div className="relative inline-flex items-center justify-center">
        <svg width="130" height="130" viewBox="0 0 100 100">
          {/* Outer ring */}
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          {/* Track */}
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
          {/* Score arc */}
          <circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 1.2s ease-out", filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-bold tabular-nums" style={{ color }}>
            {scoreNorm}
          </span>
          <span className="text-[9px] font-mono mt-0.5 tracking-wider" style={{ color }}>
            {label}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <div className="text-white/35 text-[11px] font-mono">
          Confidence: <span className="text-white/60 font-medium">{signals.confidence_pct.toFixed(1)}%</span>
        </div>
        <div className="text-white/25 text-[11px] font-mono capitalize">
          {signals.signal_strength} signal
        </div>
      </div>
    </div>
  );
}
