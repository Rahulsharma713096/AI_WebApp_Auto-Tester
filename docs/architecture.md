# Architecture

## System Layers

1. **Frontend UI** - Next.js with Tailwind CSS, WebSocket streaming
2. **API Gateway** - FastAPI with CORS, JWT auth ready
3. **AI Orchestration** - Agent-based analysis using OpenAI/Claude
4. **Browser Runtime** - Playwright headless Chromium
5. **Analysis Engine** - AI defect classification, severity scoring
6. **Report System** - PDF/DOCX/JSON generation

## Data Flow

1. User submits URL + profile
2. Backend creates TestRun in SQLite
3. AI Planner generates strategy
4. Playwright launches browser session
5. AI agents analyze results in parallel
6. Issues classified and stored
7. Report generated
8. Real-time dashboard updates via WebSocket

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| API Gateway | FastAPI | Async-native, auto OpenAPI |
| Frontend | Next.js + Tailwind | SSR, App Router, utility CSS |
| Browser Runtime | Separate service | Isolate crashes, scale workers |
| Database | SQLite | Zero-config dev; swap to PostgreSQL for SaaS |
| LLM | OpenAI + Claude (configurable) | Provider-agnostic |
| Task Queue | Celery + Redis | Production-ready async tasks |
| Reports | Local filesystem | Swap to S3 for SaaS |
