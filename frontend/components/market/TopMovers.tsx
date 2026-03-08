"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { getTopCoins, CoinMarket } from "@/lib/api";
import { formatPct } from "@/lib/formatters";
import { DEFAULT_CURRENCY } from "@/lib/constants";

export function TopMovers() {
  const [mode, setMode] = useState<"gainers" | "losers">("gainers");
  const cur = DEFAULT_CURRENCY.toLowerCase();

  const { data: coins = [] } = useSWR<CoinMarket[]>(
    `coins:${cur}:movers`,
    () => getTopCoins(cur, 100),
    { refreshInterval: 60_000 }
  );

  const sorted = [...coins].sort((a, b) =>
    mode === "gainers"
      ? b.price_change_percentage_24h - a.price_change_percentage_24h
      : a.price_change_percentage_24h - b.price_change_percentage_24h
  ).slice(0, 5);

  return (
    <div className="glass-static rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-mono text-white/30 uppercase tracking-wider">Top Movers</span>
        <div className="flex gap-1">
          {(["gainers", "losers"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono capitalize transition-colors ${
                mode === m
                  ? m === "gainers" ? "bg-emerald-400/15 text-emerald-400 border border-emerald-400/30"
                                   : "bg-rose-400/15 text-rose-400 border border-rose-400/30"
                  : "text-white/30 hover:text-white/65"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map((coin) => (
          <Link key={coin.id} href={`/coin/${coin.id}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Image src={coin.image} alt={coin.name} width={20} height={20} className="rounded-full" />
            <span className="text-white/65 text-xs font-mono flex-1">{coin.symbol.toUpperCase()}</span>
            <span className={`font-mono text-xs font-medium tabular-nums ${
              coin.price_change_percentage_24h >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}>
              {formatPct(coin.price_change_percentage_24h)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
