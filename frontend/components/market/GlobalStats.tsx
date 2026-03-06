"use client";

import useSWR from "swr";
import { getGlobalStats, getFearGreed, FearGreedData } from "@/lib/api";
import { formatLKR, formatPct } from "@/lib/formatters";
import { clsx } from "clsx";

export function GlobalStats() {
  const { data: global } = useSWR("global", getGlobalStats, { refreshInterval: 120_000 });
  const { data: fg }     = useSWR<FearGreedData>("feargreed", getFearGreed, { refreshInterval: 3_600_000 });

  const g = global as Record<string, Record<string, number>> | undefined;

  const totalMcap   = g?.total_market_cap?.lkr ?? 0;
  const mcapChange  = g?.market_cap_change_percentage_24h_usd ?? 0;
  const btcDom      = g?.market_cap_percentage?.btc ?? 0;
  const ethDom      = g?.market_cap_percentage?.eth ?? 0;
  const totalVol    = g?.total_volume?.lkr ?? 0;
  const activeCrpyt = (g as unknown as Record<string, number>)?.active_cryptocurrencies ?? 0;

  const fgColor = (v: number) => {
    if (v >= 70) return "text-oracle-emerald";
    if (v >= 55) return "text-oracle-cyan";
    if (v >= 45) return "text-oracle-muted";
    if (v >= 30) return "text-oracle-amber";
    return "text-oracle-rose";
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatCard label="Total Market Cap" value={formatLKR(totalMcap)} sub={formatPct(mcapChange)} subColor={mcapChange >= 0 ? "text-oracle-emerald" : "text-oracle-rose"} />
      <StatCard label="24h Volume" value={formatLKR(totalVol)} />
      <StatCard label="BTC Dominance" value={`${btcDom.toFixed(1)}%`} />
      <StatCard label="ETH Dominance" value={`${ethDom.toFixed(1)}%`} />
      <StatCard label="Active Coins" value={activeCrpyt.toLocaleString()} />
      <StatCard
        label="Fear & Greed"
        value={fg ? String(fg.value) : "—"}
        sub={fg?.label}
        subColor={fgColor(fg?.value ?? 50)}
      />
    </div>
  );
}

function StatCard({
  label, value, sub, subColor,
}: {
  label:     string;
  value:     string;
  sub?:      string;
  subColor?: string;
}) {
  return (
    <div className="bg-oracle-card border border-oracle-border rounded-lg px-3 py-2.5">
      <div className="text-oracle-muted text-xs font-mono mb-1">{label}</div>
      <div className="font-mono text-sm font-semibold text-oracle-text">{value}</div>
      {sub && <div className={`font-mono text-xs mt-0.5 ${subColor ?? "text-oracle-muted"}`}>{sub}</div>}
    </div>
  );
}
