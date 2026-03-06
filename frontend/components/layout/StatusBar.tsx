"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { getGlobalStats, getFearGreed, FearGreedData } from "@/lib/api";
import { formatLKR, nowSL } from "@/lib/formatters";
import { clsx } from "clsx";

export function StatusBar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => setTime(nowSL());
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  const { data: global } = useSWR("global", getGlobalStats, { refreshInterval: 120_000 });
  const { data: fearGreed } = useSWR<FearGreedData>("feargreed:bar", getFearGreed, { refreshInterval: 3_600_000 });

  const totalMcap = (global as Record<string, Record<string, number>> | undefined)
    ?.total_market_cap?.lkr ?? 0;
  const btcDom = (global as Record<string, Record<string, number>> | undefined)
    ?.market_cap_percentage?.btc ?? 0;

  const fgColor = (v: number) => {
    if (v >= 70) return "text-oracle-emerald bg-oracle-emerald/10 border-oracle-emerald/30";
    if (v >= 55) return "text-oracle-cyan bg-oracle-cyan/10 border-oracle-cyan/30";
    if (v >= 45) return "text-oracle-muted bg-oracle-muted/10 border-oracle-muted/30";
    if (v >= 30) return "text-oracle-amber bg-oracle-amber/10 border-oracle-amber/30";
    return "text-oracle-rose bg-oracle-rose/10 border-oracle-rose/30";
  };

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-oracle-surface border-b border-oracle-border text-xs font-mono shrink-0 overflow-x-auto">
      {/* Market Cap */}
      {totalMcap > 0 && (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-oracle-muted">Market Cap</span>
          <span className="text-oracle-text">{formatLKR(totalMcap)}</span>
        </div>
      )}

      <div className="h-3 w-px bg-oracle-border shrink-0" />

      {/* BTC Dominance */}
      {btcDom > 0 && (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-oracle-muted">BTC Dom</span>
          <span className="text-oracle-text">{btcDom.toFixed(1)}%</span>
        </div>
      )}

      <div className="h-3 w-px bg-oracle-border shrink-0" />

      {/* Fear & Greed */}
      {fearGreed && (
        <div className={clsx(
          "flex items-center gap-1.5 px-2 py-0.5 rounded border whitespace-nowrap",
          fgColor(fearGreed.value)
        )}>
          <span>{fearGreed.value}</span>
          <span>{fearGreed.label}</span>
        </div>
      )}

      <div className="flex-1" />

      {/* GPU Status */}
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <div className="w-1.5 h-1.5 rounded-full bg-oracle-emerald animate-pulse" />
        <span className="text-oracle-muted">RTX 3050</span>
      </div>

      <div className="h-3 w-px bg-oracle-border shrink-0" />

      {/* Clock */}
      <div className="text-oracle-cyan whitespace-nowrap">
        {time} SLST
      </div>
    </div>
  );
}
