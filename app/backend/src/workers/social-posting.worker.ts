/**
 * Social Posting Worker
 * Publishes reels to social media platforms
 * 
 * Responsibilities:
 * - Upload reels to Instagram/TikTok/YouTube
 * - Generate platform-specific metadata
 * - Handle scheduled posting
 * - Track post IDs for analytics
 */

import dotenv from 'dotenv';
// Ensure env vars are loaded before evaluating Redis config
dotenv.config({ path: '.env.local' });
dotenv.config();

import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { getRedisClient, createRedisClient } from '../utils/redis-client.js';
import type { SocialPostingJob } from '../queues/index.js';

const prisma = new PrismaClient();

// Ensure singleton Redis client is available
createRedisClient();

const worker = new Worker<SocialPostingJob>(
  'social-posting',
  async (job: Job<SocialPostingJob>) => {
    console.log(`[Social Posting] Processing reel: ${job.data.reelVariantId}`);
    const startTime = Date.now();

    try {
      const { reelId, reelVariantId, platforms, businessId, scheduleTime } = job.data;

      // Get reel variant
      const reel = await (prisma as any).reelVariant.findUnique({
        where: { id: reelVariantId },
        include: { contentProject: true },
      });

      if (!reel) {
        throw new Error(`Reel variant not found: ${reelVariantId}`);
      }

      // Get social accounts
      const socialAccounts = await (prisma as any).socialAccount.findMany({
        where: {
          businessId,
          platform: { in: platforms },
        },
      });

      if (socialAccounts.length === 0) {
        throw new Error(`No social accounts configured for platforms: ${platforms.join(', ')}`);
      }

      // Post to each platform
      const results: any[] = [];
      for (const account of socialAccounts) {
        try {
          const postResult = await postToSocialMedia({
            platform: account.platform as 'instagram' | 'tiktok' | 'youtube',
            reel,
            accessToken: account.accessToken,
            ...(scheduleTime ? { scheduleTime } : {}),
          });

          results.push({
            platform: account.platform,
            success: true,
            externalPostId: postResult.externalPostId,
          });

          console.log(`[Social Posting] Posted to ${account.platform}: ${postResult.externalPostId}`);
        } catch (error) {
          console.error(`[Social Posting] Failed to post to ${account.platform}:`, error);
          results.push({
            platform: account.platform,
            success: false,
            error: (error as Error).message,
          });
        }
      }

      // Update reel status
      const allSuccess = results.every(r => r.success);
      await (prisma as any).reelVariant.update({
        where: { id: reelVariantId },
        data: {
          status: allSuccess ? 'published' : 'draft',
        },
      });

      // Create analytics records for successful posts
      for (const result of results) {
        if (result.success) {
          await (prisma as any).postAnalytics.upsert({
            where: { reelVariantId },
            create: {
              reelVariantId,
              views: 0,
              likes: 0,
              comments: 0,
              shares: 0,
              clickThroughs: 0,
              lastsync: new Date(),
            },
            update: {
              lastsync: new Date(),
            },
          });
        }
      }

      const duration = Date.now() - startTime;
      console.log(`[Social Posting] Completed ${results.length} posts in ${duration}ms`);

      return {
        success: true,
        reelVariantId,
        posts: results,
        duration,
      };
    } catch (error: any) {
      console.error('[Social Posting] Error:', error?.message);
      throw error;
    }
  },
  {
    connection: getRedisClient(),
    concurrency: 2,
    maxStalledCount: 2,
    stalledInterval: 30000,
  }
);

/**
 * Post reel to social media platform
 */
async function postToSocialMedia(params: {
  platform: 'instagram' | 'tiktok' | 'youtube';
  reel: any;
  accessToken: string;
  scheduleTime?: Date;
}): Promise<{ externalPostId: string }> {
  const { platform, reel, accessToken, scheduleTime } = params;

  // In production, this would integrate with each platform's API
  // For now, generate a mock external ID
  const externalPostId = `${platform}-${reel.id}-${Date.now()}`;

  if (platform === 'instagram') {
    return handleInstagramPosting(reel, accessToken, scheduleTime, externalPostId);
  } else if (platform === 'tiktok') {
    return handleTikTokPosting(reel, accessToken, scheduleTime, externalPostId);
  } else if (platform === 'youtube') {
    return handleYouTubePosting(reel, accessToken, scheduleTime, externalPostId);
  }

  throw new Error(`Unsupported platform: ${platform}`);
}

/**
 * Handle Instagram posting
 */
async function handleInstagramPosting(
  reel: any,
  accessToken: string,
  scheduleTime?: Date,
  externalPostId?: string
): Promise<{ externalPostId: string }> {
  // In production, use Instagram Graph API
  console.log('[Instagram] Would post:', {
    caption: reel.caption,
    hashtags: reel.hashtags.join(' '),
    scheduled: scheduleTime ? 'yes' : 'no',
  });

  return {
    externalPostId: externalPostId || `ig-${reel.id}-${Date.now()}`,
  };
}

/**
 * Handle TikTok posting
 */
async function handleTikTokPosting(
  reel: any,
  accessToken: string,
  scheduleTime?: Date,
  externalPostId?: string
): Promise<{ externalPostId: string }> {
  // In production, use TikTok API
  console.log('[TikTok] Would post:', {
    description: reel.caption,
    hashtags: reel.hashtags.join(' '),
    scheduled: scheduleTime ? 'yes' : 'no',
  });

  return {
    externalPostId: externalPostId || `tt-${reel.id}-${Date.now()}`,
  };
}

/**
 * Handle YouTube posting
 */
async function handleYouTubePosting(
  reel: any,
  accessToken: string,
  scheduleTime?: Date,
  externalPostId?: string
): Promise<{ externalPostId: string }> {
  // In production, use YouTube Data API
  console.log('[YouTube] Would post:', {
    title: reel.title,
    description: reel.caption,
    tags: reel.hashtags,
    scheduled: scheduleTime ? 'yes' : 'no',
  });

  return {
    externalPostId: externalPostId || `yt-${reel.id}-${Date.now()}`,
  };
}

worker.on('completed', (job) => {
  console.log(`[Social Posting] Job completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
  console.error(`[Social Posting] Job failed: ${job?.id} - ${err?.message}`);
});

worker.on('error', (err) => {
  console.error('[Social Posting] Worker error:', err);
});

export default worker;
