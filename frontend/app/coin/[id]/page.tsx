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
    ? "text-oracle-emerald" : "text-oracle-rose";

  const currentPrice = coinInfo?.current_price?.[currency] ?? 0;

  return (
    <div className="flex flex-col h-full">
      {/* Coin Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-oracle-border bg-oracle-surface">
        {coinInfo?.image && (
          <Image
            src={coinInfo.image}
            alt={coinInfo.name ?? id}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <div>
          <span className="font-display text-lg text-oracle-text">
            {coinInfo?.name ?? id}
          </span>
          <span className="ml-2 text-oracle-muted text-sm font-mono">
            {coinInfo?.symbol}
          </span>
        </div>

        <div className="ml-4 font-mono text-xl text-oracle-text">
          {formatCurrency(currentPrice, DEFAULT_CURRENCY_SYMBOL, DEFAULT_CURRENCY)}
        </div>
        <div className={`font-mono text-sm ${price24hColor}`}>
          {formatPct(coinInfo?.price_change_24h ?? 0)}
        </div>

        {coinInfo?.market_cap_rank && (
          <div className="ml-auto text-oracle-muted text-xs font-mono">
            Rank #{coinInfo.market_cap_rank}
          </div>
        )}
      </div>

      {/* Main 3-column layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Control Panel */}
        <div className="w-64 border-r border-oracle-border bg-oracle-surface overflow-y-auto">
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
          {/* Chart area */}
          <div className="flex-1 p-3">
            <CandlestickChart
              coinId={id}
              ohlcv={ohlcv}
              predictions={data?.predictions}
              currency={currency}
              currencySymbol={DEFAULT_CURRENCY_SYMBOL}
            />
          </div>

          {/* News panel */}
          <div className="h-72 border-t border-oracle-border overflow-y-auto">
            <NewsFeed coinId={id} />
          </div>
        </div>

        {/* Right: Oracle Panel */}
        <div className="w-72 border-l border-oracle-border bg-oracle-surface overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="space-y-3">
              <LoadingSkeleton className="h-40" />
              <LoadingSkeleton className="h-24" />
              <LoadingSkeleton className="h-32" />
            </div>
          )}

          {error && (
            <div className="bg-oracle-rose/10 border border-oracle-rose/30 rounded-lg p-3 text-oracle-rose text-sm">
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
              <div className="text-center">
                <p className="text-xs text-oracle-muted">
                  Educational only — not financial advice
                </p>
                <p className="text-xs text-oracle-muted mt-1">
                  Accuracy: ~{data.stats.estimated_direction_accuracy} direction
                </p>
              </div>
            </>
          )}

          {!loading && !data && !error && (
            <div className="text-center text-oracle-muted text-sm mt-8 space-y-2">
              <div className="text-4xl">◉</div>
              <p>Configure prediction parameters and run Oracle</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
