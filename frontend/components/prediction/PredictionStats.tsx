"use client";

import { PredictionStats as Stats } from "@/lib/api";
import { formatPrice, formatPct } from "@/lib/formatters";

interface Props {
  stats:    Stats;
  currency: string;
  symbol:   string;
}

export function PredictionStats({ stats, currency, symbol }: Props) {
  const changeColor = stats.change_pct >= 0 ? "text-emerald-400" : "text-rose-400";
  const changeArrow = stats.change_pct >= 0 ? "▲" : "▼";

  return (
    <div className="glass-static rounded-2xl p-5 space-y-2.5">
      <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] mb-4">Price Forecast</p>

      <StatRow label="Current"    value={formatPrice(stats.current_price, symbol)} />
      <StatRow label="High"       value={formatPrice(stats.predicted_high, symbol)}
        sub={formatPct(stats.change_pct_high)} subColor="text-emerald-400" />
      <StatRow label="Median"     value={formatPrice(stats.predicted_median_final, symbol)}
        sub={`${changeArrow} ${formatPct(stats.change_pct)}`} subColor={changeColor} bold />
      <StatRow label="Low"        value={formatPrice(stats.predicted_low, symbol)}
        sub={formatPct(stats.change_pct_low)} subColor="text-rose-400" />

      <div className="pt-3 border-t border-white/[0.06] space-y-2">
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-white/30">Avg band</span>
          <span className="text-white/55 tabular-nums">{formatPrice(stats.avg_confidence_band, symbol)}</span>
        </div>
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-white/30">Direction accuracy</span>
          <span className="text-cyan-400 font-medium">~{stats.estimated_direction_accuracy}</span>
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
      <span className="text-white/35 text-[11px] font-mono">{label}</span>
      <div className="text-right flex items-center gap-1.5">
        <span className={`font-mono text-[11px] tabular-nums ${
          bold ? "font-semibold text-white/85" : "text-white/45"
        } ${className ?? ""}`}>{value}</span>
        {sub && <span className={`font-mono text-[10px] ${subColor ?? ""}`}>{sub}</span>}
      </div>
    </div>
  );
}
