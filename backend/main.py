import asyncio
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import predict, coins, history, news, sentiment, settings
from services.chronos_service import warmup_model

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Crypto Oracle backend...")
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, warmup_model)
    logger.info("Chronos model ready: %s", os.getenv("CHRONOS_MODEL", "amazon/chronos-bolt-small"))
    yield
    logger.info("Shutting down Crypto Oracle backend.")


app = FastAPI(
    title="Crypto Oracle API",
    description="AI-powered cryptocurrency price prediction platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router,   prefix="/api/predict",   tags=["Prediction"])
app.include_router(coins.router,     prefix="/api/coins",     tags=["Coins"])
app.include_router(history.router,   prefix="/api/history",   tags=["History"])
app.include_router(news.router,      prefix="/api/news",      tags=["News"])
app.include_router(sentiment.router, prefix="/api/sentiment", tags=["Sentiment"])
app.include_router(settings.router,  prefix="/api/settings",  tags=["Settings"])


@app.get("/health")
async def health_check():
    from services.chronos_service import get_gpu_stats
    return {
        "status": "ok",
        "gpu": get_gpu_stats(),
        "model": os.getenv("CHRONOS_MODEL", "amazon/chronos-bolt-small"),
    }
