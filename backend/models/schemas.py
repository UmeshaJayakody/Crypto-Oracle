from pydantic import BaseModel, Field
from typing import Optional


# ── Request ───────────────────────────────────────────────────────────────────
class EnhancedPredictionRequest(BaseModel):
    coin_id:         str   = Field("bitcoin")
    vs_currency:     str   = Field("lkr")
    history_days:    int   = Field(30,  ge=7,   le=365)
    prediction_days: int   = Field(7,   ge=1,   le=60)
    interval:        str   = Field("daily")
    timezone:        str   = Field("Asia/Colombo")
    quantile_low:    float = Field(0.1,  ge=0.01, le=0.49)
    quantile_high:   float = Field(0.9,  ge=0.51, le=0.99)
    num_samples:     int   = Field(20,   ge=10,   le=100)
    news_hours_back: int   = Field(12,   ge=1,    le=48)
    include_reddit:  bool  = Field(True)


# ── News ──────────────────────────────────────────────────────────────────────
class NewsArticle(BaseModel):
    source: str
    title: str
    summary: str
    url: str
    published: str
    sentiment_score: float
    sentiment_label: str
    affected_coins: list[str]
    impact_horizon: str


class SentimentAnalysis(BaseModel):
    sentiment_score: float
    confidence: str
    direction: str
    key_factors: list[str]
    summary: str
    articles_analyzed: int


class FearGreedData(BaseModel):
    value: int
    label: str
    score: float


# ── Prediction ────────────────────────────────────────────────────────────────
class PredictionPoint(BaseModel):
    timestamp: str
    median: float
    lower: float
    upper: float
    sentiment_adjusted_median: float


class OracleSignals(BaseModel):
    chronos_signal: float
    news_signal: float
    fear_greed_signal: float
    reddit_signal: float
    combined_signal: float
    signal_strength: str
    direction: str
    confidence_pct: float


class PredictionStats(BaseModel):
    current_price: float
    predicted_high: float
    predicted_low: float
    predicted_median_final: float
    change_pct: float
    change_pct_low: float
    change_pct_high: float
    avg_confidence_band: float
    estimated_direction_accuracy: str


class EnhancedPredictionResponse(BaseModel):
    coin_id: str
    coin_name: str
    currency: str
    currency_symbol: str
    timezone: str
    historical: list[dict]
    predictions: list[PredictionPoint]
    oracle_signals: OracleSignals
    stats: PredictionStats
    sentiment: SentimentAnalysis
    fear_greed: FearGreedData
    top_news: list[NewsArticle]
    model: str
    generated_at: str
    cached: bool
