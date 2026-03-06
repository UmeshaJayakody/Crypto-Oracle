import time
from typing import Any, Optional

_cache: dict[str, dict] = {}


def get_cached(key: str) -> Optional[Any]:
    entry = _cache.get(key)
    if entry and entry["expires_at"] > time.time():
        return entry["data"]
    if entry:
        del _cache[key]
    return None


def set_cached(key: str, data: Any, ttl: int = 300) -> None:
    _cache[key] = {
        "data": data,
        "expires_at": time.time() + ttl,
    }


def invalidate(key: str) -> None:
    _cache.pop(key, None)


def clear_all() -> None:
    _cache.clear()


def cache_stats() -> dict:
    now = time.time()
    active = sum(1 for v in _cache.values() if v["expires_at"] > now)
    return {"total_entries": len(_cache), "active_entries": active}
