"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { getTopCoins, CoinMarket } from "@/lib/api";
import { formatCurrency, formatPct } from "@/lib/formatters";
import { TOP_COINS, DEFAULT_CURRENCY, DEFAULT_CURRENCY_SYMBOL } from "@/lib/constants";

export function WatchList() {
  const [watchIds, setWatchIds] = useState<string[]>(["bitcoin", "ethereum", "solana"]);
  const cur = DEFAULT_CURRENCY.toLowerCase();

  const { data: coins = [] } = useSWR<CoinMarket[]>(
    `coins:${cur}:small`,
    () => getTopCoins(cur, 20),
    { refreshInterval: 60_000 }
  );

  const watched = coins.filter((c) => watchIds.includes(c.id));

  const toggle = (id: string) => {
    setWatchIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  };

  return (
    <div className="p-4">
      <p className="text-[10px] font-mono text-white/25 uppercase tracking-[0.2em] px-1 py-2">Watchlist</p>

      <div className="space-y-0.5">
        {watched.map((coin) => (
          <Link
            key={coin.id}
            href={`/coin/${coin.id}`}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/[0.05] transition-colors group"
          >
            <Image src={coin.image} alt={coin.name} width={18} height={18} className="rounded-full" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-mono text-white/70 group-hover:text-white/90 transition-colors">{coin.symbol.toUpperCase()}</div>
              <div className="text-[10px] font-mono text-white/30 tabular-nums">{formatCurrency(coin.current_price, DEFAULT_CURRENCY_SYMBOL, DEFAULT_CURRENCY)}</div>
            </div>
            <div className={`text-[11px] font-mono font-medium tabular-nums ${
              coin.price_change_percentage_24h >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}>
              {formatPct(coin.price_change_percentage_24h)}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 px-1">
        <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] mb-2">Quick Add</p>
        <div className="flex flex-wrap gap-1.5">
          {TOP_COINS.slice(0, 6).map((c) => (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all ${
                watchIds.includes(c.id)
                  ? "bg-cyan-400/15 text-cyan-400 border border-cyan-400/30"
                  : "bg-white/[0.04] text-white/35 border border-white/[0.08] hover:text-white/60"
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
