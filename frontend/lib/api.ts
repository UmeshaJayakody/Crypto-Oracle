import { API_BASE } from "./constants";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Prediction ────────────────────────────────────────────────────────────────
export interface PredictionRequest {
  coin_id?:         string;
  vs_currency?:     string;
  history_days?:    number;
  prediction_days?: number;
  interval?:        string;
  timezone?:        string;
  quantile_low?:    number;
  quantile_high?:   number;
  num_samples?:     number;
  news_hours_back?: number;
  include_reddit?:  boolean;
}

export interface PredictionPoint {
  timestamp:                  string;
  median:                     number;
  lower:                      number;
  upper:                      number;
  sentiment_adjusted_median:  number;
}

export interface OracleSignals {
  chronos_signal:    number;
  news_signal:       number;
  fear_greed_signal: number;
  reddit_signal:     number;
  combined_signal:   number;
  signal_strength:   string;
  direction:         string;
  confidence_pct:    number;
}

export interface PredictionStats {
  current_price:                number;
  predicted_high:               number;
  predicted_low:                number;
  predicted_median_final:       number;
  change_pct:                   number;
  change_pct_low:               number;
  change_pct_high:              number;
  avg_confidence_band:          number;
  estimated_direction_accuracy: string;
}

export interface NewsArticle {
  source:          string;
  title:           string;
  summary:         string;
  url:             string;
  published:       string;
  sentiment_score?: number | null;
  sentiment_label?: string | null;
  affected_coins?: string[] | null;
  impact_horizon:  string;
}

export interface SentimentAnalysis {
  sentiment_score:  number;
  confidence:       string;
  direction:        string;
  key_factors:      string[];
  summary:          string;
  articles_analyzed: number;
}

export interface FearGreedData {
  value:      number;
  label:      string;
  score:      number;
  prev_value?: number;
  change?:    number;
  trend?:     string;
}

export interface PredictionResponse {
  coin_id:         string;
  coin_name:       string;
  currency:        string;
  currency_symbol: string;
  timezone:        string;
  historical:      { timestamp: string; price: number }[];
  predictions:     PredictionPoint[];
  oracle_signals:  OracleSignals;
  stats:           PredictionStats;
  sentiment:       SentimentAnalysis;
  fear_greed:      FearGreedData;
  top_news:        NewsArticle[];
  model:           string;
  generated_at:    string;
  cached:          boolean;
}

export interface CoinInfo {
  id:               string;
  name:             string;
  symbol:           string;
  image?:           string;
  market_cap_rank?: number;
  current_price?:   Record<string, number>;
  market_cap?:      Record<string, number>;
  total_volume?:    Record<string, number>;
  price_change_24h?: number;
  price_change_7d?:  number;
  price_change_1h?:  number;
}

export interface CoinMarket {
  id:                              string;
  name:                            string;
  symbol:                          string;
  image:                           string;
  current_price:                   number;
  market_cap:                      number;
  market_cap_rank:                 number;
  total_volume:                    number;
  price_change_percentage_1h_in_currency: number;
  price_change_percentage_24h:     number;
  price_change_percentage_7d_in_currency: number;
  sparkline_in_7d:                 { price: number[] };
}

export async function runPrediction(req: PredictionRequest): Promise<PredictionResponse> {
  return apiFetch<PredictionResponse>("/api/predict/enhanced", {
    method: "POST",
    body:   JSON.stringify(req),
  });
}

export async function getTopCoins(
  currency: string = "usd",
  perPage: number = 20,
): Promise<CoinMarket[]> {
  return apiFetch(`/api/coins/list?vs_currency=${currency}&per_page=${perPage}`);
}

export async function getCoinInfo(coinId: string): Promise<CoinInfo> {
  return apiFetch(`/api/coins/${coinId}`);
}

export async function searchCoins(query: string): Promise<{ id: string; name: string; symbol: string; thumb: string }[]> {
  return apiFetch(`/api/coins/search?q=${encodeURIComponent(query)}`);
}

export async function getGlobalStats(): Promise<Record<string, unknown>> {
  return apiFetch("/api/coins/global");
}

export async function getCoinHistory(
  coinId: string,
  currency: string = "usd",
  days: number = 30,
): Promise<{ timestamp: string; price: number }[]> {
  return apiFetch(`/api/history/${coinId}?vs_currency=${currency}&days=${days}`);
}

export async function getCoinOHLCV(
  coinId: string,
  currency: string = "usd",
  days: number = 30,
): Promise<{ timestamp: string; open: number; high: number; low: number; close: number }[]> {
  return apiFetch(`/api/history/${coinId}?vs_currency=${currency}&days=${days}&ohlcv=true`);
}

export async function getNews(
  coinId: string,
  hoursBack: number = 12,
  limit: number = 20,
): Promise<NewsArticle[]> {
  return apiFetch(`/api/news/${coinId}?hours_back=${hoursBack}&limit=${limit}`);
}

export async function getSentiment(coinId: string): Promise<{
  coin_id:   string;
  sentiment: SentimentAnalysis;
  reddit:    Record<string, unknown>;
  timestamp: string;
}> {
  return apiFetch(`/api/sentiment/${coinId}`);
}

export async function getFearGreed(): Promise<FearGreedData> {
  return apiFetch("/api/sentiment/fear-greed/current");
}

export async function getSettings(): Promise<Record<string, unknown>> {
  return apiFetch("/api/settings");
}

export async function updateSettings(settings: Record<string, unknown>): Promise<Record<string, unknown>> {
  return apiFetch("/api/settings", { method: "PUT", body: JSON.stringify(settings) });
}

export async function getSystemStatus(): Promise<{
  gpu:   Record<string, unknown>;
  cache: Record<string, unknown>;
}> {
  return apiFetch("/api/settings/system");
}

export async function checkHealth(): Promise<{
  status: string;
  gpu:    Record<string, unknown>;
  model:  string;
}> {
  return apiFetch("/health");
}
