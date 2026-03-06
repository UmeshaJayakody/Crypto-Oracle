import httpx
import logging

logger = logging.getLogger(__name__)


async def get_fear_greed() -> dict:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get("https://api.alternative.me/fng/?limit=3")
            r.raise_for_status()
            data = r.json()["data"]

        current = data[0]
        prev    = data[1] if len(data) > 1 else data[0]
        value   = int(current["value"])
        prev_v  = int(prev["value"])
        score   = (value - 50) / 50

        return {
            "value":      value,
            "prev_value": prev_v,
            "change":     value - prev_v,
            "label":      current["value_classification"],
            "score":      round(score, 3),
            "timestamp":  current["timestamp"],
            "trend":      "rising" if value > prev_v else "falling" if value < prev_v else "stable",
        }
    except Exception as e:
        logger.error(f"Fear & Greed fetch failed: {e}")
        return {
            "value": 50, "prev_value": 50, "change": 0,
            "label": "Neutral", "score": 0.0,
            "timestamp": "", "trend": "stable",
        }
