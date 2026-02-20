# Deep Scan - Frontend & Backend Audit
**Date:** February 19, 2026  
**Scope:** Complete codebase analysis  
**Status:** ISSUES IDENTIFIED

---

## Executive Summary

### Backend Status
- **TypeScript Compilation:** ⚠️ 21 ERRORS (fixable)
- **Frontend TypeScript:** ✅ 0 ERRORS
- **Critical Issues:** 4
- **High Priority:** 8
- **Medium Priority:** 5

---

## BACKEND ISSUES

### 🔴 CRITICAL - Auth Routes Not Registered

**File:** `app/backend/src/routes/auth.ts`  
**Issue:** Auth router is created but **NOT registered in index.ts**

**Evidence:**
- Router exists with endpoints:
  - `POST /api/auth/set-refresh-cookie`
  - `POST /api/auth/clear-refresh-cookie`
  - `POST /api/auth/refresh-token`
  - `GET /api/auth/status`
- No `app.use()` call in `index.ts` to register the router

**Impact:** ❌ Frontend cannot refresh auth tokens or manage sessions  
**Solution:** Add `app.use(authRouter)` in index.ts

---

### 🔴 CRITICAL - TypeScript Errors in New Workers

#### 1. Type Import Issues (3 workers)
**Files:**
- `src/workers/content-ingestion.worker.ts`
- `src/workers/distribution.worker.ts`
- `src/workers/repurposing.worker.ts`

**Error:** `TS1484` - Types must be imported with `type` keyword when `verbatimModuleSyntax` is enabled

**Current:**
```typescript
import { ContentIngestionJob } from '../queues/index.js';
```

**Fix Required:**
```typescript
import type { ContentIngestionJob } from '../queues/index.js';
```

---

#### 2. Fetch API Timeout Not Supported (content-ingestion.worker.ts)
**Error:** `TS2769` - `timeout` property not in `RequestInit`

**Current:**
```typescript
const response = await fetch(url, {
  headers: { 'User-Agent': '...' },
  timeout: 30000,  // ❌ Invalid
});
```

**Fix Required:**
```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30000);
const response = await fetch(url, {
  headers: { 'User-Agent': '...' },
  signal: controller.signal,
});
clearTimeout(timeout);
```

---

#### 3. Undefined Property Access (repurposing.worker.ts)
**Error:** `TS2722` - Cannot invoke object which is possibly `undefined`

**Affected:** Lines 63, 114, 179, 269, 378

**Issue:** Dynamic template object calls without null checks

**Current:**
```typescript
const template = templates[style];
return template(text);  // ❌ template might be undefined
```

**Fix Required:**
```typescript
const template = templates[style] || templates.educational;
return template(text);  // ✅ Guaranteed to exist
```

---

#### 4. Invalid Bucket Type (storage.service.ts & workers)
**Error:** `TS2345` - String not assignable to bucket enum

**Affected:**
- `content-ingestion.worker.ts` line 215
- `repurposing.worker.ts` line 451

**Current:**
```typescript
await storageService.uploadFile(fileName, text, 'text/plain', {
  bucket: 'generated-assets',  // ❌ Invalid - not in enum
});
```

**Issue:** Bucket names are enums, not strings

**Expected Buckets:** `"WEBSITES" | "VIDEOS" | "AUDIO" | "ASSETS"`

**Fix Required:**
```typescript
await storageService.uploadFile(fileName, text, 'text/plain', {
  bucket: 'ASSETS',  // ✅ Valid enum value
});
```

---

#### 5. Redis Config Optional Type Issues
**File:** `src/utils/redis-config.ts` (3 occurrences)

**Error:** `TS2375` - `password` is possibly `undefined`

**Issue:** Config object has optional password but type expects string

**Fix Required:** 
```typescript
// Change from:
password: process.env.REDIS_PASSWORD

// To:
password: process.env.REDIS_PASSWORD || undefined
```

---

#### 6. Metadata Date Parsing Issues
**File:** `src/workers/content-ingestion.worker.ts` lines 142, 124

**Error:** `TS2532` / `TS2769` - Possibly undefined date string

**Current:**
```typescript
metadata.publishDate = new Date(dateMatch[1]);  // dateMatch[1] might be undefined
```

**Fix Required:**
```typescript
if (dateMatch && dateMatch[1]) {
  metadata.publishDate = new Date(dateMatch[1]);
}
```

---

### 🟠 HIGH PRIORITY - Missing Implementations

#### 1. Platform API Stubs in Distribution Worker
**File:** `src/workers/distribution.worker.ts` lines 26-91

**Issue:** 6 TODO comments for real API integrations

```typescript
// TODO: Replace with real Instagram API call
// TODO: Replace with real TikTok API call
// TODO: Replace with real YouTube API call
// TODO: Replace with real Twitter API call
// TODO: Replace with real LinkedIn API call
// TODO: Replace with real Facebook API call
```

**Status:** ⏳ Ready for implementation (mock objects in place)

**Required APIs:**
- Instagram (Meta Graph API)
- TikTok (Business API)
- YouTube (Data API v3)
- Twitter (API v2)
- LinkedIn (Content Publishing API)
- Facebook (Graph API)

---

#### 2. Supabase Storage Bucket Validation
**Issue:** Code assumes buckets exist; none created yet

**Required Setup:**
```bash
# Create in Supabase dashboard
- websites (for generated sites)
- videos (for video assets)
- audio (for audio files)
- generated-assets (for repurposed content)
```

---

#### 3. Worker Concurrency Not Validated
**Issue:** Workers start with hardcoded concurrency but no health checks

**File:** `src/workers/index.ts`

**Config:**
```typescript
content_ingestion: concurrency 8
repurposing: concurrency 5
distribution: concurrency 10
```

**Missing:** Redis queue health checks before worker startup

---

### 🟠 HIGH PRIORITY - Redis Configuration Issues

**File:** `src/utils/redis-config.ts`

**Issues:**
1. Exponential backoff in config only (not used in actual retries)
2. No connection validation timeout
3. No pool size configuration
4. password handling with undefined edge cases

---

### 🟡 MEDIUM PRIORITY - Content Ingestion Edge Cases

**File:** `src/workers/content-ingestion.worker.ts`

**Issues:**
1. HTML extraction regex patterns too simple (won't handle complex structures)
2. No handling of redirects or meta tags in wrong format
3. Content size limit hardcoded (5000/10000 chars) - not configurable
4. No support for PDF, images, video captions
5. Metadata extraction assumptions (title, author fields optional but code assumes existence)

---

### 🟡 MEDIUM PRIORITY - Repurposing Quality Issues

**File:** `src/workers/repurposing.worker.ts`

**Issues:**
1. Template text just inserts raw content - no formatting
2. No character count limits per platform
3. Instagram Reel script doesn't include timing/scene breaks
4. Twitter thread doesn't number tweets properly
5. No image/video placeholder generation
6. Style parameter only affects intro/outro, not content tone

---

### 🟡 MEDIUM PRIORITY - Distribution Error Handling

**File:** `src/workers/distribution.worker.ts`

**Issues:**
1. Partial platform failures continue silently
2. No retry logic per platform
3. No rate limiting awareness (Instagram 200 req/hour limit)
4. Scheduled publishing uses setTimeout (won't survive server restart)
5. No validation of caption/hashtag count per platform

---

## FRONTEND ISSUES

### ✅ TypeScript
- **Status:** 0 compilation errors
- **Type Safety:** Excellent (all imports properly typed)

### ✅ Routes
- **All routes defined:** Dashboard, Content Studio, Analytics, Settings, etc.
- **Phase 4 routes registered:** Content Calendar, Approvals, Metrics, Team Management

### 🟡 MEDIUM PRIORITY - Navigation Inconsistencies

**File:** `app/frontend/src/components/AppShell.tsx`

**Issue:** Indented "Content Calendar" nav item works but pattern is ad-hoc

**Current:**
```typescript
{ label: 'Content Calendar', path: '/schedule', icon: Calendar, indent: true }
```

**Better Approach:** Support nested menu structure for future expandability

---

### 🟡 MEDIUM PRIORITY - Missing Error Boundaries

**Components without error boundaries:**
- ContentCalendar
- ApprovalQueue  
- TeamManagement
- DashboardMetrics

**Risk:** Single component crash takes down entire page

---

### 🟡 MEDIUM PRIORITY - Unimplemented Components

**Routes mapped but components may be stubs:**
- `/dashboard/metrics` → DashboardMetrics (Phase 4)
- `/schedule` → ContentCalendar (Phase 4)
- `/approvals` → ApprovalQueue (Phase 4)
- `/team/management` → TeamManagement (Phase 4)

**Status:** Need verification that these aren't just exports without implementation

---

### 🟡 MEDIUM PRIORITY - Auth Context API

**File:** `app/frontend/src/contexts/AuthContext.tsx`

**Issue:** Multiple implementations possible (memory tokens + cookies)

**Concern:** Ensure consistency between:
1. Frontend token storage (memory for access, sessionStorage for refresh)
2. Backend cookie handling (HTTP-only refresh cookies)
3. Token refresh flow (fallback logic)

---

## INTEGRATION ISSUES

### 🔴 CRITICAL - Auth Token Flow Not Connected

**Issue:** Frontend and backend disagree on token storage

**Frontend State:**
- Access tokens in memory (cleared on tab close)
- Refresh tokens in sessionStorage

**Backend Endpoints Exist But Not Called:**
- POST `/api/auth/set-refresh-cookie` (not registered!)
- POST `/api/auth/refresh-token` (not registered!)
- GET `/api/auth/status` (not registered!)

**Fix:** 
1. Register auth router in index.ts
2. Verify frontend calls these endpoints on login
3. Test token refresh flow end-to-end

---

### 🟠 HIGH PRIORITY - Queue Worker Startup Race Condition

**Issue:** Workers start immediately in index.ts before Redis connectivity verified

**Current:**
```typescript
try {
  if (process.env.REDIS_HOST || process.env.NODE_ENV === 'development') {
    startWorker();
    startContentIngestionWorker();
    startRepurposingWorker();
    startDistributionWorker();  // ❌ No await, no error handling
  }
}
```

**Fix Required:**
```typescript
try {
  const redisConfig = getRedisConfig();
  // Verify connection first
  await verifyRedisConnection(redisConfig);
  
  // Then start workers
  await startWorker();
  await startContentIngestionWorker();
  // etc...
}
```

---

### 🟠 HIGH PRIORITY - Supabase Client Not Validated

**Issue:** Backend creates Supabase client but never tests connection

**File:** `src/lib/supabase.server.ts`

**Missing:**
1. Connection health check on startup
2. Timeout handling for slow connections
3. Fallback if Supabase unavailable
4. Logging of initialization failures

---

## MISSING FEATURES

### 🟠 Queue Monitoring & Management

**Missing Endpoints:**
- `GET /api/queues/health` - Listed in docs but not checked for implementation
- `GET /api/queues/stats` - Listed but not checked
- `POST /api/queues/:queueName/pause` - Not mentioned
- `POST /api/queues/:queueName/resume` - Not mentioned
- `DELETE /api/jobs/:jobId` - Job cancellation not implemented

---

### 🟠 Dead Letter Queue

**Status:** ⏳ Planned but not implemented

**Missing:**
- DLQ worker to process failed jobs
- DLQ monitoring dashboard
- Retry policy UI
- Failed job inspection endpoints

---

### 🟠 Analytics Event Tracking

**Queue Definition:** `enqueueAnalyticsPolling()` exists  
**Worker Status:** Exists in `src/workers/analytics-polling.worker.ts`

**Concern:** No validation that:
1. Jobs are actually being enqueued
2. Worker is running and processing
3. Data is being stored in database

---

## DATABASE/PRISMA ISSUES

### 🟡 MEDIUM PRIORITY - Schema Not Verified

**Issue:** New queue types (content-ingestion, repurposing, distribution) not in Prisma schema

**Files Created:** Workers with Job types  
**Files Not Updated:** `prisma/schema.prisma`

**Impact:** If jobs need to be stored in database (not just Redis), schema doesn't support them

**Required:**
- Review if queue jobs should be persisted in DB
- Add tables if needed for job history/audit trail
- Run migrations

---

## DEPLOYMENT READINESS

### 🔴 NOT READY - Missing Environment Variables

**Required but not documented:**
```
# Supabase
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Redis
REDIS_HOST=
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_URL=  # Alternative to host/port/password

# Platform APIs (for distribution worker)
INSTAGRAM_API_TOKEN=
TIKTOK_BUSINESS_API_KEY=
YOUTUBE_API_KEY=
TWITTER_API_KEY=
TWITTER_API_SECRET=
LINKEDIN_ACCESS_TOKEN=
FACEBOOK_ACCESS_TOKEN=
```

---

### 🟠 Config Validation Incomplete

**File:** `app/backend/.env.example`

**Issue:** Some vars documented but no runtime validation

**Example:**
```typescript
// Checks REDIS_URL but treats failure silently
const redisConfig = getRedisConfig();
```

Better:
```typescript
const redisConfig = getRedisConfig();
if (!redisConfig.host) {
  throw new Error('REDIS_HOST not configured. See .env.example');
}
```

---

## SUMMARY TABLE

| Category | Critical | High | Medium | Total |
|----------|----------|------|--------|-------|
| Backend TypeScript | 0 | 0 | 0 | 0* |
| Backend Logic | 1 | 4 | 5 | 10 |
| Frontend | 0 | 0 | 3 | 3 |
| Integration | 1 | 2 | 2 | 5 |
| **TOTAL** | **2** | **6** | **10** | **18** |

*But 21 TypeScript errors that need fixing first

---

## RECOMMENDED FIX SEQUENCE

### Phase 1 - CRITICAL (30 min)
1. ✅ Fix worker type imports (add `type` keyword)
2. ✅ Fix fetch timeout in content-ingestion worker
3. ✅ Register auth router in index.ts
4. ✅ Fix bucket enum values

### Phase 2 - HIGH PRIORITY (60 min)
5. ✅ Add null checks for template objects
6. ✅ Fix redis-config optional types
7. ✅ Add Redis connection health check before workers
8. ✅ Verify Supabase connection on startup

### Phase 3 - MEDIUM PRIORITY (90 min)
9. ✅ Add platform API implementation skeleton
10. ✅ Improve HTML extraction robustness
11. ✅ Add error boundaries to Phase 4 components
12. ✅ Implement queue health check endpoints
13. ✅ Create .env.example with all vars

### Phase 4 - ENHANCEMENT (120 min)
14. Platform-specific rate limiting
15. Scheduled job persistence
16. DLQ implementation
17. Enhanced analytics tracking

---

## QUICK WINS (Can do in parallel)

- [ ] Add `Calendar` icon import already added, need to verify it's used
- [ ] Verify Phase 4 components are not just stubs
- [ ] Document supabase bucket setup requirement
- [ ] Create DEPLOYMENT_CHECKLIST.md

