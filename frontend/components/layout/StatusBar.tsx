"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { getGlobalStats, getFearGreed, FearGreedData } from "@/lib/api";
import { formatCurrency, nowSL } from "@/lib/formatters";
import { DEFAULT_CURRENCY, DEFAULT_CURRENCY_SYMBOL } from "@/lib/constants";
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

  const cur = DEFAULT_CURRENCY.toLowerCase();
  const totalMcap = (global as Record<string, Record<string, number>> | undefined)
    ?.total_market_cap?.[cur] ?? 0;
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
    <div className="flex items-center gap-5 px-5 py-2.5 border-b border-white/[0.05] text-[11px] font-mono shrink-0 overflow-x-auto" style={{ background: 'rgba(255,255,255,0.015)', backdropFilter: 'blur(12px)' }}>
      {/* Market Cap */}
      {totalMcap > 0 && (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-white/30 uppercase tracking-wider">Market Cap</span>
          <span className="text-white/70 font-medium">{formatCurrency(totalMcap, DEFAULT_CURRENCY_SYMBOL, DEFAULT_CURRENCY)}</span>
        </div>
      )}

      <div className="h-3 w-px bg-white/[0.08] shrink-0" />

      {/* BTC Dominance */}
      {btcDom > 0 && (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-white/30 uppercase tracking-wider">BTC Dom</span>
          <span className="text-white/70 font-medium">{btcDom.toFixed(1)}%</span>
        </div>
      )}

      <div className="h-3 w-px bg-white/[0.08] shrink-0" />

      {/* Fear & Greed */}
      {fearGreed && (
        <div className={clsx(
          "flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border whitespace-nowrap text-[11px]",
          fgColor(fearGreed.value)
        )}>
          <span className="font-semibold">{fearGreed.value}</span>
          <span className="opacity-75">{fearGreed.label}</span>
        </div>
      )}

      <div className="flex-1" />

      {/* GPU */}
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.7)] animate-pulse" />
        <span className="text-white/30">RTX 3050</span>
      </div>

      <div className="h-3 w-px bg-white/[0.08] shrink-0" />

      {/* Time */}
      <div className="text-cyan-400/70 whitespace-nowrap tabular-nums">{time}</div>
    </div>
  );
}
