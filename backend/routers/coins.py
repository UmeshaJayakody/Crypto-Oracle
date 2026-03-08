from fastapi import APIRouter, Query
from services.coingecko_service import fetch_top_coins, fetch_global_stats, search_coins, fetch_coin_info
from services.cache_service import get_cached, set_cached

router = APIRouter()


@router.get("/list")
async def list_coins(
    vs_currency: str = Query("usd"),
    per_page:    int = Query(50, ge=1, le=250),
    page:        int = Query(1, ge=1),
):
    cache_key = f"coins:list:{vs_currency}:{per_page}:{page}"
    cached = get_cached(cache_key)
    if cached:
        return cached

    coins = await fetch_top_coins(vs_currency=vs_currency, per_page=per_page, page=page)
    set_cached(cache_key, coins, ttl=60)
    return coins


@router.get("/global")
async def global_stats():
    cache_key = "coins:global"
    cached = get_cached(cache_key)
    if cached:
        return cached

    data = await fetch_global_stats()
    set_cached(cache_key, data, ttl=120)
    return data


@router.get("/search")
async def coin_search(q: str = Query(..., min_length=1)):
    cache_key = f"coins:search:{q.lower()}"
    cached = get_cached(cache_key)
    if cached:
        return cached

    results = await search_coins(q)
    set_cached(cache_key, results, ttl=300)
    return results


@router.get("/{coin_id}")
async def get_coin(coin_id: str):
    cache_key = f"coins:info:{coin_id}"
    cached = get_cached(cache_key)
    if cached:
        return cached

    info = await fetch_coin_info(coin_id)
    set_cached(cache_key, info, ttl=120)
    return info
