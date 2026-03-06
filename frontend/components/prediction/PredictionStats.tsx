"use client";

import { PredictionStats as Stats } from "@/lib/api";
import { formatPrice, formatPct } from "@/lib/formatters";

interface Props {
  stats:    Stats;
  currency: string;
  symbol:   string;
}

export function PredictionStats({ stats, currency, symbol }: Props) {
  const changeColor = stats.change_pct >= 0 ? "text-oracle-emerald" : "text-oracle-rose";
  const changeArrow = stats.change_pct >= 0 ? "▲" : "▼";

  return (
    <div className="bg-oracle-card border border-oracle-border rounded-lg p-4 space-y-2">
      <div className="text-oracle-muted text-xs font-mono uppercase tracking-wider mb-3">
        Price Forecast
      </div>

      <StatRow
        label="Current"
        value={formatPrice(stats.current_price, symbol)}
        className="text-oracle-text"
      />
      <StatRow
        label="High (upper)"
        value={formatPrice(stats.predicted_high, symbol)}
        sub={formatPct(stats.change_pct_high)}
        subColor="text-oracle-emerald"
      />
      <StatRow
        label="Median"
        value={formatPrice(stats.predicted_median_final, symbol)}
        sub={`${changeArrow} ${formatPct(stats.change_pct)}`}
        subColor={changeColor}
        bold
      />
      <StatRow
        label="Low (lower)"
        value={formatPrice(stats.predicted_low, symbol)}
        sub={formatPct(stats.change_pct_low)}
        subColor="text-oracle-rose"
      />

      <div className="pt-2 border-t border-oracle-border">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-oracle-muted">Avg band</span>
          <span className="text-oracle-text">{formatPrice(stats.avg_confidence_band, symbol)}</span>
        </div>
        <div className="flex justify-between text-xs font-mono mt-1">
          <span className="text-oracle-muted">Direction accuracy</span>
          <span className="text-oracle-cyan">~{stats.estimated_direction_accuracy}</span>
        </div>
      </div>
    </div>
  );
}

function StatRow({
  label, value, sub, subColor, bold, className,
}: {
  label:     string;
  value:     string;
  sub?:      string;
  subColor?: string;
  bold?:     boolean;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-oracle-muted text-xs font-mono">{label}</span>
      <div className="text-right">
        <span className={`font-mono text-xs ${bold ? "font-semibold text-oracle-text" : "text-oracle-muted"} ${className ?? ""}`}>
          {value}
        </span>
        {sub && (
          <span className={`font-mono text-xs ml-1.5 ${subColor ?? ""}`}>{sub}</span>
        )}
      </div>
    </div>
  );
}
