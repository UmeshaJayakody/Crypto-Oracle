"use client";

// This component is used as a lightweight overlay description panel
// The actual chart overlay is handled inside CandlestickChart.tsx
// This can show metadata about the prediction shown in chart

import { PredictionPoint } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import { DEFAULT_CURRENCY, DEFAULT_CURRENCY_SYMBOL } from "@/lib/constants";

interface Props {
  predictions:   PredictionPoint[];
  currencySymbol: string;
}

export function PredictionOverlay({ predictions, currencySymbol }: Props) {
  if (!predictions.length) return null;

  const last = predictions[predictions.length - 1];

  return (
    <div className="flex items-center gap-4 px-3 py-1.5 bg-oracle-amber/5 border border-oracle-amber/20 rounded text-xs font-mono">
      <span className="text-oracle-amber">Chronos Forecast</span>
      <span className="text-oracle-muted">
        Median: <span className="text-oracle-text">{formatCurrency(last.sentiment_adjusted_median, DEFAULT_CURRENCY_SYMBOL, DEFAULT_CURRENCY)}</span>
      </span>
      <span className="text-oracle-muted">
        Range: <span className="text-oracle-text">{formatCurrency(last.lower, DEFAULT_CURRENCY_SYMBOL, DEFAULT_CURRENCY)} — {formatCurrency(last.upper, DEFAULT_CURRENCY_SYMBOL, DEFAULT_CURRENCY)}</span>
      </span>
    </div>
  );
}
