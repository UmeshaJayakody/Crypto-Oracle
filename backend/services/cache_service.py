import time
from typing import Any, Optional

_cache: dict[str, dict] = {}


def get_cached(key: str) -> Optional[Any]:
    entry = _cache.get(key)
    if entry and entry["expires_at"] > time.time():
        return entry["data"]
    if entry and entry["expires_at"] <= time.time():
        # keep stale entry – don't delete, get_stale() may still need it
        pass
    return None


def get_stale(key: str) -> Optional[Any]:
    """Return cached data even if expired. Used as last-resort fallback."""
    entry = _cache.get(key)
    return entry["data"] if entry else None


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
