"use client";

import { HISTORY_RANGES } from "@/lib/constants";
import { clsx } from "clsx";

interface Props {
  value:    number;
  onChange: (days: number) => void;
}

export function TimeRangeSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-1">
      {HISTORY_RANGES.map(({ label, days }) => (
        <button
          key={days}
          onClick={() => onChange(days)}
          className={clsx(
            "px-2.5 py-1 rounded text-xs font-mono transition-colors",
            value === days
              ? "bg-oracle-cyan/20 text-oracle-cyan border border-oracle-cyan/40"
              : "bg-oracle-card text-oracle-muted border border-oracle-border hover:border-oracle-cyan/30"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
