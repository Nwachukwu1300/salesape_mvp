/**
 * Repurposing Worker
 * 
 * Transforms content into multiple formats:
 * - Instagram Reels
 * - TikTok clips
 * - YouTube Shorts
 * - Twitter threads
 * - LinkedIn posts
 * - Blog excerpts
 */

import { Worker, Job } from 'bullmq';
import { repurposingQueue, enqueueDistribution } from '../queues/index.js';
import type { RepurposingJob, DistributionJob } from '../queues/index.js';
import { getRedisClient, createRedisClient } from '../utils/redis-client.js';
import { createContextLogger } from '../utils/logger.js';
import { storageService } from '../services/storage.service.js';

const logger = createContextLogger('repurposing');

/**
 * Generate variants for Instagram Reels
 */
async function generateInstagramReelVariant(content: string, style: string): Promise<string> {
  // Instagram Reels: 15-90 seconds, vertical video format
  // Here we generate script/narrative for video creation

  const maxLength = 500; // ~30 seconds of speaking
  const excerpt = content.substring(0, maxLength);

  const scripts: Record<string, (text: string) => string> = {
    educational: (text: string) => `
📚 Here's something you need to know:

${text}

Want to learn more? Check the link in bio! 🔗
`.trim(),
    authority: (text: string) => `
💡 Pro tip from the industry leader:

${text}

Share this with someone who needs to hear it 👇
`.trim(),
    storytelling: (text: string) => `
✨ Let me tell you something...

${text}

Have you experienced this too? Comment below! 💬
`.trim(),
    entertaining: (text: string) => `
🎬 You won't believe this...

${text}

Tag someone who needs to see this! 😂
`.trim(),
  };

  const script = scripts[style] || scripts.educational;
  if (!script) throw new Error('No script template found');
  return script(excerpt);
}

/**
 * Generate variants for TikTok
 */
async function generateTikTokVariant(content: string, style: string): Promise<string> {
  // TikTok: 15 seconds to 10 minutes, trending sounds + trending formats
  const maxLength = 300;
  const excerpt = content.substring(0, maxLength);

  const templates: Record<string, (text: string) => string> = {
    educational: (text: string) => `
[TRENDING SOUND]

POV: You're about to learn something that changes everything...

${text}

#fyp #foryoupage #viral #education
`.trim(),
    authority: (text: string) => `
[TRENDING SOUND]

This is what entrepreneurs don't talk about:

${text}

#entrepreneur #motivation #success
`.trim(),
    storytelling: (text: string) => `
[TRENDING SOUND]

Wait for the plot twist... 

${text}

#storytelling #relatable #interesting
`.trim(),
    entertaining: (text: string) => `
[TRENDING SOUND]

POV: You have 15 seconds to watch this...

${text}

#funny #trending #viral
`.trim(),
  };

  const template = templates[style] || templates.educational;
  if (!template) throw new Error('No template found');
  return template(excerpt);
}

/**
 * Generate variants for YouTube Shorts
 */
async function generateYouTubeShortVariant(content: string, style: string): Promise<string> {
  // YouTube Shorts: 15-60 seconds, vertical format, high production quality
  const maxLength = 400;
  const excerpt = content.substring(0, maxLength);

  const formats: Record<string, (text: string) => string> = {
    educational: (text: string) => `
[TITLE: Learn This One Trick]

[INTRO (0-2s)]
"You're probably doing this wrong..."

[MAIN CONTENT (2-50s)]
${text}

[OUTRO (50-60s)]
"Subscribe for more insider tips!"

#shorts #learn #youtubeshorts
`.trim(),
    authority: (text: string) => `
[TITLE: Industry Secret Revealed]

[HOOK]
"Here's what big companies don't want you to know..."

[CONTENT]
${text}

[CTA]
"Drop a comment if you agree!"

#shorts #business #insider
`.trim(),
    storytelling: (text: string) => `
[TITLE: You Won't Believe What Happened]

[SETUP]
${text}

[REACTION/TWIST]

[CALL TO ACTION]
"What would you do in this situation?"

#shorts #story #relatable
`.trim(),
    entertaining: (text: string) => `
[TITLE: POV: Your Day Just Got Better]

${text}

[END SCREEN: Subscribe!]

#shorts #funny #viral
`.trim(),
  };

  const format = formats[style] || formats.educational;
  if (!format) throw new Error('No format template found');
  return format(excerpt);
}

/**
 * Generate variants for Twitter Thread
 */
async function generateTwitterThreadVariant(content: string, style: string): Promise<string> {
  // Twitter: 280 chars per tweet, thread format
  const sentences = content.split('.').filter((s) => s.trim().length > 0);
  const tweets: string[] = [];

  let currentTweet = '';
  for (const sentence of sentences) {
    const cleanSentence = sentence.trim() + '.';
    if ((currentTweet + cleanSentence).length <= 270) {
      currentTweet += ' ' + cleanSentence;
    } else {
      if (currentTweet) tweets.push(currentTweet.trim());
      currentTweet = cleanSentence;
    }
  }
  if (currentTweet) tweets.push(currentTweet.trim());

  const prefixes: Record<string, string> = {
    educational: `🧵 A thread about something you need to know:\n\n`,
    authority: `💡 Hot take incoming:\n\n`,
    storytelling: `📖 A story I need to share:\n\n`,
    entertaining: `😂 Wait for the punchline:\n\n`,
  };

  const prefix = prefixes[style] || prefixes.educational;
  return prefix + tweets.map((tweet, i) => `${i + 1}/ ${tweet}`).join('\n\n') + '\n\n/fin';
}

/**
 * Generate variants for LinkedIn
 */
async function generateLinkedInVariant(content: string, style: string): Promise<string> {
  // LinkedIn: Professional, long-form, value-focused
  const maxLength = 1300;
  const text = content.substring(0, maxLength);

  const templates: Record<string, (text: string) => string> = {
    educational: (text: string) => `
Here's a lesson I learned the hard way:

${text}

Key takeaway: Focus on continuous learning and growth.

What's your experience with this? Share in the comments below 👇

#learning #growthmindset #professional
`.trim(),
    authority: (text: string) => `
After 10+ years in this industry, here's what I know for sure:

${text}

This is non-negotiable.

Would love to hear your perspective on this in the comments!

#leadership #industry #expertise
`.trim(),
    storytelling: (text: string) => `
This changed my career trajectory. Here's why:

${text}

Sometimes the best lessons come from unexpected places.

Have a similar story? Let's connect!

#careergrowth #success #experience
`.trim(),
    entertaining: (text: string) => `
They said it wasn't possible, but here's what happened:

${text}

Never underestimate the power of persistence.

Tag someone who should read this 👇

#motivation #success #mindset
`.trim(),
  };

  const template = templates[style] || templates.educational;
  if (!template) throw new Error('No template found');
  return template(text);
}

/**
 * Generate variants for blog excerpt
 */
async function generateBlogExcerptVariant(content: string, style: string): Promise<string> {
  // Blog: 500-2000 word articles, SEO-optimized
  const maxLength = 2000;
  const text = content.substring(0, maxLength);

  const structures: Record<string, (text: string) => string> = {
    educational: (text: string) => `
# What You Need to Know About This Topic

## Introduction
In today's world, understanding this concept is more important than ever.

## The Main Idea
${text}

## Key Takeaways
- Focus on the fundamentals
- Practice consistently
- Stay updated with trends

## Conclusion
This knowledge will serve you well in your journey.

## Next Steps
1. Apply this immediately
2. Share with your network
3. Continue learning

#blog #education #guide
`.trim(),
    authority: (text: string) => `
# The Complete Guide: Inside Expert Insights

## Overview
As someone deeply involved in this space, I want to share what really works.

## What The Industry Gets Wrong
${text}

## The Right Approach
- Research-backed
- Proven results
- Scalable strategy

## Real-World Examples
[Case studies and examples]

## Conclusion
Don't fall for the myths. Stick to what actually works.

#businessblog #expertise #insights
`.trim(),
    storytelling: (text: string) => `
# How I Went From Zero to Success

## The Beginning
It all started when...

## The Challenge
${text}

## The Turning Point
That's when everything changed.

## The Result
[Outcomes and metrics]

## Lessons Learned
- Lesson 1
- Lesson 2
- Lesson 3

## Your Journey
Ready to start yours?

#successtory #blog #inspiration
`.trim(),
    entertaining: (text: string) => `
# The Crazy Story Behind This Discovery

## Hook
You won't believe what happened...

## The Plot
${text}

## The Twist
And then something unexpected occurred...

## Why It Matters
Here's the real story:

## The Moral
Sometimes the best discoveries come from the most unexpected places.

## Share Your Story
Have a wild story too? Comment below!

#storytelling #blog #entertainment
`.trim(),
  };

  const structure = structures[style] || structures.educational;
  if (!structure) throw new Error('No structure template found');
  return structure(text);
}

/**
 * Generate all content variants
 */
async function generateVariants(
  content: string,
  targetFormats: string[],
  style: string = 'educational'
): Promise<Record<string, string>> {
  const variants: Record<string, string> = {};

  try {
    for (const format of targetFormats) {
      logger.info('Generating variant', { format, style });

      switch (format) {
        case 'instagram-reel':
          variants[format] = await generateInstagramReelVariant(content, style);
          break;
        case 'tiktok':
          variants[format] = await generateTikTokVariant(content, style);
          break;
        case 'youtube-short':
          variants[format] = await generateYouTubeShortVariant(content, style);
          break;
        case 'twitter-thread':
          variants[format] = await generateTwitterThreadVariant(content, style);
          break;
        case 'linkedin':
          variants[format] = await generateLinkedInVariant(content, style);
          break;
        case 'blog-excerpt':
          variants[format] = await generateBlogExcerptVariant(content, style);
          break;
        default:
          logger.warn('Unknown format', { format });
      }
    }

    return variants;
  } catch (error) {
    logger.error('Variant generation failed', {
      error: error instanceof Error ? error.message : String(error),
      targetFormats,
    });
    throw error;
  }
}

/**
 * Process repurposing job
 */
async function processRepurposing(job: Job<RepurposingJob>) {
  const { contentId, businessId, originContent, targetFormats, style = 'educational', tone } = job.data;

  try {
    logger.info('Processing content repurposing', {
      jobId: job.id,
      contentId,
      businessId,
      formatCount: targetFormats.length,
      style,
    });

    // Generate variants
    const variants = await generateVariants(originContent, targetFormats, style);

    // Store all variants
    const storagePaths: Record<string, string> = {};
    for (const [format, variantContent] of Object.entries(variants)) {
      const fileName = `repurposing/${contentId}/${format}-${Date.now()}.txt`;
      await storageService.uploadFile('ASSETS', fileName, variantContent, {
        contentType: 'text/plain',
        metadata: {
          contentId,
          format,
          style,
          tone,
          createdAt: new Date(),
        },
      });
      storagePaths[format] = fileName;
    }

    logger.info('Content repurposing completed', {
      jobId: job.id,
      contentId,
      variantCount: Object.keys(variants).length,
    });

    // Trigger distribution for all variants
    const distributionJob: DistributionJob = {
      reelId: contentId,
      reelVariantId: `${contentId}-${Date.now()}`,
      businessId,
      platforms: targetFormats.map((f) => {
        switch (f) {
          case 'instagram-reel':
            return 'instagram';
          case 'tiktok':
            return 'tiktok';
          case 'youtube-short':
            return 'youtube';
          case 'twitter-thread':
            return 'twitter';
          case 'linkedin':
            return 'linkedin';
          default:
            return 'instagram';
        }
      }),
    };

    await enqueueDistribution(distributionJob);

    return {
      success: true,
      variantCount: Object.keys(variants).length,
      storagePaths,
    };
  } catch (error) {
    logger.error('Repurposing job failed', {
      jobId: job.id,
      contentId,
      error: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

/**
 * Start repurposing worker
 */
export async function startRepurposingWorker() {
  // Use the shared Redis client singleton
  createRedisClient();

  const worker = new Worker<RepurposingJob>(
    'repurposing',
    async (job) => {
      return await processRepurposing(job);
    },
    {
      connection: getRedisClient(),
      concurrency: 5,
      maxStalledCount: 2,
      stalledInterval: 5000,
      lockDuration: 30000,
    }
  );

  // Handle worker events
  worker.on('completed', (job) => {
    logger.info('Repurposing job completed', {
      jobId: job.id,
      contentId: job.data.contentId,
    });
  });

  worker.on('failed', (job, err) => {
    logger.error('Repurposing job failed', {
      jobId: job?.id,
      contentId: job?.data.contentId,
      error: err.message,
      attempt: job?.attemptsMade,
      maxAttempts: job?.opts.attempts,
    });
  });

  worker.on('error', (err) => {
    logger.error('Repurposing worker error', {
      error: err.message,
    });
  });

  logger.info('Repurposing worker started', { concurrency: 5 });

  return worker;
}

// Start worker if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startRepurposingWorker().catch((err) => {
    logger.error('Failed to start repurposing worker', {
      error: err.message,
    });
    process.exit(1);
  });
}

export { startRepurposingWorker as default };
