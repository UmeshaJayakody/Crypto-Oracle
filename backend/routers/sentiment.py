from fastapi import APIRouter, Query
from services.news_aggregator import fetch_rss_articles, fetch_reddit_sentiment, filter_articles_for_coin
from services.claude_sentiment import analyze_news_with_claude
from services.fear_greed_service import get_fear_greed
from services.cache_service import get_cached, set_cached
from datetime import datetime
import pytz

router  = APIRouter()
COLOMBO = pytz.timezone("Asia/Colombo")


@router.get("/{coin_id}")
async def get_sentiment(
    coin_id:    str,
    hours_back: int  = Query(12, ge=1, le=48),
    reddit:     bool = Query(True),
):
    cache_key = f"sentiment:{coin_id}:{hours_back}:{reddit}"
    cached = get_cached(cache_key)
    if cached:
        return cached

    now_sl       = datetime.now(COLOMBO)
    articles_raw = await fetch_rss_articles(hours_back=hours_back)
    relevant     = filter_articles_for_coin(articles_raw, coin_id)

    reddit_data = await fetch_reddit_sentiment(coin_id) if reddit else {
        "signal": 0.0, "posts_found": 0, "avg_upvote_ratio": 0.5, "top_posts": []
    }

    sentiment = await analyze_news_with_claude(
        articles=relevant,
        coin_id=coin_id,
        reddit_signal=reddit_data["signal"],
        current_time=now_sl.strftime("%Y-%m-%d %H:%M SLST"),
    )

    result = {
        "coin_id":    coin_id,
        "sentiment":  sentiment,
        "reddit":     reddit_data,
        "timestamp":  now_sl.isoformat(),
    }
    set_cached(cache_key, result, ttl=600)
    return result


@router.get("/fear-greed/current")
async def fear_greed_index():
    cache_key = "feargreed:current"
    cached = get_cached(cache_key)
    if cached:
        return cached

    data = await get_fear_greed()
    set_cached(cache_key, data, ttl=3600)
    return data
