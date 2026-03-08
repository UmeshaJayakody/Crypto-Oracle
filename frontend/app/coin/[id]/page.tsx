"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { getCoinInfo, getCoinOHLCV, CoinInfo } from "@/lib/api";
import { usePrediction } from "@/lib/hooks/usePrediction";
import { formatCurrency, formatPct } from "@/lib/formatters";
import { DEFAULT_CURRENCY, DEFAULT_CURRENCY_SYMBOL } from "@/lib/constants";
import { PredictionPanel } from "@/components/prediction/PredictionPanel";
import { OracleScore } from "@/components/prediction/OracleScore";
import { SignalBreakdown } from "@/components/prediction/SignalBreakdown";
import { PredictionStats } from "@/components/prediction/PredictionStats";
import { CandlestickChart } from "@/components/chart/CandlestickChart";
import { NewsFeed } from "@/components/news/NewsFeed";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function CoinPage() {
  const routeParams = useParams<{ id: string | string[] }>();
  const id = Array.isArray(routeParams.id) ? routeParams.id[0] : routeParams.id;
  const [coinInfo, setCoinInfo] = useState<CoinInfo | null>(null);
  const [ohlcv,    setOhlcv]   = useState<{ timestamp: string; open: number; high: number; low: number; close: number }[]>([]);
  const [currency] = useState(DEFAULT_CURRENCY.toLowerCase());
  const [historyDays, setHistoryDays] = useState(30);

  const { data, loading, error, status, predict } = usePrediction();

  useEffect(() => {
    getCoinInfo(id).then(setCoinInfo).catch(console.error);
  }, [id]);

  useEffect(() => {
    getCoinOHLCV(id, currency, historyDays).then(setOhlcv).catch(console.error);
  }, [id, currency, historyDays]);

  const price24hColor = (coinInfo?.price_change_24h ?? 0) >= 0
    ? "text-emerald-400" : "text-rose-400";

  const currentPrice = coinInfo?.current_price?.[currency] ?? 0;

  return (
    <div className="flex flex-col h-full">
      {/* Coin Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.06]" style={{ background: "rgba(255,255,255,0.015)" }}>
        {coinInfo?.image && (
          <Image
            src={coinInfo.image}
            alt={coinInfo.name ?? id}
            width={34}
            height={34}
            className="rounded-full ring-1 ring-white/10"
          />
        )}
        <div className="flex items-baseline gap-2">
          <span className="font-display text-lg text-white/90 font-semibold">
            {coinInfo?.name ?? id}
          </span>
          <span className="text-white/35 text-xs font-mono uppercase">
            {coinInfo?.symbol}
          </span>
        </div>

        <div className="ml-3 font-mono text-xl font-semibold text-white/90 tabular-nums">
          {formatCurrency(currentPrice, DEFAULT_CURRENCY_SYMBOL, DEFAULT_CURRENCY)}
        </div>
        <div className={`font-mono text-sm font-medium tabular-nums ${price24hColor}`}>
          {formatPct(coinInfo?.price_change_24h ?? 0)}
        </div>

        {coinInfo?.market_cap_rank && (
          <div className="ml-auto px-2.5 py-1 rounded-lg border border-white/[0.08] text-white/30 text-[10px] font-mono">
            Rank #{coinInfo.market_cap_rank}
          </div>
        )}
      </div>

      {/* Main 3-column layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Control Panel */}
        <div className="w-64 border-r border-white/[0.05] overflow-y-auto" style={{ background: "rgba(255,255,255,0.012)" }}>
          <PredictionPanel
            coinId={id}
            currency={currency}
            historyDays={historyDays}
            onHistoryDaysChange={setHistoryDays}
            onPredict={predict}
            loading={loading}
            status={status}
          />
        </div>

        {/* Center: Chart + News */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-4">
            <CandlestickChart
              coinId={id}
              ohlcv={ohlcv}
              predictions={data?.predictions}
              signals={data?.oracle_signals}
              currency={currency}
              currencySymbol={DEFAULT_CURRENCY_SYMBOL}
            />
          </div>

          <div className="h-72 border-t border-white/[0.05] overflow-y-auto">
            <NewsFeed coinId={id} />
          </div>
        </div>

        {/* Right: Oracle Panel */}
        <div className="w-72 border-l border-white/[0.05] overflow-y-auto p-4 space-y-4" style={{ background: "rgba(255,255,255,0.012)" }}>
          {loading && (
            <div className="space-y-3">
              <LoadingSkeleton className="h-40" />
              <LoadingSkeleton className="h-24" />
              <LoadingSkeleton className="h-32" />
            </div>
          )}

          {error && (
            <div className="glass rounded-xl p-4 border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          )}

          {data && (
            <>
              <OracleScore signals={data.oracle_signals} />
              <SignalBreakdown signals={data.oracle_signals} />
              <PredictionStats
                stats={data.stats}
                currency={data.currency}
                symbol={data.currency_symbol}
              />
              <p className="text-center text-[10px] font-mono text-white/20 px-2">
                Educational only · ~{data.stats.estimated_direction_accuracy} direction accuracy
              </p>
            </>
          )}

          {!loading && !data && !error && (
            <div className="text-center text-white/25 mt-12 space-y-3">
              <div className="text-4xl opacity-40">◉</div>
              <p className="text-xs font-mono">Configure parameters and run Oracle</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
