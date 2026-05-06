# Architecture

SalesAPE is a Vite React frontend plus an Express TypeScript backend. The backend owns API routes, Prisma access, queues, workers, and integrations with external services.

## High-Level Map

```text
Browser
  |
  v
Vite React frontend (app/frontend, port 3002)
  |
  | HTTP / JSON
  v
Express backend (app/backend, port 3001)
  |
  +-- Prisma -> PostgreSQL
  +-- Queue provider -> pg-boss or BullMQ/Redis
  +-- Workers -> content, website, automation, publishing, analytics
  +-- External services -> Supabase, OpenAI, email, SMS, Google, Stripe, Beyond/LiveKit
```

## Frontend

Location: `app/frontend`

- Framework: Vite, React 19, TypeScript
- Dev server: `http://localhost:3002`
- Main entry: `src/main.tsx`
- Router: `src/routes.tsx`
- Screens: `src/screens`
- Shared UI: `src/components`
- Shared clients/helpers: `src/lib`
- Build output: `app/frontend/build`

The frontend uses Vite proxy rules for common API paths during local development. Code that needs an absolute API origin should use `VITE_API_URL`.

Production chunks are configured in `app/frontend/vite.config.ts` so large dependencies such as React, React Router, LiveKit, Radix UI, icons, Stripe, Axios, and Zod are split into named vendor chunks.

## Backend

Location: `app/backend`

- Runtime: Node.js, Express, TypeScript
- Dev server: `http://localhost:3001`
- App bootstrap: `src/index.ts`
- Extracted route modules: `src/routes`
- Business services: `src/services`
- Queue definitions and provider: `src/queues`
- Background workers: `src/workers`
- Prisma client wrapper: `src/prisma.ts`
- Prisma schema: `prisma/schema.prisma`

`src/index.ts` still contains legacy route groups. New route work should go in `src/routes`, with reusable business logic in `src/services` or `src/utils`.

Current extracted route modules:

- `analytics-dashboard.ts`
- `apeChat.ts`
- `approval-workflow.ts`
- `auth.ts`
- `health.ts`
- `memory.ts`
- `scheduling.ts`
- `settings.ts`
- `team-permissions.ts`
- `tts.ts`

## Data

The production datasource is PostgreSQL through `DATABASE_URL`.

Run Prisma client generation after dependency install or schema changes:

```bash
npm run prisma:generate
```

## Queues And Workers

Queue provider selection lives in `app/backend/src/queues/provider.ts`.

- `QUEUE_PROVIDER=pgboss` uses PostgreSQL-backed pg-boss.
- `QUEUE_PROVIDER=bullmq` uses BullMQ with Redis.
- If unset, local/development defaults to `pgboss`; production defaults to `bullmq`.

Worker implementations live in `app/backend/src/workers`. Local development can skip worker startup with:

```env
REDIS_SKIP_WORKERS=true
```

Main worker domains:

- Website generation
- Lead automation
- Content generation
- Content ingestion
- Content repurposing
- Social distribution/posting
- Review requests
- Analytics polling
- Account deletion

## External Services

Common integrations:

- Supabase for storage/auth support
- OpenAI for generation, embeddings, and TTS
- Anthropic as an optional repurposing provider
- Redis for BullMQ queues
- SendGrid or SMTP for email
- Twilio for SMS
- Google APIs for auth/calendar/PageSpeed
- Stripe for payments
- Beyond Presence and LiveKit for avatar/voice sessions
- Unsplash for generated website imagery

Keep secrets in local env files or deployment environment variables. Never commit real secrets.

## CI

GitHub Actions installs backend and frontend dependencies, generates Prisma client, typechecks/tests the backend, and builds the frontend.

Workflow file: `.github/workflows/ci.yml`
