/**
 * Worker System
 * 
 * BullMQ-based background job processors for:
 * - Lead automation (scoring, email sequences)
 * - Content generation (repurpose content → reels)
 * - Social posting (publish to Instagram, TikTok, YouTube)
 * - Review requests (harvest reviews post-booking)
 * - Analytics polling (fetch engagement metrics hourly)
 * 
 * Each worker runs independently and can be scaled horizontally
 * by adding more Redis nodes and worker processes.
 * 
 * Start all workers:
 * $ npm run workers
 * 
 * Start specific worker:
 * $ npx ts-node src/workers/lead-automation.worker.ts
 */

// Import all worker exports
export * from './website.worker.js';
export { startContentIngestionWorker } from './content-ingestion.worker.js';
export { startRepurposingWorker } from './repurposing.worker.js';
export { startDistributionWorker } from './distribution.worker.js';

// Worker type definitions for job queues
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

// Worker configuration
export const WORKER_CONFIG = {
  lead_automation: {
    name: 'lead-automation',
    concurrency: 10,
    description: 'Processes new leads, calculates scores, sends welcome emails, adds to sequences',
  },
  content_generation: {
    name: 'content-generation',
    concurrency: 5,
    description: 'Transforms blog/video/text content into multi-platform optimized reels',
  },
  social_posting: {
    name: 'social-posting',
    concurrency: 10,
    description: 'Publishes reels to Instagram Reels, TikTok, and YouTube Shorts with OAuth',
  },
  review_request: {
    name: 'review-request',
    concurrency: 15,
    description: 'Sends automated review requests post-booking with platform-specific links',
  },
  analytics_polling: {
    name: 'analytics-polling',
    concurrency: 5,
    description: 'Fetches engagement metrics from social platforms hourly',
  },
  content_ingestion: {
    name: 'content-ingestion',
    concurrency: 8,
    description: 'Ingests external content from URLs, extracts text and metadata',
  },
  repurposing: {
    name: 'repurposing',
    concurrency: 5,
    description: 'Repurposes content into multiple formats (reels, threads, etc)',
  },
  distribution: {
    name: 'distribution',
    concurrency: 10,
    description: 'Distributes repurposed content across social platforms',
  },
};
