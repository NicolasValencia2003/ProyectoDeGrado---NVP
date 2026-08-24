# FinVise — AI-Adaptive Financial Education Platform

FinVise is a web platform that teaches personal finance through AI-generated, risk-profile-aware portfolio recommendations — framed explicitly as educational examples, never as real investment advice. It combines a reinforcement-learning bandit algorithm, automatic cognitive-bias detection, and Claude (Anthropic) as the reasoning engine behind every explanation.

Built as my Computer & Systems Engineering capstone project (Pontificia Universidad Javeriana Cali, 2026), validated with real users, not just a class demo.

## Why this exists

Colombia has one of the lowest levels of financial literacy in the region, and most fintech tools optimize for transactions, not understanding. FinVise's bet: if you show people a personalized, low-stakes simulation of *why* a recommendation makes sense — and catch the cognitive biases shaping their decisions along the way — they learn faster than from a static course.

## Key features

- **AI-generated portfolio recommendations** — Claude Sonnet (Anthropic) generates educational explanations for a pre-filtered set of candidate assets, adapting tone and vocabulary to the user's life profile.
- **Adaptive personalization (Multi-Armed Bandit / UCB1)** — the system learns which assets resonate with each user from their feedback, balancing exploration of new assets against ones that already worked.
- **Automatic cognitive-bias detection** — flags 5 behavioral-finance biases (loss aversion, recency, familiarity, disposition effect, among others) from user interaction patterns, backed by Kahneman & Tversky's literature, and surfaces them as in-app alerts.
- **Real-time market data with multi-layer fallback** — aggregates 5 external sources (TwelveData, CoinGecko, Alternative.me, FRED, NewsAPI); if a provider fails, the system falls back to a Supabase cache, then to another provider, transparently to the user.
- **Portfolio simulator** — hypothetical 1-day return on a user-defined amount, visualized with Recharts.
- **Pre/post educational-impact survey** — quantifies actual learning, not just engagement.
- **Scheduled data automation (n8n + Python)** — three workflows (price ingestion via `yfinance`, market-sentiment refresh every 6h, nightly bias-pattern analysis) run independently of the main API via Docker Compose.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite, TypeScript, Tailwind CSS, Recharts |
| Backend | NestJS (TypeScript), modular architecture (11 domain modules) |
| Database & Auth | Supabase (PostgreSQL + Supabase Auth, JWT) |
| AI | Claude Sonnet (Anthropic API) |
| Automation | n8n + Python 3.11, orchestrated via Docker Compose |
| Market data | TwelveData, CoinGecko, Alternative.me, FRED API, NewsAPI |

**Why React + Vite over Next.js or Angular:** evaluated against Angular 17 (Signals felt like unnecessary conceptual overhead for this scope), Vue 3 (no native TypeScript), and Next.js 14 (SSR/SEO wasn't a real need for an authenticated dashboard app). React + Vite won on hook-based state management and native TypeScript fit with the backend's data shapes.

## Architecture

- **Frontend (SPA)** — 8 main pages behind a guided flow (onboarding → dashboard → simulator/chat/history), talking to the backend exclusively through an authenticated REST API (Axios client, JWT auto-attached via `AuthContext`). Auth and a few user-preference writes go directly through the Supabase client.
- **Backend (NestJS, 11 modules)** — `auth`, `recommendations`, `ucb`, `biases`, `simulator`, `chat`, `survey`, `history`, `market-data`, `alerts`, `glossary`. The `recommendations` module is the core pipeline: pulls cached market data, queries the UCB1 bandit for personalization scores, filters candidates by risk profile, injects bias-correction instructions, and only then prompts Claude — explicitly constrained to the pre-computed candidate set.
- **Persistence** — Supabase (PostgreSQL) for auth, user profiles, behavior events, recommendation history, survey responses, and market-data cache. Row-level access is filtered by `user_id`.
- **Automation layer** — n8n workflows running in their own container handle scheduled data collection so the main API never blocks on it.

## Validation — this wasn't just built, it was tested with real users

Usability testing with 11 participants of varying financial background (36% with zero prior exposure to financial concepts, 46% basic level):

- **100%** rated ease of use 4 or 5 out of 5
- **90.9%** found the platform useful or very useful for improving their financial education
- **63.6%** said they'd recommend it to a friend or family member
- Testing also surfaced real friction (63.6% felt the 11-step onboarding had no natural pauses) — which fed directly back into interface iteration

Beyond usability testing, the project includes documented black-box and white-box functional tests and performance testing (response-time budgets per module: 5s for the bandit algorithm, 20s for the AI recommendation pipeline, with a 5-minute in-memory cache on market data).

## Running locally

> Adjust to match your actual `package.json` scripts and env var names — this is the general shape based on the architecture above.

```bash
git clone https://github.com/NicolasValencia2003/ProyectoDeGrado---NVP.git
cd ProyectoDeGrado---NVP

# Backend
cd backend
npm install
# .env: SUPABASE_URL, SUPABASE_ANON_KEY, ANTHROPIC_API_KEY,
#       TWELVEDATA_API_KEY, FRED_API_KEY, NEWSAPI_KEY
npm run start:dev   # http://localhost:3000/api

# Frontend
cd ../frontend
npm install
npm run dev

# Automation (optional)
cd ../n8n-docker
docker-compose up
```

Database schema and migrations live in `supabase/migrations`.

## Status

Capstone project, defended May 2026. Validated through functional, performance, and usability testing with real users; not yet deployed to production (see thesis for the roadmap on what a production launch would require — privacy policy, regulatory review, etc.).

## Author

**Nicolás Valencia Payán** — Computer & Systems Engineering, Pontificia Universidad Javeriana Cali
[LinkedIn](https://www.linkedin.com/in/nicolás-valencia-payán) · nvalenciapayan@gmail.com
