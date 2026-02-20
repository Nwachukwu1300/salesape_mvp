/**
 * Content Generation Worker
 * Processes content projects and generates reels
 * 
 * Responsibilities:
 * - Fetch input content (blog, video, transcript, text, voice)
 * - Repurpose content into TikTok/Instagram Reel scripts
 * - Generate hooks, scripts, captions, hashtags
 * - Create ReelVariant records with metadata
 * - Calculate pre-publish scores
 */

import dotenv from 'dotenv';
// Ensure env vars are loaded before evaluating Redis config
dotenv.config({ path: '.env.local' });
dotenv.config();

import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import type { ContentGenerationJob } from '../queues/index.js';
import { processVideo, getVideoMetadata } from '../services/video-processor.service.js';
import { enhanceReelCaption } from '../services/seo-aeo-enhancement.service.js';

const prisma = new PrismaClient();

const worker = new Worker<ContentGenerationJob>(
  'content-generation',
  async (job: Job<ContentGenerationJob>) => {
    console.log('[Content Generation] Processing project:', job.data.projectId);
    const startTime = Date.now();

    try {
      const { projectId, businessId, inputType, inputUrl, inputText, reelsRequested = 3, style = 'educational' } = job.data;

      // Get content project and business
      const project = await (prisma as any).contentProject.findUnique({
        where: { id: projectId },
        include: { business: true },
      });

      if (!project) {
        throw new Error(`Content project not found: ${projectId}`);
      }

      // Get business growth mode to determine repurposing strategy
      const business = await (prisma as any).business.findUnique({
        where: { id: businessId },
      });
      const growthMode: string = (business as any)?.growthMode || 'BALANCED';

      // Adjust reel count based on growth mode
      let reelsCount = 3;
      if (growthMode === 'CONSERVATIVE') reelsCount = 1;
      else if (growthMode === 'BALANCED') reelsCount = 3;
      else if (growthMode === 'AGGRESSIVE') reelsCount = 5;

      console.log(`[Content Generation] Using ${growthMode} growth mode - generating ${reelsCount} reels`);

      // Update project status
      await (prisma as any).contentProject.update({
        where: { id: projectId },
        data: { status: 'processing' },
      });

      // Step 1: Fetch source content
      let sourceContent = '';
      let videoMetadata: any = null;
      
      if (inputType === 'video' && inputUrl) {
        // Handle video input - extract transcript and metadata
        console.log('[Content Generation] Processing video:', inputUrl);
        try {
          // Check if it's a URL or local file path
          let videoPath = inputUrl;
          if (inputUrl.startsWith('http')) {
            // Download video from URL
            videoPath = await downloadVideo(inputUrl);
          }

          // Process video to extract transcript
          const videoContent = await processVideo(videoPath);
          sourceContent = videoContent.transcript + '\n\nVideo Summary: ' + videoContent.summary;
          videoMetadata = {
            duration: videoContent.metadata.duration,
            resolution: `${videoContent.metadata.width}x${videoContent.metadata.height}`,
            fps: videoContent.metadata.fps,
            keyframes: videoContent.keyframes,
            scenes: videoContent.scenes,
          };

          console.log(`[Content Generation] Extracted ${sourceContent.length} characters from video`);
        } catch (videoError) {
          console.error('[Content Generation] Video processing failed:', videoError);
          throw new Error(`Failed to process video: ${(videoError as any).message}`);
        }
      } else if (inputType === 'blog' && inputUrl) {
        sourceContent = await fetchBlogContent(inputUrl);
      } else if (inputType === 'text' && inputText) {
        sourceContent = inputText;
      } else if (inputType === 'voice') {
        sourceContent = inputText || '';
      }

      if (!sourceContent) {
        throw new Error('No content to process');
      }

      console.log(`[Content Generation] Fetched ${sourceContent.length} characters of content`);

      // Step 2: Generate reel variants based on growth mode
      const reelVariants = [];
      const finalReelsCount = growthMode === 'CONSERVATIVE' ? 1 : growthMode === 'AGGRESSIVE' ? 5 : 3;
      for (let i = 0; i < finalReelsCount; i++) {
        const reel = generateReelVariant(sourceContent, i, style, growthMode);
        
        // Enhance caption with SEO/AEO optimizations
        const enhancedCaption = enhanceReelCaption(reel.caption, reel.hook, reel.platform as 'instagram' | 'tiktok' | 'youtube');

        const createdReel = await (prisma as any).reelVariant.create({
          data: {
            contentProjectId: projectId,
            title: reel.title,
            hook: reel.hook,
            script: reel.script,
            caption: enhancedCaption,
            hashtags: reel.hashtags,
            duration: reel.duration,
            platform: reel.platform,
            thumbnailText: reel.thumbnailText,
            prePublishScore: reel.prePublishScore,
            status: 'draft',
          },
        });

        reelVariants.push(createdReel);
        console.log(`[Content Generation] Created reel variant: ${reel.title}`);
      }

      // Step 3: Update project
      await (prisma as any).contentProject.update({
        where: { id: projectId },
        data: {
          status: 'ready',
          updatedAt: new Date(),
        },
      });

      const duration = Date.now() - startTime;
      console.log(`[Content Generation] Completed ${reelVariants.length} reels in ${duration}ms`);

      return {
        success: true,
        projectId,
        reelsCreated: reelVariants.length,
        duration,
      };
    } catch (error: any) {
      console.error('[Content Generation] Error:', error?.message);
      
      // Mark project as failed
      await (prisma as any).contentProject.update({
        where: { id: job.data.projectId },
        data: { status: 'processing' }, // Keep for retry
      }).catch(() => {});

      throw error;
    }
  },
  {
    connection: getRedisClient(),
    concurrency: 3,
    maxStalledCount: 2,
    stalledInterval: 30000,
  }
);

createRedisClient();

/**
 * Fetch blog post content from URL
 */
async function fetchBlogContent(url: string): Promise<string> {
  try {
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });

    const $ = cheerio.load(data);
    
    // Extract article content
    const article = $('article, [role="main"], .post-content, .entry-content, main').first();
    const text = article.length > 0 ? article.text() : $('body').text();

    // Clean up whitespace
    return text
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000); // Limit to 5000 chars
  } catch (error) {
    console.error('[Content Generation] Failed to fetch blog:', error);
    return '';
  }
}

/**
 * Generate a single reel variant
 * Behavior adjusts based on GrowthMode for different repurposing strategies
 */
function generateReelVariant(
  sourceContent: string,
  index: number,
  style: string,
  growthMode: string = 'BALANCED'
): {
  title: string;
  hook: string;
  script: string;
  caption: string;
  hashtags: string[];
  duration: number;
  platform: string;
  thumbnailText: string;
  prePublishScore: number;
} {
  // Extract key points from content
  const sentences = sourceContent.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const keyPoints = sentences.slice(index * 2, (index + 1) * 2 + 1);

  // Generate hooks based on style AND growth mode
  const baseHooks = {
    educational: [
      `Watch this 60-second breakdown! 🎓`,
      `You've been doing this wrong... 🤔`,
      `Here's what nobody tells you about this...`,
      `This one trick changed everything ✨`,
    ],
    storytelling: [
      `This story will change your perspective 🧵`,
      `You won't believe what happened next...`,
      `Let me share something personal 💭`,
    ],
    entertaining: [
      `Wait for the ending 🤣`,
      `Bet you didn't see that coming!`,
      `This is absolutely wild 🔥`,
    ],
    bold: [
      `Most people are doing this wrong! ⚠️`,
      `The truth they don't want you to know...`,
      `This changes everything. Period.`,
    ],
  };

  // AGGRESSIVE mode adds stronger CTAs and hooks
  if (growthMode === 'AGGRESSIVE') {
    baseHooks.bold.push('This will blow your mind 🤯');
    baseHooks.educational.push('Save this before they delete it ⚡');
  }

  const styleHooks = (baseHooks as Record<string, string[]>)[style] || baseHooks.educational;
  const hook: string = (styleHooks[index % styleHooks.length] as string) || 'Check this out';

  // Platform rotation
  const platforms = ['instagram', 'tiktok', 'youtube'];
  const platform: string = (platforms[index % platforms.length] as string) || 'instagram';
  const keyPointsText: string = keyPoints.join(' ');
  const captionText: string = generateCaption(keyPointsText, platform);
  const hashtagsArray: string[] = generateHashtags(keyPointsText, platform);
  const preScoreValue: number = calculatePrePublishScore(hook, keyPointsText);

  const result: {
    title: string;
    hook: string;
    script: string;
    caption: string;
    hashtags: string[];
    duration: number;
    platform: string;
    thumbnailText: string;
    prePublishScore: number;
  } = {
    title: `Reel ${index + 1}: ${keyPoints[0]?.substring(0, 50) || 'Untitled'}...`,
    hook,
    script: keyPointsText.substring(0, 300),
    caption: captionText,
    hashtags: hashtagsArray,
    duration: platform === 'tiktok' ? 60 : platform === 'instagram' ? 90 : 120,
    platform,
    thumbnailText: hook.substring(0, 30),
    prePublishScore: preScoreValue,
  };

  return result;
}

/**
 * Generate caption for reel
 */
function generateCaption(text: string, platform: string): string {
  const mainPoint = text.substring(0, 150) || 'Check this out';
  
  if (platform === 'tiktok') {
    return `${mainPoint}... Full breakdown in the video! 👇 #MustWatch #Tips`;
  } else if (platform === 'instagram') {
    return `${mainPoint}... Swipe through for more! 📲 #Reels #Insights`;
  } else {
    return `${mainPoint}... Subscribe for more! 🔔 #Shorts #Educational`;
  }
}

/**
 * Generate hashtags for reel
 */
function generateHashtags(text: string, platform: string): string[] {
  const baseHashtags = [
    '#tips',
    '#howto',
    '#learning',
    '#fyp',
    '#foryoupage',
    '#trending',
  ];

  if (platform === 'tiktok') {
    return [...baseHashtags, '#tiktok', '#viral', '#fypシ'];
  } else if (platform === 'instagram') {
    return [...baseHashtags, '#reels', '#instagram', '#instagood'];
  } else {
    return [...baseHashtags, '#shorts', '#youtube', '#recommended'];
  }
}

/**
 * Calculate pre-publish score (0-100)
 */
function calculatePrePublishScore(hook: string, script: string): number {
  let score = 50;

  // Hook length and quality
  if (hook.length > 30 && hook.length < 100) score += 10;
  if (hook.includes('?') || hook.includes('!')) score += 5;
  if (hook.toLowerCase().includes('you')) score += 5;

  // Script quality
  if (script.length > 100) score += 10;
  if (script.split(' ').length > 20) score += 5;

  // Engagement indicators
  if (hook.includes('💡') || hook.includes('🔥') || hook.includes('✨')) score += 8;

  return Math.min(100, score);
}

/**
 * Download video from URL to temporary storage
 */
async function downloadVideo(videoUrl: string): Promise<string> {
  try {
    const tempPath = `/tmp/video-${Date.now()}.mp4`;
    
    // Download with axios and save to temp file
    const response = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 60000 });
    fs.writeFileSync(tempPath, response.data);
    
    console.log(`[Content Generation] Downloaded video to: ${tempPath}`);
    return tempPath;
  } catch (error) {
    console.error('Video download failed:', error);
    throw new Error(`Failed to download video: ${(error as any).message}`);
  }
}

worker.on('completed', (job) => {
  console.log(`[Content Generation] Job completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
  console.error(`[Content Generation] Job failed: ${job?.id} - ${err?.message}`);
});

worker.on('error', (err) => {
  console.error('[Content Generation] Worker error:', err);
});

export default worker;
