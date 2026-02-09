# Sentry Setup Verification Checklist ✅

## Installed Packages
- ✅ `@sentry/node` v10.38.0 (Backend)
- ✅ `@sentry/tracing` (Backend)
- ✅ `@sentry/nextjs` (Frontend)

## Configuration Files Created/Updated

### Backend (Express)
- ✅ [app/backend/src/utils/sentry.ts](app/backend/src/utils/sentry.ts) - Helper module
- ✅ [app/backend/src/index.ts](app/backend/src/index.ts) - Initialization wired
- ✅ [app/backend/.env](app/backend/.env) - Environment template

### Frontend (Next.js)  
- ✅ [app/frontend/sentry.server.config.ts](app/frontend/sentry.server.config.ts) - Server config
- ✅ [app/frontend/sentry.client.config.ts](app/frontend/sentry.client.config.ts) - Client config
- ✅ [app/frontend/instrumentation.ts](app/frontend/instrumentation.ts) - Auto-init hook
- ✅ [app/frontend/next.config.ts](app/frontend/next.config.ts) - Updated with hook
- ✅ [app/frontend/app/error.tsx](app/frontend/app/error.tsx) - Error boundary
- ✅ [app/frontend/app/global-error.tsx](app/frontend/app/global-error.tsx) - Global handler
- ✅ [app/frontend/.env.local](app/frontend/.env.local) - Env vars added

### Documentation
- ✅ [SENTRY_SETUP.md](SENTRY_SETUP.md) - Comprehensive guide
- ✅ [SENTRY_INSTALLATION_COMPLETE.md](SENTRY_INSTALLATION_COMPLETE.md) - Installation summary

## Integration Points

### Backend (Express)
```
app.ts → initializeSentry(app)
         ↓
      app.use(attachSentryErrorHandler)
         ↓
      Global error handling active
```

### Frontend (Next.js)
```
instrumentation.ts (auto-loaded by Next.js)
   ├─ sentry.server.config.ts (server-side)
   └─ sentry.client.config.ts (client-side)
         ↓
    app/error.tsx (component errors)
    app/global-error.tsx (critical errors)
```

## Environment Variables

### Frontend (.env.local) ✅
```env
NEXT_PUBLIC_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
NEXT_PUBLIC_SENTRY_TRACE_SAMPLE_RATE=1.0
NEXT_PUBLIC_SENTRY_REPLAY_SESSION_SAMPLE_RATE=0.1
NEXT_PUBLIC_SENTRY_REPLAY_ERROR_SAMPLE_RATE=1.0
```

### Backend (.env) ✅
```env
# Uncomment and set:
# SENTRY_DSN=https://<public>@sentry.io/<project>
# SENTRY_ENV=production
# SENTRY_RELEASE=your-app@1.2.3
# SENTRY_TRACES_SAMPLE_RATE=0.1
```

## Ready for Deployment

To complete setup:
1. Replace `NEXT_PUBLIC_SENTRY_DSN` with your actual DSN from Sentry
2. Uncomment and update backend `SENTRY_DSN` in `.env`
3. Start the app and verify error capture in Sentry dashboard

Live Sentry Dashboard: https://sentry.io/organizations/francis-cz/issues/?project=7564889
