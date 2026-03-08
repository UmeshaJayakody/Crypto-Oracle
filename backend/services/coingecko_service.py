import httpx
import os
import logging
import asyncio
from datetime import datetime
import pytz
from services.cache_service import get_cached, set_cached, get_stale

logger  = logging.getLogger(__name__)
BASE_URL = os.getenv("COINGECKO_BASE_URL", "https://api.coingecko.com/api/v3")
COLOMBO  = pytz.timezone("Asia/Colombo")

# Binance coin-id  →  trading pair   (USDT-quoted, public endpoint)
_BINANCE_PAIR = {
    "bitcoin":   "BTCUSDT",
    "ethereum":  "ETHUSDT",
    "binancecoin": "BNBUSDT",
    "solana":    "SOLUSDT",
    "ripple":    "XRPUSDT",
    "cardano":   "ADAUSDT",
    "dogecoin":  "DOGEUSDT",
    "polkadot":  "DOTUSDT",
    "avalanche-2": "AVAXUSDT",
    "chainlink": "LINKUSDT",
    "toncoin":   "TONUSDT",
    "shiba-inu": "SHIBUSDT",
    "litecoin":  "LTCUSDT",
}


async def _fetch_binance_prices(coin_id: str, days: int) -> list[dict]:
    """Fallback: fetch daily close prices from Binance public klines."""
    pair = _BINANCE_PAIR.get(coin_id.lower())
    if not pair:
        return []
    url = "https://api.binance.com/api/v3/klines"
    params = {"symbol": pair, "interval": "1d", "limit": min(days + 2, 500)}
    try:
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.get(url, params=params)
            r.raise_for_status()
        result = []
        for row in r.json():
            ts_ms = int(row[0])
            close = float(row[4])
            dt = datetime.fromtimestamp(ts_ms / 1000, tz=pytz.utc)
            result.append({"timestamp": dt, "price": close})
        logger.info("Binance fallback succeeded for %s: %d points (USDT)", coin_id, len(result))
        return result
    except Exception as e:
        logger.warning("Binance fallback failed for %s: %s", coin_id, e)
        return []


async def fetch_market_chart(coin_id: str, vs_currency: str = "usd", days: int = 30) -> list[dict]:
    """Fetch OHLCV-like price history from CoinGecko, with stale cache + Binance fallback."""
    cache_key = f"cg:market_chart:{coin_id}:{vs_currency}:{days}"
    cached = get_cached(cache_key)
    if cached:
        return cached

    url = f"{BASE_URL}/coins/{coin_id}/market_chart"
    params = {
        "vs_currency": vs_currency,
        "days":        days,
        "interval":    "daily" if days > 1 else "hourly",
    }
    headers = {"Accept": "application/json", "User-Agent": "Crypto-Oracle/1.0"}

    data = None
    hit_429 = False
    try:
        async with httpx.AsyncClient(timeout=20, headers=headers) as client:
            for attempt in range(4):
                r = await client.get(url, params=params)
                if r.status_code == 429:
                    hit_429 = True
                    if attempt < 3:
                        wait = [2, 5, 10][attempt]
                        logger.warning("CoinGecko 429 for %s/%s, retrying in %ds", coin_id, vs_currency, wait)
                        await asyncio.sleep(wait)
                        continue
                    break  # all retries exhausted
                r.raise_for_status()
                data = r.json()
                hit_429 = False
                break
    except Exception as e:
        logger.error("CoinGecko market_chart failed [%s]: %s", coin_id, e)

    if data is not None:
        prices = data.get("prices", [])
        result = [
            {"timestamp": datetime.fromtimestamp(ts_ms / 1000, tz=pytz.utc), "price": float(p)}
            for ts_ms, p in prices
        ]
        set_cached(cache_key, result, ttl=300)
        # stale fallback stored for 6 h – used when CoinGecko rate-limits later
        set_cached(f"stale:{cache_key}", result, ttl=21600)
        return result

    # ── stale cache first ────────────────────────────────────────────────────
    stale = get_stale(f"stale:{cache_key}")
    if stale:
        logger.warning("Using stale cache for %s/%s (%d points)", coin_id, vs_currency, len(stale))
        return stale

    # ── Binance fallback (returns USDT ≈ USD prices only) ────────────────────
    # Only used when caller requests USD, or as the USD leg for conversion.
    # Do NOT silently return USDT prices for non-USD currencies.
    if vs_currency.lower() in ("usd", "usdt"):
        binance = await _fetch_binance_prices(coin_id, days)
        if len(binance) >= 10:
            usd_key = f"cg:market_chart:{coin_id}:usd:{days}"
            set_cached(usd_key, binance, ttl=300)
            set_cached(f"stale:{usd_key}", binance, ttl=21600)
            return binance

    return []


async def fetch_ohlcv(coin_id: str, vs_currency: str = "usd", days: int = 30) -> list[dict]:
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
    """Fetch basic coin metadata (with stale fallback)."""
    cache_key = f"cg:coin_info:{coin_id}"
    cached = get_cached(cache_key)
    if cached:
        return cached

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
        result = {
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
            "price_change_1h":    market.get("price_change_percentage_1h_in_currency", {}).get("usd"),
            "ath":                market.get("ath", {}),
            "atl":                market.get("atl", {}),
            "circulating_supply": market.get("circulating_supply"),
            "max_supply":         market.get("max_supply"),
        }
        set_cached(cache_key, result, ttl=120)
        set_cached(f"stale:{cache_key}", result, ttl=21600)
        return result

    except Exception as e:
        logger.error(f"CoinGecko coin info failed [{coin_id}]: {e}")
        stale = get_stale(f"stale:{cache_key}")
        if stale:
            logger.warning("Using stale coin_info for %s", coin_id)
            return stale
        return {"id": coin_id, "name": coin_id.title()}


async def fetch_top_coins(vs_currency: str = "usd", per_page: int = 50, page: int = 1) -> list[dict]:
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
