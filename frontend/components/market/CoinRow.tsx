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
  const color = v >= 0 ? "text-emerald-400" : "text-rose-400";
  const bg    = v >= 0 ? "bg-emerald-400/10" : "bg-rose-400/10";
  return (
    <span className={`inline-block font-mono text-xs px-1.5 py-0.5 rounded ${color} ${bg} tabular-nums`}>
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
    <tr className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors group cursor-pointer">
      <td className="px-5 py-3.5 text-white/30 text-xs font-mono w-10 tabular-nums">{rank}</td>
      <td className="px-4 py-3.5">
        <Link href={`/coin/${coin.id}`} className="flex items-center gap-2.5 group-hover:opacity-90 transition-opacity">
          <Image src={coin.image} alt={coin.name} width={22} height={22} className="rounded-full" />
          <span className="text-white/90 text-sm font-medium">{coin.name}</span>
          <span className="text-white/30 text-xs font-mono uppercase">{coin.symbol}</span>
        </Link>
      </td>
      <td className="px-4 py-3.5 text-right">
        <span className="font-mono text-sm text-white/85 font-medium tabular-nums">
          {formatCurrency(coin.current_price, DEFAULT_CURRENCY_SYMBOL, DEFAULT_CURRENCY)}
        </span>
      </td>
      <td className="px-4 py-3.5 text-right"><PctCell value={coin.price_change_percentage_1h_in_currency} /></td>
      <td className="px-4 py-3.5 text-right"><PctCell value={coin.price_change_percentage_24h} /></td>
      <td className="px-4 py-3.5 text-right"><PctCell value={coin.price_change_percentage_7d_in_currency} /></td>
      <td className="px-4 py-3.5 text-right">
        <span className="font-mono text-xs text-white/35 tabular-nums">
          {formatCurrency(coin.market_cap, DEFAULT_CURRENCY_SYMBOL, DEFAULT_CURRENCY)}
        </span>
      </td>
      <td className="px-4 py-3.5"><Sparkline prices={coin.sparkline_in_7d?.price ?? []} /></td>
      <td className="px-4 py-3.5">
        <Link
          href={`/coin/${coin.id}`}
          className="px-3 py-1.5 text-[11px] font-mono rounded-lg border border-white/[0.12] text-white/50 hover:border-cyan-400/50 hover:text-cyan-400 transition-all"
        >
          Predict
        </Link>
      </td>
    </tr>
  );
}
