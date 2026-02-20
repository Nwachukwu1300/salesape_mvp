import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { repurposeContent } from '../utils/content-repurposer.js';

const prisma = new PrismaClient();

/**
 * Content Generation Worker (Simplified)
 * Generates content reels from various sources
 */

interface ContentGenerationJob {
  projectId?: string;
  businessId: string;
  contentType: 'blog' | 'video' | 'text' | 'voice';
  content: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
}

const worker = new Worker<ContentGenerationJob>(
  'content-generation',
  async (job) => {
    const { businessId, contentType, content, platform } = job.data;

    try {
      console.log(`[Content Generation] Processing ${contentType} content for business ${businessId}`);

      // Generate reels from content
      const reels = await repurposeContent(
        {
          type: contentType,
          content,
          businessCategory: 'general',
        },
        5  // Generate 5 reels
      );

      console.log(`[Content Generation] ✅ Generated ${reels.length} reels`);

      return {
        success: true,
        businessId,
        reelsCount: reels.length,
        reels,
      };
    } catch (error) {
      console.error(`[Content Generation] ❌ Error:`, error);
      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
    },
    concurrency: 5,
  }
);

worker.on('completed', (job) => {
  console.log(`[Content Generation] Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`[Content Generation] Job ${job?.id} failed:`, err);
});

export { worker as contentGenerationWorker };
