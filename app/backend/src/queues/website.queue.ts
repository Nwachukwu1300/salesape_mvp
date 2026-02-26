/**
 * Website Generation Queue
 * Handles async website generation jobs using BullMQ (optional if Redis unavailable)
 */

import dotenv from 'dotenv';
// Ensure env vars are loaded before evaluating Redis config
dotenv.config({ path: '.env.local' });
dotenv.config();

import { Queue, QueueEvents } from 'bullmq';
import { getRedisClient, createRedisClient } from '../utils/redis-client.js';
let redisAvailable = true; // Flag to track if Redis is available

// Queue name
const QUEUE_NAME = 'website-generation';

// Job data interface
export interface WebsiteGenerationJobData {
  businessId: string;
  userId: string;
  businessUnderstanding: {
    name: string;
    category: string;
    location: string;
    services: string[];
    valueProposition: string;
    targetAudience: string;
    brandTone: string;
    brandColors: string[];
    trustSignals: string[];
    seoKeywords: string[];
    contactPreferences: {
      email: boolean;
      phone: boolean;
      booking: boolean;
    };
    desiredFeatures?: string[];
    logoUrl?: string;
  };
  sourceUrl?: string;
}

// Job result interface
export interface WebsiteGenerationJobResult {
  success: boolean;
  businessId: string;
  templateId?: string;
  websiteConfigId?: string;
  error?: string;
}

// Generation steps
export type GenerationStep =
  | 'queued'
  | 'scraping'
  | 'analyzing'
  | 'selecting_template'
  | 'generating_config'
  | 'enriching_images'
  | 'completed'
  | 'failed';

// Create the queue
let websiteQueue: Queue<WebsiteGenerationJobData, WebsiteGenerationJobResult> | null = null;
let queueEvents: QueueEvents | null = null;

// Export function to get connection
export function getConnection() {
  return getRedisClient();
}

/**
 * Get or create the website generation queue
 */
export function getWebsiteQueue(): Queue<WebsiteGenerationJobData, WebsiteGenerationJobResult> | null {
  // Return null if Redis is not available
  if (!redisAvailable) {
    return null;
  }

  if (!websiteQueue) {
    try {
      createRedisClient();
      websiteQueue = new Queue(QUEUE_NAME, {
        connection: getRedisClient(),
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: {
            count: 100, // Keep last 100 completed jobs
          },
          removeOnFail: {
            count: 50, // Keep last 50 failed jobs
          },
        },
      });
    } catch (err) {
      console.warn('[Queue] Redis connection failed:', err instanceof Error ? err.message : String(err));
      redisAvailable = false;
      return null;
    }
  }
  return websiteQueue;
}

/**
 * Get queue events for monitoring
 */
export function getQueueEvents(): QueueEvents | null {
  // Return null if Redis is not available
  if (!redisAvailable) {
    return null;
  }

  if (!queueEvents) {
    try {
      createRedisClient();
      queueEvents = new QueueEvents(QUEUE_NAME, { connection: getRedisClient() });
    } catch (err) {
      console.warn('[Queue] Failed to create queue events:', err instanceof Error ? err.message : String(err));
      redisAvailable = false;
      return null;
    }
  }
  return queueEvents;
}

/**
 * Add a website generation job to the queue
 */
export async function enqueueWebsiteGeneration(
  data: WebsiteGenerationJobData
): Promise<{ jobId: string }> {
  const queue = getWebsiteQueue();

  // If Redis/queue is not available, return a mock job ID
  if (!queue) {
    console.warn('[Queue] Redis not available, returning mock job ID. Website generation will not run async.');
    return { jobId: `mock-${data.businessId}-${Date.now()}` };
  }

  const job = await queue.add('generate-website', data, {
    jobId: `website-${data.businessId}-${Date.now()}`,
  });

  return { jobId: job.id! };
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string): Promise<{
  status: GenerationStep;
  progress: number;
  step?: string;
  result?: WebsiteGenerationJobResult;
}> {
  const queue = getWebsiteQueue();

  // If Redis is not available, return completed status for mock jobs
  if (!queue) {
    if (jobId.startsWith('mock-')) {
      return { status: 'completed', progress: 100 };
    }
    return { status: 'failed', progress: 0, step: 'Redis not available' };
  }

  const job = await queue.getJob(jobId);

  if (!job) {
    return { status: 'failed', progress: 0, step: 'Job not found' };
  }

  const state = await job.getState();
  const progress = (job.progress as number) || 0;

  let status: GenerationStep;
  switch (state) {
    case 'waiting':
    case 'delayed':
      status = 'queued';
      break;
    case 'active':
      status = (job.data as any).currentStep || 'scraping';
      break;
    case 'completed':
      status = 'completed';
      break;
    case 'failed':
      status = 'failed';
      break;
    default:
      status = 'queued';
  }

  const responseObj: any = {
    status,
    progress,
  };
  
  if (typeof (job.data as any).currentStep === 'string') {
    responseObj.step = (job.data as any).currentStep;
  }
  
  if (state === 'completed' && job.returnvalue) {
    responseObj.result = job.returnvalue;
  }
  
  return responseObj;
}

/**
 * Close queue connections
 */
export async function closeQueue(): Promise<void> {
  if (websiteQueue) {
    try {
      await websiteQueue.close();
    } catch (err) {
      console.warn('[Queue] Error closing queue:', err instanceof Error ? err.message : String(err));
    }
    websiteQueue = null;
  }
  if (queueEvents) {
    try {
      await queueEvents.close();
    } catch (err) {
      console.warn('[Queue] Error closing queue events:', err instanceof Error ? err.message : String(err));
    }
    queueEvents = null;
  }
}

export { QUEUE_NAME, redisAvailable };
