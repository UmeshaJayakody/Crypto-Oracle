"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { getTopCoins, CoinMarket } from "@/lib/api";
import { formatPct } from "@/lib/formatters";

export function TopMovers() {
  const [mode, setMode] = useState<"gainers" | "losers">("gainers");

  const { data: coins = [] } = useSWR<CoinMarket[]>(
    "coins:lkr:movers",
    () => getTopCoins("lkr", 100),
    { refreshInterval: 60_000 }
  );

  const sorted = [...coins].sort((a, b) =>
    mode === "gainers"
      ? b.price_change_percentage_24h - a.price_change_percentage_24h
      : a.price_change_percentage_24h - b.price_change_percentage_24h
  ).slice(0, 5);

  return (
    <div className="bg-oracle-card border border-oracle-border rounded-lg p-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-oracle-muted text-xs font-mono uppercase">Top Movers</span>
        <div className="ml-auto flex gap-1">
          {(["gainers", "losers"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2 py-0.5 rounded text-xs font-mono capitalize transition-colors ${
                mode === m
                  ? m === "gainers" ? "bg-oracle-emerald/20 text-oracle-emerald" : "bg-oracle-rose/20 text-oracle-rose"
                  : "text-oracle-muted hover:text-oracle-text"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((coin) => (
          <Link key={coin.id} href={`/coin/${coin.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src={coin.image} alt={coin.name} width={18} height={18} className="rounded-full" />
            <span className="text-oracle-text text-xs font-mono flex-1">{coin.symbol.toUpperCase()}</span>
            <span className={`font-mono text-xs ${coin.price_change_percentage_24h >= 0 ? "text-oracle-emerald" : "text-oracle-rose"}`}>
              {formatPct(coin.price_change_percentage_24h)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
