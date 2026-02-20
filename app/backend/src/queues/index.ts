/**
 * Queue System Management
 * 
 * Centralized job queue interface for enqueueing background jobs:
 * - Lead automation (score, email, sequence)
 * - Content generation (repurpose content → reels)
 * - Social posting (publish to Instagram, TikTok, YouTube)
 * - Review requests (harvest reviews post-booking)
 * - Analytics polling (fetch engagement metrics hourly)
 * 
 * Uses BullMQ with Redis for reliable job processing.
 * Each queue can be started independently as a scalable worker process.
 */

import dotenv from 'dotenv';
// Ensure env vars are loaded before evaluating Redis config
dotenv.config({ path: '.env.local' });
dotenv.config();

import { Queue } from 'bullmq';
import { getRedisClient, createRedisClient } from '../utils/redis-client.js';
import { logRedisConfig } from '../utils/redis-config.js';

export * from './website.queue.js';

// Job type definitions
export interface LeadAutomationJob {
  leadId: string;
  businessId: string;
  email: string;
  name?: string;
  message?: string;
  source?: string;
}

export interface ContentGenerationJob {
  projectId: string;
  businessId: string;
  inputType: 'video' | 'blog' | 'text' | 'voice';
  inputUrl?: string;
  inputText?: string;
  inputTranscript?: string;
  reelsRequested?: number;
  style?: 'educational' | 'authority' | 'storytelling' | 'entertaining' | 'bold' | 'calm';
  autoPublish?: boolean;
}

export interface SocialPostingJob {
  reelId: string;
  reelVariantId: string;
  platforms: Array<'instagram' | 'tiktok' | 'youtube'>;
  businessId: string;
  scheduleTime?: Date;
}

export interface ReviewRequestJob {
  bookingId: string;
  businessId: string;
  bookingEmail: string;
  bookingName?: string;
  serviceTitle?: string;
  completionDate?: Date;
}

export interface AnalyticsPollingJob {
  reelVariantId: string;
  businessId: string;
  externalPostId?: string;
  platform?: string;
}

export interface ContentIngestionJob {
  projectId: string;
  businessId: string;
  sourceUrl: string;
  contentType: 'article' | 'blog' | 'video' | 'podcast' | 'social-post' | 'website';
  extractedContent?: string;
  metadata?: {
    title?: string;
    author?: string;
    publishDate?: Date;
    thumbnail?: string;
  };
}

export interface RepurposingJob {
  contentId: string;
  businessId: string;
  originContent: string;
  targetFormats: Array<'instagram-reel' | 'tiktok' | 'youtube-short' | 'twitter-thread' | 'linkedin' | 'blog-excerpt'>;
  style?: 'educational' | 'authority' | 'storytelling' | 'entertaining' | 'bold' | 'calm';
  tone?: string;
}

export interface DistributionJob {
  reelId: string;
  reelVariantId: string;
  businessId: string;
  platforms: Array<'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin' | 'facebook'>;
  caption?: string;
  hashtags?: string[];
  scheduleTime?: Date;
}

// Ensure singleton Redis client is available for all queues
logRedisConfig();
createRedisClient();

// Initialize queues using shared Redis client singleton
export const leadAutomationQueue = new Queue<LeadAutomationJob, any, 'lead-automation'>('lead-automation', {
  connection: getRedisClient(),
});

export const contentGenerationQueue = new Queue<ContentGenerationJob, any, 'content-generation'>('content-generation', {
  connection: getRedisClient(),
});

export const socialPostingQueue = new Queue<SocialPostingJob, any, 'social-posting'>('social-posting', {
  connection: getRedisClient(),
});

export const reviewRequestQueue = new Queue<ReviewRequestJob, any, 'review-request'>('review-request', {
  connection: getRedisClient(),
});

export const analyticsPollingQueue = new Queue<AnalyticsPollingJob, any, 'analytics-polling'>('analytics-polling', {
  connection: getRedisClient(),
});

export const contentIngestionQueue = new Queue<ContentIngestionJob, any, 'content-ingestion'>('content-ingestion', {
  connection: getRedisClient(),
});

export const repurposingQueue = new Queue<RepurposingJob, any, 'repurposing'>('repurposing', {
  connection: getRedisClient(),
});

export const distributionQueue = new Queue<DistributionJob, any, 'distribution'>('distribution', {
  connection: getRedisClient(),
});

/**
 * LEAD AUTOMATION
 * Triggered: When new lead is created
 * Delay: Immediate
 * Actions: Score lead, send welcome email, add to sequence
 */
export async function enqueueLeadAutomation(data: LeadAutomationJob, options?: any) {
  return await leadAutomationQueue.add('lead-automation', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { age: 86400 },
    jobId: `lead-${data.leadId}-${Date.now()}`,
    ...options,
  });
}

/**
 * CONTENT GENERATION
 * Triggered: When user creates content project
 * Delay: Immediate
 * Actions: Fetch content, generate reels, save variants
 */
export async function enqueueContentGeneration(data: ContentGenerationJob, options?: any) {
  return await contentGenerationQueue.add('content-generation', data, {
    attempts: 2,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: { age: 604800 },
    jobId: `content-${data.projectId}-${Date.now()}`,
    ...options,
  });
}

/**
 * SOCIAL POSTING
 * Triggered: When user publishes reels
 * Delay: Immediate or scheduled
 * Actions: Upload to Instagram/TikTok/YouTube, get post IDs
 */
export async function enqueueSocialPosting(data: SocialPostingJob, options?: any) {
  const opts: any = {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { age: 604800 },
    jobId: `social-${data.reelVariantId}-${Date.now()}`,
  };

  // Schedule for future if specified
  if (data.scheduleTime && new Date(data.scheduleTime) > new Date()) {
    opts.delay = new Date(data.scheduleTime).getTime() - Date.now();
  }

  return await socialPostingQueue.add('social-posting', data, { ...opts, ...options });
}

/**
 * REVIEW REQUEST
 * Triggered: When booking is completed
 * Delay: 1 hour (let customer experience settle)
 * Actions: Send review request email with platform links
 */
export async function enqueueReviewRequest(data: ReviewRequestJob, options?: any) {
  return await reviewRequestQueue.add('review-request', data, {
    attempts: 2,
    backoff: { type: 'exponential', delay: 3000 },
    delay: 60 * 60 * 1000, // 1 hour delay
    removeOnComplete: { age: 604800 },
    jobId: `review-${data.bookingId}-${Date.now()}`,
    ...options,
  });
}

/**
 * ANALYTICS POLLING
 * Triggered: When reel is published
 * Schedule: Hourly for 7 days, then daily
 * Actions: Fetch views, likes, shares, calculate engagement
 */
export async function enqueueAnalyticsPolling(
  data: AnalyticsPollingJob,
  options?: any
) {
  return await analyticsPollingQueue.add('analytics-polling', data, {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { age: 604800 },
    jobId: `analytics-${data.reelVariantId}-${Date.now()}`,
    ...options,
  });
}

/**
 * CONTENT INGESTION
 * Triggered: When user adds new content source
 * Delay: Immediate
 * Actions: Fetch content from URL, extract text, save metadata
 */
export async function enqueueContentIngestion(data: ContentIngestionJob, options?: any) {
  return await contentIngestionQueue.add('content-ingestion', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { age: 604800 },
    jobId: `ingestion-${data.projectId}-${Date.now()}`,
    ...options,
  });
}

/**
 * REPURPOSING
 * Triggered: When user initiates content repurposing
 * Delay: Immediate
 * Actions: Transform content into multiple formats, generate variants
 */
export async function enqueueRepurposing(data: RepurposingJob, options?: any) {
  return await repurposingQueue.add('repurposing', data, {
    attempts: 2,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: { age: 604800 },
    jobId: `repurpose-${data.contentId}-${Date.now()}`,
    ...options,
  });
}

/**
 * DISTRIBUTION
 * Triggered: When user publishes repurposed content
 * Delay: Immediate or scheduled
 * Actions: Upload to all platforms, track post IDs
 */
export async function enqueueDistribution(data: DistributionJob, options?: any) {
  const opts: any = {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { age: 604800 },
    jobId: `distribute-${data.reelVariantId}-${Date.now()}`,
  };

  // Schedule for future if specified
  if (data.scheduleTime && new Date(data.scheduleTime) > new Date()) {
    opts.delay = new Date(data.scheduleTime).getTime() - Date.now();
  }

  return await distributionQueue.add('distribution', data, { ...opts, ...options });
}

/**
 * Queue Monitoring
 */
export async function getQueueStats() {
  const stats = await Promise.all([
    leadAutomationQueue.getJobCounts(),
    contentGenerationQueue.getJobCounts(),
    socialPostingQueue.getJobCounts(),
    reviewRequestQueue.getJobCounts(),
    analyticsPollingQueue.getJobCounts(),
    contentIngestionQueue.getJobCounts(),
    repurposingQueue.getJobCounts(),
    distributionQueue.getJobCounts(),
  ]);

  return {
    lead_automation: stats[0],
    content_generation: stats[1],
    social_posting: stats[2],
    review_request: stats[3],
    analytics_polling: stats[4],
    content_ingestion: stats[5],
    repurposing: stats[6],
    distribution: stats[7],
  };
}

export async function getQueuesHealth() {
  const stats = await getQueueStats();
  const health: any = { status: 'healthy', queues: {} };

  for (const [name, counts] of Object.entries(stats)) {
    const queueCounts = counts as any;
    const failed = queueCounts.failed || 0;
    health.queues[name] = {
      ...queueCounts,
      status: failed > 100 ? 'warning' : 'healthy',
    };
    if (failed > 100) health.status = 'warning';
  }

  return health;
}
