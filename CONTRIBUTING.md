# Contributing

This repo is an MVP, so keep changes small, easy to review, and backed by the checks below.

## Branches

- `main` should always build.
- Create feature branches from `main`.
- Use focused branch names like `feature/content-studio-upload` or `fix/backend-tts`.

## Before You Start

1. Pull the latest `main`.
2. Install dependencies:

```bash
npm run install:all
```

3. Generate Prisma client after backend installs or schema changes:

```bash
npm run prisma:generate
```

## Local Development

Run backend and frontend in separate terminals:

```bash
npm run dev:backend
npm run dev:frontend
```

Backend runs on `http://localhost:3001`.
Frontend runs on `http://localhost:3002`.

## Required Checks

Run these before opening a PR or pushing to `main`:

```bash
npm run typecheck:backend
npm run test:backend
npm run lint:frontend
npm run build:frontend
```

Also run frontend unit tests when touching frontend behavior:

```bash
npm run test:frontend
```

Run all tests with:

```bash
npm test
```

## Pull Requests

- Describe what changed and why.
- Mention any environment variables, migrations, or setup steps.
- Include screenshots for visible frontend changes.
- Keep unrelated refactors out of feature PRs.
- Update docs in the same PR when behavior, setup, routes, env vars, or architecture changes.

## Backend Route Guidelines

- Prefer route modules in `app/backend/src/routes`.
- Keep HTTP parsing in routes and business logic in `services` or `utils`.
- Avoid adding new large blocks to `src/index.ts`; use it for app setup and route registration.
- When touching a legacy route group in `src/index.ts`, consider extracting that group.

## Frontend Guidelines

- Put route screens in `app/frontend/src/screens`.
- Put reusable UI in `app/frontend/src/components`.
- Put shared API/client helpers in `app/frontend/src/lib`.
- Lazy-load heavy screens and SDKs when possible.
- Keep Vite chunk splitting in `app/frontend/vite.config.ts` current when adding large dependencies.

## Docs Guidelines

Canonical docs live in:

- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/OPERATIONS.md`
- `CONTRIBUTING.md`
- `CODING_STANDARDS.md`

Avoid new one-off "implementation complete" reports. If a feature needs documentation, add it to one of the canonical docs or create a durable guide under `docs/` and link it from `README.md`.
