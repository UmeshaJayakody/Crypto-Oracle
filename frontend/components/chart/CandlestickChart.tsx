"use client";

import { useEffect, useRef, useState } from "react";
import { PredictionPoint } from "@/lib/api";
import { HISTORY_RANGES } from "@/lib/constants";

interface OHLCVPoint {
  timestamp: string;
  open:  number;
  high:  number;
  low:   number;
  close: number;
}

interface Props {
  coinId:        string;
  ohlcv:         OHLCVPoint[];
  predictions?:  PredictionPoint[];
  currency:      string;
  currencySymbol: string;
}

export function CandlestickChart({ coinId, ohlcv, predictions, currency, currencySymbol }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<unknown>(null);
  const candleRef    = useRef<unknown>(null);
  const predMedRef   = useRef<unknown>(null);
  const predBandRef  = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    const loadChart = async () => {
      const { createChart, ColorType, LineStyle } = await import("lightweight-charts");

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
      const candleSeries = chart.addCandlestickSeries({
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

      // Prediction median line
      const predMedianSeries = chart.addLineSeries({
        color:     "#f59e0b",
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        title:     "Oracle Median",
      });

      // Prediction band (area series for uncertainty)
      const predUpperSeries = chart.addLineSeries({
        color:     "rgba(245,158,11,0.2)",
        lineWidth: 1,
        title:     "Pred High",
      });

      const predLowerSeries = chart.addLineSeries({
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

  return (
    <div className="relative w-full h-full min-h-64 bg-oracle-bg rounded-lg border border-oracle-border overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      {ohlcv.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-oracle-muted text-sm">
          Loading chart data...
        </div>
      )}
      {predictions && predictions.length > 0 && (
        <div className="absolute top-2 right-2 flex items-center gap-3 text-xs font-mono bg-oracle-card/80 px-2 py-1 rounded border border-oracle-border">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5 bg-oracle-emerald" /> Historical
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5 bg-oracle-amber border-dashed border-t" /> Forecast
          </span>
        </div>
      )}
    </div>
  );
}
