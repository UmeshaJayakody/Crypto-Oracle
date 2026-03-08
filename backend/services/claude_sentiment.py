import httpx
import json
import os
import re
import logging

logger = logging.getLogger(__name__)

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
CLAUDE_MODEL      = "claude-haiku-4-5-20251001"

SENTIMENT_PROMPT = """You are a professional cryptocurrency market analyst.
Analyze the following recent news headlines and summaries for their likely
impact on {coin_id} price over the next 1-7 days.

Current time: {current_time} (Sri Lanka Standard Time, UTC+5:30)

NEWS ARTICLES (newest first):
{articles_text}

REDDIT SIGNAL: {reddit_signal}
(Scale: -1.0 = very bearish community, 0 = neutral, +1.0 = very bullish)

Respond ONLY with valid JSON (no markdown, no backticks, no extra text):
{{
  "sentiment_score": <float -1.0 to +1.0>,
  "confidence": "<high|medium|low>",
  "direction": "<bullish|bearish|neutral>",
  "key_factors": ["<factor1>", "<factor2>", "<factor3>"],
  "summary": "<2-3 sentence plain English analysis>",
  "article_scores": [
    {{
      "title": "<first 60 chars of headline>",
      "score": <float -1.0 to +1.0>,
      "label": "<bullish|bearish|neutral>",
      "affected_coins": ["<coin1>"],
      "impact_horizon": "<immediate|short|long>"
    }}
  ],
  "affects_coin_directly": <true|false>,
  "market_context": "<global|coin-specific|mixed>"
}}"""


async def analyze_news_with_claude(
    articles: list[dict],
    coin_id: str,
    reddit_signal: float,
    current_time: str,
) -> dict:
    _empty = {
        "sentiment_score": 0.0,
        "confidence": "low",
        "direction": "neutral",
        "key_factors": ["No recent news found"],
        "summary": "Insufficient news data for analysis in the selected time window.",
        "article_scores": [],
        "affects_coin_directly": False,
        "market_context": "unknown",
        "articles_analyzed": 0,
    }

    if not articles:
        return _empty

    if not ANTHROPIC_API_KEY or ANTHROPIC_API_KEY.startswith("sk-ant-YOUR"):
        logger.warning("ANTHROPIC_API_KEY not set — returning neutral sentiment")
        return {**_empty, "summary": "API key not configured. Set ANTHROPIC_API_KEY in .env"}

    articles_text = "\n\n".join([
        f"[{a['source']}] [{a['published'][:16]}]\n"
        f"TITLE: {a['title']}\n"
        f"SUMMARY: {a['summary'][:300]}"
        for a in articles[:15]
    ])

    prompt = SENTIMENT_PROMPT.format(
        coin_id=coin_id.upper(),
        current_time=current_time,
        articles_text=articles_text,
        reddit_signal=f"{reddit_signal:+.2f}",
    )

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key":         ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type":      "application/json",
                },
                json={
                    "model":      CLAUDE_MODEL,
                    "max_tokens": 1500,
                    "messages":   [{"role": "user", "content": prompt}],
                },
            )
            r.raise_for_status()
            data = r.json()

        text = data["content"][0]["text"].strip()

        # Strip markdown code fences that Claude sometimes adds, e.g. ```json ... ```
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text.strip()).strip()

        result = json.loads(text)
        result["articles_analyzed"] = len(articles)
        return result

    except json.JSONDecodeError as e:
        logger.error(f"Claude returned invalid JSON: {e}\nRaw text: {text!r}")
        return {**_empty, "articles_analyzed": len(articles),
                "summary": "Sentiment parsing error — please retry."}
    except Exception as e:
        logger.error(f"Claude sentiment request failed: {e}")
        return {**_empty, "articles_analyzed": len(articles),
                "summary": "News sentiment analysis temporarily unavailable."}
