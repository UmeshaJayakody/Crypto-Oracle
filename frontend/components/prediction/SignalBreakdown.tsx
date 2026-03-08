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
  const barPct  = Math.abs(value) * 100;
  const isPos   = value >= 0;
  const color   = value > 0.05 ? "#34d399" : value < -0.05 ? "#fb7185" : "rgba(255,255,255,0.35)";

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px] font-mono">
        <span className="text-white/40">{label}</span>
        <div className="flex items-center gap-2">
          <span style={{ color }} className="font-medium tabular-nums">
            {value >= 0 ? "+" : ""}{value.toFixed(3)}
          </span>
          <span className="text-white/20 text-[9px]">{weight}</span>
        </div>
      </div>
      <div className="relative h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div className="absolute left-1/2 top-0 w-px h-full bg-white/[0.15]" />
        <div
          className="absolute top-0 h-full rounded-full transition-all duration-700"
          style={{
            width:  `${barPct / 2}%`,
            left:   isPos ? "50%" : `${50 - barPct / 2}%`,
            background: color,
            boxShadow: `0 0 6px ${color}60`,
          }}
        />
      </div>
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
    <div className="glass-static rounded-2xl p-5 space-y-4">
      <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Signal Breakdown</p>
      {rows.map((r) => <SignalBar key={r.label} {...r} />)}
      <div className="pt-3 border-t border-white/[0.06]">
        <SignalBar label="Combined" value={signals.combined_signal} weight="Oracle" />
      </div>
    </div>
  );
}
