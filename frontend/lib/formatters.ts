export const COLOMBO_TZ = "Asia/Colombo";

export function formatLKR(value: number): string {
  if (value >= 1_000_000_000_000) return `Rs ${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000)     return `Rs ${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000)         return `Rs ${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000)             return `Rs ${(value / 1_000).toFixed(1)}K`;
  return `Rs ${value.toFixed(2)}`;
}

export function formatCurrency(value: number, symbol: string, currency: string): string {
  if (currency.toUpperCase() === "LKR") return formatLKR(value);
  if (value >= 1_000_000_000) return `${symbol}${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000)     return `${symbol}${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000)         return `${symbol}${(value / 1_000).toFixed(1)}K`;
  return `${symbol}${value.toFixed(2)}`;
}

export function formatPrice(value: number, symbol: string = "$"): string {
  if (value >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000)     return `${symbol}${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return `${symbol}${value.toFixed(2)}`;
}

export function formatPct(value: number, digits: number = 2): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function formatDateSL(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-LK", {
    timeZone: COLOMBO_TZ,
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
}

export function formatTimeSL(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-LK", {
    timeZone: COLOMBO_TZ,
    hour:   "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDateTimeSL(isoString: string): string {
  return `${formatDateSL(isoString)} ${formatTimeSL(isoString)} SLST`;
}

export function nowSL(): string {
  return new Date().toLocaleTimeString("en-LK", {
    timeZone: COLOMBO_TZ,
    hour:   "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
