# AI Company

**Autonomous Startup Factory** — Four AI co-CEOs debate your startup idea in real-time, then build the company.

![Dark Mode AI Control Room](https://img.shields.io/badge/UI-Dark_Mode_Control_Room-0f172a?style=for-the-badge)
![Real LLM Calls](https://img.shields.io/badge/AI-Real_LLM_Calls-06b6d4?style=for-the-badge)
![Hackathon MVP](https://img.shields.io/badge/Status-Hackathon_MVP-10b981?style=for-the-badge)

---

## What is this?

You type in a startup idea (e.g. "fintech, payments"). Four AI co-CEOs — each powered by a different frontier LLM — debate, critique, and converge on the best company to build. You watch the whole thing happen live in a sci-fi control room UI.

**No mock data. No simulations. Real LLM calls, real debate, real output.**

### The Board

| Role | Model | Personality |
|------|-------|-------------|
| **Tech CEO** | OpenAI GPT-5.4 | Technical feasibility, architecture, engineering |
| **Market CEO** | Anthropic Claude Sonnet 4.6 | Market opportunity, GTM, user acquisition |
| **Skeptic CEO** | xAI Grok 4.20 Beta | Risk analysis, stress-testing, devil's advocate |
| **Finance CEO** | Google Gemini 3.1 Pro | Revenue modeling, unit economics, funding |

### How It Works

```
User enters keywords ("healthcare, ai, analytics")
         |
    [Phase 1: IDEATION]
    Each CEO proposes a startup idea
         |
    [Phase 2: CRITIQUE]
    Each CEO critiques all proposals
         |
    [Phase 3: CONVERGENCE]
    GPT-5.4 synthesizes consensus
         |
    Company Name, Tagline, Summary
         |
    [Phase 4: WORKERS] (coming soon)
    Builder, GTM Strategist, Finance Ops
    generate deliverables
```

---

## Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 19 + Vite + Tailwind CSS |
| **Backend** | Express 5 (Node.js) |
| **Database** | PostgreSQL + Drizzle ORM |
| **AI** | OpenRouter (multi-model routing) |
| **Monorepo** | pnpm workspaces |
| **Types** | TypeScript 5.9 + Zod v4 |
| **API** | OpenAPI spec + Orval codegen |
| **Build** | esbuild (CJS bundle) |

---

## Project Structure

```
artifacts/
  ai-company/              React frontend (dark mode control room)
    src/
      components/           AgentCard, TranscriptPanel, CompanySummary, ArtifactsPanel
      data/                 Agent display profiles
      hooks/                use-simulation (real API polling)
      pages/                Dashboard

  api-server/              Express API server
    src/
      config/              Agent definitions, model registry
      lib/                 OpenRouter HTTP client
      prompts/             System prompts per agent persona
      routes/              REST endpoints
      services/            Orchestrators, DB services

lib/
  api-spec/                OpenAPI 3.0 spec + Orval config
  api-client-react/        Generated React Query hooks
  api-zod/                 Generated Zod validation schemas
  db/                      Drizzle schema (runs, transcript_messages, artifacts)
```

---

## Architecture

### Founder Debate Loop

1. **Frontend** creates a run via `POST /api/runs`, then fires `POST /api/runs/:id/founders/start`
2. **Backend** spawns the orchestrator asynchronously (fire-and-forget with error catch)
3. **Orchestrator** runs three phases sequentially:
   - **Ideation**: Each founder calls their LLM with persona prompt + user keywords, building on prior proposals
   - **Critique**: Each founder evaluates all ideas from their perspective
   - **Convergence**: GPT-5.4 synthesizes the debate into a JSON decision (company name, tagline, winner)
4. **Frontend** polls `GET /api/runs/:id/transcript` every 2 seconds for live updates
5. Run transitions: `created` -> `running` -> `founders_ideation` -> `founders_critique` -> `founders_convergence` -> `founders_complete`

### Safety

- **Idempotency**: `/founders/start` rejects with 409 if the run is already running or completed
- **Error resilience**: Individual LLM failures are captured as transcript messages; catastrophic failures set run to error state
- **Polling**: Recursive `setTimeout` (not `setInterval`) prevents overlapping requests; auto-stops after 10 consecutive errors

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/healthz` | Health check (DB status) |
| `POST` | `/api/health/openrouter` | Test OpenRouter connection |
| `POST` | `/api/runs` | Create new run |
| `GET` | `/api/runs/:runId` | Get run details |
| `GET` | `/api/runs/:runId/transcript` | Get transcript messages |
| `GET` | `/api/runs/:runId/artifacts` | Get generated artifacts |
| `POST` | `/api/runs/:runId/founders/start` | Start founder debate |
| `POST` | `/api/runs/:runId/workers/start` | Start worker phase |
| `GET` | `/api/runs/:runId/preview` | Get landing page preview |
| `GET` | `/api/config/agents` | Get agent configuration |

---

## Database Schema

### runs
Core entity tracking each company generation session.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `status` | varchar | created, running, completed, error |
| `phase` | varchar | Current phase (idle, founders_ideation, etc.) |
| `userKeywords` | text | Input keywords from user |
| `companyName` | varchar | Generated company name |
| `companyTagline` | varchar | Generated tagline |
| `selectedIdeaTitle` | varchar | Winning idea title |
| `selectedIdeaSummary` | text | Winning idea summary |
| `winnerAgentKey` | varchar | Which CEO's idea won |

### transcript_messages
Ordered log of every AI agent message during debate.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `runId` | UUID | FK to runs |
| `phase` | varchar | founders, workers |
| `agentKey` | varchar | tech, market, skeptic, finance, system |
| `roleType` | varchar | founder, worker, system |
| `messageType` | varchar | idea, critique, decision, phase_start |
| `content` | text | The actual message content |
| `sortOrder` | integer | Ordering within the run |

### artifacts
Generated deliverables from worker agents.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `runId` | UUID | FK to runs |
| `artifactType` | varchar | product_spec, gtm_plan, finance_memo, preview |
| `title` | varchar | Artifact title |
| `content` | text | Generated content |

---

## Setup

### Prerequisites
- Node.js 24+
- pnpm 10+
- PostgreSQL
- [OpenRouter API key](https://openrouter.ai/)

### Install & Run

```bash
# Install dependencies
pnpm install

# Set up environment
# DATABASE_URL is auto-provided on Replit
# Set OPENROUTER_API_KEY in your environment

# Push database schema
pnpm --filter @workspace/db run push

# Start the API server
pnpm --filter @workspace/api-server run dev

# Start the frontend
pnpm --filter @workspace/ai-company run dev
```

### Regenerate API Client

```bash
pnpm --filter @workspace/api-spec run codegen
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key for LLM calls |
| `OPENROUTER_BASE_URL` | No | Defaults to `https://openrouter.ai/api/v1` |
| `OPENROUTER_APP_NAME` | No | Defaults to "AI Company" |

---

## License

MIT
