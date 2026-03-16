# AI Company - Hackathon MVP

## Overview

AI Company is a hackathon MVP where users click "Start Company" and four AI co-CEOs (Tech, Market, Skeptic, Finance) debate startup ideas via real OpenRouter LLM calls, converge on one company, then worker agents generate deliverables (product spec, GTM plan, finance memo, landing page).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind (dark mode AI control room theme)
- **Backend**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: OpenRouter (multi-model: Claude, GPT-4o, Gemini)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts/
├── ai-company/           # React + Vite frontend (dark mode dashboard)
│   └── src/
│       ├── components/    # AgentCard, TranscriptPanel, CompanySummary, ArtifactsPanel, etc.
│       ├── data/          # agents.ts - agent display profiles (colors, names, models)
│       ├── hooks/         # use-simulation.ts - real API polling hook
│       └── pages/         # Dashboard page
├── api-server/            # Express API server
│   └── src/
│       ├── config/        # agents.ts, models.ts, env.ts
│       ├── lib/           # openrouter.ts helper
│       ├── prompts/       # founders.ts, workers.ts
│       ├── routes/        # health.ts, runs.ts, config.ts
│       └── services/      # runService, transcriptService, artifactService,
│                          # founderOrchestrator (REAL LLM), workerOrchestrator, seedService (empty)
lib/
├── api-spec/              # OpenAPI spec + Orval codegen config
├── api-client-react/      # Generated React Query hooks
├── api-zod/               # Generated Zod schemas
└── db/                    # Drizzle ORM schema (runs, transcript_messages, artifacts)
```

## Founder Debate Flow (Real LLM)

1. Frontend: POST /api/runs → POST /api/runs/:id/founders/start (fire-and-forget)
2. Backend runs founderOrchestrator asynchronously:
   - Phase 1 (Ideation): Each of 4 founders calls OpenRouter with their persona prompt + user keywords
   - Phase 2 (Critique): Each founder critiques all ideas
   - Phase 3 (Convergence): GPT-4o synthesizes consensus → updates run with companyName/tagline
3. Frontend polls GET /api/runs/:id and GET /api/runs/:id/transcript every 2s for live updates
4. Idempotency: /founders/start rejects if run already running/completed (409)

## Database Tables

- **runs** - Company generation runs with status, phase, company details
- **transcript_messages** - Chat messages from AI agents during debate
- **artifacts** - Generated deliverables (product spec, GTM plan, finance memo, preview)

## API Endpoints

- `GET /api/healthz` - Health check (DB status)
- `POST /api/health/openrouter` - Test OpenRouter connection
- `POST /api/runs` - Create new run
- `GET /api/runs/:runId` - Get run details
- `GET /api/runs/:runId/transcript` - Get transcript messages
- `GET /api/runs/:runId/artifacts` - Get artifacts
- `POST /api/runs/:runId/founders/start` - Start founder debate (real LLM calls)
- `POST /api/runs/:runId/workers/start` - Start worker phase (placeholder)
- `GET /api/runs/:runId/preview` - Get landing page preview (placeholder)
- `GET /api/config/agents` - Get agent configuration

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection (auto-provided by Replit)
- `OPENROUTER_API_KEY` - Required for AI model calls
- `OPENROUTER_BASE_URL` - Optional, defaults to https://openrouter.ai/api/v1
- `OPENROUTER_SITE_URL` - Optional
- `OPENROUTER_APP_NAME` - Optional, defaults to "AI Company"

## Commands

- `pnpm run typecheck` - Full typecheck
- `pnpm --filter @workspace/api-spec run codegen` - Regenerate API client
- `pnpm --filter @workspace/db run push` - Push DB schema changes
- `pnpm --filter @workspace/api-server run dev` - Run API server
- `pnpm --filter @workspace/ai-company run dev` - Run frontend
