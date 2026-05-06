# Operations

This document covers setup details that are useful after the first install: environment variables, queues, workers, Supabase storage, and troubleshooting.

## Environment Files

Use `.env.example` as the source of truth for common variables.

Local files:

- Backend: `app/backend/.env` or `app/backend/.env.local`
- Frontend: `app/frontend/.env.local`

Do not commit real secrets.

## Backend Essentials

```env
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/salesape?schema=public
JWT_SECRET=replace-with-a-long-random-secret
ENCRYPTION_KEY=replace-with-32-byte-hex-key
FRONTEND_URL=http://localhost:3002
OPENAI_API_KEY=replace-with-openai-key
```

`ENCRYPTION_KEY` is required by encrypted secret helpers. Use a strong fixed value per environment; changing it can make old encrypted values unreadable.

## Frontend Essentials

```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=replace-with-anon-key
```

The Vite dev server also proxies common API paths to the backend, but auth redirects and some explicit fetches use `VITE_API_URL`.

## Queue Provider

The backend chooses a queue provider through `QUEUE_PROVIDER`.

```env
QUEUE_PROVIDER=pgboss
```

or:

```env
QUEUE_PROVIDER=bullmq
REDIS_URL=redis://localhost:6379
```

Defaults:

- Development/local: `pgboss`
- Production: `bullmq`

Useful local switch:

```env
REDIS_SKIP_WORKERS=true
```

Use it when you want the API server without background workers.

## Workers

Worker files live in `app/backend/src/workers`.

The app can start workers during backend startup when Redis/BullMQ is enabled and readiness checks pass. Worker domains include:

- Website generation
- Lead automation
- Content generation
- Social posting
- Review requests
- Analytics polling
- Content ingestion
- Content repurposing
- Distribution
- Account deletion

If workers do not start locally:

1. Confirm `REDIS_SKIP_WORKERS` is not `true`.
2. Confirm `QUEUE_PROVIDER=bullmq` if you expect BullMQ workers.
3. Confirm `REDIS_URL` or `REDIS_HOST`/`REDIS_PORT`.
4. Check backend logs for Redis readiness messages.

## Redis

The backend uses `app/backend/src/utils/redis-client.ts` as the shared Redis client helper for BullMQ paths.

Common variables:

```env
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TLS=false
REDIS_CONNECT_TIMEOUT=5000
REDIS_ENABLE_OFFLINE_QUEUE=true
```

Prefer `REDIS_URL` when your hosting provider supplies one.

## Supabase

Server-side Supabase code expects:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=replace-with-service-role-key
```

Frontend Supabase code expects:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=replace-with-anon-key
```

Storage bucket names default to:

```env
SUPABASE_BUCKET_WEBSITES=websites
SUPABASE_BUCKET_VIDEOS=videos
SUPABASE_BUCKET_AUDIO=audio
SUPABASE_BUCKET_ASSETS=generated-assets
```

Create those buckets in the Supabase dashboard when using storage-backed website/video/audio features.

## AI And Content

Common AI variables:

```env
OPENAI_API_KEY=replace-with-openai-key
OPENAI_CHAT_MODEL=gpt-5-mini
OPENAI_TTS_MODEL=gpt-4o-mini-tts
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
ANTHROPIC_API_KEY=
UNSPLASH_ACCESS_KEY=
```

Fallback behavior:

- If OpenAI is missing, some routes return an explicit configuration error.
- Some content and image helpers fall back to existing data or mock-like placeholders.
- PageSpeed audit can be disabled or slowed with the `AUTO_PAGESPEED_*` variables.

## Email, SMS, Calendar, Payments

Email can use SendGrid or SMTP:

```env
SENDGRID_API_KEY=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
EMAIL_ENABLED=false
```

SMS:

```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_FROM=
```

Google:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
GOOGLE_PAGESPEED_API_KEY=
```

Stripe:

```env
VITE_STRIPE_PUBLISHABLE_KEY=
```

## Tests

Root commands:

```bash
npm run typecheck:backend
npm run test:backend
npm run lint:frontend
npm run test:frontend
npm run build:frontend
npm test
npm run build
```

Frontend Vitest is run through `app/frontend/scripts/run-vitest.mjs`, which forces Vitest temp files into a workspace-local `.tmp/vitest` folder. This avoids Windows/user-temp permission issues.

## Common Troubleshooting

Backend cannot connect to DB:

- Check `DATABASE_URL`.
- Run `npm run prisma:generate`.
- Confirm the database exists and accepts connections.

Frontend cannot reach backend:

- Confirm backend is on `http://localhost:3001`.
- Confirm frontend is on `http://localhost:3002`.
- Check `VITE_API_URL`.
- Check Vite proxy rules in `app/frontend/vite.config.ts`.

Vite chunk warning:

- Production chunk splitting is configured in `app/frontend/vite.config.ts`.
- Run `npm run build` and inspect chunk sizes.
- As of the latest cleanup, the largest chunk is `vendor-livekit`, below Vite's default warning threshold.

Supabase storage fails:

- Confirm `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`.
- Confirm bucket names exist.
- Confirm service-role key is only used server-side.

Workers should not run locally:

- Set `REDIS_SKIP_WORKERS=true`.

Workers should run locally:

- Set `QUEUE_PROVIDER=bullmq`.
- Configure Redis.
- Remove `REDIS_SKIP_WORKERS=true`.
