# Dead-Letter Queue (DLQ) Implementation Guide

**Date:** February 19, 2026  
**Purpose:** Implement dead-letter queues and retry policies for reliable job processing

---

## Overview

This guide provides step-by-step instructions for implementing dead-letter queues (DLQs), unified retry strategies, and DLQ management endpoints.

---

## Architecture

### Problem Statement

**Current Issues:**
- Failed jobs are logged but not recoverable
- No aggregated view of failures
- No automatic retry with backoff
- Failed jobs disappear—impossible to audit

**Solution:**
- Route failed jobs to separate DLQ after max retries exceeded
- Create DLQ monitor worker
- Add management endpoints to inspect/retry failed jobs
- Implement unified retry/backoff strategy

### DLQ Flow
```
Job Added
    ↓
Worker Processing
    ↓
    ├─ Success → Completed & Removed
    │
    └─ Error
        ├─ Retries Remaining (max 3)
        │   └─ Wait, Retry
        │
        └─ Retries Exhausted
            ├─ Move to DLQ (`queue-name-dlq`)
            ├─ Log Error
            └─ Alert/Notify
                ↓
            DLQ Monitor
            (Inspectable, Retryable)
                ├─ View Failed Jobs
                ├─ Manual Investigation
                └─ Retry Failed Job
```

---

## Step 1: Define Unified Retry Strategy

**File:** `app/backend/src/utils/job-retry-strategy.ts`

```typescript
/**
 * Unified job retry and DLQ strategy
 * Ensures consistent retry behavior across all queues
 */

export interface JobRetryConfig {
  // Max attempts (1 initial + N retries)
  // Critical jobs: 3 attempts
  // Standard jobs: 2 attempts
  // Non-critical jobs: 1 attempt
  attempts: number;

  // Exponential backoff with jitter
  // delays: 2s, 4s, 8s, 16s, 30s (capped)
  backoff: {
    type: 'exponential';
    delay: number;
  };

  // Remove completed jobs after X time
  removeOnComplete: {
    age: number; // seconds
  };

  // When max retries exceeded, move to DLQ
  // DLQ name = `{queue-name}-dlq`
  // DLQ jobs NOT auto-removed
  removeOnFail?: boolean;
}

/**
 * Get retry config by job criticality
 */
export function getRetryConfig(criticality: 'critical' | 'standard' | 'low'): JobRetryConfig {
  const configs = {
    critical: {
      attempts: 3,      // Initial try + 2 retries
      backoff: { type: 'exponential' as const, delay: 2000 },
      removeOnComplete: { age: 86400 }, // 24 hours
    },
    standard: {
      attempts: 2,      // Initial try + 1 retry
      backoff: { type: 'exponential' as const, delay: 2000 },
      removeOnComplete: { age: 604800 }, // 7 days
    },
    low: {
      attempts: 1,      // Initial try only
      backoff: { type: 'exponential' as const, delay: 1000 },
      removeOnComplete: { age: 86400 }, // 24 hours
    },
  };

  return configs[criticality];
}

/**
 * Backoff delay calculation
 * Attempts: 1, 2, 3
 * Delays: 2s, 4s, 8s (exponential)
 * Max delay: 30s
 */
export function calculateBackoffDelay(attemptNumber: number): number {
  const baseDelay = 2000; // 2 seconds
  const delayMs = Math.min(
    baseDelay * Math.pow(2, attemptNumber - 1),
    30000 // 30 second cap
  );

  // Add jitter (±20%) to avoid thundering herd
  const jitter = delayMs * 0.2 * (Math.random() * 2 - 1);
  return Math.max(delayMs + jitter, 1000); // Min 1s
}

/**
 * Format job details for DLQ storage
 */
export interface FailedJobDetails {
  jobId: string;
  queueName: string;
  jobData: Record<string, any>;
  error: {
    message: string;
    stack?: string;
    code?: string;
  };
  attempts: number;
  lastAttemptAt: Date;
  firstFailedAt: Date;
  retryable: boolean;
}

/**
 * Determine if a job should be retried based on error
 */
export function isJobRetryable(error: Error): boolean {
  // Don't retry on validation errors
  if (error.message.includes('validation') || error.message.includes('Invalid')) {
    return false;
  }

  // Don't retry on auth errors
  if (error.message.includes('401') || error.message.includes('403') || error.message.includes('Unauthorized')) {
    return false;
  }

  // Retry on network errors, timeouts, service unavailable
  if (
    error.message.includes('ECONNREFUSED') ||
    error.message.includes('timeout') ||
    error.message.includes('503') ||
    error.message.includes('Service Unavailable')
  ) {
    return true;
  }

  // Default: retry transient failures
  return true;
}

export default {
  getRetryConfig,
  calculateBackoffDelay,
  isJobRetryable,
};
```

---

## Step 2: Update Queue Definitions

**File:** `app/backend/src/queues/index.ts`

Replace all manual retry configs with unified strategy:

```typescript
import { getRetryConfig } from '../utils/job-retry-strategy.js';

// LEAD AUTOMATION - CRITICAL
export async function enqueueLeadAutomation(data: LeadAutomationJob, options?: any) {
  const config = getRetryConfig('critical');
  return await leadAutomationQueue.add('lead-automation', data, {
    ...config,
    jobId: `lead-${data.leadId}-${Date.now()}`,
    ...options,
  });
}

// CONTENT GENERATION - CRITICAL (takes time, needs retries)
export async function enqueueContentGeneration(data: ContentGenerationJob, options?: any) {
  const config = getRetryConfig('critical');
  return await contentGenerationQueue.add('content-generation', data, {
    ...config,
    jobId: `content-${data.projectId}-${Date.now()}`,
    ...options,
  });
}

// SOCIAL POSTING - STANDARD (platform dependencies)
export async function enqueueSocialPosting(data: SocialPostingJob, options?: any) {
  const config = getRetryConfig('standard');
  const opts: any = {
    ...config,
    jobId: `social-${data.reelVariantId}-${Date.now()}`,
  };

  if (data.scheduleTime && data.scheduleTime > new Date()) {
    opts.delay = data.scheduleTime.getTime() - Date.now();
  }

  return await socialPostingQueue.add('social-posting', data, { ...opts, ...options });
}

// REVIEW REQUEST - STANDARD
export async function enqueueReviewRequest(data: ReviewRequestJob, options?: any) {
  const config = getRetryConfig('standard');
  return await reviewRequestQueue.add('review-request', data, {
    ...config,
    jobId: `review-${data.bookingId}-${Date.now()}`,
    ...options,
  });
}

// ANALYTICS POLLING - LOW (non-critical, frequent)
export async function enqueueAnalyticsPolling(data: AnalyticsPollingJob, options?: any) {
  const config = getRetryConfig('low');
  return await analyticsPollingQueue.add('analytics-polling', data, {
    ...config,
    jobId: `analytics-${data.reelVariantId}-${Date.now()}`,
    ...options,
  });
}

// Updated: Content Ingestion, Repurposing, Distribution
export async function enqueueContentIngestion(data: ContentIngestionJob, options?: any) {
  const config = getRetryConfig('critical');
  return await contentIngestionQueue.add('content-ingestion', data, {
    ...config,
    jobId: `ingestion-${data.ingestionId}-${Date.now()}`,
    ...options,
  });
}

export async function enqueueRepurposing(data: RepurposingJob, options?: any) {
  const config = getRetryConfig('critical');
  return await repurposingQueue.add('repurposing', data, {
    ...config,
    jobId: `repurpose-${data.repurposingJobId}-${Date.now()}`,
    ...options,
  });
}

export async function enqueueDistribution(data: DistributionJob, options?: any) {
  const config = getRetryConfig('standard');
  const opts: any = {
    ...config,
    jobId: `distribute-${data.distributionJobId}-${Date.now()}`,
  };

  if (data.scheduleTime && data.scheduleTime > new Date()) {
    opts.delay = data.scheduleTime.getTime() - Date.now();
  }

  return await distributionQueue.add('distribution', data, { ...opts, ...options });
}
```

---

## Step 3: Create DLQ Monitor Worker

**File:** `app/backend/src/workers/dlq.worker.ts`

```typescript
/**
 * Dead-Letter Queue Monitor
 * 
 * Monitors all DLQs for failed jobs
 * Sends alerts and maintains indexing for inspection
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { Queue } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { createContextLogger } from '../utils/logger.js';
import { getRedisConfig } from '../utils/redis-config.js';

const log = createContextLogger('DLQMonitor');
const prisma = new PrismaClient();

/**
 * DLQ names to monitor
 * One for each queue
 */
const DLQ_NAMES = [
  'lead-automation-dlq',
  'content-generation-dlq',
  'social-posting-dlq',
  'review-request-dlq',
  'analytics-polling-dlq',
  'website-generation-dlq',
  'content-ingestion-dlq',
  'repurposing-dlq',
  'distribution-dlq',
];

/**
 * Monitor all DLQs
 */
export async function monitorDLQs() {
  log.info('DLQ Monitor started');

  const redisConfig = getRedisConfig();

  for (const dlqName of DLQ_NAMES) {
    const dlq = new Queue(dlqName, { connection: redisConfig as any });

    try {
      // Get count of failed jobs
      const counts = await dlq.getJobCounts();
      
      if (counts.failed > 0) {
        log.warn(`Failed jobs in ${dlqName}`, {
          failedCount: counts.failed,
          dlqName,
        });

        // Get recent failed jobs (last 10)
        const failedJobs = await dlq.getFailed(0, 9);

        for (const job of failedJobs) {
          log.error(`DLQ Job: ${dlqName}/${job.id}`, {
            data: job.data,
            failedReason: job.failedReason,
            attempts: job.attemptsMade,
          });

          // Optional: Record in database for monitoring dashboard
          // await recordDLQJob(dlqName, job);
        }
      } else {
        log.info(`${dlqName} healthy`, { failedCount: 0 });
      }
    } catch (error: any) {
      log.error(`Error monitoring ${dlqName}`, error);
    }
  }
}

/**
 * Start periodic monitoring (runs every 5 minutes)
 */
export function startDLQMonitoring(intervalMs: number = 5 * 60 * 1000) {
  log.info('Starting periodic DLQ monitoring', { intervalMs });

  // Run immediately
  monitorDLQs();

  // Then run on interval
  setInterval(monitorDLQs, intervalMs);

  // Handle process signals gracefully
  process.on('SIGTERM', () => {
    log.info('DLQ Monitor stopping');
    process.exit(0);
  });
}

// Auto-start if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startDLQMonitoring();
}

export default { monitorDLQs, startDLQMonitoring };
```

---

## Step 4: Create DLQ Management Endpoints

**File:** `app/backend/src/routes/jobs.ts`

```typescript
/**
 * Job Management Routes
 * 
 * Endpoints for inspecting and managing DLQ jobs
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { Queue } from 'bullmq';
import { getRedisConfig } from '../utils/redis-config.js';
import { createContextLogger } from '../utils/logger.js';

const router = Router();
const log = createContextLogger('JobRoutes');

const DLQ_NAMES = [
  'lead-automation-dlq',
  'content-generation-dlq',
  'social-posting-dlq',
  'review-request-dlq',
  'analytics-polling-dlq',
  'website-generation-dlq',
  'content-ingestion-dlq',
  'repurposing-dlq',
  'distribution-dlq',
];

/**
 * GET /api/jobs/dlq
 * 
 * Inspect failed jobs aggregated from all DLQs
 * Supports pagination and filtering
 * 
 * Query Params:
 * - queue: Filter by specific queue (optional)
 * - page: Page number (default: 0)
 * - limit: Items per page (default: 20, max: 100)
 * - sortBy: 'failedAt' | 'attempts' (default: 'failedAt')
 * 
 * Response: { jobs: FailedJob[], total: number, page: number }
 */
router.get('/api/jobs/dlq', async (req: Request, res: Response) => {
  try {
    const { queue, page = '0', limit = '20', sortBy = 'failedAt' } = req.query;

    const pageNum = Math.max(0, parseInt(page as string) || 0);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));

    const redisConfig = getRedisConfig();
    const queuesToCheck = queue ? [`${queue}-dlq`] : DLQ_NAMES;

    const allJobs: any[] = [];

    for (const dlqName of queuesToCheck) {
      try {
        const dlq = new Queue(dlqName, { connection: redisConfig as any });
        const counts = await dlq.getJobCounts();

        if (counts.failed > 0) {
          const failedJobs = await dlq.getFailed(0, counts.failed - 1);

          for (const job of failedJobs) {
            allJobs.push({
              jobId: job.id,
              queueName: dlqName.replace('-dlq', ''),
              data: job.data,
              failedReason: job.failedReason,
              attempts: job.attemptsMade,
              failedAt: job.failedReason ? new Date(job.finishedOn || 0) : null,
              stackTrace: job.stacktrace,
            });
          }
        }
      } catch (error: any) {
        log.warn(`Error fetching ${dlqName}`, { error: error.message });
      }
    }

    // Sort
    const sorted = allJobs.sort((a, b) => {
      if (sortBy === 'attempts') {
        return b.attempts - a.attempts;
      }
      return (b.failedAt?.getTime() || 0) - (a.failedAt?.getTime() || 0);
    });

    // Paginate
    const paginatedJobs = sorted.slice(pageNum * limitNum, (pageNum + 1) * limitNum);

    return res.json({
      jobs: paginatedJobs,
      total: allJobs.length,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(allJobs.length / limitNum),
    });
  } catch (error: any) {
    log.error('Error fetching DLQ jobs', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/jobs/dlq/:queueName/:jobId/retry
 * 
 * Manually retry a failed job
 * Moves job back to original queue with reset attempt counter
 * 
 * Response: { success: boolean, message: string }
 */
router.post('/api/jobs/dlq/:queueName/:jobId/retry', async (req: Request, res: Response) => {
  try {
    const { queueName, jobId } = req.params;
    const dlqName = `${queueName}-dlq`;

    const redisConfig = getRedisConfig();
    const dlq = new Queue(dlqName, { connection: redisConfig as any });

    // Get the failed job
    const job = await dlq.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    log.info('Retrying DLQ job', { jobId, queueName, jobData: job.data });

    // Create new job in original queue with same data
    const originalQueue = new Queue(queueName, { connection: redisConfig as any });
    const newJob = await originalQueue.add(queueName, job.data, {
      jobId: `${jobId}-retry-${Date.now()}`,
      attempts: 1, // Reset attempts
      backoff: { type: 'exponential', delay: 2000 },
    });

    // Remove from DLQ
    await job.remove();

    log.info('Retried DLQ job successfully', { newJobId: newJob.id });

    return res.json({
      success: true,
      message: `Job ${jobId} retried as ${newJob.id}`,
      newJobId: newJob.id,
    });
  } catch (error: any) {
    log.error('Error retrying DLQ job', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/jobs/dlq/:queueName/:jobId
 * 
 * Remove a failed job from DLQ (permanent deletion)
 * Use with caution - removes all trace of the failure
 * 
 * Response: { success: boolean }
 */
router.delete('/api/jobs/dlq/:queueName/:jobId', async (req: Request, res: Response) => {
  try {
    const { queueName, jobId } = req.params;
    const dlqName = `${queueName}-dlq`;

    const redisConfig = getRedisConfig();
    const dlq = new Queue(dlqName, { connection: redisConfig as any });

    const job = await dlq.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    log.warn('Deleting DLQ job permanently', { jobId, queueName });

    await job.remove();

    return res.json({ success: true, message: `Job ${jobId} removed` });
  } catch (error: any) {
    log.error('Error deleting DLQ job', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/jobs/stats
 * 
 * Overall job queue statistics
 * Shows job counts across all queues
 * 
 * Response: { queues: { [queueName]: { counts } } }
 */
router.get('/api/jobs/stats', async (req: Request, res: Response) => {
  try {
    const redisConfig = getRedisConfig();
    const queueNames = [
      'lead-automation',
      'content-generation',
      'social-posting',
      'review-request',
      'analytics-polling',
      'website-generation',
      'content-ingestion',
      'repurposing',
      'distribution',
    ];

    const stats: Record<string, any> = {};

    for (const queueName of queueNames) {
      try {
        const queue = new Queue(queueName, { connection: redisConfig as any });
        stats[queueName] = await queue.getJobCounts();
      } catch (error) {
        stats[queueName] = { error: 'Unable to fetch' };
      }
    }

    return res.json({ queues: stats, timestamp: new Date() });
  } catch (error: any) {
    log.error('Error fetching job stats', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
```

---

## Step 5: Update Main Express App

**File:** `app/backend/src/index.ts`

Register the new routes and start DLQ monitoring:

```typescript
import cookieParser from 'cookie-parser';
import jobRoutes from './routes/jobs.js';
import authRoutes from './routes/auth.js';
import { startDLQMonitoring } from './workers/dlq.worker.js';

// ... existing setup ...

app.use(cookieParser());

// Register route handlers
app.use(jobRoutes);
app.use(authRoutes);
// ... other routes ...

// Start DLQ monitoring
startDLQMonitoring(5 * 60 * 1000); // Monitor every 5 minutes

// Start server
app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});
```

---

## Step 6: Create Monitoring Dashboard (Optional)

**File:** `app/frontend/src/screens/JobMonitoring.tsx`

```typescript
import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

interface FailedJob {
  jobId: string;
  queueName: string;
  failedReason: string;
  attempts: number;
  failedAt: string;
}

export function JobMonitoring() {
  const [dlqJobs, setDlqJobs] = useState<FailedJob[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDLQJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/jobs/dlq?limit=50');
      const data = await response.json();
      setDlqJobs(data.jobs);
    } catch (error) {
      console.error('Failed to fetch DLQ jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const retryJob = async (queueName: string, jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/dlq/${queueName}/${jobId}/retry`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Refetch list
        fetchDLQJobs();
      }
    } catch (error) {
      console.error('Failed to retry job:', error);
    }
  };

  useEffect(() => {
    // Fetch on mount and set up polling
    fetchDLQJobs();
    const interval = setInterval(fetchDLQJobs, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Job Monitoring</h1>
        <button
          onClick={fetchDLQJobs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {dlqJobs.length === 0 ? (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          All queues healthy
        </div>
      ) : (
        <div className="space-y-4">
          {dlqJobs.map((job) => (
            <div key={job.jobId} className="border border-red-200 bg-red-50 p-4 rounded">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="font-mono text-sm">{job.jobId}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Queue: {job.queueName}</p>
                    <p>Attempts: {job.attempts}</p>
                    <p>Failed: {new Date(job.failedAt).toLocaleString()}</p>
                    <p className="mt-2 font-mono text-xs">{job.failedReason}</p>
                  </div>
                </div>
                <button
                  onClick={() => retryJob(job.queueName, job.jobId)}
                  className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  Retry
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Verification Checklist

- [ ] Retry strategy utility created
- [ ] All queue enqueue functions updated to use unified config
- [ ] DLQ monitor worker created and tested
- [ ] DLQ management endpoints created and tested
- [ ] Main app registers job routes and starts DLQ monitoring
- [ ] Job monitoring dashboard created (optional)
- [ ] All imports resolved, TypeScript: 0 errors
- [ ] Workers properly handle failed jobs (move to DLQ)
- [ ] Can inspect DLQ via `/api/jobs/dlq`
- [ ] Can retry failed jobs via `/api/jobs/dlq/:queue/:jobId/retry`
- [ ] DLQ monitoring logs properly
- [ ] End-to-end test: create → fail → retry → succeed

---

## Testing Scenarios

### Test 1: Job Failure → DLQ Routing
```bash
# 1. Enqueue a job
curl -X POST http://localhost:3001/api/content/ingest \
  -H "Content-Type: application/json" \
  -d '{"businessId":"test","sourceType":"text","textContent":""}'

# 2. Force failure (manually kill worker)
# 3. Check DLQ
curl http://localhost:3001/api/jobs/dlq
```

### Test 2: Manual Retry
```bash
# Retry a failed job
curl -X POST http://localhost:3001/api/jobs/dlq/content-ingestion/ingest-123/retry
```

### Test 3: Monitor Health
```bash
# Get overall stats
curl http://localhost:3001/api/jobs/stats
```

---

## Production Checkklist

- [ ] DLQ data persists in Redis (test restart)
- [ ] Monitoring alerts configured (Sentry, DataDog)
- [ ] DLQ cleanup policy defined (e.g., delete after 30 days)
- [ ] Manual retry process documented
- [ ] Operator training completed
- [ ] Monitoring dashboard in production

---

**Created:** February 19, 2026  
**For:** DLQ Implementation Team  
**Estimated Time:** 2-3 hours hands-on implementation

