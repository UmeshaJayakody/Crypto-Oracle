from fastapi import APIRouter, Query
from services.news_aggregator import fetch_rss_articles, filter_articles_for_coin
from services.cache_service import get_cached, set_cached

router = APIRouter()


@router.get("/{coin_id}")
async def get_news(
    coin_id:    str,
    hours_back: int  = Query(12, ge=1, le=72),
    limit:      int  = Query(20, ge=1, le=50),
):
    cache_key = f"news:{coin_id}:{hours_back}"
    cached = get_cached(cache_key)
    if cached:
        return cached[:limit]

    all_articles = await fetch_rss_articles(hours_back=hours_back)
    relevant     = filter_articles_for_coin(all_articles, coin_id)

    # Strip pub_dt (not serializable)
    clean = [{k: v for k, v in a.items() if k != "pub_dt"} for a in relevant]
    set_cached(cache_key, clean, ttl=300)
    return clean[:limit]


@router.get("/")
async def get_all_news(
    hours_back: int = Query(12, ge=1, le=72),
    limit:      int = Query(30, ge=1, le=100),
):
    cache_key = f"news:all:{hours_back}"
    cached = get_cached(cache_key)
    if cached:
        return cached[:limit]

    articles = await fetch_rss_articles(hours_back=hours_back)
    clean    = [{k: v for k, v in a.items() if k != "pub_dt"} for a in articles]
    set_cached(cache_key, clean, ttl=300)
    return clean[:limit]
