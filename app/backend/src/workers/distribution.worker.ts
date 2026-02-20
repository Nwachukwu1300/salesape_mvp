/**
 * Distribution Worker
 * 
 * Publishes repurposed content to social platforms:
 * - Instagram
 * - TikTok
 * - YouTube
 * - Twitter
 * - LinkedIn
 * - Facebook
 */

import { Worker, Job } from 'bullmq';
import { distributionQueue, enqueueAnalyticsPolling } from '../queues/index.js';
import type { DistributionJob, AnalyticsPollingJob } from '../queues/index.js';
import { getRedisClient, createRedisClient } from '../utils/redis-client.js';
import { createContextLogger } from '../utils/logger.js';

const logger = createContextLogger('distribution');

/**
 * Mock platform APIs - Replace with real API calls
 */
const platformServices = {
  instagram: {
    async publish(caption: string, mediaUrl: string, hashtags?: string[]) {
      // TODO: Replace with real Instagram API call
      // Using Meta Graph API: POST /ig_hashtag_search, /ig_user_media
      logger.info('Publishing to Instagram', { caption, hashtags });
      return {
        success: true,
        postId: `ig_${Date.now()}`,
        platform: 'instagram',
        url: `https://instagram.com/p/mock_${Date.now()}`,
      };
    },
  },
  tiktok: {
    async publish(caption: string, videoUrl: string, hashtags?: string[]) {
      // TODO: Replace with real TikTok API call
      // Using TikTok Business API
      logger.info('Publishing to TikTok', { caption, hashtags });
      return {
        success: true,
        postId: `tt_${Date.now()}`,
        platform: 'tiktok',
        url: `https://tiktok.com/@user/video/${Date.now()}`,
      };
    },
  },
  youtube: {
    async publish(title: string, description: string, videoUrl: string, hashtags?: string[]) {
      // TODO: Replace with real YouTube API call
      // Using YouTube Data API v3
      logger.info('Publishing to YouTube', { title, hashtags });
      return {
        success: true,
        postId: `yt_${Date.now()}`,
        platform: 'youtube',
        url: `https://youtube.com/watch?v=mock_${Date.now()}`,
      };
    },
  },
  twitter: {
    async publish(threadContent: string, hashtags?: string[]) {
      // TODO: Replace with real Twitter API call
      // Using Twitter API v2
      logger.info('Publishing to Twitter', { hashtags });
      return {
        success: true,
        postId: `tw_${Date.now()}`,
        platform: 'twitter',
        url: `https://twitter.com/user/status/${Date.now()}`,
      };
    },
  },
  linkedin: {
    async publish(content: string, hashtags?: string[]) {
      // TODO: Replace with real LinkedIn API call
      // Using LinkedIn Share API or Content Publishing API
      logger.info('Publishing to LinkedIn', { hashtags });
      return {
        success: true,
        postId: `li_${Date.now()}`,
        platform: 'linkedin',
        url: `https://linkedin.com/feed/update/urn:li:activity:${Date.now()}`,
      };
    },
  },
  facebook: {
    async publish(caption: string, mediaUrl: string, hashtags?: string[]) {
      // TODO: Replace with real Facebook API call
      // Using Facebook Graph API
      logger.info('Publishing to Facebook', { caption, hashtags });
      return {
        success: true,
        postId: `fb_${Date.now()}`,
        platform: 'facebook',
        url: `https://facebook.com/user/posts/${Date.now()}`,
      };
    },
  },
};

/**
 * Publish to a single platform
 */
async function publishToPlatform(
  platform: string,
  content: string,
  caption?: string,
  hashtags?: string[],
  scheduleTime?: Date
) {
  type PlatformKey = keyof typeof platformServices;
  const platformKey = platform as PlatformKey;

  try {
    logger.info('Starting platform publish', { platform, scheduleTime });

    // Check if scheduled
    if (scheduleTime && new Date(scheduleTime) > new Date()) {
      const delay = new Date(scheduleTime).getTime() - Date.now();
      logger.info('Scheduling publish', { platform, delayMs: delay });
      // In production, use platform-specific scheduling
      // For now, we wait (not recommended for production)
      await new Promise((resolve) => setTimeout(resolve, Math.min(delay, 60000)));
    }

    // Get the appropriate service
    const service = platformServices[platformKey];
    if (!service) {
      throw new Error(`Unknown platform: ${platform}`);
    }

    // Call the platform service (cast to any to handle differing signatures across services)
    const result = await (service as any).publish(caption || content, content, hashtags);

    logger.info('Platform publish successful', {
      platform: platformKey,
      postId: result.postId,
      url: result.url,
    });

    return result;
  } catch (error) {
    logger.error('Platform publish failed', {
      platform,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Process distribution job
 */
async function processDistribution(job: Job<DistributionJob>) {
  const { reelId, reelVariantId, businessId, platforms, caption, hashtags, scheduleTime } = job.data;

  try {
    logger.info('Processing distribution', {
      jobId: job.id,
      reelId,
      reelVariantId,
      businessId,
      platformCount: platforms.length,
    });

    // Publish to all platforms
    const publishResults = [];
    const publishErrors = [];

    for (const platform of platforms) {
      try {
        const result = await publishToPlatform(platform, reelVariantId, caption, hashtags, scheduleTime);
        publishResults.push(result);
      } catch (error) {
        publishErrors.push({
          platform,
          error: error instanceof Error ? error.message : String(error),
        });
        // Continue with other platforms on error
        logger.error('Platform publish error', {
          jobId: job.id,
          platform,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    if (publishResults.length === 0 && publishErrors.length > 0) {
      throw new Error(`Failed to publish to any platform: ${publishErrors.map((e) => e.error).join(', ')}`);
    }

    logger.info('Distribution completed', {
      jobId: job.id,
      reelId,
      successCount: publishResults.length,
      errorCount: publishErrors.length,
    });

    // Trigger analytics polling for each successful publication
    for (const result of publishResults) {
      const analyticsJob: AnalyticsPollingJob = {
        reelVariantId,
        businessId,
        externalPostId: result.postId,
        platform: result.platform,
      };

      // Start polling after a small delay
      try {
        await enqueueAnalyticsPolling(analyticsJob, {
          delay: 5 * 60 * 1000, // First poll after 5 minutes
        });
      } catch (error) {
        logger.error('Failed to enqueue analytics polling', {
          reelVariantId,
          platform: result.platform,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      success: publishResults.length > 0,
      published: publishResults,
      failed: publishErrors,
      totalPublished: publishResults.length,
      totalFailed: publishErrors.length,
    };
  } catch (error) {
    logger.error('Distribution job failed', {
      jobId: job.id,
      reelId,
      error: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

/**
 * Start distribution worker
 */
export async function startDistributionWorker() {
  // Use the shared Redis client singleton
  createRedisClient();

  const worker = new Worker<DistributionJob>(
    'distribution',
    async (job) => {
      return await processDistribution(job);
    },
    {
      connection: getRedisClient(),
      concurrency: 10,
      maxStalledCount: 2,
      stalledInterval: 5000,
      lockDuration: 30000,
    }
  );

  // Handle worker events
  worker.on('completed', (job) => {
    logger.info('Distribution job completed', {
      jobId: job.id,
      reelId: job.data.reelId,
    });
  });

  worker.on('failed', (job, err) => {
    logger.error('Distribution job failed', {
      jobId: job?.id,
      reelId: job?.data.reelId,
      error: err.message,
      attempt: job?.attemptsMade,
      maxAttempts: job?.opts.attempts,
    });
  });

  worker.on('error', (err) => {
    logger.error('Distribution worker error', {
      error: err.message,
    });
  });

  logger.info('Distribution worker started', { concurrency: 10 });

  return worker;
}

// Start worker if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startDistributionWorker().catch((err) => {
    logger.error('Failed to start distribution worker', {
      error: err.message,
    });
    process.exit(1);
  });
}

export { startDistributionWorker as default };
