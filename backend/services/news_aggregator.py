import httpx
import feedparser
import asyncio
from datetime import datetime, timedelta
import pytz
import logging

logger = logging.getLogger(__name__)

COLOMBO = pytz.timezone("Asia/Colombo")
UTC     = pytz.utc

RSS_FEEDS = {
    "CoinTelegraph": "https://cointelegraph.com/rss",
    "CoinDesk":      "https://www.coindesk.com/arc/outboundfeeds/rss/",
    "Decrypt":       "https://decrypt.co/feed",
    "Bitcoin.com":   "https://news.bitcoin.com/feed/",
    "CryptoSlate":   "https://cryptoslate.com/feed/",
}

COIN_KEYWORDS = {
    "bitcoin":     ["bitcoin", "btc", "satoshi"],
    "ethereum":    ["ethereum", "eth", "vitalik", "ether"],
    "solana":      ["solana", "sol"],
    "cardano":     ["cardano", "ada"],
    "ripple":      ["ripple", "xrp"],
    "dogecoin":    ["dogecoin", "doge"],
    "binancecoin": ["binance", "bnb"],
    "polkadot":    ["polkadot", "dot"],
    "avalanche-2": ["avalanche", "avax"],
    "chainlink":   ["chainlink", "link"],
    "litecoin":    ["litecoin", "ltc"],
    "uniswap":     ["uniswap", "uni"],
    "polygon":     ["polygon", "matic"],
}


async def fetch_rss_articles(hours_back: int = 12) -> list[dict]:
    cutoff      = datetime.now(COLOMBO) - timedelta(hours=hours_back)
    all_articles: list[dict] = []

    async def fetch_one(source: str, url: str):
        try:
            loop = asyncio.get_event_loop()
            feed = await loop.run_in_executor(None, feedparser.parse, url)
            for entry in feed.entries[:30]:
                try:
                    pub = datetime(*entry.published_parsed[:6], tzinfo=UTC)
                    if pub.astimezone(COLOMBO) < cutoff:
                        continue
                    all_articles.append({
                        "source":    source,
                        "title":     entry.title,
                        "summary":   getattr(entry, "summary", "")[:600],
                        "url":       entry.link,
                        "published": pub.astimezone(COLOMBO).isoformat(),
                        "pub_dt":    pub,
                    })
                except Exception:
                    continue
        except Exception as e:
            logger.warning(f"RSS fetch failed [{source}]: {e}")

    await asyncio.gather(*[fetch_one(s, u) for s, u in RSS_FEEDS.items()])
    return sorted(all_articles, key=lambda x: x["pub_dt"], reverse=True)


async def fetch_reddit_sentiment(coin_id: str, limit: int = 25) -> dict:
    subreddits = ["CryptoCurrency", "Bitcoin", "ethereum", "CryptoMarkets"]
    keywords   = COIN_KEYWORDS.get(coin_id.lower(), [coin_id.lower()])
    scores: list[float] = []
    posts:  list[dict]  = []

    async with httpx.AsyncClient(
        timeout=15,
        headers={"User-Agent": "CryptoOracle/1.0 (research project)"},
        follow_redirects=True,
    ) as client:
        for sub in subreddits[:2]:
            try:
                r = await client.get(
                    f"https://www.reddit.com/r/{sub}/hot.json",
                    params={"limit": limit},
                )
                data = r.json()
                for post in data["data"]["children"]:
                    p           = post["data"]
                    title_lower = p["title"].lower()
                    if any(kw in title_lower for kw in keywords):
                        ratio = p.get("upvote_ratio", 0.5)
                        scores.append(ratio)
                        posts.append({
                            "title":        p["title"],
                            "upvote_ratio": ratio,
                            "score":        p["score"],
                            "url":          f"https://reddit.com{p['permalink']}",
                        })
            except Exception as e:
                logger.warning(f"Reddit fetch failed [{sub}]: {e}")

    if not scores:
        return {"signal": 0.0, "posts_found": 0, "avg_upvote_ratio": 0.5, "top_posts": []}

    avg_ratio = sum(scores) / len(scores)
    signal    = (avg_ratio - 0.5) * 2

    return {
        "signal":           round(signal, 3),
        "posts_found":      len(posts),
        "avg_upvote_ratio": round(avg_ratio, 3),
        "top_posts":        posts[:5],
    }


def filter_articles_for_coin(articles: list[dict], coin_id: str) -> list[dict]:
    keywords = COIN_KEYWORDS.get(coin_id.lower(), [coin_id.lower()])
    # Always include broad market news
    global_kws = ["crypto", "market", "sec", "regulation", "etf", "bitcoin", "blockchain"]
    all_kws    = list(set(keywords + global_kws))

    relevant = []
    for a in articles:
        text = (a["title"] + " " + a["summary"]).lower()
        if any(kw in text for kw in all_kws):
            relevant.append(a)
    return relevant[:20]
