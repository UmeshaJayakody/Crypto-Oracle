"use client";

import { OracleSignals } from "@/lib/api";

interface Props {
  signals: OracleSignals;
}

interface SignalBarProps {
  label:  string;
  value:  number;   // -1 to +1
  weight: string;
}

function SignalBar({ label, value, weight }: SignalBarProps) {
  // Normalize -1..+1 to 0..100%
  const pct     = ((value + 1) / 2) * 100;
  const color   = value > 0.05 ? "#10b981" : value < -0.05 ? "#f43f5e" : "#6b7280";
  const barPct  = Math.abs(value) * 100;
  const isPos   = value >= 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-oracle-muted">{label}</span>
        <span style={{ color }}>
          {value >= 0 ? "+" : ""}{value.toFixed(3)}
        </span>
      </div>
      <div className="relative h-2 bg-oracle-border rounded-full overflow-hidden">
        {/* Center line */}
        <div className="absolute left-1/2 top-0 w-px h-full bg-oracle-muted/40" />
        {/* Bar from center */}
        <div
          className="absolute top-0 h-full rounded-full transition-all duration-700"
          style={{
            width:      `${barPct / 2}%`,
            left:       isPos ? "50%" : `${50 - barPct / 2}%`,
            background: color,
          }}
        />
      </div>
      <div className="text-right text-xs text-oracle-muted font-mono">{weight}</div>
    </div>
  );
}

export function SignalBreakdown({ signals }: Props) {
  const rows = [
    { label: "Chronos",    value: signals.chronos_signal,    weight: "35%" },
    { label: "News LLM",   value: signals.news_signal,       weight: "35%" },
    { label: "Fear/Greed", value: signals.fear_greed_signal, weight: "20%" },
    { label: "Reddit",     value: signals.reddit_signal,     weight: "10%" },
  ];

  return (
    <div className="bg-oracle-card border border-oracle-border rounded-lg p-4 space-y-3">
      <div className="text-oracle-muted text-xs font-mono uppercase tracking-wider">
        Signal Breakdown
      </div>
      {rows.map((r) => <SignalBar key={r.label} {...r} />)}

      <div className="pt-2 border-t border-oracle-border">
        <SignalBar label="Combined" value={signals.combined_signal} weight="Oracle" />
      </div>
    </div>
  );
}
