"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { getTopCoins, CoinMarket } from "@/lib/api";
import { formatLKR, formatPct } from "@/lib/formatters";
import { TOP_COINS } from "@/lib/constants";

export function WatchList() {
  const [watchIds, setWatchIds] = useState<string[]>(["bitcoin", "ethereum", "solana"]);

  const { data: coins = [] } = useSWR<CoinMarket[]>(
    "coins:lkr:small",
    () => getTopCoins("lkr", 20),
    { refreshInterval: 60_000 }
  );

  const watched = coins.filter((c) => watchIds.includes(c.id));

  const toggle = (id: string) => {
    setWatchIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  };

  return (
    <div className="p-2">
      <div className="flex items-center justify-between px-1 py-2">
        <span className="text-oracle-muted text-xs font-mono uppercase tracking-wider">Watchlist</span>
      </div>

      <div className="space-y-1">
        {watched.map((coin) => (
          <Link
            key={coin.id}
            href={`/coin/${coin.id}`}
            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-oracle-card transition-colors group"
          >
            <Image src={coin.image} alt={coin.name} width={16} height={16} className="rounded-full" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-mono text-oracle-text truncate">{coin.symbol.toUpperCase()}</div>
              <div className="text-xs font-mono text-oracle-muted truncate">{formatLKR(coin.current_price)}</div>
            </div>
            <div className={`text-xs font-mono ${coin.price_change_percentage_24h >= 0 ? "text-oracle-emerald" : "text-oracle-rose"}`}>
              {formatPct(coin.price_change_percentage_24h)}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-2 px-1">
        <div className="text-oracle-muted text-xs font-mono uppercase tracking-wider mb-1">Quick Add</div>
        <div className="flex flex-wrap gap-1">
          {TOP_COINS.slice(0, 6).map((c) => (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              className={`px-1.5 py-0.5 rounded text-xs font-mono transition-colors ${
                watchIds.includes(c.id)
                  ? "bg-oracle-cyan/20 text-oracle-cyan"
                  : "bg-oracle-card text-oracle-muted hover:text-oracle-text"
              }`}
            >
              {c.symbol}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
