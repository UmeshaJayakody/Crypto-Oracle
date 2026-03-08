"use client";

import { useState } from "react";
import useSWR from "swr";
import { getTopCoins, CoinMarket } from "@/lib/api";
import { CoinRow } from "./CoinRow";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { DEFAULT_CURRENCY } from "@/lib/constants";

type SortKey = "rank" | "price" | "change_24h" | "market_cap" | "volume";

export function MarketOverview() {
  const [sortKey, setSortKey]   = useState<SortKey>("rank");
  const [sortAsc, setSortAsc]   = useState(true);
  const currency                = DEFAULT_CURRENCY.toLowerCase();

  const { data: coins = [], isLoading } = useSWR<CoinMarket[]>(
    `coins:${currency}`,
    () => getTopCoins(currency, 100),
    { refreshInterval: 60_000 }
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((p) => !p);
    else { setSortKey(key); setSortAsc(false); }
  };

  const sorted = [...coins].sort((a, b) => {
    let av = 0, bv = 0;
    if (sortKey === "rank")       { av = a.market_cap_rank; bv = b.market_cap_rank; }
    if (sortKey === "price")      { av = a.current_price;   bv = b.current_price; }
    if (sortKey === "change_24h") { av = a.price_change_percentage_24h; bv = b.price_change_percentage_24h; }
    if (sortKey === "market_cap") { av = a.market_cap; bv = b.market_cap; }
    if (sortKey === "volume")     { av = a.total_volume; bv = b.total_volume; }
    return sortAsc ? av - bv : bv - av;
  });

  const th = (label: string, key: SortKey) => (
    <th
      key={key}
      onClick={() => handleSort(key)}
      className="px-4 py-3 text-right text-[11px] font-mono text-white/30 uppercase tracking-wider cursor-pointer hover:text-white/65 transition-colors select-none"
    >
      {label}{sortKey === key ? (sortAsc ? " ▲" : " ▼") : ""}
    </th>
  );

  return (
    <div className="glass-static rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <h2 className="font-display text-lg text-white/90 tracking-wide">Market Overview</h2>
        <span className="text-white/30 text-[11px] font-mono">
          Top {coins.length} · auto-refreshes
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.05]">
              <th className="px-5 py-3 text-left text-[11px] font-mono text-white/30 uppercase tracking-wider w-10">#</th>
              <th className="px-4 py-3 text-left text-[11px] font-mono text-white/30 uppercase tracking-wider">Coin</th>
              {th("Price",      "price")}
              {th("1h",         "rank")}
              {th("24h",        "change_24h")}
              <th className="px-4 py-3 text-right text-[11px] font-mono text-white/30 uppercase tracking-wider">7d</th>
              {th("Market Cap", "market_cap")}
              <th className="px-4 py-3 text-left  text-[11px] font-mono text-white/30 uppercase tracking-wider">7d Chart</th>
              <th className="px-4 py-3 w-24" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-white/[0.04]">
                  <td colSpan={9} className="px-5 py-3">
                    <LoadingSkeleton className="h-8" />
                  </td>
                </tr>
              ))
            ) : (
              sorted.map((coin, i) => (
                <CoinRow key={coin.id} coin={coin} rank={coin.market_cap_rank ?? i + 1} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
