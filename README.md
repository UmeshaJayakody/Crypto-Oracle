# Crypto Oracle

**AI-powered cryptocurrency price prediction platform combining GPU time-series forecasting, live news intelligence, and market psychology signals into a single unified prediction score.**

Built for: RTX 3050 6GB · Windows 11 WSL2 · Sri Lanka (LKR, Asia/Colombo)

---

## What Is Crypto Oracle?

Crypto Oracle is a full-stack platform that answers one question: *which direction is this crypto asset likely to move over the next 1–7 days?*

It does this by running four independent intelligence signals in parallel, then fusing them into a single **Oracle Score** displayed on a TradingView-grade dark interface:

| Signal | Source | Weight |
|--------|--------|--------|
| Price pattern forecast | Amazon Chronos-2 (GPU) | 35% |
| News sentiment analysis | Claude Haiku (AI) | 35% |
| Market psychology | Fear & Greed Index | 20% |
| Community pulse | Reddit hot posts | 10% |

The result is a score from 0 to 100 (strong bearish → strong bullish) with a confidence percentage and an adjusted price forecast showing expected high, median, and low.

---

## How It Works

### 1. Price Data Collection

When you run a prediction, the system first fetches historical OHLCV price data from CoinGecko for your chosen coin and currency (default: LKR). It collects up to 365 days of daily candles, which become the context window for the AI forecasting model.

### 2. News Intelligence (Claude Haiku)

Simultaneously, the system pulls articles from six RSS feeds — CoinTelegraph, CoinDesk, Decrypt, Reuters, Bitcoin.com, and CryptoSlate — published within your chosen time window (default: last 12 hours). Articles are filtered for relevance to your coin and passed to Claude Haiku, Anthropic's fast and cost-efficient AI model.

Claude reads the headlines and summaries, then returns a structured sentiment score from -1.0 (strongly bearish) to +1.0 (strongly bullish), a confidence level, key market factors it identified, and a 2–3 sentence plain-English summary explaining its reasoning. It also scores each individual article.

Claude's self-reported confidence level directly attenuates how much weight its score carries in the final fusion — high confidence news has full impact, low confidence news is dampened by 55%.

### 3. Reddit Sentiment

The system fetches hot posts from r/CryptoCurrency and r/Bitcoin using the public Reddit JSON API (no authentication required). Posts matching the coin's keywords are collected and their upvote ratios averaged. A ratio above 0.5 maps to a bullish signal; below 0.5 maps to bearish. This acts as a real-time community pulse check.

### 4. Fear & Greed Index

The platform fetches the current Crypto Fear & Greed Index from alternative.me (free, no API key). The 0–100 index value is normalized to the -1 to +1 signal scale. It also tracks the previous day's value to show whether market psychology is rising or falling.

### 5. Chronos-2 GPU Forecast

The historical prices are passed directly to **Amazon Chronos-2**, a state-of-the-art time-series foundation model running on your RTX 3050 GPU using bfloat16 precision. The model generates 20 independent price trajectory samples over your chosen forecast horizon (1–30 days), then computes:

- **Median** — the central forecast line
- **Lower band** — 10th percentile (pessimistic)
- **Upper band** — 90th percentile (optimistic)
- **Chronos signal** — direction and magnitude of the price slope, normalized to -1 to +1

The GPU inference typically completes in 2–5 seconds on the RTX 3050.

### 6. Signal Fusion

All four signals are combined with their respective weights into a single **combined signal** between -1 and +1. This is then:

- Converted to an **Oracle Score** from 0 to 100
- Used to **nudge the Chronos price forecast** by up to ±5% per day (decaying for farther-out days)
- Used to **widen or narrow the confidence bands** based on news certainty

The Oracle Score maps to a direction and strength label:

| Score | Direction | Strength |
|-------|-----------|----------|
| 70–100 | Bullish | Strong |
| 55–70 | Bullish | Moderate |
| 45–55 | Neutral | Weak |
| 30–45 | Bearish | Moderate |
| 0–30 | Bearish | Strong |

### 7. Caching

Completed predictions are cached in memory for 1 hour. News and sentiment are cached for 5–10 minutes. This means repeated requests for the same parameters return in under 100ms rather than 5–10 seconds.

---

## Accuracy Expectations

| Forecast Horizon | Direction Accuracy |
|------------------|--------------------|
| 1 day | ~72–76% |
| 3 days | ~65–69% |
| 7 days | ~61–65% |
| 14 days | ~55–59% |
| 30 days | ~50–54% |

These are directional accuracy estimates (up vs. down), not price-level accuracy. Crypto markets are highly volatile. **This platform is for educational and research use only — never make financial decisions based solely on AI predictions.**

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| AI Forecasting | Amazon Chronos-2 (HuggingFace, bfloat16, CUDA 12.1) |
| AI Sentiment | Claude Haiku via Anthropic API |
| Backend API | FastAPI + Python 3.11 + Uvicorn |
| Frontend | Next.js 14 App Router + TypeScript + Tailwind CSS |
| Charts | TradingView Lightweight Charts v4 |
| Database | PostgreSQL 15 |
| ORM | Prisma (frontend) + SQLAlchemy async (backend) |
| Container | Docker Compose + NVIDIA GPU passthrough |
| Price Data | CoinGecko API (free tier) |
| News | RSS feeds (no API keys needed) |
| Market Data | alternative.me Fear & Greed (free, no key) |

---

## Hardware Requirements

| Component | Minimum | Used In This Build |
|-----------|---------|-------------------|
| GPU | NVIDIA GPU with CUDA 12.1+ | RTX 3050 6GB |
| VRAM | 4 GB (bfloat16) | 6 GB (2.1 GB used) |
| RAM | 12 GB | 16 GB |
| CPU | 4 cores | Intel i5 11th Gen |
| OS | WSL2 Ubuntu 22.04 | Windows 11 + WSL2 |

> The model also runs on CPU if no GPU is available — inference will be significantly slower (30–60 seconds vs 2–5 seconds).

---

## Prerequisites

Before setting up, ensure the following are installed and working in your WSL2 environment:

- **Docker Desktop** with WSL2 integration enabled
- **NVIDIA Container Toolkit** for GPU passthrough to Docker
- **NVIDIA drivers** on Windows (not inside WSL2 — Windows drivers are shared)
- An **Anthropic API key** from [console.anthropic.com](https://console.anthropic.com)

### Install NVIDIA Container Toolkit (WSL2)

Run the following commands inside your WSL2 terminal to enable GPU access inside Docker containers:

1. Add the NVIDIA package repository GPG key and source list
2. Install `nvidia-container-toolkit`
3. Configure the Docker runtime
4. Restart Docker

Verify GPU access works in Docker by running a quick `nvidia-smi` check inside a CUDA container before proceeding.

---

## Setup

### Step 1 — Clone or Navigate to the Project

Open a WSL2 terminal and navigate to the `crypto-oracle` directory.

### Step 2 — Configure Environment

Copy `.env.example` to `.env` and open it. The only required change is:

```
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

All other values are pre-configured for Sri Lanka defaults (LKR currency, Asia/Colombo timezone). You can adjust them later through the Settings page in the UI.

### Step 3 — Build and Start

Run Docker Compose to build and start all three services (database, backend, frontend):

```
docker compose up --build
```

**First run takes 15–20 minutes** — Docker downloads the PyTorch CUDA image (~5 GB), installs dependencies, and when the backend first starts, it downloads the Chronos-2 model weights (~2 GB) from HuggingFace. These are all cached in Docker volumes so subsequent starts take 2–3 minutes.

You will see the backend log `"Chronos-2 model ready."` when the GPU model is loaded and the system is ready to accept predictions.

### Step 4 — Initialize the Database

In a second terminal, run the Prisma migration to create the database tables:

```
docker compose exec frontend npx prisma db push
```

This creates the tables for user settings, watchlist, prediction logs, and news cache.

### Step 5 — Open the App

- **Frontend:** http://localhost:3000
- **Backend API + Swagger docs:** http://localhost:8000/docs
- **Health check:** http://localhost:8000/health

---

## How to Use the App

### Dashboard

The main dashboard loads at http://localhost:3000 and shows the top 100 cryptocurrencies sorted by market cap. Each row displays the current price in LKR, percentage changes for 1h / 24h / 7d, market cap, and a 7-day sparkline chart.

The top bar shows the total crypto market cap, BTC dominance, current Fear & Greed index, a live Sri Lanka time clock, and the GPU status indicator.

The left sidebar shows your watchlist with quick-glance prices and changes. You can toggle coins on and off the watchlist using the quick-add buttons.

### Running a Prediction

Click any coin row or the **Predict** button to open the coin prediction page. From there:

1. **Set your history range** — how many days of past price data to feed into Chronos-2 (7 days to 1 year)
2. **Set your forecast horizon** — how many days ahead to predict (1 to 30 days)
3. **Adjust GPU samples** — more samples = more accurate confidence bands but slower (10–100)
4. **Set the news window** — how far back to collect articles (3h to 48h)
5. **Choose your confidence band** — the quantile range shown as the prediction ribbon (default: 10%–90%)
6. **Toggle Reddit** — include or exclude Reddit community sentiment
7. Click **RUN PREDICTION ▶**

The button cycles through status messages as each phase completes: fetching prices → aggregating news → Claude Haiku analysis → Chronos-2 GPU inference → fusing signals → Oracle ready.

Results appear in the right panel showing:
- The **Oracle Score** circular gauge (0–100)
- **Signal Breakdown** bars showing each signal's individual contribution
- **Prediction Stats** with forecast high, median, and low prices plus change percentages
- The candlestick chart updates with the amber prediction ribbon

### News Feed

The News page shows a filterable feed of all recent crypto news across all tracked sources. Filter by All / Bullish / Bearish / Neutral. Each article card shows the source, headline, sentiment score and label, affected coins, impact horizon, and how long ago it was published (in Sri Lanka time).

The global sentiment bar shows the average sentiment score across all articles. The page auto-refreshes every 5 minutes.

### Settings

The Settings page lets you change:
- **Default currency** — LKR, USD, EUR, GBP, INR, and more
- **Timezone** — Colombo, Mumbai, UTC, New York, London, Singapore, Tokyo
- **Default prediction parameters** — history days, forecast days, samples, news window
- **Reddit toggle** — enable or disable Reddit sentiment globally

---

## Services & Ports

| Service | URL | Notes |
|---------|-----|-------|
| Frontend | http://localhost:3000 | Next.js development server |
| Backend API | http://localhost:8000 | FastAPI with Swagger UI at `/docs` |
| Database | localhost:5432 | PostgreSQL (not exposed to browser) |

---

## Useful Docker Commands

| Command | Purpose |
|---------|---------|
| `docker compose up` | Start all services |
| `docker compose up --build` | Rebuild images and start |
| `docker compose down` | Stop all services |
| `docker compose logs -f backend` | Follow backend logs |
| `docker compose logs -f frontend` | Follow frontend logs |
| `docker compose exec frontend npx prisma db push` | Apply schema changes |
| `docker compose exec frontend npx prisma studio` | Open database browser UI |

---

## Cost & Usage

| Item | Cost | Notes |
|------|------|-------|
| Anthropic API (Claude Haiku) | ~$0.0003 per prediction | ~$9/month at 1,000 predictions/day |
| CoinGecko API | Free | No API key needed for free tier |
| Fear & Greed Index | Free | No API key needed |
| Reddit | Free | Public JSON API, no authentication |
| RSS Feeds | Free | No API keys needed |
| Chronos-2 model | Free | Self-hosted on your GPU |

The only recurring cost is the Anthropic API for Claude Haiku news sentiment analysis. If you run predictions sparingly, monthly costs will be negligible.

---

## Disclaimer

> Crypto Oracle is built for **educational and research purposes only.**
> Cryptocurrency markets are extremely volatile and unpredictable. The predictions
> generated by this platform — even with high confidence scores — should never be
> the sole basis for any financial decision. Past model accuracy does not guarantee
> future results. Always conduct your own research (DYOR) before investing.

---

## Project Structure

```
crypto-oracle/
├── .env                    ← Your configuration (add API key here)
├── .env.example            ← Template with all available options
├── docker-compose.yml      ← Orchestrates all 3 services with GPU support
├── backend/                ← FastAPI Python backend + AI services
│   ├── routers/            ← API endpoint handlers
│   ├── services/           ← Chronos, Claude, CoinGecko, news, fusion
│   ├── models/             ← Pydantic request/response schemas
│   └── db/                 ← SQLAlchemy async database engine
└── frontend/               ← Next.js TypeScript frontend
    ├── app/                ← Pages: dashboard, coin detail, news, settings
    ├── components/         ← Chart, prediction, news, market, UI components
    ├── lib/                ← API client, formatters, constants, hooks
    └── prisma/             ← Database schema (settings, watchlist, logs)
```

For full technical implementation details including all service code, schema definitions, and UI specifications, see [CRYPTO_ORACLE.md](CRYPTO_ORACLE.md).
