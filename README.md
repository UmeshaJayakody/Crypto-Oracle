# Crypto Oracle

**AI-powered cryptocurrency price prediction platform with matte glass UI design — combining GPU time-series forecasting, live news intelligence, and market psychology signals into a single unified Oracle Score.**

**Built for:** RTX 3050 6GB • Windows 11 WSL2 • Multi-currency (LKR/USD/EUR/etc) • CUDA 12.4.1

**Research-only:** This project is for educational and research purposes **only**. It is **not** financial advice, trading guidance, or a production trading system.

---

## Platform Preview

![Crypto Oracle Platform Screenshot](image.png)

---

## What Is Crypto Oracle?

A full-stack production-grade platform that answers: *which direction is this crypto asset likely to move over the next 1–30 days?*

Four independent intelligence signals run in parallel, fused into a single **Oracle Score (0–100)** displayed on a modern matte glass interface with white text hierarchy and subtle backdrop blur effects:

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

## Interpreting Predictions

### Understanding Signal Strength

Not all predictions are created equal. The **combined signal** value (ranging from -1 to +1) reveals the consensus strength across all four intelligence sources:

| Combined Signal | Quality | Tradability | UI Indicator |
|----------------|---------|-------------|--------------|
| **> +0.6 or < -0.6** | Strong | High confidence | Green checkmark "Strong alignment" |
| **+0.3 to +0.6** or **-0.3 to -0.6** | Moderate | Use with other data | Cyan "Moderate signal" |
| **-0.2 to +0.2** | Weak/Conflicting | Not actionable | Amber warning "Conflicting signals" |

### When to Trust a Prediction

**High Quality Predictions:**
- Combined signal magnitude > 0.3 (far from neutral)
- All four signals aligned in the same direction
- Narrow confidence bands (< $3,000 for Bitcoin)
- News confidence > 75%
- Fear & Greed index moving in same direction as other signals

**Low Quality Predictions (Wait for Better Setup):**
- Combined signal near zero (-0.2 to +0.2)
- Conflicting signals (e.g., Fear/Greed bearish but News/Reddit bullish)
- Wide confidence bands (> $5,000 for Bitcoin)
- News confidence < 50%
- Low Reddit engagement (< 5 matching posts)

### Real-World Example: Conflicting Signals

**Scenario:** You run a prediction and see:

```
Signal Breakdown:
• Chronos:    -0.030 (35%) — GPU sees slight bearish pattern
• News LLM:   +0.380 (35%) — Claude found moderate bullish sentiment  
• Fear/Greed: -0.760 (20%) — Strong fear in market (dominant bearish)
• Reddit:     +0.667 (10%) — Community is bullish

Combined Signal: +0.004 (Oracle)
```

**Interpretation:** The combined signal of +0.004 is essentially **neutral**. While news and Reddit sentiment are positive, the Fear & Greed index is in strong fear territory (-0.76), creating a conflict. This is **not an actionable prediction** — wait for signals to align before making decisions.

The Oracle Score card will show an **amber warning banner** with "Conflicting signals" to alert you that this prediction has low reliability.

### Why 72–76% Is Near Maximum for 1-Day Predictions

Cryptocurrency markets are inherently chaotic systems influenced by factors no model can predict: regulatory surprises, whale movements, black swan events, social media viral moments, and quantum effects from other markets. Even professional algorithmic traders rarely exceed 65–70% directional accuracy on intraday crypto moves.

**72–76% accuracy for next-day direction is already exceptional.** Higher accuracy rates would imply market inefficiency that would self-correct once exploited at scale.

### How to Improve Prediction Quality

Rather than chasing higher accuracy percentages, focus on **using predictions more intelligently:**

1. **Use longer forecast horizons** — 7-day and 14-day predictions smooth out daily noise
2. **Extend history length** — Increase from 90 days to 180 days for better pattern recognition
3. **Increase GPU samples** — Raise from 20 to 50–100 samples for tighter confidence bands
4. **Widen news window** — Use 24-hour news instead of 12-hour for more comprehensive sentiment
5. **Wait for signal alignment** — Only act when all four signals point the same direction
6. **Use stop-losses** — Even 75% accuracy means 1 in 4 predictions are wrong

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| AI Forecasting | Amazon Chronos-2 (HuggingFace, bfloat16, CUDA 12.4.1) |
| AI Sentiment | Claude Haiku 4-5 via Anthropic API |
| Backend API | FastAPI + Python 3.11 + Uvicorn ASGI |
| Frontend | Next.js 16.1.6 (Turbopack) + React 19 + TypeScript 5.8 |
| UI Framework | **Tailwind CSS v4** (CSS-first with `@utility`, `@theme`) |
| Design System | Matte glass cards (`backdrop-filter: blur(16px)`) + white opacity hierarchy |
| Charts | TradingView Lightweight Charts v5 |
| Database | PostgreSQL 15 Alpine |
| ORM | Prisma v7 (frontend) + SQLAlchemy async (backend) |
| Container | Docker Compose v3.9 + NVIDIA GPU passthrough |
| Price Data | CoinGecko API (free tier, no key) |
| News | RSS feeds (6 sources, no keys) |
| Market Data | alternative.me Fear & Greed (free, no key) |
| State Management | SWR (stale-while-revalidate, auto-refresh) |

---

## Hardware Requirements

| Component | Minimum | Used In This Build |
|-----------|---------|-------------------|
| GPU | NVIDIA GPU with CUDA 12.1+ | RTX 3050 Laptop 6GB |
| VRAM | 4 GB (bfloat16) | 6 GB (~2 GB used) |
| RAM | 12 GB | 16 GB DDR4 |
| CPU | 4 cores | Intel i5 11th Gen |
| OS | WSL2 Ubuntu 22.04 | Windows 11 22H2 + WSL2 Ubuntu 22.04 |
| Docker | Docker Desktop 4.0+ with GPU support | Docker Desktop latest + nvidia-container-toolkit |

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

> **Remote Access:** The frontend auto-detects the backend at `{window.location.hostname}:8000`, so if you access from another machine (e.g., `http://192.168.1.50:3000`), API calls automatically target `http://192.168.1.50:8000` instead of hard-coded localhost.

---

## Design System

Crypto Oracle uses a **matte glass aesthetic** with a CSS-first Tailwind v4 architecture:

### Visual Language

- **Background:** Deep black (`#06060d`) with subtle cyan/emerald radial gradients
- **Glass cards:** `rgba(255,255,255,0.028)` + `backdrop-filter: blur(16px)` + white/7.5% borders
- **Text hierarchy:** `text-white/90` → `/60` → `/35` → `/25` (semantic opacity levels)
- **Accent color:** Cyan-400 (`#22d3ee`) used ONLY for interactive states (active nav, buttons, hover)
- **Status colors:** Emerald-400 (bullish), Rose-400 (bearish), Amber-400 (warning), White (neutral)

### Custom Tailwind Utilities

All custom UI primitives are defined as `@utility` blocks in `app/globals.css` for first-class Tailwind integration:

```css
@utility glass {
  background: rgba(255,255,255,0.028);
  border: 1px solid rgba(255,255,255,0.075);
  backdrop-filter: blur(16px);
  &:hover { background: rgba(255,255,255,0.048); }
}

@utility pill-bull {
  background: rgba(16,185,129,0.10);
  color: #34d399;
  border: 1px solid rgba(52,211,153,0.22);
}
```

**Available utilities:** `glass`, `glass-static`, `glass-panel`, `oracle-bg-ambient`, `text-gradient`, `text-gradient-cyan`, `pill-bull`, `pill-bear`, `pill-neut`, `glow-cyan`, `glow-emerald`, `glow-rose`, `glow-amber`, `skeleton`, `prediction-dash`, `font-mono`, `font-display`

All support Tailwind variants (`hover:`, `focus:`, `lg:`, etc.) and appear in IntelliSense autocomplete.

### Component Architecture

- **Sidebar:** Glass panel with border-right, logo, nav with cyan active states, corner API health dot
- **StatusBar:** Glass backdrop bar with market stats, emerald live dot with glow, Sri Lanka time
- **Cards:** All use `glass-static rounded-2xl p-5` with consistent spacing
- **Tables:** `px-5 py-3.5` rows, `hover:bg-white/[0.03]`, pill-style percentage cells
- **Inputs/Selects:** Glass background with cyan focus rings, custom styled range/checkbox
- **Buttons:** Cyan glow on hover, disabled state with reduced opacity
- **Pills:** Sentiment/source badges with tinted backgrounds and matching borders

---

## How to Use the App

### Dashboard

The main dashboard at http://localhost:3000 shows the top 20 cryptocurrencies in a glass table with proper padding and hierarchy. Each row displays:

- Rank badge with white/25 opacity
- Coin icon (ring-1 ring-white/10)
- Price in selected currency (white/90 semibold)
- 1h/24h/7d percentage changes as pills (emerald/rose tinted backgrounds)
- Market cap (white/35)
- 7-day sparkline
- **Predict** button (glass with cyan ring on hover)

**Top bar components:**
- Market cap widget (glass pill with emerald/amber/rose accent bar)
- BTC/ETH dominance (white/60)
- Fear & Greed gauge (colored by score)
- Sri Lanka time (white/70 with cyan seconds)

**Sidebar (left panel):**
- Watchlist with glass hover states
- Quick-add pills (cyan when active)
- Compact price display with white/60 values

### Running a Prediction

Click any coin row or the **Predict** button to open the coin detail page (`/coin/bitcoin`). The page has a 3-column layout:

**Left panel (glass-panel background):** Prediction controls
1. **History range buttons** — 7D, 1M, 3M, 6M, 1Y (cyan when selected)
2. **Forecast horizon pills** — 1d, 3d, 7d, 14d, 30d (white/12 bg when active)
3. **GPU samples slider** — 10 (fast) to 100 (accurate), cyan thumb with glow
4. **Confidence band selects** — Lower/upper quantile percentages (10%–25% / 75%–95%)
5. **News window dropdown** — 3h, 6h, 12h, 24h, 48h
6. **Reddit checkbox** — Glass-styled with cyan accent
7. **RUN ORACLE ▶** button — Large cyan glass button with glow effect

The button cycles through status messages during execution:
- "Fetching prices..."
- "Analyzing news..."
- "Running Chronos GPU..."
- "Fusing signals..."
- "Oracle ready"

**Center panel:** Candlestick chart + news feed
- Lightweight Charts with dark theme
- Prediction overlay (amber ribbon with glow)
- Sentiment bands below OHLCV
- Bottom news feed (3 latest articles, glass cards)

**Right panel (glass-panel background):** Oracle results
- **Oracle Score** — Circular gauge (0–100) with colored arc (emerald/cyan/amber/rose)
- **Signal Breakdown** — Horizontal bars showing Chronos (35%), News (35%), Fear/Greed (20%), Reddit (10%)
- **Prediction Stats** — Glass card with high/median/low forecasts, color-coded change %
- **Accuracy estimate** — Direction accuracy footer (white/20)

### News Page

`/news` shows all recent crypto news across 6 RSS sources:
- Glass sentiment bar at top (aggregate sentiment, Fear & Greed value, article count)
- Filter pills (All / Bullish / Bearish / Neutral) with colored active states
- Grid layout (1 column mobile, 2 columns desktop)
- Each card: glass rounded-2xl, source badge, sentiment pill, white text hierarchy
- Auto-refreshes every 5 minutes (shown in white/25 footer)

### Settings Page

`/settings` has glass sections for:
- **Regional:** Currency selector (10 currencies), Timezone selector (7 zones)
- **Prediction Defaults:** History days, Forecast days, GPU samples, News window (all number inputs with glass styling)
- **Reddit toggle**
- **Stack info card:** Shows Chronos model, Claude version, CoinGecko, hardware (cyan values)

All inputs auto-save with green confirmation banner.

---

## Services & Ports

| Service | URL | Notes |
|---------|-----|-------|
| Frontend | http://localhost:3000 | Next.js Turbopack dev server (HMR enabled) |
| Backend API | http://localhost:8000 | FastAPI with Swagger UI at `/docs` |
| Database | localhost:5432 | PostgreSQL (internal; not exposed to browser) |

---

## Key Features

### 🎨 Matte Glass UI Design
- Custom `@utility` blocks in Tailwind v4 for glass cards, pills, gradients, glows
- Semantic white opacity hierarchy (`/90` → `/60` → `/35` → `/25`)
- Cyan-only accent system for interactive states
- Backdrop blur effects with subtle border glows

### 🔮 Multi-Signal Oracle Score
- 4 independent AI signals (Chronos GPU, Claude news, Fear/Greed, Reddit)
- Weighted fusion (35% + 35% + 20% + 10%)
- Confidence-adjusted median price forecast
- Dynamic confidence bands (10%–95% quantile range)

### 📊 TradingView-Grade Charts
- Lightweight Charts v5 with OHLCV candlesticks
- Prediction overlay (amber ribbon with glow)
- Sentiment band below price action
- Volume histogram with gradient fills

### 🤖 GPU-Accelerated Forecasting
- Amazon Chronos-2 running on RTX 3050 (~2 seconds inference)
- bfloat16 precision for VRAM efficiency
- 10–100 trajectory samples (user configurable)
- Auto-fallback to CPU if GPU unavailable

### 📰 Live News Intelligence
- 6 RSS sources (CoinTelegraph, CoinDesk, Decrypt, Reuters, Bitcoin.com, CryptoSlate)
- Claude Haiku 4-5 sentiment analysis per article
- Confidence-weighted scoring (high confidence = full weight)
- Auto-refresh every 5 minutes

### 💾 Smart Caching
- Memory cache with TTL (1h predictions, 5–10m news)
- SWR state management (stale-while-revalidate)
- Instant re-renders on cached data

### 🌍 Multi-Currency Support
- 10 fiat currencies (LKR, USD, EUR, GBP, INR, JPY, AUD, SGD, MYR, CAD)
- 7 timezones (Asia/Colombo, Mumbai, UTC, New York, London, Singapore, Tokyo)
- Dynamic API base (works from localhost or remote IP)

---

## Performance

| Metric | Value |
|--------|-------|
| Prediction latency | 2–5 seconds (GPU) / 30–60 seconds (CPU) |
| Frontend build time | ~900ms (Next.js Turbopack) |
| API response (cached) | <100ms |
| News refresh interval | 5 minutes |
| Container startup (cold) | 15–20 minutes (model download + deps) |
| Container startup (warm) | 2–3 minutes (cache hit) |
| VRAM usage | ~2 GB (Chronos bfloat16 + CUDA runtime) |

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
| Anthropic API (Claude Haiku 4-5) | ~$0.0002–0.0004 per prediction | Input: $0.80/M tokens, Output: $4.00/M tokens |
| CoinGecko API | Free | 10–50 calls/min on free tier (no key needed) |
| Fear & Greed Index | Free | No rate limits, no key |
| Reddit JSON API | Free | Public access, no authentication |
| RSS Feeds | Free | Direct XML fetch, no keys |
| Chronos-2 model | Free | Self-hosted on your GPU |
| PostgreSQL | Free | Self-hosted Docker volume |
| Next.js / React | Free | Open source |

**Monthly estimate:** ~$5–15 if running 500–1,000 predictions/month. Claude Haiku is the only recurring cost. All other services are free forever.

---

## Disclaimer

> **Educational and Research Use Only**
>
> Crypto Oracle is built for **educational and research purposes only.**
> Cryptocurrency markets are extremely volatile and unpredictable. The predictions
> generated by this platform — even with high Oracle Scores or confidence percentages —
> should **NEVER** be the sole basis for any financial decision.
>
> - Past model accuracy does not guarantee future results
> - AI predictions can be wrong even with 90%+ confidence
> - Market conditions change rapidly and unpredictably
> - Always conduct your own research (DYOR) before investing
> - Never invest more than you can afford to lose
>
> The developers of this platform assume no liability for any financial losses.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Contributing

Pull requests welcome! Please ensure:
- TypeScript strict mode passes (`npm run lint`)
- Glass UI design system is maintained (use utility classes from `globals.css`)
- API contracts match Pydantic schemas in `backend/models/schemas.py`
- All Docker services start cleanly with `docker compose up --build`

---

## Support

For issues, questions, or feature requests, open an issue on GitHub or contact the maintainers.

---

**Built for the crypto research community**

---

## Project Structure

```
crypto-oracle/
├── .env                    ← Your configuration (add ANTHROPIC_API_KEY here)
├── .env.example            ← Template with all available options
├── docker-compose.yml      ← Orchestrates 3 services with NVIDIA GPU
├── README.md               ← This file
├── CRYPTO_ORACLE.md        ← Full technical specification
├── backend/                ← FastAPI Python backend + AI services
│   ├── Dockerfile          ← CUDA 12.4.1 + PyTorch + Chronos-2
│   ├── main.py             ← FastAPI app with CORS + lifespan
│   ├── requirements.txt    ← FastAPI, anthropic, feedparser, etc.
│   ├── routers/            ← API endpoint handlers
│   │   ├── predict.py      ← /api/predict/* (enhanced prediction)
│   │   ├── coins.py        ← /api/coins/* (CoinGecko proxy)
│   │   ├── history.py      ← /api/history/* (OHLCV data)
│   │   ├── news.py         ← /api/news/* (RSS aggregation)
│   │   ├── sentiment.py    ← /api/sentiment/* (Claude + Fear/Greed)
│   │   └── settings.py     ← /api/settings/* (user preferences)
│   ├── services/           ← Core intelligence services
│   │   ├── chronos_service.py       ← GPU Chronos-2 inference (bfloat16)
│   │   ├── claude_sentiment.py      ← Claude Haiku API client
│   │   ├── coingecko_service.py     ← CoinGecko API client
│   │   ├── news_aggregator.py       ← RSS feed parser (6 sources)
│   │   ├── fear_greed_service.py    ← Fear & Greed index API
│   │   ├── signal_fusion.py         ← 4-signal weighted fusion
│   │   └── cache_service.py         ← In-memory TTL cache
│   ├── models/             ← Pydantic schemas
│   │   └── schemas.py      ← Request/response models
│   └── db/                 ← Database (unused, reserved for future)
│       ├── database.py     ← SQLAlchemy async engine
│       └── __init__.py
└── frontend/               ← Next.js 16 TypeScript frontend
    ├── Dockerfile          ← Node 22 Alpine + Prisma
    ├── package.json        ← Dependencies (Next 16, React 19, TW 4)
    ├── tailwind.config.ts  ← Empty (v4 uses @theme in CSS)
    ├── postcss.config.js   ← @tailwindcss/postcss plugin
    ├── next.config.ts      ← Turbopack + image domains
    ├── tsconfig.json       ← TypeScript 5.8 config
    ├── app/                ← Next.js pages (App Router)
    │   ├── globals.css     ← Tailwind v4 @theme + @utility blocks
    │   ├── layout.tsx      ← Root layout (Sidebar + StatusBar)
    │   ├── page.tsx        ← Dashboard (/) — market table
    │   ├── icon.svg        ← Favicon (dark bg + logo)
    │   ├── coin/[id]/page.tsx      ← Coin detail + prediction
    │   ├── news/page.tsx           ← News feed
    │   └── settings/page.tsx       ← User settings
    ├── components/         ← React components
    │   ├── chart/
    │   │   ├── CandlestickChart.tsx     ← Lightweight Charts wrapper
    │   │   ├── PredictionOverlay.tsx    ← Amber ribbon + bands
    │   │   ├── SentimentBand.tsx        ← Sentiment strip below chart
    │   │   └── VolumeBar.tsx            ← Volume histogram
    │   ├── layout/
    │   │   ├── Navbar.tsx               ← (unused, reserved)
    │   │   ├── Sidebar.tsx              ← Glass panel left nav
    │   │   └── StatusBar.tsx            ← Glass top bar stats
    │   ├── market/
    │   │   ├── CoinRow.tsx              ← Table row with pills
    │   │   ├── GlobalStats.tsx          ← Market cap cards
    │   │   ├── MarketOverview.tsx       ← Main table wrapper
    │   │   ├── TopMovers.tsx            ← Bull/bear movers
    │   │   └── WatchList.tsx            ← Sidebar coin list
    │   ├── news/
    │   │   ├── NewsCard.tsx             ← Glass article card
    │   │   ├── NewsFeed.tsx             ← Feed with filters
    │   │   ├── SentimentPill.tsx        ← Colored sentiment badge
    │   │   └── SourceBadge.tsx          ← Per-source colors
    │   ├── prediction/
    │   │   ├── OracleScore.tsx          ← Circular gauge (0–100)
    │   │   ├── SignalBreakdown.tsx      ← 4 signal bars
    │   │   ├── PredictionPanel.tsx      ← Left control panel
    │   │   ├── PredictionStats.tsx      ← High/med/low forecast
    │   │   └── AccuracyMeter.tsx        ← Direction accuracy bar
    │   └── ui/
    │       ├── CoinSearch.tsx           ← Search dropdown
    │       ├── CurrencySelector.tsx     ← Currency picker
    │       ├── TimeRangeSelector.tsx    ← History range buttons
    │       ├── LoadingSkeleton.tsx      ← Shimmer skeleton
    │       └── Tooltip.tsx              ← Hover tooltip
    ├── lib/                ← Utilities + API client
    │   ├── api.ts          ← API fetch wrappers (dynamic base)
    │   ├── constants.ts    ← Currencies, timezones, coins, colors
    │   ├── formatters.ts   ← Price/pct/date formatters
    │   └── hooks/
    │       ├── usePrediction.ts         ← Prediction state hook
    │       ├── useNews.ts               ← News SWR hook
    │       └── useSettings.ts           ← Settings state hook
    ├── prisma/
    │   └── schema.prisma   ← Settings + watchlist tables
    └── public/
        └── logo.svg        ← Oracle logo (standalone)
```

For full technical implementation details including all service code, schema definitions, and UI specifications, see [CRYPTO_ORACLE.md](CRYPTO_ORACLE.md).
