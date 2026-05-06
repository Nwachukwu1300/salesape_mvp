# SalesAPE MVP

SalesAPE helps small service businesses turn an Instagram profile, website URL, or guided conversation into a working online presence: generated website, lead capture, bookings, content workflows, and follow-up automation.

## Stack

Backend:

- Node.js, Express, TypeScript
- Prisma with PostgreSQL
- Queue provider abstraction: pg-boss for simple local/dev use, BullMQ/Redis for production-style workers
- Integrations for Supabase, OpenAI, email, SMS, Google Calendar, publishing, voice/avatar services, and payments

Frontend:

- Vite, React 19, TypeScript
- Tailwind CSS
- React Router
- Vitest for unit tests

## Repo Map

```text
salesape_mvp/
  app/
    backend/        Express API, Prisma schema, queues, workers, services
    frontend/       Vite React app
  docs/             Canonical project docs
  .github/          CI workflow
```

Important backend paths:

- `app/backend/src/index.ts` - app bootstrap plus remaining legacy route groups
- `app/backend/src/routes` - extracted route modules
- `app/backend/src/services` - business logic and integrations
- `app/backend/src/queues` - queue provider and queue definitions
- `app/backend/src/workers` - background workers
- `app/backend/prisma/schema.prisma` - database schema

Important frontend paths:

- `app/frontend/src/routes.tsx` - app route table
- `app/frontend/src/screens` - route screens
- `app/frontend/src/components` - reusable UI
- `app/frontend/src/lib` - shared clients and helpers
- `app/frontend/vite.config.ts` - dev server, proxy, and production chunk config

## Prerequisites

- Node.js 20 or newer
- npm
- PostgreSQL database URL for full backend features
- Optional Redis if `QUEUE_PROVIDER=bullmq`

The repo includes `.nvmrc` for the expected local Node version.

## Environment

Do not commit real secrets.

Use `.env.example` as the reference, then copy values into:

- `app/backend/.env`
- `app/backend/.env.local`
- `app/frontend/.env.local`

Minimum backend values:

```env
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/salesape?schema=public
JWT_SECRET=replace-with-a-long-random-secret
ENCRYPTION_KEY=replace-with-32-byte-hex-key
FRONTEND_URL=http://localhost:3002
OPENAI_API_KEY=replace-with-openai-key
REDIS_SKIP_WORKERS=true
```

Minimum frontend values:

```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=replace-with-anon-key
```

## Install

From the repo root:

```bash
npm run install:all
npm run prisma:generate
```

## Run Locally

Start the backend:

```bash
npm run dev:backend
```

Backend default URL:

```text
http://localhost:3001
```

Start the frontend in another terminal:

```bash
npm run dev:frontend
```

Frontend default URL:

```text
http://localhost:3002
```

## Build And Test

```bash
npm run typecheck:backend
npm run test:backend
npm run lint:frontend
npm run test:frontend
npm run build:frontend
```

Combined checks:

```bash
npm test
npm run build
```

## CI

GitHub Actions runs on pushes and pull requests to `main`.

Workflow file:

```text
.github/workflows/ci.yml
```

Current CI steps:

1. Setup Node 20
2. Install backend dependencies
3. Install frontend dependencies
4. Generate Prisma client
5. Typecheck backend
6. Run backend tests
7. Build frontend

## Docs

Canonical docs:

- `docs/ARCHITECTURE.md` - system map and code ownership
- `docs/API.md` - API surface and route ownership
- `docs/OPERATIONS.md` - environment, queues, workers, Supabase, and troubleshooting
- `CONTRIBUTING.md` - branch, PR, and test rules
- `CODING_STANDARDS.md` - coding conventions

Old implementation reports and duplicate API guides were removed. If a new doc is needed, keep it current and link it here.
