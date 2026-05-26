# AI Web App Auto-Tester

> AI-powered autonomous web application testing platform. Runs automated functional, visual, accessibility, security, and performance tests using AI agents and Playwright.

[![CI](https://github.com/user/ai-webapp-tester/actions/workflows/ci.yml/badge.svg)](https://github.com/user/ai-webapp-tester/actions)
![Python](https://img.shields.io/badge/python-3.11%2B-blue)
![Node](https://img.shields.io/badge/node-20%2B-green)
![License](https://img.shields.io/badge/license-MIT-orange)

---

## Features

- **5 AI Agents** — Test Planner, Functional Flow, Visual QA, Accessibility, Security Probe
- **9 Automated Test Types** — Functional, Visual Regression, Accessibility (WCAG), Security (OWASP Top 10), Performance, Console, Network, SEO, Mobile
- **14 Report Sections** — Executive Summary, Test Overview, Visual QA, Accessibility Scorecard, Security Findings, Remediation, and more
- **Live Dashboard** — Real-time WebSocket streaming with progress indicators
- **Multi-Format Reports** — PDF, DOCX, JSON export
- **Configurable AI** — Supports OpenAI GPT-4o and Claude 3.5 Sonnet

---

## Quick Start

### Option 1: One-Click Run Scripts

**Windows:**
```batch
run.bat
```

**Linux / Mac:**
```bash
chmod +x run.sh && ./run.sh
```

Both scripts automatically:
- Check prerequisites (Python 3.11+, Node.js 20+)
- Install Python & npm dependencies
- Start Redis (via Docker if available)
- Launch Backend (FastAPI) on `:8000`
- Launch Frontend (Next.js) on `:3000`
- Launch optional services (AI Orchestrator `:8001`, Runtime `:8005`)
- Open browser to the frontend

### Option 2: Manual Start

**1. Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**2. Frontend (new terminal):**
```bash
cd frontend
npm install
npm run dev
```

**3. Open** [http://localhost:3000](http://localhost:3000)

### Option 3: Docker
```bash
docker compose up
```

---

## Services & Ports

| Service | Port | Description |
|---------|------|-------------|
| **Frontend** | `3000` | Next.js UI (Test input, dashboard, history, reports) |
| **Backend API** | `8000` | FastAPI gateway with SQLite persistence |
| **AI Orchestrator** | `8001` | Agent coordination and LLM integration |
| **Visual QA** | `8002` | Screenshot comparison and visual regression |
| **Accessibility** | `8003` | WCAG 2.1 AA compliance scoring |
| **Security Probe** | `8004` | OWASP Top 10 vulnerability scanning |
| **Runtime** | `8005` | Playwright headless browser execution |
| **Redis** | `6379` | Message broker and task queue |

---

## API Reference

### Test Runs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/test-runs?url=...&profile=...` | Create & start a new test run |
| `GET` | `/api/test-runs` | List all test runs (paginated) |
| `GET` | `/api/test-runs/{id}` | Get test run details |
| `DELETE` | `/api/test-runs/{id}` | Delete a test run |
| `GET` | `/api/test-runs/{id}/issues` | Get all issues for a run |
| `GET` | `/api/test-runs/{id}/pages` | Get all pages scanned |
| `GET` | `/api/test-runs/{id}/test-cases` | Get all test cases executed |

### WebSocket

| Endpoint | Description |
|----------|-------------|
| `ws://localhost:8000/ws/test-run/{id}` | Real-time execution logs and progress |

### Health

| Method | Endpoint |
|--------|----------|
| `GET` | `/health` |
| `GET` | `/` |

> Interactive API docs available at [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Architecture

```
┌────────────────────────────────────────────────────────┐
│                      Frontend UI                       │
│              Next.js + Tailwind CSS v4                  │
│    [TestInput] [LiveDashboard] [Report] [History]       │
├────────────────────────────────────────────────────────┤
│                   API Gateway (FastAPI)                 │
│          REST + WebSocket + JWT Auth (ready)            │
├────────────────────────────────────────────────────────┤
│               AI Orchestration Engine                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Planner  │ │Function  │ │Visual QA │ │Security  │  │
│  │ Agent    │ │ Agent    │ │ Agent    │ │ Agent    │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                    LLM Provider Layer                   │
│              ┌──────────┐  ┌──────────┐               │
│              │  OpenAI  │  │  Claude  │               │
│              └──────────┘  └──────────┘               │
├────────────────────────────────────────────────────────┤
│           Browser Execution Runtime (Playwright)        │
│     Navigation | Screenshots | Console | Network        │
├────────────────────────────────────────────────────────┤
│              Report & Export System                     │
│         PDF (reportlab) | DOCX (python-docx) | JSON     │
├────────────────────────────────────────────────────────┤
│                    Data Layer                           │
│     SQLite (dev) / PostgreSQL (prod) + Redis Queue      │
└────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
ai-webapp-tester/
├── frontend/                    # Next.js app (TypeScript + Tailwind)
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── page.tsx              # Home (Test Input)
│   │   │   ├── dashboard/[id]/       # Live Execution Dashboard
│   │   │   ├── report/[id]/          # Report View
│   │   │   └── history/              # Run History
│   │   ├── components/          # Reusable UI components
│   │   ├── lib/                 # API client & WebSocket helpers
│   │   └── types/               # TypeScript type definitions
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                     # FastAPI API gateway
│   ├── api/                     # REST + WebSocket endpoints
│   ├── models/                  # SQLAlchemy ORM models
│   ├── services/                # Business logic
│   ├── tests/                   # Pytest test suite
│   ├── main.py                  # App entry point
│   └── requirements.txt
│
├── services/
│   ├── ai-orchestrator/         # AI agent coordination
│   │   ├── agents/              # Planner, Functional, Visual, A11y, Security
│   │   ├── llm/                 # OpenAI / Claude provider abstraction
│   │   └── orchestrator.py      # Main orchestrator
│   ├── visual-qa/               # Visual regression (standalone service)
│   ├── accessibility/           # WCAG compliance (standalone service)
│   └── security-probe/          # OWASP scanning (standalone service)
│
├── runtime/                     # Playwright browser automation
│   ├── browser/runner.py        # Headless Chromium execution
│   └── main.py                  # Runtime API service
│
├── reports/                     # Report generation engine
│   ├── generators/
│   │   ├── report_generator.py  # PDF / DOCX / JSON generators
│   └── output/                  # Generated reports
│
├── docker/                      # Dockerfiles for each service
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── Dockerfile.ai-orchestrator
│   └── Dockerfile.runtime
│
├── docker-compose.yml           # Production orchestration
├── docker-compose.dev.yml       # Development (hot reload)
├── run.bat                      # Windows one-click launcher
├── run.sh                       # Linux/Mac one-click launcher
├── .env.example                 # Environment template
├── pyproject.toml               # Python project config
└── README.md
```

---

## Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `AI_PROVIDER` | No | LLM provider (`openai` / `claude`) | `openai` |
| `OPENAI_API_KEY` | Yes* | OpenAI API key | — |
| `ANTHROPIC_API_KEY` | Yes* | Anthropic API key | — |
| `DATABASE_URL` | No | SQLite database path | `sqlite+aiosqlite:///./data/tester.db` |
| `REDIS_URL` | No | Redis connection URL | `redis://localhost:6379/0` |
| `FRONTEND_URL` | No | Frontend URL for CORS | `http://localhost:3000` |
| `SECRET_KEY` | Yes | JWT signing secret | `change-this` |
| `PLAYWRIGHT_HEADLESS` | No | Run browser headless | `true` |
| `LOG_LEVEL` | No | Logging level | `INFO` |

*\* Required if using the corresponding AI provider.*

---

## Test Profiles

| Profile | Description | Checks |
|---------|-------------|--------|
| **Basic** | Quick functional check | Page load, console errors, network status |
| **Full** | Comprehensive audit | Functional + Visual + Accessibility + Security |
| **Security** | Security-focused scan | OWASP Top 10, headers, CSRF, XSS |
| **Accessibility** | Accessibility audit | WCAG 2.1 AA compliance |

---

## Roadmap

| Phase | Weeks | Deliverable |
|-------|-------|-------------|
| **Phase 0** | Week 1 | Project scaffold, folder structure, configs |
| **Phase 1** | Weeks 2–3 | URL submission → Playwright → basic report (MVP) |
| **Phase 2** | Weeks 4–5 | AI agents with configurable LLM providers |
| **Phase 3** | Weeks 6–7 | Visual QA, accessibility scoring |
| **Phase 4** | Weeks 8–9 | Security scanning, multi-format reports |
| **Phase 5** | Week 10 | History, dashboard, UX polish |
| **Phase 6** | Week 11 | CI/CD, Docker, production readiness |
| **Phase 7** | Week 12 | Documentation |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| **Backend** | FastAPI, SQLAlchemy, Pydantic, SQLite |
| **AI** | OpenAI GPT-4o / Claude 3.5 Sonnet (configurable) |
| **Browser** | Playwright (Chromium) |
| **Task Queue** | Celery + Redis |
| **Reports** | ReportLab (PDF), python-docx (DOCX) |
| **Infrastructure** | Docker, Docker Compose, GitHub Actions |

---

## License

MIT
