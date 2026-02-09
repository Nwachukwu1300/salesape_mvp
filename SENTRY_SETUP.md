# Sentry Install & Configuration

This document explains how to install and configure Sentry for this project (backend and frontend). It assumes you have permission to run package manager commands where indicated.

## Quick summary
- Backend: `app/backend` — uses `@sentry/node` (server-side). A helper already exists at `app/backend/src/utils/sentry.ts`.
- Frontend: `app/frontend` — for Next.js use `@sentry/nextjs`; otherwise use `@sentry/react` + `@sentry/tracing`.
- **Sentry is now wired into startup** — see [Error Coverage](#error-coverage) below.

## Error Coverage

Sentry is configured to capture errors across the entire platform:

### Backend (Express)
✅ **Automatically captured:**
- All HTTP request/response errors via `Sentry.Handlers.requestHandler()`
- Tracing for performance monitoring via `Sentry.Handlers.tracingHandler()`
- Unhandled exceptions via `attachSentryErrorHandler(app)` (placed after all routes)
- Process-level unhandled rejections (if integrations active)

✅ **Manual capture available:**
- Use `captureException(error, context)` for custom error handling
- Use `captureMessage(msg, level)` for logging to Sentry

**Initialization:** Called in `app/backend/src/index.ts` immediately after app creation.

### Frontend (Next.js)
✅ **Automatically captured:**
- Client-side React errors via `app/error.tsx` error boundary
- Global application errors via `app/global-error.tsx`
- Tracing for performance monitoring (client & server)
- Page navigation and transaction tracking

✅ **Manual capture available:**
- Use `Sentry.captureException(error)` in event handlers
- Use `Sentry.captureMessage(msg)` for custom logging

**Initialization:** 
- Auto-loaded via `instrumentation.ts` on Next.js startup (requires `experimental.instrumentationHook: true` in `next.config.ts`)
- Client config: `sentry.client.config.ts`
- Server config: `sentry.server.config.ts`

### Coverage Matrix

| Component | Error Capture | Perf Tracing | Sessions | Replays |
|-----------|---------------|--------------|----------|---------|
| Backend (Express) | ✅ Yes | ✅ Yes | ❌ No | N/A |
| Frontend (Next.js Client) | ✅ Yes | ✅ Yes | ✅ Yes (0.1 rate) | ✅ Yes (1.0 on error) |
| Frontend (Next.js Server) | ✅ Yes | ✅ Yes | ❌ No | N/A |

---

## Environment variables

All variables are optional and Sentry will gracefully disable itself if no DSN is set.

### Backend
```
SENTRY_DSN=https://<public>@sentry.io/<project>
SENTRY_ENV=production
SENTRY_RELEASE=app@1.2.3
SENTRY_TRACES_SAMPLE_RATE=0.1          # 0.0-1.0, lower = fewer events
```

### Frontend
```
NEXT_PUBLIC_SENTRY_DSN=https://<public>@sentry.io/<project>
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.0    # Set to 0 in dev to avoid noise
NEXT_PUBLIC_ENVIRONMENT=production
```

**Important:** 
- Only set `NEXT_PUBLIC_SENTRY_DSN` if you want **client-side** error reporting.
- Set variables in `.env.local` (local dev) or deployment secrets (staging/prod).
- **Never commit DSNs to version control.**

---

## Installation

### Backend (Express / Node)

1. Install packages:

```bash
npm --prefix app/backend install @sentry/node @sentry/tracing
```

2. Sentry is already initialized in `app/backend/src/index.ts`:
   - `initializeSentry(app)` — called after app creation
   - `attachSentryErrorHandler(app)` — called before server.listen()
   - Both calls are guarded by `try/catch` and log warnings if DSN is missing

3. Set `SENTRY_DSN` in `.env` (see env vars above).

### Frontend (Next.js)

1. Install packages:

```bash
npm --prefix app/frontend install @sentry/nextjs
```

2. Sentry is already initialized via `instrumentation.ts`:
   - `next.config.ts` has `experimental.instrumentationHook: true`
   - `instrumentation.ts` auto-loads server/client configs on startup
   - `app/error.tsx` and `app/global-error.tsx` catch React errors

3. Set `NEXT_PUBLIC_SENTRY_DSN` in `.env.local` (see env vars above).

4. Optionally wrap main App/Page in Sentry's `<ErrorBoundary>`:

```tsx
import * as Sentry from '@sentry/nextjs';

export default Sentry.withErrorBoundary(MyComponent, {
  fallback: <div>Something went wrong</div>,
  showDialog: true,
});
```

---

## Configuration Files

### Backend
- `app/backend/src/utils/sentry.ts` — SDK init + helpers  
- `app/backend/src/index.ts` — calls `initializeSentry()` and `attachSentryErrorHandler()`

### Frontend
- `sentry.server.config.ts` — server-side init (loaded via instrumentation)
- `sentry.client.config.ts` — client-side init + replay config (loaded via instrumentation)
- `instrumentation.ts` — Next.js hook to auto-load configs
- `app/error.tsx` — React error boundary (local errors)
- `app/global-error.tsx` — global error handler (critical errors)
- `next.config.ts` — has `experimental.instrumentationHook: true` enabled

---

## Testing

### Backend
To test backend error capture:

```bash
# Start backend with SENTRY_DSN set
SENTRY_DSN=https://... npm --prefix app/backend run dev

# Trigger an error on an API endpoint (e.g., divide by zero)
# Check your Sentry project dashboard for the error event
```

### Frontend
To test frontend error capture:

```bash
# Start frontend with NEXT_PUBLIC_SENTRY_DSN set
NEXT_PUBLIC_SENTRY_DSN=https://... npm --prefix app/frontend run dev

# In the browser console:
throw new Error('Test error');

# Check your Sentry dashboard
```

---

## Best Practices

1. **Sample rates in production:** Set `tracesSampleRate` low (0.1 = 10%) to avoid quota overages.
2. **Sensitive data:** Use Scrubbing rules in Sentry to redact PII from errors.
3. **Release tracking:** Set `SENTRY_RELEASE` to your git tag or deployment version for better issue tracking.
4. **Monitor quotas:** Check Sentry's event quota monthly and adjust sample rates if needed.
5. **Alert on critical issues:** Configure Sentry alerts in the project settings.

---

## Troubleshooting

**Errors not appearing in Sentry?**
- Confirm `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` is set and correct.
- Check browser console / server logs for errors.
- Ensure `NEXT_PUBLIC_SENTRY_DSN` is in quotes in `.env.local`.
- Try increasing `SENTRY_TRACES_SAMPLE_RATE` temporarily for testing.

**Stale TypeScript files?**
```bash
rm app/frontend/tsconfig.tsbuildinfo
npm --prefix app/frontend run build
```

**Sentry packages not installing?**
If you cannot run `npm install` due to permissions, contact DevOps. Sentry config is in place but will remain inactive until packages are installed.


