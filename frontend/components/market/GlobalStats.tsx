"use client";

import useSWR from "swr";
import { getGlobalStats, getFearGreed, FearGreedData } from "@/lib/api";
import { formatCurrency, formatPct } from "@/lib/formatters";
import { DEFAULT_CURRENCY, DEFAULT_CURRENCY_SYMBOL } from "@/lib/constants";
import { clsx } from "clsx";

export function GlobalStats() {
  const { data: global } = useSWR("global", getGlobalStats, { refreshInterval: 120_000 });
  const { data: fg }     = useSWR<FearGreedData>("feargreed", getFearGreed, { refreshInterval: 3_600_000 });

  const g = global as Record<string, Record<string, number>> | undefined;
  const cur = DEFAULT_CURRENCY.toLowerCase();

  const totalMcap   = g?.total_market_cap?.[cur] ?? 0;
  const mcapChange  = g?.market_cap_change_percentage_24h_usd ?? 0;
  const btcDom      = g?.market_cap_percentage?.btc ?? 0;
  const ethDom      = g?.market_cap_percentage?.eth ?? 0;
  const totalVol    = g?.total_volume?.[cur] ?? 0;
  const activeCrpyt = (g as unknown as Record<string, number>)?.active_cryptocurrencies ?? 0;

  const fgColor = (v: number) => {
    if (v >= 70) return "text-oracle-emerald";
    if (v >= 55) return "text-oracle-cyan";
    if (v >= 45) return "text-oracle-muted";
    if (v >= 30) return "text-oracle-amber";
    return "text-oracle-rose";
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard
        label="Total Market Cap"
        value={formatCurrency(totalMcap, DEFAULT_CURRENCY_SYMBOL, DEFAULT_CURRENCY)}
        sub={formatPct(mcapChange)}
        subColor={mcapChange >= 0 ? "text-emerald-400" : "text-rose-400"}
        accent="cyan"
      />
      <StatCard label="24h Volume"     value={formatCurrency(totalVol, DEFAULT_CURRENCY_SYMBOL, DEFAULT_CURRENCY)} />
      <StatCard label="BTC Dominance"  value={`${btcDom.toFixed(1)}%`} />
      <StatCard label="ETH Dominance"  value={`${ethDom.toFixed(1)}%`} />
      <StatCard label="Active Coins"   value={activeCrpyt.toLocaleString()} />
      <StatCard
        label="Fear & Greed"
        value={fg ? String(fg.value) : "–"}
        sub={fg?.label}
        subColor={fgColor(fg?.value ?? 50)}
        accent={fg && fg.value >= 55 ? "emerald" : fg && fg.value <= 40 ? "rose" : "muted"}
      />
    </div>
  );
}

function StatCard({
  label, value, sub, subColor, accent,
}: {
  label:     string;
  value:     string;
  sub?:      string;
  subColor?: string;
  accent?:   "cyan" | "emerald" | "rose" | "muted";
}) {
  const accentBar = {
    cyan:    "bg-cyan-400",
    emerald: "bg-emerald-400",
    rose:    "bg-rose-400",
    muted:   "bg-white/20",
  }[accent ?? "muted"];

  return (
    <div className="glass-static rounded-2xl p-5 flex flex-col gap-2">
      <div className={`w-6 h-0.5 rounded-full ${accentBar} opacity-70`} />
      <div className="font-mono text-lg font-semibold text-white leading-none tracking-tight">{value}</div>
      {sub && <div className={`font-mono text-xs font-medium ${subColor ?? "text-white/40"}`}>{sub}</div>}
      <div className="text-[11px] text-white/35 uppercase tracking-wider mt-auto">{label}</div>
    </div>
  );
}
