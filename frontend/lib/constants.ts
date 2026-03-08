// Resolve API base. Prefer explicit env; otherwise use a relative /api path so Next.js
// rewrite can proxy to the backend (avoids CORS and mixed-content issues).
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export const DEFAULT_CURRENCY        = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "USD";
export const DEFAULT_CURRENCY_SYMBOL = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL  ?? "$";
export const DEFAULT_TIMEZONE        = process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE ?? "Asia/Colombo";
export const COINGECKO_IMG           = process.env.NEXT_PUBLIC_COINGECKO_IMG    ?? "https://assets.coingecko.com/coins/images";

export const CURRENCIES = [
  { code: "LKR", symbol: "Rs",  name: "Sri Lankan Rupee" },
  { code: "USD", symbol: "$",   name: "US Dollar" },
  { code: "EUR", symbol: "€",   name: "Euro" },
  { code: "GBP", symbol: "£",   name: "British Pound" },
  { code: "INR", symbol: "₹",   name: "Indian Rupee" },
  { code: "JPY", symbol: "¥",   name: "Japanese Yen" },
  { code: "AUD", symbol: "A$",  name: "Australian Dollar" },
  { code: "SGD", symbol: "S$",  name: "Singapore Dollar" },
  { code: "MYR", symbol: "RM",  name: "Malaysian Ringgit" },
  { code: "CAD", symbol: "C$",  name: "Canadian Dollar" },
] as const;

export const TIMEZONES = [
  { tz: "Asia/Colombo",    label: "Colombo (UTC+5:30)" },
  { tz: "Asia/Kolkata",    label: "Mumbai (UTC+5:30)" },
  { tz: "UTC",             label: "UTC" },
  { tz: "America/New_York", label: "New York (EST/EDT)" },
  { tz: "Europe/London",   label: "London (GMT/BST)" },
  { tz: "Asia/Singapore",  label: "Singapore (UTC+8)" },
  { tz: "Asia/Tokyo",      label: "Tokyo (UTC+9)" },
] as const;

export const HISTORY_RANGES = [
  { label: "7D",   days: 7 },
  { label: "1M",   days: 30 },
  { label: "3M",   days: 90 },
  { label: "6M",   days: 180 },
  { label: "1Y",   days: 365 },
] as const;

export const PREDICT_RANGES = [1, 3, 7, 14, 30] as const;

export const TOP_COINS = [
  { id: "bitcoin",       symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum",      symbol: "ETH", name: "Ethereum" },
  { id: "binancecoin",   symbol: "BNB", name: "BNB" },
  { id: "solana",        symbol: "SOL", name: "Solana" },
  { id: "ripple",        symbol: "XRP", name: "XRP" },
  { id: "dogecoin",      symbol: "DOGE", name: "Dogecoin" },
  { id: "cardano",       symbol: "ADA", name: "Cardano" },
  { id: "avalanche-2",   symbol: "AVAX", name: "Avalanche" },
  { id: "polkadot",      symbol: "DOT", name: "Polkadot" },
  { id: "chainlink",     symbol: "LINK", name: "Chainlink" },
  { id: "litecoin",      symbol: "LTC", name: "Litecoin" },
  { id: "uniswap",       symbol: "UNI", name: "Uniswap" },
  { id: "polygon",       symbol: "MATIC", name: "Polygon" },
] as const;

export const SENTIMENT_COLORS = {
  bullish: { text: "text-oracle-emerald", bg: "bg-oracle-emerald/10", border: "border-oracle-emerald/30" },
  bearish: { text: "text-oracle-rose",    bg: "bg-oracle-rose/10",    border: "border-oracle-rose/30" },
  neutral: { text: "text-oracle-muted",   bg: "bg-oracle-muted/10",   border: "border-oracle-muted/30" },
} as const;

export const ORACLE_SCORE_COLORS = {
  strongBullish: "#10b981",
  bullish:       "#00d4ff",
  neutral:       "#6b7280",
  bearish:       "#f59e0b",
  strongBearish: "#f43f5e",
} as const;
