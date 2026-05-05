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
npm --prefix app/backend install
npm --prefix app/frontend install
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

Frontend unit tests are available with:

```bash
npm run test:frontend
```

## Pull Requests

- Describe what changed and why.
- Mention any environment variables, migrations, or setup steps.
- Include screenshots for visible frontend changes.
- Keep unrelated refactors out of feature PRs.

## Backend Route Guidelines

- Prefer route modules in `app/backend/src/routes`.
- Keep HTTP parsing in routes and business logic in `services` or `utils`.
- Avoid adding new large blocks to `src/index.ts`; use it as app setup and route registration.

## Frontend Guidelines

- Put screens in `app/frontend/src/screens`.
- Put reusable UI in `app/frontend/src/components`.
- Put API calls in `app/frontend/src/lib/api.ts`.
- Lazy-load heavy screens and SDKs when possible.
