from fastapi import APIRouter, Query
from services.coingecko_service import fetch_market_chart, fetch_ohlcv
from services.cache_service import get_cached, set_cached

router = APIRouter()


@router.get("/{coin_id}")
async def get_history(
    coin_id:     str,
    vs_currency: str = Query("lkr"),
    days:        int = Query(30, ge=1, le=365),
    ohlcv:       bool = Query(False),
):
    cache_key = f"history:{coin_id}:{vs_currency}:{days}:{'ohlcv' if ohlcv else 'price'}"
    cached = get_cached(cache_key)
    if cached:
        return cached

    if ohlcv:
        data = await fetch_ohlcv(coin_id, vs_currency=vs_currency, days=days)
    else:
        raw  = await fetch_market_chart(coin_id, vs_currency=vs_currency, days=days)
        data = [
            {"timestamp": p["timestamp"].isoformat(), "price": round(p["price"], 2)}
            for p in raw
        ]

    set_cached(cache_key, data, ttl=60)
    return data
