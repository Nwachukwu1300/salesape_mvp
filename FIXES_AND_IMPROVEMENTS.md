# Fixes and Improvements Plan

**Date:** February 19, 2026  
**Status:** In Progress  
**Priority:** Critical → High → Medium → Low

---

## Executive Summary

This document outlines 10 major issues found during the deep code audit and provides concrete implementation plans and code solutions for each. All fixes are backward-compatible and focus on removing technical debt while strengthening the application's reliability and security.

---

## CRITICAL ISSUES

### 1. Supabase Storage Integration Missing

**Problem:**
- Backend lacks a centralized Supabase storage service
- Workers and services expect `storagePath` metadata but have no upload/download implementation
- Frontend stores auth tokens in localStorage but no production-safe storage client exists
- Bucket names (websites, videos, audio, generated-assets) not configured or used

**Files Affected:**
- `app/backend/src/lib/supabase.ts` (does not exist)
- `app/backend/src/services/*.ts` (storagePath references without upload logic)
- `app/frontend/src/lib/supabase.ts` (lightweight helper, no storage methods)

**Solution:**
1. Create `app/backend/src/lib/supabase.server.ts` with service client initialized from `SUPABASE_URL` and service role key
2. Implement storage methods: `uploadFile()`, `downloadFile()`, `deleteFile()`, `getPublicUrl()`
3. Create `app/backend/src/services/storage.service.ts` to abstract bucket operations
4. Update environment configuration to include `SUPABASE_SERVICE_KEY`
5. Add upload calls in: content-input, repurposed-content, website generation workers
6. Document bucket names and usage patterns

**Implementation Status:** [ ] Not Started

**Expected Files Created:**
- `app/backend/src/lib/supabase.server.ts`
- `app/backend/src/services/storage.service.ts`
- `.env.example` (updated with SUPABASE_SERVICE_KEY)

---

### 2. Temporary Type Workarounds (@ts-ignore)

**Problem:**
- `// @ts-nocheck` at top of `website.worker.ts` disables type checking for entire file
- Multiple `// @ts-ignore` comments in scheduling.service.ts, approval-workflow.service.ts
- Masks real TypeScript errors and reduces IDE intelligence
- Makes code harder to refactor safely

**Files Affected:**
- `app/backend/src/workers/website.worker.ts` (line 6: @ts-nocheck)
- `app/backend/src/services/scheduling.service.ts` (16 @ts-ignore instances)
- `app/backend/src/services/approval-workflow.service.ts` (6 @ts-ignore instances)
- `app/backend/src/index.ts` (line 1: @ts-nocheck)

**Root Cause:**
- Prisma client types not properly generated or imported
- Service models (ScheduledPost, ApprovalHistory) may be missing from Prisma schema
- Or: versions between Prisma package and generated client are out of sync

**Solution:**
1. Verify Prisma schema contains all required models: `ScheduledPost`, `ApprovalHistory`, etc.
2. Run: `npx prisma generate` to regenerate client types
3. Update imports in services to use `PrismaClient` type safely
4. Remove `@ts-ignore` comments by fixing actual typing issues
5. Run: `npx tsc --noEmit` to validate zero TypeScript errors

**Implementation Status:** [ ] Not Started

**Expected Outcome:**
- Zero TypeScript errors
- Full IDE autocomplete and type safety
- No suppression comments

---

### 3. Redis Hostname Instability

**Problem:**
- Workers configured with hostname (`process.env.REDIS_HOST`) instead of IP or connection string
- DNS resolution intermittent: hostname resolves to `18.200.249.162` but TCP connect sometimes fails
- Workers fail to establish connections on retry, causing job processing delays
- No connection pooling or reconnection strategy

**Files Affected:**
- `app/backend/src/workers/*.worker.ts` (social-posting, lead-automation, content-generation, analytics-polling, website)
- `app/backend/src/queues/index.ts` (getRedisConfig function)

**Current Config:**
```typescript
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};
```

**Solution:**
1. Add support for `REDIS_URL` connection string (takes precedence over host/port)
2. Update all queue connections to use standardized config
3. Implement exponential backoff and connection retry logic
4. Add health check endpoint for Redis connectivity
5. Use IP address (18.200.249.162) if DNS is unreliable, or investigate DNS provider

**Implementation Status:** [ ] Not Started

**Expected Files Modified:**
- `app/backend/src/queues/index.ts`
- `app/backend/src/utils/redis-config.ts` (new)

---

## HIGH PRIORITY ISSUES

### 4. Content Ingestion/Repurpose/Distribution Queues Incomplete

**Problem:**
- Workers exist for: website generation, content generation, social posting, lead automation, analytics polling
- Missing or incomplete: ContentIngestion queue, Repurpose queue, Distribution queue
- These are critical for Phase 3 (content workflows) but not clearly wired
- Job naming and queue structures inconsistent across codebase

**Files Affected:**
- `app/backend/src/queues/index.ts` (queue definitions)
- `app/backend/src/workers/*.worker.ts` (workers for missing queues)
- `app/backend/src/index.ts` (job enqueuing endpoints)

**Current State:**
- Queue exports: lead-automation, content-generation, social-posting, review-request, analytics-polling
- Missing: content-ingestion, repurposing, distribution, asset-processing

**Solution:**
1. Define job types:
   - `ContentIngestionJob` (input source, storage, metadata)
   - `RepurposingJob` (content ID, platforms, style)
   - `DistributionJob` (content ID, target platforms, schedule)
2. Create queue definitions with job options (retries, delays, backoff)
3. Create workers: `content-ingestion.worker.ts`, `repurposing.worker.ts`, `distribution.worker.ts`
4. Wire enqueueing functions in index.ts or service files
5. Document job flow and naming conventions

**Implementation Status:** [ ] Not Started

**Expected Files Created:**
- `app/backend/src/workers/content-ingestion.worker.ts`
- `app/backend/src/workers/repurposing.worker.ts`
- `app/backend/src/workers/distribution.worker.ts`
- `QUEUE_DEFINITIONS.md` (documentation)

---

### 5. Theme Toggle Exists (Should Be System-Only)

**Problem:**
- Spec requires: "Remove any theme toggle logic. Use system preference only."
- Current implementation: ThemeContext supports `'light' | 'dark' | 'system'` with toggle button
- ThemeToggle.tsx component exists and allows manual cycling
- Settings page likely includes theme toggle option

**Files Affected:**
- `app/frontend/src/contexts/ThemeContext.tsx` (toggleTheme function, local storage)
- `app/frontend/src/components/ThemeToggle.tsx` (component exists)
- Navigation or Settings where toggle is rendered

**Solution:**
1. Modify ThemeContext to **always** use system preference (remove toggle, remove localStorage)
2. Remove ThemeToggle.tsx component entirely
3. Remove theme toggle from UI (Settings, AppShell, or wherever it appears)
4. Update documentation to clarify theme is system-following only

**Implementation Status:** [ ] Not Started

**Expected Changes:**
- ThemeContext simplified (no setTheme, no manual toggle)
- ThemeToggle.tsx deleted
- Theme always synced to `prefers-color-scheme` media query

---

### 6. Frontend Auth Token Storage Risk

**Problem:**
- tokens stored in localStorage: `supabase.auth.token`, `supabase.refresh.token`
- localStorage is readable by any JavaScript on the page (XSS vulnerability)
- Tokens persist across browser restarts, increasing exposure window
- No secure session management (HTTP-only cookies not used)

**Files Affected:**
- `app/frontend/src/lib/supabase.ts` (signIn/signUp store tokens)
- Any page that calls `localStorage.getItem('supabase.auth.token')`

**Current Pattern:**
```typescript
localStorage.setItem('supabase.auth.token', data.session.access_token);
localStorage.setItem('supabase.refresh.token', data.session.refresh_token || '');
```

**Solution:**
1. Use **memory-only storage** for access token (session only, cleared on close)
2. Use **HTTP-only, Secure cookies** for refresh token if hosted on HTTPS
3. Implement auth endpoint on backend: `POST /api/auth/session` to accept refreshToken and return new accessToken
4. Update Supabase helper to:
   - Send refresh token to backend endpoint
   - Store access token in memory only
   - Implement token refresh on 401 responses
5. Clear tokens on tab close
6. Add Content Security Policy (CSP) headers to reduce XSS risk

**Implementation Status:** [ ] Not Started

**Expected Files Modified:**
- `app/frontend/src/lib/supabase.ts`
- `app/backend/src/routes/auth.ts` (new endpoint)

---

## MEDIUM PRIORITY ISSUES

### 7. Dead-Letter Queue and Retry Policies

**Problem:**
- Workers have basic retry config (attempts: 2-3) but no dead-letter queue (DLQ) handling
- Failed jobs are logged but not routed to a separate queue for inspection/manual retry
- No exponential backoff uniformity across queues
- No way to debug persistent job failures

**Files Affected:**
- `app/backend/src/workers/*.worker.ts` (all workers)
- `app/backend/src/queues/index.ts` (job options)

**Current Pattern:**
```typescript
attempts: 3,
backoff: { type: 'exponential', delay: 2000 },
removeOnComplete: { age: 86400 },
```

**Solution:**
1. Create a unified retry/DLQ strategy:
   - Attempts: 3 for critical jobs, 2 for non-critical
   - Backoff: exponential with jitter (2s, 4s, 8s)
   - DLQ: route failed jobs to `{queue-name}-dlq`
2. Create `dlq.worker.ts` to monitor all DLQs and log/alert failures
3. Add management endpoint: `GET /api/jobs/dlq` to inspect failed jobs
4. Implement retry mechanism: `POST /api/jobs/dlq/:jobId/retry`
5. Document retry behavior and DLQ inspection procedures

**Implementation Status:** [ ] Not Started

**Expected Files Created:**
- `app/backend/src/workers/dlq.worker.ts`
- `app/backend/src/routes/jobs.ts` (DLQ management endpoints)
- `DLQ_OPERATIONS.md` (documentation)

---

### 8. Supabase Bucket Configuration

**Problem:**
- Spec defines buckets: `websites`, `videos`, `audio`, `generated-assets`
- No code references or environment configuration for bucket names
- No bucket creation or initialization script

**Files Affected:**
- `.env.example` (missing bucket names)
- `app/backend/src/lib/supabase.server.ts` (to be created)
- `app/backend/src/services/storage.service.ts` (to be created)

**Solution:**
1. Define bucket configuration in environment:
   ```
   SUPABASE_BUCKET_WEBSITES=websites
   SUPABASE_BUCKET_VIDEOS=videos
   SUPABASE_BUCKET_AUDIO=audio
   SUPABASE_BUCKET_ASSETS=generated-assets
   ```
2. Create buckets in Supabase dashboard (one-time setup)
3. Document bucket permissions and retention policies
4. Add validation in storage.service.ts to ensure bucket exists before upload

**Implementation Status:** [ ] Not Started

**Expected Files:**
- Updated `.env.example`
- `SUPABASE_SETUP.md` (bucket creation guide)

---

## LOW PRIORITY ISSUES

### 9. Supabase Usage Consolidation

**Problem:**
- Frontend has lightweight custom helper: `app/frontend/src/lib/supabase.ts`
- Backend has no centralized Supabase client
- No clear pattern for sharing Supabase methods across services
- Duplicated API calls and configuration

**Solution:**
1. Create `app/backend/src/lib/supabase.server.ts` with initialized Supabase container client
2. Export common methods: query, insert, update, delete (if needed)
3. Create `app/backend/src/services/supabase.service.ts` wrapper for domain logic
4. Document usage patterns and best practices
5. Consider shared types between frontend/backend (in `shared/**` or published npm package)

**Implementation Status:** [ ] Not Started

**Expected Files:**
- `app/backend/src/lib/supabase.server.ts`
- `app/backend/src/services/supabase.service.ts`
- `SUPABASE_PATTERNS.md`

---

### 10. Logging Standardization

**Problem:**
- Console.log/error used inconsistently: some with `[Tag]` prefix, some without
- No centralized log levels (debug, info, warn, error)
- Logs not structured for parsing or forwarding to APM
- No log filtering for production

**Files Affected:**
- All `app/backend/src/**/*.ts` files (services, workers, routes)

**Current Patterns:**
```typescript
console.log(`[Social Posting] Processing...`);
console.error('Failed to update:', error);
console.warn('[Worker] Error closing worker:', err);
```

**Solution:**
1. Create `app/backend/src/utils/logger.ts` with structured logging:
   - Levels: debug, info, warn, error
   - Context tags: [ServiceName], [WorkerName], [Queue]
   - Metadata support for structured JSON logs
2. Export logger instance for all modules
3. Replace all `console.*` calls with logger methods
4. Add log filtering for production (reduce debug logs)
5. Consider integration with Sentry or DataDog for APM

**Implementation Status:** [ ] Not Started

**Expected Files:**
- `app/backend/src/utils/logger.ts` (updated version)
- `LOGGING_GUIDE.md`

---

## Implementation Roadmap

### Phase 1: Critical Fixes (Days 1-2)
- [ ] 1. Supabase Storage Integration
- [ ] 2. Replace @ts-ignore with proper types
- [ ] 3. Redis Connection Stability

### Phase 2: High Priority (Days 3-4)
- [ ] 4. Content Queue Completion
- [ ] 5. Theme System-Only Enforcement
- [ ] 6. Secure Token Storage

### Phase 3: Medium Priority (Days 5-6)
- [ ] 7. DLQ and Retry Policies
- [ ] 8. Bucket Configuration

### Phase 4: Low Priority (Days 7+)
- [ ] 9. Consolidate Supabase Usage
- [ ] 10. Logging Standardization

---

## Testing Checklist

- [ ] All workers connect to Redis successfully
- [ ] All queues accept jobs and process them
- [ ] Supabase uploads/downloads work for each content type
- [ ] Failed jobs route to DLQ and can be retried
- [ ] Theme changes based on system preference only
- [ ] Auth tokens not visible in localStorage (frontend only stores refresh)
- [ ] TypeScript compilation: 0 errors
- [ ] Production build succeeds
- [ ] All environment variables documented and present

---

## Rollout Strategy

1. **Staging Deployment:** Test all changes on staging environment
2. **Feature Flags:** Use feature flags for DLQ/retry changes during rollout
3. **Database Migrations:** Ensure Prisma migrations are backward compatible
4. **Monitoring:** Add alerts for new DLQ queues and failed jobs
5. **Gradual Rollout:** Deploy to production in phases (10% → 50% → 100%)

---

## Sign-Off Checklist

- [ ] All fixes implemented
- [ ] Tests passing (unit, integration, e2e)
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Staging deployment verified
- [ ] Production deployment approved

---

**Last Updated:** February 19, 2026  
**Prepared By:** GitHub Copilot  
**Status:** Active Implementation
