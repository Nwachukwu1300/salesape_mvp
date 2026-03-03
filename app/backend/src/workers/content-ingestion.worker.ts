/**
 * Content Ingestion Worker
 * 
 * Processes incoming content from external sources:
 * - Extracts text and metadata from URLs
 * - Detects content type (article, video, etc)
 * - Stores extracted content
 * - Triggers repurposing pipeline
 */

import { Worker, Job } from 'bullmq';
import { enqueueRepurposing } from '../queues/index.js';
import type { ContentIngestionJob } from '../queues/index.js';
import { getRedisClient, createRedisClient } from '../utils/redis-client.js';
import { createContextLogger } from '../utils/logger.js';
import { storageService } from '../services/storage.service.js';

const logger = createContextLogger('content-ingestion');

/**
 * Extract content from various sources
 */
async function extractFromUrl(url: string, contentType: string): Promise<{ text: string; metadata: any }> {
  try {
    logger.info(`Extracting content from ${url}`, { contentType, url });

    // Set up timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SalesApe Content Ingestion Bot/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      throw new Error('Content too large (>10MB)');
    }

    const content = await response.text();
    let text = '';
    let metadata: any = {};

    // Handle different content types
    switch (contentType) {
      case 'article':
      case 'blog':
        // Extract text from HTML article
        text = extractTextFromHtml(content);
        metadata = extractMetadataFromHtml(content);
        break;

      case 'website':
        // Extract main content from website
        text = extractMainContent(content);
        metadata = extractMetadataFromHtml(content);
        break;

      case 'social-post':
        // For social posts, text is typically the content itself
        text = extractTextFromHtml(content);
        metadata = {
          platform: detectPlatform(url),
          url,
        };
        break;

      default:
        text = content.substring(0, 5000); // Max 5000 chars
    }

    logger.info('Content extraction successful', {
      url,
      textLength: text.length,
      hasMetadata: !!metadata.title,
    });

    return { text, metadata };
  } catch (error) {
    logger.error('Content extraction failed', {
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Extract text from HTML
 */
function extractTextFromHtml(html: string): string {
  // Remove script and style tags
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text.substring(0, 10000); // Max 10k chars
}

/**
 * Extract metadata from HTML
 */
function extractMetadataFromHtml(html: string): any {
  const metadata: any = {};

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    metadata.title = titleMatch[1].trim();
  }

  // Extract meta description
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  if (descMatch && descMatch[1]) {
    metadata.description = descMatch[1];
  }

  // Extract author
  const authorMatch = html.match(/<meta\s+name="author"\s+content="([^"]+)"/i);
  if (authorMatch && authorMatch[1]) {
    metadata.author = authorMatch[1];
  }

  // Extract publish date
  const dateMatch = html.match(/<meta\s+(?:name="publish-date"|property="article:published_time")\s+content="([^"]+)"/i);
  if (dateMatch?.[1]) {
    const dateStr = dateMatch[1].trim();
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      metadata.publishDate = date;
    }
  }

  // Extract image
  const imageMatch = html.match(/<meta\s+(?:property="og:image"|name="image")\s+content="([^"]+)"/i);
  if (imageMatch && imageMatch[1]) {
    metadata.thumbnail = imageMatch[1];
  }

  return metadata;
}

/**
 * Extract main content from website (basic implementation)
 */
function extractMainContent(html: string): string {
  // Remove common non-content elements
  let content = html.replace(/<(script|style|nav|footer|header|aside)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');

  // Try to find main content sections
  const mainMatch = content.match(/<main[^>]*>[\s\S]*?<\/main>/i) ||
    content.match(/<article[^>]*>[\s\S]*?<\/article>/i) ||
    content.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>[\s\S]*?<\/div>/i);

  if (mainMatch) {
    content = mainMatch[0];
  }

  return extractTextFromHtml(content);
}

/**
 * Detect platform from URL
 */
function detectPlatform(url: string): string {
  if (url.includes('linkedin.com')) return 'linkedin';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('youtube.com')) return 'youtube';
  if (url.includes('facebook.com')) return 'facebook';
  return 'website';
}

/**
 * Process content ingestion job
 */
async function processContentIngestion(job: Job<ContentIngestionJob>) {
  const { projectId, businessId, sourceUrl, contentType, metadata: inputMetadata } = job.data;

  try {
    logger.info('Processing content ingestion', {
      jobId: job.id,
      projectId,
      businessId,
      contentType,
      sourceUrl,
    });

    // Extract content
    const { text, metadata } = await extractFromUrl(sourceUrl, contentType);

    // Merge metadata
    const finalMetadata = {
      ...inputMetadata,
      ...metadata,
      sourceUrl,
      contentType,
      ingestedAt: new Date(),
    };

    // Store extracted content as text file
    const fileName = `ingestion/${projectId}/${Date.now()}-extracted.txt`;
    const BucketName = 'ASSETS' as const;
    await storageService.uploadFile(BucketName, fileName, text, {
      contentType: 'text/plain',
      metadata: finalMetadata,
    });

    logger.info('Content ingestion completed', {
      jobId: job.id,
      fileName,
      textLength: text.length,
    });

    // Trigger repurposing for the ingested content
    await enqueueRepurposing({
      contentId: projectId,
      businessId,
      originContent: text,
      targetFormats: ['instagram-reel', 'tiktok', 'youtube-short'],
      style: 'educational',
    });

    return {
      success: true,
      contentLength: text.length,
      storagePath: fileName,
      metadata: finalMetadata,
    };
  } catch (error) {
    logger.error('Content ingestion failed', {
      jobId: job.id,
      projectId,
      error: error instanceof Error ? error.message : String(error),
    });

    // Re-throw for BullMQ to handle retry
    throw error;
  }
}

/**
 * Start content ingestion worker
 */
export async function startContentIngestionWorker() {
  // Use the shared Redis client singleton
  createRedisClient();

  const worker = new Worker<ContentIngestionJob>(
    'content-ingestion',
    async (job) => {
      return await processContentIngestion(job);
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
    logger.info('Content ingestion job completed', {
      jobId: job.id,
      projectId: job.data.projectId,
    });
  });

  worker.on('failed', (job, err) => {
    logger.error('Content ingestion job failed', {
      jobId: job?.id,
      projectId: job?.data.projectId,
      error: err.message,
      attempt: job?.attemptsMade,
      maxAttempts: job?.opts.attempts,
    });
  });

  worker.on('error', (err) => {
    logger.error('Content ingestion worker error', {
      error: err.message,
    });
  });

  logger.info('Content ingestion worker started', { concurrency: 5 });

  return worker;
}

// Start worker if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startContentIngestionWorker().catch((err) => {
    logger.error('Failed to start content ingestion worker', {
      error: err.message,
    });
    process.exit(1);
  });
}

export { startContentIngestionWorker as default };
