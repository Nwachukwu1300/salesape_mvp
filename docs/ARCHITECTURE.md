# Architecture

SalesAPE is a Vite React frontend plus an Express TypeScript backend. The backend owns API routes, Prisma access, queues, workers, and external service integrations.

## Repo Map

```text
salesape_mvp/
  app/
    backend/        Express API, Prisma schema, workers, queues, services
    frontend/       Vite React app
  docs/             Architecture and operating notes
  .github/          CI workflow
```

## Frontend

Location: `app/frontend`

- Framework: Vite + React 19 + TypeScript
- Dev server: `http://localhost:3002`
- Main entry: `src/main.tsx`
- Router: `src/routes.tsx`
- Screens: `src/screens`
- Shared UI: `src/components`
- API client: `src/lib/api.ts`

The frontend calls the backend on `http://localhost:3001` in development. Vite also proxies common API paths during local dev.

## Backend

Location: `app/backend`

- Runtime: Node.js + Express + TypeScript
- Dev server: `http://localhost:3001`
- App bootstrap: `src/index.ts`
- Route modules: `src/routes`
- Business services: `src/services`
- Queue setup: `src/queues`
- Background workers: `src/workers`
- Prisma schema: `prisma/schema.prisma`

`src/index.ts` still contains legacy route groups. New work should move toward route modules in `src/routes` and services in `src/services`.

## Data

- Prisma models live in `app/backend/prisma/schema.prisma`.
- The production datasource is PostgreSQL through `DATABASE_URL`.
- Run Prisma client generation after dependency install or schema changes:

```bash
npm run prisma:generate
```

## Queues And Workers

The backend supports background jobs for website generation, content ingestion, repurposing, publishing, reviews, and automation.

Key folders:

- `app/backend/src/queues`
- `app/backend/src/workers`

Local development can skip Redis-backed workers with:

```env
REDIS_SKIP_WORKERS=true
```

## External Services

Common integrations include:

- Supabase for auth/storage support
- OpenAI for generation and TTS
- Redis or pg-boss for background jobs
- SendGrid for email
- Twilio for SMS
- Google APIs for calendar
- Beyond Presence and LiveKit for avatar/voice sessions
- Stripe for payments

Keep secrets in `app/backend/.env` or deployment environment variables. Do not commit real secrets.

## CI

GitHub Actions installs backend and frontend dependencies, generates Prisma client, typechecks/tests the backend, and builds the frontend.

Workflow file: `.github/workflows/ci.yml`
