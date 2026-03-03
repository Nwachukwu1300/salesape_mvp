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

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Worker } from 'bullmq';
import { enqueueDistribution } from '../queues/index.js';
import type { RepurposingJob, DistributionJob } from '../queues/index.js';
import { getRedisClient, createRedisClient } from '../utils/redis-client.js';
import { createContextLogger } from '../utils/logger.js';
import { storageService } from '../services/storage.service.js';
import { createRepurposedContent } from '../services/repurposed-content.service.js';
import { getContentInput, updateContentInputStatus } from '../services/content-input.service.js';
import { repurposeContentWithAI } from '../utils/ai-repurposing.js';
import { processVideo } from '../services/video-processor.service.js';
import { renderShortFormVideo } from '../services/short-form-renderer.service.js';
import { transformTranscriptToReels } from '../utils/content-repurposer.js';
import { getTrendHooks } from '../utils/trend-hooks.js';
import {
  calculateClarity,
  calculateHookStrength,
  calculateNovelty,
  calculatePacing,
  calculatePlatformFit,
  calculateWeightedScore,
} from '../utils/content-scoring.js';
import { getScoreWeightsForPlatform } from '../services/performance-feedback.service.js';
import { getQueueProvider } from '../queues/provider.js';
import { startRepurposingPgBossWorker } from '../queues/pgboss.js';

const logger = createContextLogger('repurposing');

type CutTimestamp = {
  start: number;
  end: number;
  duration: number;
};

const VIDEO_PLATFORMS = new Set(['instagram', 'tiktok', 'youtube', 'linkedin']);

function isVideoPlatform(platform: string): platform is 'instagram' | 'tiktok' | 'youtube' | 'linkedin' {
  return VIDEO_PLATFORMS.has(platform);
}

function extractKeyMomentsFromTranscript(transcript: string): string[] {
  if (!transcript) return [];
  const sentences = transcript
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);
  return sentences.slice(0, 6);
}

function buildShotList(keyMoments: string[]): string[] {
  if (keyMoments.length === 0) {
    return ['Opening hook shot', 'Main message delivery', 'CTA close'];
  }
  return keyMoments.map((moment, index) => `Shot ${index + 1}: ${moment}`);
}

function buildBRollGuide(keyMoments: string[]): string[] {
  if (keyMoments.length === 0) {
    return ['B-roll: behind the scenes', 'B-roll: product close-up', 'B-roll: customer reaction'];
  }
  return keyMoments.map((moment) => `B-roll: Visuals that illustrate "${moment}"`);
}

function buildOnScreenText(keyMoments: string[]): string[] {
  if (keyMoments.length === 0) {
    return ['Key takeaway', 'Quick win', 'Call to action'];
  }
  return keyMoments.map((moment) => moment.slice(0, 60));
}

function buildCutTimestamps(videoDuration: number, clipDuration: number, count: number): CutTimestamp[] {
  const safeDuration = Math.max(clipDuration, 5);
  const maxStart = Math.max(videoDuration - safeDuration, 0);
  const step = count > 1 ? maxStart / (count - 1) : 0;
  const cuts: CutTimestamp[] = [];

  for (let i = 0; i < count; i += 1) {
    const start = Math.min(Math.round(step * i), Math.max(videoDuration - safeDuration, 0));
    const end = Math.min(start + safeDuration, videoDuration);
    cuts.push({ start, end, duration: Math.max(end - start, 1) });
  }

  return cuts;
}

async function downloadUrlToTemp(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download video from URL: ${url}`);
  }

  const fileName = `video-${Date.now()}.mp4`;
  const filePath = path.join(os.tmpdir(), fileName);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return filePath;
}

async function resolveVideoSourcePath(contentInput: any): Promise<string | null> {
  if (!contentInput) return null;
  if (contentInput.storagePath) {
    try {
      const buffer = await storageService.downloadFile('VIDEOS', contentInput.storagePath);
      const filePath = path.join(os.tmpdir(), `content-input-${contentInput.id}-${Date.now()}.mp4`);
      fs.writeFileSync(filePath, buffer);
      return filePath;
    } catch (err) {
      logger.warn('Failed to download video from storage', {
        contentInputId: contentInput.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const urlCandidate = contentInput.url || contentInput.content;
  if (urlCandidate && /^https?:\/\//i.test(urlCandidate)) {
    return await downloadUrlToTemp(urlCandidate);
  }

  return null;
}

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
  if (typeof script !== 'function') throw new Error('No script template found');
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
  if (typeof template !== 'function') throw new Error('No template found');
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
  if (typeof format !== 'function') throw new Error('No format template found');
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
async function processRepurposingData(jobData: RepurposingJob, jobId?: string) {
  const {
    contentId,
    businessId,
    originContent,
    targetFormats = [],
    style = 'educational',
    tone,
    contentInputId,
    platforms = [],
    businessName,
    businessContext,
  } = jobData;

  try {
    // Async Content Studio flow: generate DB-backed repurposed items from a content input.
    if (contentInputId && platforms.length > 0) {
      let sourceText = originContent || '';
      const contentInput = await getContentInput(contentInputId);
      sourceText = sourceText || contentInput?.content || contentInput?.url || '';

      if (!contentInput) {
        throw new Error('Content input not found for repurposing');
      }

      if (contentInput.type === 'video') {
        const created = [];
        const videoSourcePath = await resolveVideoSourcePath(contentInput);
        const metadata = typeof contentInput.metadata === 'string'
          ? { businessCategory: 'business' }
          : (contentInput.metadata || {});
        const businessCategory = metadata?.businessCategory || 'business';

        let transcript = sourceText;
        let videoDuration = 60;
        let summary = '';
        let keyMoments: string[] = [];

        if (videoSourcePath) {
          try {
            const videoInfo = await processVideo(videoSourcePath);
            transcript = videoInfo.transcript || transcript;
            videoDuration = videoInfo.metadata?.duration || videoDuration;
            summary = videoInfo.summary || '';
            keyMoments = extractKeyMomentsFromTranscript(videoInfo.transcript || '');
          } catch (err) {
            logger.warn('Video processing failed, falling back to transcript only', {
              contentInputId,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }

        if (!transcript) {
          transcript = 'Transcript unavailable for this video.';
        }

        const reelCandidates = await transformTranscriptToReels(transcript, businessCategory);
        const clipDurations: Record<string, number> = {
          instagram: 45,
          tiktok: 30,
          youtube: 60,
          linkedin: 45,
        };

        const filteredPlatforms = platforms.filter((platform) => isVideoPlatform(platform));
        const expandedTargets = filteredPlatforms.map((platform) => ({
          platform,
          variantIndex: 0,
        }));
        const cuts = buildCutTimestamps(
          videoDuration,
          45,
          Math.max(expandedTargets.length, 1)
        );

        for (let index = 0; index < expandedTargets.length; index += 1) {
          const target = expandedTargets[index];
          if (!target) continue;
          const { platform, variantIndex } = target;
          const platformDuration = clipDurations[platform] ?? 45;
          const base = reelCandidates.find((reel) => reel.platform === platform) || reelCandidates[0];
          const duration = Math.min(platformDuration, videoDuration || platformDuration);
          const hook = base?.hook || 'Watch this';
          const script = base?.script || transcript.slice(0, 200);
          const caption = base?.caption || script;
          const hashtags = base?.hashtags || [];
          const cut = cuts[index] || { start: 0, end: duration, duration };

          let assetPath: string | null = null;
          let assetUrl: string | null = null;
          let renderError: string | null = null;

          if (videoSourcePath) {
            try {
              const rendered = await renderShortFormVideo({
                inputPath: videoSourcePath,
                startSeconds: cut.start,
                durationSeconds: cut.duration,
                platform,
              });
              const buffer = fs.readFileSync(rendered.outputPath);
              const fileName = `repurposing/${contentInputId}/${platform}-${variantIndex + 1}-${Date.now()}.mp4`;
              const upload = await storageService.uploadFile('ASSETS', fileName, buffer, {
                contentType: 'video/mp4',
              });
              assetPath = upload.path;
              assetUrl = upload.publicUrl;
              try {
                fs.unlinkSync(rendered.outputPath);
              } catch {
                // ignore cleanup errors
              }
            } catch (err) {
              renderError = err instanceof Error ? err.message : String(err);
            }
          }

          const trendHooks = getTrendHooks(platform).map((hookItem) => hookItem.hook);
          const weights = await getScoreWeightsForPlatform(businessId, platform);
          const breakdown = {
            hookStrength: calculateHookStrength(hook),
            pacing: calculatePacing(script, duration, platform),
            clarity: calculateClarity(script),
            platformFit: calculatePlatformFit(platform, hook, caption, hashtags),
            novelty: calculateNovelty(script),
          };
          const weightedScore = calculateWeightedScore(breakdown, weights);

          const row: any = {
            businessId,
            contentInputId,
            platform,
            content: script,
            caption,
            hashtags,
            assetUrl,
            assetPath,
            score: weightedScore,
            scoreBreakdown: { ...breakdown, weightedScore },
            trendHooks,
            metadata: {
              summary,
              keyMoments,
              shotList: buildShotList(keyMoments),
              bRollGuide: buildBRollGuide(keyMoments),
              onScreenText: buildOnScreenText(keyMoments),
              cutTimestamps: cut,
              hook,
              duration,
              variantIndex: variantIndex + 1,
              renderError,
            },
            status: 'draft',
          };

          const repurposed = await createRepurposedContent(row);
          created.push(repurposed);
        }

        if (videoSourcePath) {
          try {
            fs.unlinkSync(videoSourcePath);
          } catch {
            // ignore cleanup errors
          }
        }

        await updateContentInputStatus(contentInputId, created.length > 0 ? 'ready' : 'failed');

        return {
          success: created.length > 0,
          mode: 'content-input',
          contentInputId,
          createdCount: created.length,
        };
      }

      if (!sourceText) {
        throw new Error('No source content available for repurposing');
      }

      const created = [];
      for (const platform of platforms) {
        try {
          const platformKey = platform as 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin' | 'facebook';
          const platformContent = await repurposeContentWithAI(
            sourceText,
            platformKey,
            businessName || 'Business',
            businessContext
          );

          const hook = platformContent?.caption
            ? String(platformContent.caption).split('\n')[0] || ''
            : String(platformContent.content || '').slice(0, 80);
          const script = String(platformContent.content || '');
          const caption = platformContent.caption || script;
          const hashtags = platformContent.hashtags || [];
          const trendHooks = getTrendHooks(platformKey).map((hookItem) => hookItem.hook);
          const weights = await getScoreWeightsForPlatform(businessId, platformKey);
          const breakdown = {
            hookStrength: calculateHookStrength(hook),
            pacing: calculatePacing(script, 45, platformKey),
            clarity: calculateClarity(script),
            platformFit: calculatePlatformFit(platformKey, hook, caption, hashtags),
            novelty: calculateNovelty(script),
          };
          const weightedScore = calculateWeightedScore(breakdown, weights);

          const row: any = {
            businessId,
            contentInputId,
            platform,
            content: script,
            caption,
            hashtags,
            score: weightedScore,
            scoreBreakdown: { ...breakdown, weightedScore },
            trendHooks,
            status: 'draft',
          };

          const repurposed = await createRepurposedContent(row);
          created.push(repurposed);
        } catch (err) {
          logger.warn('Failed to repurpose platform in async flow', {
            platform,
            contentInputId,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }

      await updateContentInputStatus(contentInputId, created.length > 0 ? 'ready' : 'failed');

      return {
        success: created.length > 0,
        mode: 'content-input',
        contentInputId,
        createdCount: created.length,
      };
    }

    logger.info('Processing content repurposing', {
      jobId,
      contentId,
      businessId,
      formatCount: targetFormats.length,
      style,
    });

    if (!originContent) {
      throw new Error('originContent is required for legacy repurposing jobs');
    }

    // Generate variants
    const variants = await generateVariants(originContent, targetFormats, style);

    // Store all variants
    const storagePaths: Record<string, string> = {};
    for (const [format, variantContent] of Object.entries(variants)) {
      const fileName = `repurposing/${contentId}/${format}-${Date.now()}.txt`;
      const BucketName = 'ASSETS' as const;
      await storageService.uploadFile(BucketName, fileName, variantContent, {
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
      jobId,
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
    if (contentInputId) {
      try {
        await updateContentInputStatus(contentInputId, 'failed');
      } catch (updateErr) {
        logger.warn('Failed to mark content input as failed', {
          contentInputId,
          error: updateErr instanceof Error ? updateErr.message : String(updateErr),
        });
      }
    }

    logger.error('Repurposing job failed', {
      jobId,
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
  const provider = getQueueProvider();

  if (provider === 'pgboss') {
    const worker = await startRepurposingPgBossWorker(async (jobData, jobId) => {
      await processRepurposingData(jobData, jobId);
    });
    logger.info('Repurposing worker started', { provider: 'pgboss' });
    return worker as any;
  }

  // Use the shared Redis client singleton
  createRedisClient();

  const worker = new Worker<RepurposingJob>(
    'repurposing',
    async (job) => {
      return await processRepurposingData(job.data, String(job.id));
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

  logger.info('Repurposing worker started', { concurrency: 5, provider: 'bullmq' });

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
