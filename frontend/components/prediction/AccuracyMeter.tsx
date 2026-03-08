"use client";

interface Props {
  accuracy: string;  // e.g. "72-76%"
  days:     number;
}

export function AccuracyMeter({ accuracy, days }: Props) {
  const lower = parseInt(accuracy.split("-")[0]) || 0;
  const pct   = lower;
  const color = pct >= 70 ? "#34d399" : pct >= 60 ? "#22d3ee" : "#fbbf24";

  return (
    <div className="flex items-center gap-3">
      <div className="text-white/30 text-[10px] font-mono whitespace-nowrap">{days}d accuracy</div>
      <div className="flex-1 h-1 bg-white/[0.07] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}60` }}
        />
      </div>
      <div className="font-mono text-[10px] font-medium" style={{ color }}>~{accuracy}</div>
    </div>
  );
}
