import httpx
import os
import logging
from datetime import datetime
import pytz

logger  = logging.getLogger(__name__)
BASE_URL = os.getenv("COINGECKO_BASE_URL", "https://api.coingecko.com/api/v3")
COLOMBO  = pytz.timezone("Asia/Colombo")


async def fetch_market_chart(coin_id: str, vs_currency: str = "lkr", days: int = 30) -> list[dict]:
    """Fetch OHLCV-like price history from CoinGecko."""
    url = f"{BASE_URL}/coins/{coin_id}/market_chart"
    params = {
        "vs_currency": vs_currency,
        "days":        days,
        "interval":    "daily" if days > 1 else "hourly",
    }

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.get(url, params=params)
            r.raise_for_status()
            data = r.json()

        prices = data.get("prices", [])
        result = []
        for ts_ms, price in prices:
            dt = datetime.fromtimestamp(ts_ms / 1000, tz=pytz.utc)
            result.append({"timestamp": dt, "price": float(price)})
        return result

    except Exception as e:
        logger.error(f"CoinGecko market_chart failed [{coin_id}]: {e}")
        return []


async def fetch_ohlcv(coin_id: str, vs_currency: str = "lkr", days: int = 30) -> list[dict]:
    """Fetch OHLCV candles from CoinGecko."""
    url = f"{BASE_URL}/coins/{coin_id}/ohlc"
    params = {"vs_currency": vs_currency, "days": days}

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.get(url, params=params)
            r.raise_for_status()
            data = r.json()

        result = []
        for row in data:
            ts_ms, o, h, l, c = row
            dt = datetime.fromtimestamp(ts_ms / 1000, tz=pytz.utc)
            result.append({
                "timestamp": dt.astimezone(COLOMBO).isoformat(),
                "open":  float(o),
                "high":  float(h),
                "low":   float(l),
                "close": float(c),
            })
        return result

    except Exception as e:
        logger.error(f"CoinGecko OHLCV failed [{coin_id}]: {e}")
        return []


async def fetch_coin_info(coin_id: str) -> dict:
    """Fetch basic coin metadata."""
    url = f"{BASE_URL}/coins/{coin_id}"
    params = {
        "localization":   "false",
        "tickers":        "false",
        "market_data":    "true",
        "community_data": "false",
        "developer_data": "false",
    }

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.get(url, params=params)
            r.raise_for_status()
            data = r.json()

        market = data.get("market_data", {})
        return {
            "id":                 data.get("id"),
            "name":               data.get("name"),
            "symbol":             data.get("symbol", "").upper(),
            "image":              data.get("image", {}).get("large", ""),
            "market_cap_rank":    data.get("market_cap_rank"),
            "current_price":      market.get("current_price", {}),
            "market_cap":         market.get("market_cap", {}),
            "total_volume":       market.get("total_volume", {}),
            "price_change_24h":   market.get("price_change_percentage_24h"),
            "price_change_7d":    market.get("price_change_percentage_7d"),
            "price_change_1h":    market.get("price_change_percentage_1h_in_currency", {}).get("lkr"),
            "ath":                market.get("ath", {}),
            "atl":                market.get("atl", {}),
            "circulating_supply": market.get("circulating_supply"),
            "max_supply":         market.get("max_supply"),
        }

    except Exception as e:
        logger.error(f"CoinGecko coin info failed [{coin_id}]: {e}")
        return {"id": coin_id, "name": coin_id.title()}


async def fetch_top_coins(vs_currency: str = "lkr", per_page: int = 50, page: int = 1) -> list[dict]:
    """Fetch top coins by market cap."""
    url = f"{BASE_URL}/coins/markets"
    params = {
        "vs_currency":           vs_currency,
        "order":                 "market_cap_desc",
        "per_page":              per_page,
        "page":                  page,
        "sparkline":             "true",
        "price_change_percentage": "1h,24h,7d",
    }

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.get(url, params=params)
            r.raise_for_status()
            return r.json()

    except Exception as e:
        logger.error(f"CoinGecko top coins failed: {e}")
        return []


async def fetch_global_stats() -> dict:
    """Fetch global crypto market data."""
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.get(f"{BASE_URL}/global")
            r.raise_for_status()
            return r.json().get("data", {})
    except Exception as e:
        logger.error(f"CoinGecko global stats failed: {e}")
        return {}


async def search_coins(query: str) -> list[dict]:
    """Search for coins by name or symbol."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(f"{BASE_URL}/search", params={"query": query})
            r.raise_for_status()
            data = r.json()
        return data.get("coins", [])[:10]
    except Exception as e:
        logger.error(f"CoinGecko search failed: {e}")
        return []
