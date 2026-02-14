/**
 * Website Generation Queue
 * Handles async website generation jobs using BullMQ
 */

import { Queue, QueueEvents } from 'bullmq';

// Redis connection config
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
};

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

/**
 * Get or create the website generation queue
 */
export function getWebsiteQueue(): Queue<WebsiteGenerationJobData, WebsiteGenerationJobResult> {
  if (!websiteQueue) {
    websiteQueue = new Queue(QUEUE_NAME, {
      connection,
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
  }
  return websiteQueue;
}

/**
 * Get queue events for monitoring
 */
export function getQueueEvents(): QueueEvents {
  if (!queueEvents) {
    queueEvents = new QueueEvents(QUEUE_NAME, { connection });
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

  return {
    status,
    progress,
    step: (job.data as any).currentStep,
    result: state === 'completed' ? job.returnvalue : undefined,
  };
}

/**
 * Close queue connections
 */
export async function closeQueue(): Promise<void> {
  if (websiteQueue) {
    await websiteQueue.close();
    websiteQueue = null;
  }
  if (queueEvents) {
    await queueEvents.close();
    queueEvents = null;
  }
}

export { QUEUE_NAME, connection };
