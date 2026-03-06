from fastapi import APIRouter, HTTPException
from models.schemas import EnhancedPredictionRequest, EnhancedPredictionResponse
from services.chronos_service import predict_prices
from services.news_aggregator import fetch_rss_articles, fetch_reddit_sentiment, filter_articles_for_coin
from services.claude_sentiment import analyze_news_with_claude
from services.fear_greed_service import get_fear_greed
from services.coingecko_service import fetch_market_chart, fetch_coin_info
from services.signal_fusion import fuse_signals, apply_sentiment_to_forecast, get_estimated_accuracy
from services.cache_service import get_cached, set_cached
from datetime import datetime, timedelta
import pytz
import asyncio
import hashlib
import json
import logging

router  = APIRouter()
COLOMBO = pytz.timezone("Asia/Colombo")
logger  = logging.getLogger(__name__)

CURRENCY_SYMBOLS = {
    "lkr": "Rs", "usd": "$", "eur": "€", "gbp": "£",
    "inr": "₹",  "jpy": "¥", "aud": "A$", "sgd": "S$",
    "myr": "RM", "thb": "฿", "cad": "C$",
}


@router.post("/enhanced", response_model=EnhancedPredictionResponse)
async def enhanced_prediction(req: EnhancedPredictionRequest):
    cache_key = "pred:" + hashlib.md5(
        json.dumps(req.model_dump(), sort_keys=True).encode()
    ).hexdigest()
    cached = get_cached(cache_key)
    if cached:
        cached["cached"] = True
        return cached

    now_sl = datetime.now(COLOMBO)

    async def _reddit():
        if req.include_reddit:
            return await fetch_reddit_sentiment(req.coin_id)
        return {"signal": 0.0, "posts_found": 0, "avg_upvote_ratio": 0.5, "top_posts": []}

    raw, coin_info, all_articles, reddit_data, fear_greed = await asyncio.gather(
        fetch_market_chart(req.coin_id, req.vs_currency, req.history_days),
        fetch_coin_info(req.coin_id),
        fetch_rss_articles(hours_back=req.news_hours_back),
        _reddit(),
        get_fear_greed(),
    )

    if len(raw) < 10:
        raise HTTPException(400, f"Insufficient price history: {len(raw)} points (need ≥10)")

    relevant_articles = filter_articles_for_coin(all_articles, req.coin_id)

    sentiment = await analyze_news_with_claude(
        articles=relevant_articles,
        coin_id=req.coin_id,
        reddit_signal=reddit_data["signal"],
        current_time=now_sl.strftime("%Y-%m-%d %H:%M SLST"),
    )

    prices = [p["price"] for p in raw]
    base   = predict_prices(
        historical_prices=prices,
        prediction_length=req.prediction_days,
        num_samples=req.num_samples,
        quantile_low=req.quantile_low,
        quantile_high=req.quantile_high,
    )

    oracle = fuse_signals(
        chronos_signal=    base["chronos_signal"],
        news_signal=       sentiment["sentiment_score"],
        news_confidence=   sentiment["confidence"],
        fear_greed_signal= fear_greed["score"],
        reddit_signal=     reddit_data["signal"],
        prediction_days=   req.prediction_days,
    )

    adjusted = apply_sentiment_to_forecast(
        base_median=     base["median"],
        base_lower=      base["lower"],
        base_upper=      base["upper"],
        combined_signal= oracle["combined_signal"],
        news_confidence= sentiment["confidence"],
    )

    tz      = pytz.timezone(req.timezone)
    step    = timedelta(hours=1) if req.interval == "hourly" else timedelta(days=1)
    last_ts = raw[-1]["timestamp"]
    curr_price = prices[-1]

    predictions = []
    for i in range(req.prediction_days):
        ts = (last_ts + step * (i + 1)).astimezone(tz).isoformat()
        predictions.append({
            "timestamp":                  ts,
            "median":                     round(base["median"][i], 2),
            "lower":                      round(base["lower"][i], 2),
            "upper":                      round(base["upper"][i], 2),
            "sentiment_adjusted_median":  adjusted["adjusted_median"][i],
        })

    historical_local = [
        {
            "timestamp": p["timestamp"].astimezone(tz).isoformat(),
            "price":     round(p["price"], 2),
        }
        for p in raw
    ]

    adj_final = adjusted["adjusted_median"][-1]
    symbol    = CURRENCY_SYMBOLS.get(req.vs_currency.lower(), req.vs_currency.upper())

    article_scores = {s["title"][:60]: s for s in sentiment.get("article_scores", [])}
    top_news = []
    for a in relevant_articles[:8]:
        sd = article_scores.get(a["title"][:60], {})
        top_news.append({
            "source":          a["source"],
            "title":           a["title"],
            "summary":         a["summary"][:300],
            "url":             a["url"],
            "published":       a["published"],
            "sentiment_score": sd.get("score", 0.0),
            "sentiment_label": sd.get("label", "neutral"),
            "affected_coins":  sd.get("affected_coins", []),
            "impact_horizon":  sd.get("impact_horizon", "short"),
        })

    result = {
        "coin_id":         req.coin_id,
        "coin_name":       coin_info.get("name", req.coin_id.title()),
        "currency":        req.vs_currency.upper(),
        "currency_symbol": symbol,
        "timezone":        req.timezone,
        "historical":      historical_local,
        "predictions":     predictions,
        "oracle_signals":  oracle,
        "stats": {
            "current_price":          round(curr_price, 2),
            "predicted_high":         round(max(p["upper"]  for p in predictions), 2),
            "predicted_low":          round(min(p["lower"]  for p in predictions), 2),
            "predicted_median_final": round(adj_final, 2),
            "change_pct":             round((adj_final - curr_price) / curr_price * 100, 2),
            "change_pct_low":         round(
                (min(p["lower"] for p in predictions) - curr_price) / curr_price * 100, 2
            ),
            "change_pct_high":        round(
                (max(p["upper"] for p in predictions) - curr_price) / curr_price * 100, 2
            ),
            "avg_confidence_band":    round(
                sum(p["upper"] - p["lower"] for p in predictions) / len(predictions), 2
            ),
            "estimated_direction_accuracy": get_estimated_accuracy(req.prediction_days),
        },
        "sentiment":    {k: v for k, v in sentiment.items() if k not in ("article_scores",)},
        "fear_greed":   fear_greed,
        "reddit":       reddit_data,
        "top_news":     top_news,
        "model":        "chronos-2 + claude-haiku-sentiment",
        "generated_at": now_sl.isoformat(),
        "cached":       False,
    }

    set_cached(cache_key, result, ttl=3600)
    return result
