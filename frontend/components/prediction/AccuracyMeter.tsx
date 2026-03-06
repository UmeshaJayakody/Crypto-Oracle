"use client";

interface Props {
  accuracy: string;  // e.g. "72-76%"
  days:     number;
}

export function AccuracyMeter({ accuracy, days }: Props) {
  // Parse lower bound from e.g. "72-76%"
  const lower = parseInt(accuracy.split("-")[0]) || 0;
  const pct   = lower;

  const color = pct >= 70 ? "#10b981" : pct >= 60 ? "#00d4ff" : "#f59e0b";

  return (
    <div className="flex items-center gap-2">
      <div className="text-oracle-muted text-xs font-mono whitespace-nowrap">
        {days}d accuracy
      </div>
      <div className="flex-1 h-1.5 bg-oracle-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="font-mono text-xs" style={{ color }}>~{accuracy}</div>
    </div>
  );
}
