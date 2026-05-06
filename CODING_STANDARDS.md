# Coding Standards

These standards keep the MVP understandable for junior contributors and reduce accidental drift.

## General

- Prefer existing patterns over new abstractions.
- Keep changes scoped to the feature or bug being handled.
- Do not commit generated build output, local caches, or secrets.
- Keep source files readable and boring: clear names, small helpers, and simple control flow.
- Add comments only when they explain non-obvious decisions.

## Formatting

- Use the repo's `.editorconfig` and `.prettierrc`.
- Keep TypeScript and Markdown plain ASCII unless the file already needs non-ASCII content.
- Run relevant checks before pushing:

```bash
npm run typecheck:backend
npm run test:backend
npm run lint:frontend
npm run test:frontend
npm run build:frontend
```

## TypeScript

- Prefer explicit types at module boundaries.
- Avoid `any` in new code unless the surrounding integration is genuinely untyped.
- Do not add `// @ts-nocheck` to new files.
- Validate external input before using it.
- Keep route request parsing in routes and business logic in services.

## Backend

Backend code lives in `app/backend/src`.

Use this layout:

```text
routes/       HTTP handlers and auth middleware composition
services/     Business logic and external service orchestration
queues/       Queue definitions and enqueue helpers
workers/      Background processors
utils/        Shared technical helpers
lib/          Shared clients such as Supabase
middleware/   Express middleware
```

Guidelines:

- New HTTP routes should go in `src/routes`.
- Keep `src/index.ts` focused on app setup and route registration.
- Put reusable logic in `src/services` or `src/utils`.
- Use Prisma through the existing Prisma helper/client patterns.
- Use structured logging through `src/utils/logger.ts`.
- Keep secrets in env vars, never in source.

## Frontend

Frontend code lives in `app/frontend/src`.

Use this layout:

```text
screens/      Route-level screens
components/   Reusable UI components
contexts/     React context providers
hooks/        Reusable hooks
lib/          API clients and shared helpers
```

Guidelines:

- Prefer existing UI components before creating new ones.
- Keep screen components focused on orchestration and layout.
- Put API calls and shared client logic in `src/lib`.
- Use Vite environment variables with the `VITE_` prefix.
- Avoid introducing large dependencies without checking production chunk output.

## Tests

- Backend: Jest through `npm run test:backend`.
- Frontend: Vitest through `npm run test:frontend`.
- Frontend test temp files are routed to `.tmp/vitest` by `app/frontend/scripts/run-vitest.mjs`.

Add tests when:

- A bug fix changes behavior.
- A service or route has non-trivial branching.
- Shared helpers or data transformations change.

## Documentation

Update docs when changing:

- Install or run commands
- Environment variables
- API routes
- Queue/worker behavior
- Deployment or CI behavior
- Repo structure

Canonical docs are listed in `README.md`. Avoid stale implementation reports.
