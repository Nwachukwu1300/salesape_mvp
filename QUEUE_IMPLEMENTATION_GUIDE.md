# Queue Implementation Guide

**Date:** February 19, 2026  
**Purpose:** Complete implementation of missing Content Ingestion, Repurposing, and Distribution queues

---

## Overview

This guide provides step-by-step instructions for implementing the three missing job queues that are critical for Phase 3 (Content Workflows).

---

## Architecture

### Current State
✅ Implemented queues:
- lead-automation
- content-generation
- social-posting
- review-request
- analytics-polling
- website-generation

🔴 Missing queues:
- content-ingestion (receive user content)
- repurposing (transform content for reuse)
- distribution (push to platforms)

### Job Flow
```
User Input → ContentIngestion Queue
           ↓
        Process (validate, store metadata)
           ↓
           Repurposing Queue (transform for platforms)
           ↓
        Generate variants (Instagram, TikTok, LinkedIn, email)
           ↓
           Distribution Queue (schedule & publish)
           ↓
        Post to platforms
           ↓
        Analytics Polling (track engagement)
```

---

## Step 1: Define Job Types

**File:** `app/backend/src/queues/index.ts`

Add these job type definitions:

```typescript
/**
 * CONTENT INGESTION JOB
 * Input: Raw content from user (URL, file, text, voice)
 * Output: Normalized content stored in database
 */
export interface ContentIngestionJob {
  // Unique identifiers
  ingestionId: string;
  businessId: string;
  
  // Content source
  sourceType: 'url' | 'file' | 'text' | 'voice' | 'social';
  sourceUrl?: string;        // For URL input
  filePath?: string;         // For uploaded files (stored in Supabase)
  textContent?: string;      // For text input
  voiceTranscript?: string;  // For voice input
  
  // Metadata
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  
  // Processing options
  extractEntities?: boolean;      // Extract people, places, products
  generateSummary?: boolean;      // AI-powered summary
  detectSentiment?: boolean;      // Positive/negative/neutral
  
  // Optional: Auto-publish after processing
  autoRepurpose?: boolean;
  autoPublish?: boolean;
}

/**
 * REPURPOSING JOB
 * Input: Normalized content
 * Output: Platform-specific variants (reels, posts, articles, etc.)
 */
export interface RepurposingJob {
  // References
  contentId: string;           // ID of ContentInput in database
  businessId: string;
  repurposingJobId: string;
  
  // Target platforms
  platforms: Array<'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'twitter' | 'email'>;
  
  // Repurposing style/tone
  style?: 'educational' | 'entertaining' | 'authority' | 'storytelling' | 'bold' | 'calm';
  tone?: 'formal' | 'casual' | 'humorous' | 'inspiring';
  
  // Content generation options
  includeAudio?: boolean;      // Generate voice-over
  includeSubtitles?: boolean;  // Add captions to video
  includeHashtags?: boolean;   // Generate relevant hashtags
  includeCallToAction?: boolean; // Add CTA (link, subscribe, etc.)
  
  // Output preferences
  videoLengths?: {
    instagram?: number;  // seconds
    tiktok?: number;
    youtube?: number;
  };
}

/**
 * DISTRIBUTION JOB
 * Input: Generated variants ready to publish
 * Output: Published posts with external IDs and URLs
 */
export interface DistributionJob {
  // References
  distributionJobId: string;
  businessId: string;
  contentIds: string[];        // IDs of RepurposedContent items
  
  // Publishing schedule
  platforms: Array<'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'twitter' | 'email'>;
  publishNow?: boolean;        // Publish immediately (default: true)
  scheduleTime?: Date;         // Publish at specific time
  
  // Account to use
  accountIds?: string[];       // Publish from specific connected accounts
  
  // Analytics tracking
  trackingParams?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };
  
  // Options
  includeAnalyticsLinks?: boolean; // Short links with tracking
  notifyOnPublish?: boolean;       // Email notification

  // Retry strategy
  maxRetries?: number;
  retryDelay?: number;
}
```

---

## Step 2: Create Queue Definitions

**File:** `app/backend/src/queues/index.ts` (add exports)

```typescript
import { Queue } from 'bullmq';

// ... (existing queue definitions)

// CONTENT INGESTION QUEUE
export const contentIngestionQueue = new Queue<ContentIngestionJob, any, 'content-ingestion'>('content-ingestion', {
  connection: redisConfig,
});

// REPURPOSING QUEUE
export const repurposingQueue = new Queue<RepurposingJob, any, 'repurposing'>('repurposing', {
  connection: redisConfig,
});

// DISTRIBUTION QUEUE
export const distributionQueue = new Queue<DistributionJob, any, 'distribution'>('distribution', {
  connection: redisConfig,
});

/**
 * CONTENT INGESTION
 * Triggered: When user uploads/inputs content
 * Delay: Immediate
 * Actions: Validate, extract entities, generate summary, store in database
 */
export async function enqueueContentIngestion(data: ContentIngestionJob, options?: any) {
  return await contentIngestionQueue.add('content-ingestion', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { age: 86400 }, // Keep for 24 hours
    jobId: `ingestion-${data.ingestionId}-${Date.now()}`,
    ...options,
  });
}

/**
 * REPURPOSING
 * Triggered: When user requests content repurposing or after ingestion
 * Delay: Immediate
 * Actions: Transform for each platform, generate variants, save to database
 */
export async function enqueueRepurposing(data: RepurposingJob, options?: any) {
  return await repurposingQueue.add('repurposing', data, {
    attempts: 2,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: { age: 604800 }, // Keep for 7 days
    jobId: `repurpose-${data.repurposingJobId}-${Date.now()}`,
    ...options,
  });
}

/**
 * DISTRIBUTION
 * Triggered: When user confirms & publishes content
 * Delay: Immediate or scheduled
 * Actions: Upload to platforms, schedule posts, track post IDs
 */
export async function enqueueDistribution(data: DistributionJob, options?: any) {
  const opts: any = {
    attempts: 2,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { age: 1209600 }, // Keep for 14 days
    jobId: `distribute-${data.distributionJobId}-${Date.now()}`,
  };

  // Handle scheduled publishing
  if (data.scheduleTime && data.scheduleTime > new Date()) {
    opts.delay = data.scheduleTime.getTime() - Date.now();
  }

  return await distributionQueue.add('distribution', data, {
    ...opts,
    ...options,
  });
}
```

---

## Step 3: Create Content Ingestion Worker

**File:** `app/backend/src/workers/content-ingestion.worker.ts`

```typescript
/**
 * Content Ingestion Worker
 * Processes user-submitted content and normalizes it
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createContextLogger } from '../utils/logger.js';
import type { ContentIngestionJob } from '../queues/index.js';
import { getRedisConfig } from '../utils/redis-config.js';
import { storageService } from '../services/storage.service.js';

const log = createContextLogger('ContentIngestionWorker');
const prisma = new PrismaClient();

/**
 * Extract text and metadata from URL
 */
async function extractFromUrl(url: string) {
  log.info('Extracting content from URL', { url });
  
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      maxContentLength: 5 * 1024 * 1024,
      headers: {
        'User-Agent': 'SalesAPE-Bot/1.0',
      },
    });

    const $ = cheerio.load(response.data);
    
    // Remove scripts/styles
    $('script, style, noscript').remove();

    const title = $('title').text() || $('h1').first().text() || '';
    const description = 
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      '';

    const textContent = $.root().text().replace(/\s+/g, ' ').trim();

    return {
      title: title.substring(0, 200),
      description: description.substring(0, 500),
      textContent: textContent.substring(0, 10000),
      sourceUrl: url,
    };
  } catch (error: any) {
    log.error('Failed to extract from URL', error);
    throw new Error(`Failed to extract from URL: ${error.message}`);
  }
}

/**
 * Process content ingestion job
 */
async function processContentIngestion(
  job: Job<ContentIngestionJob>
): Promise<{ success: boolean; contentId?: string; error?: string }> {
  const { ingestionId, businessId, sourceType, sourceUrl, filePath, textContent, voiceTranscript } = job.data;

  try {
    log.info('Processing content ingestion', { ingestionId, sourceType });

    let normalizedContent = {
      title: job.data.title || 'Untitled Content',
      description: job.data.description || '',
      textContent: '',
      sourceUrl: sourceUrl || null,
      sourceType,
    };

    // Step 1: Extract content based on source
    if (sourceType === 'url' && sourceUrl) {
      const extracted = await extractFromUrl(sourceUrl);
      normalizedContent = { ...normalizedContent, ...extracted };
    } else if (sourceType === 'file' && filePath) {
      // Download from Supabase storage
      const buffer = await storageService.downloadFile('AUDIO', filePath);
      normalizedContent.textContent = buffer.toString('utf-8');
    } else if (sourceType === 'text' && textContent) {
      normalizedContent.textContent = textContent;
    } else if (sourceType === 'voice' && voiceTranscript) {
      normalizedContent.textContent = voiceTranscript;
    }

    // Step 2: Validate content
    if (!normalizedContent.textContent && !normalizedContent.title) {
      throw new Error('No extractable content found');
    }

    // Step 3: Generate summary if requested
    let summary = '';
    if (job.data.generateSummary && normalizedContent.textContent) {
      log.info('Generating summary with AI');
      // Call your AI summarization service here
      summary = normalizedContent.textContent.substring(0, 200) + '...';
    }

    // Step 4: Detect entities if requested
    let entities = null;
    if (job.data.extractEntities) {
      log.info('Extracting entities');
      // Call your NLP service here
      entities = { people: [], places: [], products: [] };
    }

    // Step 5: Save to database
    const contentInput = await (prisma as any).contentInput.create({
      data: {
        businessId,
        sourceType,
        sourceUrl: normalizedContent.sourceUrl,
        originalContent: normalizedContent.textContent,
        title: normalizedContent.title,
        description: normalizedContent.description,
        summary: summary || null,
        ingestionJobId: ingestionId,
        storagePath: filePath || null,
        metadata: {
          extractedEntities: entities,
          sentiment: 'neutral', // TODO: implement sentiment analysis
          language: 'en',
        },
      },
    });

    log.info('Content ingestion completed', { contentId: contentInput.id });

    // Step 6: Auto-repurpose if enabled
    if (job.data.autoRepurpose) {
      log.info('Queueing repurposing job', { contentId: contentInput.id });
      const { enqueueRepurposing } = await import('../queues/index.js');
      await enqueueRepurposing({
        contentId: contentInput.id,
        businessId,
        repurposingJobId: `repurpose-${Date.now()}`,
        platforms: ['instagram', 'tiktok', 'linkedin'],
        style: 'educational',
      });
    }

    return {
      success: true,
      contentId: contentInput.id,
    };
  } catch (error: any) {
    log.error('Content ingestion error', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Create worker
const worker = new Worker<ContentIngestionJob>(
  'content-ingestion',
  processContentIngestion,
  {
    connection: getRedisConfig(),
    concurrency: 3,
    maxStalledCount: 2,
    stalledInterval: 30000,
  }
);

// Event handlers
worker.on('completed', (job, result) => {
  log.info('Job completed', { jobId: job.id, result });
});

worker.on('failed', (job, error) => {
  log.error('Job failed', { jobId: job?.id, error });
});

worker.on('error', (error) => {
  log.error('Worker error', error);
});

export default worker;
```

---

## Step 4: Create Repurposing Worker

**File:** `app/backend/src/workers/repurposing.worker.ts`

```typescript
/**
 * Repurposing Worker
 * Transforms content into platform-specific variants
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { createContextLogger } from '../utils/logger.js';
import type { RepurposingJob } from '../queues/index.js';
import { getRedisConfig } from '../utils/redis-config.js';
import { repurposeContentWithAI } from '../utils/ai-repurposing.js';

const log = createContextLogger('RepurposingWorker');
const prisma = new PrismaClient();

/**
 * Generate platform-specific variants
 */
async function generateVariants(
  content: any,
  platforms: string[],
  style: string
): Promise<Record<string, any>> {
  const variants: Record<string, any> = {};

  for (const platform of platforms) {
    log.info(`Generating variant for ${platform}`, { style });

    // Use your AI repurposing service
    const variant = await repurposeContentWithAI(content.originalContent, {
      platform,
      style: style as any,
      tone: 'casual',
    });

    variants[platform] = {
      headline: variant.headline || content.title,
      body: variant.bodyText,
      hashtags: variant.hashtags,
      callToAction: variant.cta,
      mediaRequirements: {
        instagram: { width: 1080, height: 1350, format: 'jpg/mp4' },
        tiktok: { width: 1080, height: 1920, format: 'mp4' },
        youtube: { format: 'mp4', minLength: 60, aspectRatio: '16:9' },
        linkedin: { format: 'jpg/mp4', maxLength: 1200 },
      }[platform],
    };
  }

  return variants;
}

/**
 * Process repurposing job
 */
async function processRepurposing(
  job: Job<RepurposingJob>
): Promise<{ success: boolean; repurposedContentIds?: string[]; error?: string }> {
  const { contentId, businessId, platforms, style } = job.data;

  try {
    log.info('Processing repurposing', { contentId, platforms });

    // Step 1: Fetch original content
    const contentInput = await (prisma as any).contentInput.findUnique({
      where: { id: contentId },
    });

    if (!contentInput) {
      throw new Error(`Content not found: ${contentId}`);
    }

    // Step 2: Generate platform variants
    const variants = await generateVariants(contentInput, platforms, style || 'educational');

    // Step 3: Save repurposed content variants
    const repurposedIds: string[] = [];
    
    for (const [platform, variant] of Object.entries(variants)) {
      const repurposed = await (prisma as any).repurposedContent.create({
        data: {
          businessId,
          contentInputId: contentId,
          platform,
          headline: variant.headline,
          bodyText: variant.body,
          hashtags: variant.hashtags,
          callToAction: variant.callToAction,
          status: 'ready_for_approval',
          metadata: {
            style,
            generatedAt: new Date(),
            mediaRequirements: variant.mediaRequirements,
          },
        },
      });

      repurposedIds.push(repurposed.id);
      log.info(`Created repurposed content for ${platform}`, { repurposedContentId: repurposed.id });
    }

    log.info('Repurposing completed', { repurposedCount: repurposedIds.length });

    return {
      success: true,
      repurposedContentIds: repurposedIds,
    };
  } catch (error: any) {
    log.error('Repurposing error', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Create worker
const worker = new Worker<RepurposingJob>(
  'repurposing',
  processRepurposing,
  {
    connection: getRedisConfig(),
    concurrency: 2,
    maxStalledCount: 2,
    stalledInterval: 30000,
  }
);

// Event handlers
worker.on('completed', (job, result) => {
  log.info('Job completed', { jobId: job.id, result });
});

worker.on('failed', (job, error) => {
  log.error('Job failed', { jobId: job?.id, error });
});

worker.on('error', (error) => {
  log.error('Worker error', error);
});

export default worker;
```

---

## Step 5: Create Distribution Worker

**File:** `app/backend/src/workers/distribution.worker.ts`

```typescript
/**
 * Distribution Worker
 * Publishes repurposed content to selected platforms
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { createContextLogger } from '../utils/logger.js';
import type { DistributionJob } from '../queues/index.js';
import { getRedisConfig } from '../utils/redis-config.js';

const log = createContextLogger('DistributionWorker');
const prisma = new PrismaClient();

/**
 * Publish content to a specific platform
 */
async function publishToPlatform(
  platform: string,
  content: any,
  accountId: string,
  scheduleTime?: Date
): Promise<{ externalPostId: string; url?: string }> {
  log.info(`Publishing to ${platform}`, { accountId, scheduled: !!scheduleTime });

  // TODO: Implement actual platform API calls
  // For now, generate mock post ID
  const externalPostId = `${platform}-${content.id}-${Date.now()}`;

  // TODO: Call platform-specific API:
  // - Instagram: /ig/content/media
  // - TikTok: /v1/post
  // - YouTube: youtube.videos.insert
  // - LinkedIn: /posts (if scheduled, add scheduled_publish_time)

  return {
    externalPostId,
    url: `https://${platform}.com/posts/${externalPostId}`,
  };
}

/**
 * Process distribution job
 */
async function processDistribution(
  job: Job<DistributionJob>
): Promise<{ success: boolean; publishedCount?: number; error?: string }> {
  const { businessId, contentIds, platforms, publishNow } = job.data;

  try {
    log.info('Processing distribution', { contentIds, platforms });

    if (contentIds.length === 0) {
      throw new Error('No content IDs provided');
    }

    let publishedCount = 0;

    // For each content ID and platform combo
    for (const contentId of contentIds) {
      // Fetch repurposed content
      const repurposedContent = await (prisma as any).repurposedContent.findUnique({
        where: { id: contentId },
      });

      if (!repurposedContent) {
        log.warn(`Content not found: ${contentId}`);
        continue;
      }

      // Get social accounts for this business
      const accounts = await (prisma as any).socialAccount.findMany({
        where: {
          businessId,
          platform: { in: platforms },
        },
      });

      if (accounts.length === 0) {
        log.warn('No social accounts configured', { platforms });
        continue;
      }

      // Publish to each platform
      for (const account of accounts) {
        try {
          const result = await publishToPlatform(
            account.platform,
            repurposedContent,
            account.id,
            job.data.scheduleTime
          );

          // Create platform distribution record
          await (prisma as any).platformDistribution.create({
            data: {
              businessId,
              repurposedContentId: contentId,
              platform: account.platform,
              accountId: account.id,
              externalPostId: result.externalPostId,
              postUrl: result.url,
              status: job.data.scheduleTime ? 'scheduled' : 'published',
              publishedAt: publishNow ? new Date() : null,
            },
          });

          publishedCount++;
          log.info(`Published to ${account.platform}`, { externalPostId: result.externalPostId });
        } catch (error: any) {
          log.error(`Failed to publish to ${account.platform}`, error);
          // Continue with other platforms on partial failure
        }
      }
    }

    if (publishedCount === 0) {
      throw new Error('No content was published');
    }

    log.info('Distribution completed', { publishedCount });

    return {
      success: true,
      publishedCount,
    };
  } catch (error: any) {
    log.error('Distribution error', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Create worker
const worker = new Worker<DistributionJob>(
  'distribution',
  processDistribution,
  {
    connection: getRedisConfig(),
    concurrency: 2,
    maxStalledCount: 2,
    stalledInterval: 30000,
  }
);

// Event handlers
worker.on('completed', (job, result) => {
  log.info('Job completed', { jobId: job.id, result });
});

worker.on('failed', (job, error) => {
  log.error('Job failed', { jobId: job?.id, error });
});

worker.on('error', (error) => {
  log.error('Worker error', error);
});

export default worker;
```

---

## Step 6: Register Workers

**File:** `app/backend/src/workers/index.ts`

Update to include the new workers:

```typescript
import contentIngestionWorker from './content-ingestion.worker.js';
import repurposingWorker from './repurposing.worker.js';
import distributionWorker from './distribution.worker.js';

// ... existing workers ...

/**
 * Start all workers
 */
export function startAllWorkers() {
  const workers = [
    // ... existing workers ...
    contentIngestionWorker,
    repurposingWorker,
    distributionWorker,
  ];

  workers.forEach(w => {
    if (w) console.log(`[Workers] Started: ${w.name}`);
  });
}
```

---

## Step 7: Add API Endpoints

Add endpoints to `app/backend/src/index.ts` to trigger these queues:

```typescript
/**
 * POST /api/content/ingest
 * User uploads/inputs content
 */
app.post('/api/content/ingest', async (req, res) => {
  try {
    const { businessId, sourceType, sourceUrl, textContent } = req.body;
    
    const { enqueueContentIngestion } = await import('./queues/index.js');
    const job = await enqueueContentIngestion({
      ingestionId: `ingest-${Date.now()}`,
      businessId,
      sourceType,
      sourceUrl,
      textContent,
      generateSummary: true,
      extractEntities: true,
    });

    res.json({ jobId: job.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/content/repurpose
 * Request content repurposing
 */
app.post('/api/content/repurpose', async (req, res) => {
  try {
    const { businessId, contentId, platforms, style } = req.body;
    
    const { enqueueRepurposing } = await import('./queues/index.js');
    const job = await enqueueRepurposing({
      contentId,
      businessId,
      repurposingJobId: `repurpose-${Date.now()}`,
      platforms,
      style,
    });

    res.json({ jobId: job.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/content/publish
 * Publish repurposed content to platforms
 */
app.post('/api/content/publish', async (req, res) => {
  try {
    const { businessId, contentIds, platforms, scheduleTime } = req.body;
    
    const { enqueueDistribution } = await import('./queues/index.js');
    const job = await enqueueDistribution({
      distributionJobId: `distribute-${Date.now()}`,
      businessId,
      contentIds,
      platforms,
      scheduleTime: scheduleTime ? new Date(scheduleTime) : undefined,
    });

    res.json({ jobId: job.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Verification Checklist

- [ ] Job types defined in `queues/index.ts`
- [ ] Queue definitions created with proper connection config
- [ ] Enqueue functions exported and callable
- [ ] Content ingestion worker created and tested
- [ ] Repurposing worker created and tested
- [ ] Distribution worker created and tested
- [ ] Workers registered in `workers/index.ts`
- [ ] API endpoints added to `index.ts`
- [ ] Prisma models support ContentInput, RepurposedContent, PlatformDistribution
- [ ] All imports and dependencies resolved
- [ ] TypeScript compilation: 0 errors
- [ ] Workers start without Redis errors
- [ ] Test end-to-end: ingest → repurpose → distribute

---

**Created:** February 19, 2026  
**For:** Queue Implementation Team  
**Estimated Time:** 3-4 hours hands-on implementation

