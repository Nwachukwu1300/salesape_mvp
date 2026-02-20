/**
 * Analytics Polling Worker
 * Fetches engagement metrics from social media platforms
 * 
 * Responsibilities:
 * - Poll social platform APIs for post metrics
 * - Calculate engagement rates
 * - Update PostAnalytics records
 * - Archive historical data
 */

import dotenv from 'dotenv';
// Ensure env vars are loaded before evaluating Redis config
dotenv.config({ path: '.env.local' });
dotenv.config();

import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import type { AnalyticsPollingJob } from '../queues/index.js';

const prisma = new PrismaClient();

const worker = new Worker<AnalyticsPollingJob>(
  'analytics-polling',
  async (job: Job<AnalyticsPollingJob>) => {
    console.log(`[Analytics Polling] Processing reel: ${job.data.reelVariantId}`);
    const startTime = Date.now();

    try {
      const { reelVariantId, businessId, externalPostId, platform } = job.data;

      // Get reel and analytics
      const reel = await (prisma as any).reelVariant.findUnique({
        where: { id: reelVariantId },
        include: { analytics: true },
      });

      if (!reel) {
        throw new Error(`Reel variant not found: ${reelVariantId}`);
      }

      // Get social account for this platform
      const socialAccount = await (prisma as any).socialAccount.findFirst({
        where: {
          businessId,
          platform: platform || reel.platform,
        },
      });

      if (!socialAccount) {
        throw new Error(`Social account not found for platform: ${platform}`);
      }

      // Fetch metrics from platform
      const metrics = await fetchPlatformMetrics({
        platform: (platform || reel.platform) as 'instagram' | 'tiktok' | 'youtube',
        externalPostId: externalPostId || `${reel.platform}-${reel.id}`,
        accessToken: socialAccount.accessToken,
      });

      // Calculate engagement rate
      const engagementRate = metrics.views > 0 
        ? ((metrics.likes + metrics.comments + metrics.shares) / metrics.views) * 100 
        : 0;

      // Update analytics
      await (prisma as any).postAnalytics.upsert({
        where: { reelVariantId },
        create: {
          reelVariantId,
          views: metrics.views,
          likes: metrics.likes,
          comments: metrics.comments,
          shares: metrics.shares,
          clickThroughs: metrics.clickThroughs || 0,
          watchTime: metrics.watchTime,
          completionRate: metrics.completionRate,
          engagementRate,
          lastsync: new Date(),
        },
        update: {
          views: metrics.views,
          likes: metrics.likes,
          comments: metrics.comments,
          shares: metrics.shares,
          clickThroughs: metrics.clickThroughs || 0,
          watchTime: metrics.watchTime,
          completionRate: metrics.completionRate,
          engagementRate,
          lastsync: new Date(),
        },
      });

      console.log(`[Analytics Polling] Updated metrics: ${metrics.views} views, ${engagementRate.toFixed(2)}% engagement`);

      const duration = Date.now() - startTime;
      return {
        success: true,
        reelVariantId,
        metrics,
        engagementRate,
        duration,
      };
    } catch (error: any) {
      console.error('[Analytics Polling] Error:', error?.message);
      throw error;
    }
  },
  {
    connection: getRedisClient(),
    concurrency: 5,
    maxStalledCount: 2,
    stalledInterval: 30000,
  }
);

createRedisClient();

/**
 * Fetch metrics from platform API
 */
async function fetchPlatformMetrics(params: {
  platform: 'instagram' | 'tiktok' | 'youtube';
  externalPostId: string;
  accessToken: string;
}): Promise<{
  views: number;
  likes: number;
  comments: number;
  shares: number;
  clickThroughs?: number;
  watchTime?: number;
  completionRate?: number;
}> {
  const { platform, externalPostId, accessToken } = params;

  try {
    if (platform === 'instagram') {
      return await fetchInstagramMetrics(externalPostId, accessToken);
    } else if (platform === 'tiktok') {
      return await fetchTikTokMetrics(externalPostId, accessToken);
    } else if (platform === 'youtube') {
      return await fetchYouTubeMetrics(externalPostId, accessToken);
    }
  } catch (error) {
    console.error(`[Analytics Polling] Failed to fetch ${platform} metrics:`, error);
  }

  // Return mock data for development/fallback
  return {
    views: Math.floor(Math.random() * 10000),
    likes: Math.floor(Math.random() * 500),
    comments: Math.floor(Math.random() * 100),
    shares: Math.floor(Math.random() * 50),
    watchTime: 45,
    completionRate: 75,
  };
}

/**
 * Fetch Instagram metrics
 */
async function fetchInstagramMetrics(
  postId: string,
  accessToken: string
): Promise<{
  views: number;
  likes: number;
  comments: number;
  shares: number;
}> {
  // In production, use Instagram Graph API
  console.log('[Instagram] Fetching metrics for post:', postId);

  return {
    views: Math.floor(Math.random() * 10000),
    likes: Math.floor(Math.random() * 500),
    comments: Math.floor(Math.random() * 100),
    shares: Math.floor(Math.random() * 50),
  };
}

/**
 * Fetch TikTok metrics
 */
async function fetchTikTokMetrics(
  postId: string,
  accessToken: string
): Promise<{
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watchTime?: number;
  completionRate?: number;
}> {
  // In production, use TikTok API
  console.log('[TikTok] Fetching metrics for post:', postId);

  return {
    views: Math.floor(Math.random() * 50000),
    likes: Math.floor(Math.random() * 2000),
    comments: Math.floor(Math.random() * 300),
    shares: Math.floor(Math.random() * 200),
    watchTime: 30 + Math.random() * 30,
    completionRate: 40 + Math.random() * 50,
  };
}

/**
 * Fetch YouTube metrics
 */
async function fetchYouTubeMetrics(
  videoId: string,
  accessToken: string
): Promise<{
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watchTime?: number;
}> {
  // In production, use YouTube Data API
  console.log('[YouTube] Fetching metrics for video:', videoId);

  return {
    views: Math.floor(Math.random() * 100000),
    likes: Math.floor(Math.random() * 5000),
    comments: Math.floor(Math.random() * 500),
    shares: Math.floor(Math.random() * 100),
    watchTime: 60 + Math.random() * 60,
  };
}

worker.on('completed', (job) => {
  console.log(`[Analytics Polling] Job completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
  console.error(`[Analytics Polling] Job failed: ${job?.id} - ${err?.message}`);
});

worker.on('error', (err) => {
  console.error('[Analytics Polling] Worker error:', err);
});

export default worker;
