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
    <div className="p-5 space-y-5 text-sm">
      {/* History Range */}
      <div>
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.18em] mb-2.5">History</p>
        <div className="flex flex-wrap gap-1.5">
          {HISTORY_RANGES.map(({ label, days }) => (
            <button
              key={days}
              onClick={() => onHistoryDaysChange(days)}
              className={clsx(
                "px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all",
                historyDays === days
                  ? "bg-cyan-400/15 text-cyan-400 border border-cyan-400/35"
                  : "border border-white/[0.08] text-white/35 hover:text-white/60 hover:border-white/20"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Forecast Days */}
      <div>
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.18em] mb-2.5">
          Forecast: <span className="text-white/55">{predictDays}d</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PREDICT_RANGES.map((d) => (
            <button
              key={d}
              onClick={() => setPredictDays(d)}
              className={clsx(
                "px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all",
                predictDays === d
                  ? "bg-white/[0.12] text-white/90 border border-white/25"
                  : "border border-white/[0.08] text-white/35 hover:text-white/60 hover:border-white/20"
              )}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* GPU Samples */}
      <div>
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.18em] mb-3">
          GPU Samples: <span className="text-white/55">{numSamples}</span>
        </p>
        <input
          type="range"
          min={10} max={100} step={10}
          value={numSamples}
          onChange={(e) => setNumSamples(parseInt(e.target.value))}
        />
        <div className="flex justify-between text-white/20 text-[10px] font-mono mt-1">
          <span>10 (fast)</span><span>100 (accurate)</span>
        </div>
      </div>

      {/* Confidence Band */}
      <div>
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.18em] mb-2.5">
          Confidence: <span className="text-white/55">{Math.round(quantileLow * 100)}%–{Math.round(quantileHigh * 100)}%</span>
        </p>
        <div className="flex gap-2 items-center">
          <select value={quantileLow}  onChange={(e) => setQuantileLow(parseFloat(e.target.value))}  className="flex-1">
            {[0.05, 0.1, 0.2, 0.25].map((v) => <option key={v} value={v}>{Math.round(v * 100)}%</option>)}
          </select>
          <span className="text-white/20 text-xs">–</span>
          <select value={quantileHigh} onChange={(e) => setQuantileHigh(parseFloat(e.target.value))} className="flex-1">
            {[0.75, 0.8, 0.9, 0.95].map((v) => <option key={v} value={v}>{Math.round(v * 100)}%</option>)}
          </select>
        </div>
      </div>

      {/* News Window */}
      <div>
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.18em] mb-2">
          News Window
        </p>
        <select value={newsHours} onChange={(e) => setNewsHours(parseInt(e.target.value))} className="w-full">
          {[3, 6, 12, 24, 48].map((h) => <option key={h} value={h}>{h}h back</option>)}
        </select>
      </div>

      {/* Reddit toggle */}
      <label className="flex items-center gap-2.5 cursor-pointer group">
        <input type="checkbox" checked={includeReddit} onChange={(e) => setIncludeReddit(e.target.checked)} />
        <span className="text-white/35 text-[11px] font-mono group-hover:text-white/55 transition-colors">Include Reddit</span>
      </label>

      {/* Run Button */}
      <button
        onClick={handleRun}
        disabled={loading}
        className={clsx(
          "w-full py-3.5 rounded-xl font-mono text-sm font-semibold tracking-wide transition-all mt-2",
          loading
            ? "bg-white/[0.04] text-white/25 border border-white/[0.07] cursor-wait"
            : "bg-cyan-400/10 text-cyan-400 border border-cyan-400/35 hover:bg-cyan-400/18 hover:border-cyan-400/55 shadow-[0_0_20px_rgba(34,211,238,0.10)]"
        )}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            {status || "Running..."}
          </span>
        ) : (
          "RUN ORACLE ▶"
        )}
      </button>
    </div>
  );
}
