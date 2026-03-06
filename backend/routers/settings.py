from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.cache_service import cache_stats
from services.chronos_service import get_gpu_stats

router = APIRouter()

# In-memory settings store (replace with DB in production)
_settings: dict = {
    "timezone":        "Asia/Colombo",
    "currency":        "lkr",
    "currency_symbol": "Rs",
    "country":         "LK",
    "locale":          "si-LK",
    "date_format":     "DD/MM/YYYY",
    "time_format":     "24h",
    "history_days":    30,
    "predict_days":    7,
    "num_samples":     20,
    "news_hours_back": 12,
    "quantile_low":    0.1,
    "quantile_high":   0.9,
    "include_reddit":  True,
    "theme":           "dark",
}


class SettingsUpdate(BaseModel):
    timezone:        Optional[str]   = None
    currency:        Optional[str]   = None
    currency_symbol: Optional[str]   = None
    country:         Optional[str]   = None
    locale:          Optional[str]   = None
    date_format:     Optional[str]   = None
    time_format:     Optional[str]   = None
    history_days:    Optional[int]   = None
    predict_days:    Optional[int]   = None
    num_samples:     Optional[int]   = None
    news_hours_back: Optional[int]   = None
    quantile_low:    Optional[float] = None
    quantile_high:   Optional[float] = None
    include_reddit:  Optional[bool]  = None
    theme:           Optional[str]   = None


@router.get("")
async def get_settings():
    return _settings


@router.put("")
async def update_settings(body: SettingsUpdate):
    updates = body.model_dump(exclude_none=True)
    _settings.update(updates)
    return _settings


@router.get("/system")
async def system_status():
    return {
        "gpu":   get_gpu_stats(),
        "cache": cache_stats(),
    }
