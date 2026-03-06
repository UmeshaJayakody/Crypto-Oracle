"use client";

import { useState } from "react";
import useSWR from "swr";
import { getTopCoins, CoinMarket } from "@/lib/api";
import { CoinRow } from "./CoinRow";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

type SortKey = "rank" | "price" | "change_24h" | "market_cap" | "volume";

export function MarketOverview() {
  const [sortKey, setSortKey]   = useState<SortKey>("rank");
  const [sortAsc, setSortAsc]   = useState(true);
  const [currency]              = useState("lkr");

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
      className="px-3 py-2 text-right text-oracle-muted text-xs font-mono uppercase tracking-wider cursor-pointer hover:text-oracle-cyan transition-colors select-none"
    >
      {label} {sortKey === key ? (sortAsc ? "▲" : "▼") : ""}
    </th>
  );

  return (
    <div className="bg-oracle-card border border-oracle-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-oracle-border flex items-center justify-between">
        <h2 className="font-display text-base text-oracle-text">Market Overview</h2>
        <span className="text-oracle-muted text-xs font-mono">
          Top {coins.length} coins by market cap · Auto-refreshes
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-oracle-border">
              <th className="px-3 py-2 text-left text-oracle-muted text-xs font-mono uppercase tracking-wider">#</th>
              <th className="px-3 py-2 text-left text-oracle-muted text-xs font-mono uppercase tracking-wider">Coin</th>
              {th("Price", "price")}
              {th("1h%", "rank")}
              {th("24h%", "change_24h")}
              <th className="px-3 py-2 text-right text-oracle-muted text-xs font-mono">7d%</th>
              {th("Market Cap", "market_cap")}
              <th className="px-3 py-2 text-left text-oracle-muted text-xs font-mono">7d Chart</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-oracle-border">
                  <td colSpan={9} className="px-3 py-2">
                    <LoadingSkeleton className="h-7" />
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
