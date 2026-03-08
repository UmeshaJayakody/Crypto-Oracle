"use client";

import { useEffect, useRef } from "react";
import { PredictionPoint, OracleSignals } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";

interface OHLCVPoint {
  timestamp: string;
  open:  number;
  high:  number;
  low:   number;
  close: number;
}

interface Props {
  coinId:         string;
  ohlcv:          OHLCVPoint[];
  predictions?:   PredictionPoint[];
  signals?:       OracleSignals;
  currency:       string;
  currencySymbol: string;
}

function getDirectionStyle(signal?: number) {
  if (signal === undefined || (signal >= -0.2 && signal <= 0.2))
    return {
      lineColor: "#f59e0b",
      arrow:     "→",
      label:     "NEUTRAL",
      labelColor: "#f59e0b",
      bg:        "rgba(245,158,11,0.08)",
      border:    "rgba(245,158,11,0.28)",
    };
  if (signal > 0.2)
    return {
      lineColor: "#10b981",
      arrow:     "▲",
      label:     signal > 0.6 ? "STRONG BULL" : "BULLISH",
      labelColor: "#10b981",
      bg:        "rgba(16,185,129,0.08)",
      border:    "rgba(16,185,129,0.32)",
    };
  return {
    lineColor: "#f43f5e",
    arrow:     "▼",
    label:     signal < -0.6 ? "STRONG BEAR" : "BEARISH",
    labelColor: "#f43f5e",
    bg:        "rgba(244,63,94,0.08)",
    border:    "rgba(244,63,94,0.32)",
  };
}

export function CandlestickChart({ coinId, ohlcv, predictions, signals, currency, currencySymbol }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<unknown>(null);
  const candleRef    = useRef<unknown>(null);
  const predMedRef   = useRef<unknown>(null);
  const predBandRef  = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    const loadChart = async () => {
      const { createChart, ColorType, LineStyle, CandlestickSeries, LineSeries } = await import("lightweight-charts");

      const chart = createChart(containerRef.current!, {
        width:  containerRef.current!.clientWidth,
        height: containerRef.current!.clientHeight,
        layout: {
          background:  { type: ColorType.Solid, color: "#0a0a0f" },
          textColor:   "#6b7280",
        },
        grid: {
          vertLines:   { color: "#1e1e2e" },
          horzLines:   { color: "#1e1e2e" },
        },
        crosshair: {
          mode: 1,
        },
        rightPriceScale: {
          borderColor: "#1e1e2e",
          textColor:   "#6b7280",
        },
        timeScale: {
          borderColor:     "#1e1e2e",
          timeVisible:     true,
          secondsVisible:  false,
          tickMarkFormatter: (time: number) => {
            const d = new Date(time * 1000);
            return d.toLocaleDateString("en-LK", {
              timeZone: "Asia/Colombo",
              day:   "2-digit",
              month: "short",
            });
          },
        },
      });

      // Candlestick series
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor:          "#10b981",
        downColor:        "#f43f5e",
        borderUpColor:    "#10b981",
        borderDownColor:  "#f43f5e",
        wickUpColor:      "#10b981",
        wickDownColor:    "#f43f5e",
      });

      if (ohlcv.length > 0) {
        const candleData = ohlcv.map((p) => ({
          time:  Math.floor(new Date(p.timestamp).getTime() / 1000) as import("lightweight-charts").Time,
          open:  p.open,
          high:  p.high,
          low:   p.low,
          close: p.close,
        })).sort((a, b) => (a.time as number) - (b.time as number));
        candleSeries.setData(candleData);
      }

      // Prediction median line — color set on first render; updated dynamically via useEffect
      const predMedianSeries = chart.addSeries(LineSeries, {
        color:     "#f59e0b",
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        title:     "Oracle Median",
      });

      // Prediction band (area series for uncertainty)
      const predUpperSeries = chart.addSeries(LineSeries, {
        color:     "rgba(245,158,11,0.2)",
        lineWidth: 1,
        title:     "Pred High",
      });

      const predLowerSeries = chart.addSeries(LineSeries, {
        color:     "rgba(245,158,11,0.2)",
        lineWidth: 1,
        title:     "Pred Low",
      });

      if (predictions && predictions.length > 0) {
        const medData = predictions.map((p) => ({
          time:  Math.floor(new Date(p.timestamp).getTime() / 1000) as import("lightweight-charts").Time,
          value: p.sentiment_adjusted_median,
        })).sort((a, b) => (a.time as number) - (b.time as number));

        const highData = predictions.map((p) => ({
          time:  Math.floor(new Date(p.timestamp).getTime() / 1000) as import("lightweight-charts").Time,
          value: p.upper,
        })).sort((a, b) => (a.time as number) - (b.time as number));

        const lowData = predictions.map((p) => ({
          time:  Math.floor(new Date(p.timestamp).getTime() / 1000) as import("lightweight-charts").Time,
          value: p.lower,
        })).sort((a, b) => (a.time as number) - (b.time as number));

        predMedianSeries.setData(medData);
        predUpperSeries.setData(highData);
        predLowerSeries.setData(lowData);
      }

      chart.timeScale().fitContent();

      chartRef.current    = chart;
      candleRef.current   = candleSeries;
      predMedRef.current  = predMedianSeries;
      predBandRef.current = { upper: predUpperSeries, lower: predLowerSeries };

      // Resize observer
      const ro = new ResizeObserver(() => {
        if (containerRef.current) {
          chart.resize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        }
      });
      containerRef.current && ro.observe(containerRef.current);

      return () => {
        ro.disconnect();
        chart.remove();
      };
    };

    const cleanup = loadChart();
    return () => { cleanup.then((fn) => fn && fn()); };
  }, []);

  // Re-color prediction line when signals change
  useEffect(() => {
    if (!predMedRef.current || !signals) return;
    const { lineColor } = getDirectionStyle(signals.combined_signal);
    (predMedRef.current as { applyOptions: (o: unknown) => void }).applyOptions({ color: lineColor });
    const bands = predBandRef.current as { upper: { applyOptions: (o: unknown) => void }; lower: { applyOptions: (o: unknown) => void } } | null;
    if (bands) {
      const bandColor = lineColor.replace(")", ", 0.15)").replace("rgb(", "rgba(") || `${lineColor}26`;
      bands.upper.applyOptions({ color: `${lineColor}30` });
      bands.lower.applyOptions({ color: `${lineColor}30` });
    }
  }, [signals]);

  // Update data when ohlcv/predictions change
  useEffect(() => {
    if (!candleRef.current || !ohlcv.length) return;
    const series = candleRef.current as { setData: (d: unknown[]) => void };
    const data = ohlcv.map((p) => ({
      time:  Math.floor(new Date(p.timestamp).getTime() / 1000),
      open:  p.open, high: p.high, low: p.low, close: p.close,
    })).sort((a, b) => a.time - b.time);
    series.setData(data);
  }, [ohlcv]);

  useEffect(() => {
    if (!predMedRef.current || !predictions?.length) return;
    const med   = predMedRef.current  as { setData: (d: unknown[]) => void };
    const bands = predBandRef.current as { upper: { setData: (d: unknown[]) => void }; lower: { setData: (d: unknown[]) => void } };

    const toSeries = (fn: (p: PredictionPoint) => number) =>
      predictions!.map((p) => ({
        time:  Math.floor(new Date(p.timestamp).getTime() / 1000),
        value: fn(p),
      })).sort((a, b) => a.time - b.time);

    med.setData(toSeries((p) => p.sentiment_adjusted_median));
    bands.upper.setData(toSeries((p) => p.upper));
    bands.lower.setData(toSeries((p) => p.lower));
  }, [predictions]);

  const hasPrediction = predictions && predictions.length > 0;
  const dirStyle = getDirectionStyle(signals?.combined_signal);
  const lastPred = hasPrediction ? predictions![predictions!.length - 1] : null;
  const firstPred = hasPrediction ? predictions![0] : null;

  return (
    <div className="relative w-full h-full min-h-64 bg-oracle-bg rounded-lg border border-oracle-border overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />

      {ohlcv.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-oracle-muted text-sm">
          Loading chart data...
        </div>
      )}

      {/* Legend row */}
      <div className="absolute top-2 right-2 flex items-center gap-3 text-[10px] font-mono bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/[0.07]">
        <span className="flex items-center gap-1.5 text-white/40">
          <span className="inline-block w-4 h-0.5 bg-emerald-500" />
          Historical
        </span>
        {hasPrediction && (
          <span className="flex items-center gap-1.5" style={{ color: dirStyle.labelColor + "aa" }}>
            <span className="inline-block w-4 h-0.5" style={{ background: dirStyle.lineColor, opacity: 0.8 }} />
            Forecast
          </span>
        )}
      </div>

      {/* Direction badge — appears after prediction is loaded */}
      {hasPrediction && signals && (
        <div
          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-4 py-2 rounded-xl border backdrop-blur-md font-mono text-xs"
          style={{ background: dirStyle.bg, borderColor: dirStyle.border }}
        >
          {/* Arrow icon */}
          <span className="text-base leading-none" style={{ color: dirStyle.labelColor }}>
            {dirStyle.arrow}
          </span>

          {/* Direction label */}
          <span className="font-semibold tracking-wide" style={{ color: dirStyle.labelColor }}>
            {dirStyle.label}
          </span>

          <span className="text-white/20">|</span>

          {/* Median target */}
          <span className="text-white/50">
            Median{" "}
            <span className="text-white/80">
              {formatCurrency(lastPred!.sentiment_adjusted_median, currencySymbol, currency.toUpperCase())}
            </span>
          </span>

          <span className="text-white/20">|</span>

          {/* High / Low targets */}
          <span className="text-white/40">
            <span className="text-emerald-400/80">{formatCurrency(lastPred!.upper, currencySymbol, currency.toUpperCase())}</span>
            {" / "}
            <span className="text-rose-400/70">{formatCurrency(lastPred!.lower, currencySymbol, currency.toUpperCase())}</span>
          </span>

          {/* Change % */}
          {signals.direction !== "neutral" && (
            <>
              <span className="text-white/20">|</span>
              <span className="text-[10px]" style={{ color: dirStyle.labelColor }}>
                signal {signals.combined_signal > 0 ? "+" : ""}{(signals.combined_signal * 100).toFixed(1)}%
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
