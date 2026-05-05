# SalesAPE MVP

SalesAPE helps small service businesses turn an Instagram profile, website URL, or short conversation into a working online business presence: generated website, lead capture, bookings, content workflows, and follow-up automation.

## Tech Stack

Backend:

- Node.js + Express
- TypeScript
- Prisma + PostgreSQL
- Background jobs through Redis or pg-boss
- Integrations for Supabase, OpenAI, email, SMS, calendar, publishing, and voice/avatar services

Frontend:

- Vite
- React 19
- TypeScript
- Tailwind CSS
- React Router

## Repo Structure

```text
salesape_mvp/
  app/
    backend/        Express API, Prisma, queues, workers, services
    frontend/       Vite React app
  docs/             Architecture and operating notes
  .github/          CI workflow
```

Important backend folders:

- `app/backend/src/index.ts` - app bootstrap and legacy route registration
- `app/backend/src/routes` - route modules
- `app/backend/src/services` - business logic and integrations
- `app/backend/src/queues` - queue definitions and queue provider setup
- `app/backend/src/workers` - background workers
- `app/backend/prisma/schema.prisma` - database schema

Important frontend folders:

- `app/frontend/src/routes.tsx` - app routes
- `app/frontend/src/screens` - route screens
- `app/frontend/src/components` - reusable UI
- `app/frontend/src/lib/api.ts` - API client helpers

## Prerequisites

- Node.js 20 or newer
- npm
- PostgreSQL database URL for full backend features
- Optional Redis for Redis-backed workers

The repo includes `.nvmrc` with the expected local Node version.

## Environment Files

Do not commit real secrets.

Use these files locally:

- `app/backend/.env`
- `app/backend/.env.local`
- `app/frontend/.env.local`

Use `.env.example` at the repo root as the reference list for common variables.

Minimum backend variables for most local work:

```env
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/salesape?schema=public
JWT_SECRET=replace-with-a-long-random-secret
ENCRYPTION_KEY=replace-with-32-byte-hex-key
FRONTEND_URL=http://localhost:3002
OPENAI_API_KEY=replace-with-openai-key
REDIS_SKIP_WORKERS=true
```

Minimum frontend variables:

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=replace-with-anon-key
```

## Install

From the repo root:

```bash
npm run install:all
```

Or install apps separately:

```bash
npm --prefix app/backend install
npm --prefix app/frontend install
```

Generate Prisma client after backend install:

```bash
npm run prisma:generate
```

## Run Locally

Start backend:

```bash
npm run dev:backend
```

Backend runs on:

```text
http://localhost:3001
```

Start frontend in another terminal:

```bash
npm run dev:frontend
```

Frontend runs on:

```text
http://localhost:3002
```

## Build And Test

Backend typecheck:

```bash
npm run typecheck:backend
```

Backend tests:

```bash
npm run test:backend
```

Frontend lint:

```bash
npm run lint:frontend
```

Frontend unit tests:

```bash
npm run test:frontend
```

Frontend production build:

```bash
npm run build:frontend
```

Default combined test command:

```bash
npm test
```

## CI

GitHub Actions runs on pushes and pull requests to `main`.

The workflow:

1. Sets up Node 20
2. Installs backend dependencies
3. Installs frontend dependencies
4. Generates Prisma client
5. Typechecks backend
6. Runs backend tests
7. Builds frontend

Workflow file:

```text
.github/workflows/ci.yml
```

## Working On Backend Routes

Prefer new route modules in `app/backend/src/routes`.

Current direction:

- Keep `src/index.ts` focused on app setup and route registration.
- Put HTTP handlers in route modules.
- Put reusable business logic in `src/services` or `src/utils`.

Example route module:

```text
app/backend/src/routes/tts.ts
```

## More Docs

- `docs/ARCHITECTURE.md` - system map
- `CONTRIBUTING.md` - branch, PR, and test rules
- `CODING_STANDARDS.md` - coding conventions
