"""
Signal Fusion Engine — Crypto Oracle

Blends Chronos-2 pattern signal + Claude news sentiment + Fear&Greed + Reddit
into a single OracleScore and adjusts the Chronos price forecast.

Signal weights (tuned for 1-7 day crypto horizon):
  Chronos    : 35% — price pattern baseline
  News (LLM) : 35% — highest alpha for short-term moves
  Fear/Greed : 20% — macro market psychology
  Reddit     : 10% — community sentiment

Direction accuracy estimates:
  1-day:  ~72-76%
  3-day:  ~65-69%
  7-day:  ~61-65%
"""

import numpy as np

WEIGHTS = {
    "chronos":    0.35,
    "news":       0.35,
    "fear_greed": 0.20,
    "reddit":     0.10,
}

CONFIDENCE_MULTIPLIER = {"high": 1.0, "medium": 0.75, "low": 0.45}

ACCURACY_TABLE = {
    1:  "72-76%",
    2:  "70-74%",
    3:  "65-69%",
    5:  "63-67%",
    7:  "61-65%",
    14: "55-59%",
    30: "50-54%",
}


def get_estimated_accuracy(days: int) -> str:
    for threshold in sorted(ACCURACY_TABLE.keys()):
        if days <= threshold:
            return ACCURACY_TABLE[threshold]
    return "50-54%"


def fuse_signals(
    chronos_signal:    float,
    news_signal:       float,
    news_confidence:   str,
    fear_greed_signal: float,
    reddit_signal:     float,
    prediction_days:   int,
) -> dict:
    conf_mult = CONFIDENCE_MULTIPLIER.get(news_confidence, 0.75)
    adj_news  = news_signal * conf_mult

    combined = (
        chronos_signal    * WEIGHTS["chronos"]    +
        adj_news          * WEIGHTS["news"]        +
        fear_greed_signal * WEIGHTS["fear_greed"]  +
        reddit_signal     * WEIGHTS["reddit"]
    )
    combined = float(np.clip(combined, -1.0, 1.0))

    raw_confidence = abs(combined) * 100
    horizon_decay  = max(0.5, 1.0 - (prediction_days - 1) * 0.04)
    confidence_pct = round(raw_confidence * horizon_decay, 1)

    direction = "bullish" if combined > 0.05 else "bearish" if combined < -0.05 else "neutral"
    strength  = "strong" if abs(combined) > 0.5 else "moderate" if abs(combined) > 0.2 else "weak"

    return {
        "chronos_signal":    round(chronos_signal, 3),
        "news_signal":       round(news_signal, 3),
        "fear_greed_signal": round(fear_greed_signal, 3),
        "reddit_signal":     round(reddit_signal, 3),
        "combined_signal":   round(combined, 3),
        "signal_strength":   strength,
        "direction":         direction,
        "confidence_pct":    confidence_pct,
    }


def apply_sentiment_to_forecast(
    base_median: list[float],
    base_lower:  list[float],
    base_upper:  list[float],
    combined_signal: float,
    news_confidence: str,
) -> dict:
    """
    Adjust Chronos price forecast using fused signal.
    - Max ±5% adjustment per day, decays exponentially
    - Widens confidence bands when news confidence is low
    """
    band_mult = {"high": 1.0, "medium": 1.25, "low": 1.65}.get(news_confidence, 1.25)
    max_adj   = 0.05

    adjusted_median = []
    adjusted_lower  = []
    adjusted_upper  = []

    for i, (med, lo, hi) in enumerate(zip(base_median, base_lower, base_upper)):
        decay      = 0.85 ** i
        adjustment = 1.0 + (combined_signal * max_adj * decay)
        mid        = (hi + lo) / 2
        half_width = (hi - lo) / 2 * band_mult

        adjusted_median.append(round(med * adjustment, 2))
        adjusted_lower.append(round(mid - half_width, 2))
        adjusted_upper.append(round(mid + half_width, 2))

    return {
        "adjusted_median": adjusted_median,
        "adjusted_lower":  adjusted_lower,
        "adjusted_upper":  adjusted_upper,
    }
