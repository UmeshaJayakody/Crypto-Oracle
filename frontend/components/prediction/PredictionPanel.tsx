"use client";

import { useState } from "react";
import { PredictionRequest } from "@/lib/api";
import { HISTORY_RANGES, PREDICT_RANGES, CURRENCIES, DEFAULT_CURRENCY } from "@/lib/constants";
import { clsx } from "clsx";

interface Props {
  coinId:               string;
  currency:             string;
  historyDays:          number;
  onHistoryDaysChange:  (days: number) => void;
  onPredict:            (req: PredictionRequest) => Promise<void>;
  loading:              boolean;
  status:               string;
}

export function PredictionPanel({
  coinId,
  currency,
  historyDays,
  onHistoryDaysChange,
  onPredict,
  loading,
  status,
}: Props) {
  const [predictDays,   setPredictDays]   = useState(7);
  const [numSamples,    setNumSamples]    = useState(20);
  const [newsHours,     setNewsHours]     = useState(12);
  const [quantileLow,   setQuantileLow]   = useState(0.1);
  const [quantileHigh,  setQuantileHigh]  = useState(0.9);
  const [includeReddit, setIncludeReddit] = useState(true);

  const handleRun = async () => {
    await onPredict({
      coin_id:         coinId,
      vs_currency:     currency,
      history_days:    historyDays,
      prediction_days: predictDays,
      num_samples:     numSamples,
      news_hours_back: newsHours,
      quantile_low:    quantileLow,
      quantile_high:   quantileHigh,
      include_reddit:  includeReddit,
      timezone:        "Asia/Colombo",
    });
  };

  return (
    <div className="p-3 space-y-4 text-sm">
      {/* History Range */}
      <div>
        <label className="text-oracle-muted text-xs uppercase tracking-wider font-mono block mb-2">
          History
        </label>
        <div className="flex flex-wrap gap-1">
          {HISTORY_RANGES.map(({ label, days }) => (
            <button
              key={days}
              onClick={() => onHistoryDaysChange(days)}
              className={clsx(
                "px-2 py-1 rounded text-xs font-mono transition-colors",
                historyDays === days
                  ? "bg-oracle-cyan/20 text-oracle-cyan border border-oracle-cyan/40"
                  : "bg-oracle-card text-oracle-muted border border-oracle-border hover:border-oracle-cyan/30"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Predict Days */}
      <div>
        <label className="text-oracle-muted text-xs uppercase tracking-wider font-mono block mb-2">
          Forecast: {predictDays}d
        </label>
        <div className="flex flex-wrap gap-1">
          {PREDICT_RANGES.map((d) => (
            <button
              key={d}
              onClick={() => setPredictDays(d)}
              className={clsx(
                "px-2 py-1 rounded text-xs font-mono transition-colors",
                predictDays === d
                  ? "bg-oracle-amber/20 text-oracle-amber border border-oracle-amber/40"
                  : "bg-oracle-card text-oracle-muted border border-oracle-border hover:border-oracle-amber/30"
              )}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* GPU Samples */}
      <div>
        <label className="text-oracle-muted text-xs uppercase tracking-wider font-mono block mb-1">
          GPU Samples: {numSamples}
        </label>
        <input
          type="range"
          min={10} max={100} step={10}
          value={numSamples}
          onChange={(e) => setNumSamples(parseInt(e.target.value))}
          className="w-full accent-oracle-cyan"
        />
        <div className="flex justify-between text-oracle-muted text-xs font-mono mt-0.5">
          <span>10 (fast)</span>
          <span>100 (slow)</span>
        </div>
      </div>

      {/* Confidence Band */}
      <div>
        <label className="text-oracle-muted text-xs uppercase tracking-wider font-mono block mb-1">
          Confidence: {Math.round(quantileLow * 100)}%–{Math.round(quantileHigh * 100)}%
        </label>
        <div className="flex gap-2">
          <select
            value={quantileLow}
            onChange={(e) => setQuantileLow(parseFloat(e.target.value))}
            className="flex-1 bg-oracle-surface border border-oracle-border rounded px-2 py-1 text-oracle-text text-xs font-mono focus:border-oracle-cyan outline-none"
          >
            {[0.05, 0.1, 0.2, 0.25].map((v) => (
              <option key={v} value={v}>{Math.round(v * 100)}%</option>
            ))}
          </select>
          <span className="text-oracle-muted text-xs self-center">–</span>
          <select
            value={quantileHigh}
            onChange={(e) => setQuantileHigh(parseFloat(e.target.value))}
            className="flex-1 bg-oracle-surface border border-oracle-border rounded px-2 py-1 text-oracle-text text-xs font-mono focus:border-oracle-cyan outline-none"
          >
            {[0.75, 0.8, 0.9, 0.95].map((v) => (
              <option key={v} value={v}>{Math.round(v * 100)}%</option>
            ))}
          </select>
        </div>
      </div>

      {/* News Window */}
      <div>
        <label className="text-oracle-muted text-xs uppercase tracking-wider font-mono block mb-1">
          News Window
        </label>
        <select
          value={newsHours}
          onChange={(e) => setNewsHours(parseInt(e.target.value))}
          className="w-full bg-oracle-surface border border-oracle-border rounded px-2 py-1.5 text-oracle-text text-xs font-mono focus:border-oracle-cyan outline-none"
        >
          {[3, 6, 12, 24, 48].map((h) => (
            <option key={h} value={h}>{h}h back</option>
          ))}
        </select>
      </div>

      {/* Reddit toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={includeReddit}
          onChange={(e) => setIncludeReddit(e.target.checked)}
          className="w-3.5 h-3.5 accent-oracle-cyan"
        />
        <span className="text-oracle-muted text-xs font-mono">Include Reddit</span>
      </label>

      {/* Run Button */}
      <button
        onClick={handleRun}
        disabled={loading}
        className={clsx(
          "w-full py-3 rounded font-mono text-sm font-semibold transition-all",
          loading
            ? "bg-oracle-cyan/10 text-oracle-muted border border-oracle-border cursor-wait"
            : "bg-oracle-cyan/10 text-oracle-cyan border border-oracle-cyan/40 hover:bg-oracle-cyan/20 glow-cyan animate-glow-cyan"
        )}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            {status || "Running..."}
          </span>
        ) : (
          "RUN PREDICTION ▶"
        )}
      </button>
    </div>
  );
}
