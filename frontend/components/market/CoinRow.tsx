import Link from "next/link";
import Image from "next/image";
import { CoinMarket } from "@/lib/api";
import { formatCurrency, formatPct } from "@/lib/formatters";
import { DEFAULT_CURRENCY, DEFAULT_CURRENCY_SYMBOL } from "@/lib/constants";
import { clsx } from "clsx";

interface Props {
  coin:  CoinMarket;
  rank:  number;
}

function PctCell({ value }: { value?: number }) {
  const v = value ?? 0;
  return (
    <span className={clsx("font-mono text-xs", v >= 0 ? "text-oracle-emerald" : "text-oracle-rose")}>
      {formatPct(v)}
    </span>
  );
}

function Sparkline({ prices }: { prices: number[] }) {
  if (!prices?.length) return <span className="text-oracle-muted text-xs">—</span>;

  const w = 60, h = 24;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const points = prices
    .map((p, i) => `${(i / (prices.length - 1)) * w},${h - ((p - min) / range) * h}`)
    .join(" ");

  const isUp = prices[prices.length - 1] >= prices[0];

  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? "#10b981" : "#f43f5e"}
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function CoinRow({ coin, rank }: Props) {
  return (
    <tr className="border-b border-oracle-border hover:bg-oracle-card/50 transition-colors group">
      <td className="px-3 py-2.5 text-oracle-muted text-xs font-mono w-8">{rank}</td>
      <td className="px-3 py-2.5">
        <Link href={`/coin/${coin.id}`} className="flex items-center gap-2 group-hover:text-oracle-cyan transition-colors">
          <Image src={coin.image} alt={coin.name} width={20} height={20} className="rounded-full" />
          <span className="text-oracle-text text-sm font-medium">{coin.name}</span>
          <span className="text-oracle-muted text-xs font-mono uppercase">{coin.symbol}</span>
        </Link>
      </td>
      <td className="px-3 py-2.5 text-right">
        <span className="font-mono text-sm text-oracle-text">{formatCurrency(coin.current_price, DEFAULT_CURRENCY_SYMBOL, DEFAULT_CURRENCY)}</span>
      </td>
      <td className="px-3 py-2.5 text-right"><PctCell value={coin.price_change_percentage_1h_in_currency} /></td>
      <td className="px-3 py-2.5 text-right"><PctCell value={coin.price_change_percentage_24h} /></td>
      <td className="px-3 py-2.5 text-right"><PctCell value={coin.price_change_percentage_7d_in_currency} /></td>
      <td className="px-3 py-2.5 text-right">
        <span className="font-mono text-xs text-oracle-muted">{formatCurrency(coin.market_cap, DEFAULT_CURRENCY_SYMBOL, DEFAULT_CURRENCY)}</span>
      </td>
      <td className="px-3 py-2.5">
        <Sparkline prices={coin.sparkline_in_7d?.price ?? []} />
      </td>
      <td className="px-3 py-2.5">
        <Link
          href={`/coin/${coin.id}`}
          className="px-2.5 py-1 text-xs font-mono rounded border border-oracle-cyan/30 text-oracle-cyan hover:bg-oracle-cyan/10 transition-colors"
        >
          Predict
        </Link>
      </td>
    </tr>
  );
}
