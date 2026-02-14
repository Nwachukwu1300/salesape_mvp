/**
 * Website Generation Worker
 * Processes website generation jobs asynchronously
 */

import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  QUEUE_NAME,
  connection,
} from '../queues/website.queue.js';
import type {
  WebsiteGenerationJobData,
  WebsiteGenerationJobResult,
  GenerationStep,
} from '../queues/website.queue.js';
import { selectTemplate } from '../templates/template-selector.js';
import { generateWebsiteConfig } from '../website-config/generateWebsiteConfig.js';
import { enrichImages, extractImagesFromHtml } from '../images/image-enrichment.service.js';

const prisma = new PrismaClient();

// Step progress percentages
const STEP_PROGRESS: Record<GenerationStep, number> = {
  queued: 0,
  scraping: 10,
  analyzing: 30,
  selecting_template: 50,
  generating_config: 70,
  enriching_images: 90,
  completed: 100,
  failed: 0,
};

/**
 * Update business generation status in database
 */
async function updateGenerationStatus(
  businessId: string,
  status: string,
  step?: string
): Promise<void> {
  try {
    await prisma.business.update({
      where: { id: businessId },
      data: {
        generationStatus: status,
        generationStep: step || null,
      },
    });
  } catch (error) {
    console.error('Failed to update generation status:', error);
  }
}

/**
 * Secure website scraping with protections
 */
async function secureScrapWebsite(url: string): Promise<{
  title?: string;
  description?: string;
  email?: string;
  phone?: string;
  images?: string[];
  headings?: string[];
  error?: string;
}> {
  try {
    // Validate URL
    const urlObj = new URL(url);

    // Block private IPs
    const hostname = urlObj.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.2') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.')
    ) {
      return { error: 'Invalid URL: private IP addresses not allowed' };
    }

    // Fetch with timeout and size limit
    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
      maxContentLength: 5 * 1024 * 1024, // 5MB max
      headers: {
        'User-Agent': 'SalesAPE-Bot/1.0 (Website Analysis)',
        Accept: 'text/html',
      },
      responseType: 'text',
    });

    const html = response.data;

    // Limit HTML size
    if (typeof html !== 'string' || html.length > 5 * 1024 * 1024) {
      return { error: 'Response too large' };
    }

    const $ = cheerio.load(html);

    // Strip all script tags for security
    $('script').remove();
    $('noscript').remove();
    $('style').remove();

    const title = $('title').text().trim() || $('h1').first().text().trim() || '';
    const description =
      $('meta[name="description"]').attr('content')?.trim() ||
      $('meta[property="og:description"]').attr('content')?.trim() ||
      $('p').first().text().trim().substring(0, 300) ||
      '';

    const text = $.root().text();

    // Extract contact info with improved regex
    const emailMatch = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
    const phoneMatch = text.match(/\+?\d[\d\s().-]{7,}\d/);

    // Extract images
    const images = extractImagesFromHtml(html, url);

    // Extract headings
    const headings: string[] = [];
    $('h1, h2, h3').each((_i, el) => {
      const text = $(el).text().trim();
      if (text && text.length < 200 && headings.length < 5) {
        headings.push(text);
      }
    });

    return {
      title: title.substring(0, 200),
      description: description.substring(0, 500),
      email: emailMatch ? emailMatch[0] : undefined,
      phone: phoneMatch ? phoneMatch[0] : undefined,
      images: images.slice(0, 10),
      headings,
    };
  } catch (error: any) {
    console.error('Scraping error:', error.message);
    return { error: error.message || 'Failed to scrape website' };
  }
}

/**
 * Process a website generation job
 */
async function processWebsiteGeneration(
  job: Job<WebsiteGenerationJobData, WebsiteGenerationJobResult>
): Promise<WebsiteGenerationJobResult> {
  const { businessId, businessUnderstanding, sourceUrl } = job.data;

  try {
    // Step 1: Scraping
    await job.updateProgress(STEP_PROGRESS.scraping);
    await updateGenerationStatus(businessId, 'processing', 'scraping');

    let scrapedData: any = {};
    if (sourceUrl) {
      scrapedData = await secureScrapWebsite(sourceUrl);
      if (scrapedData.error) {
        console.warn('Scraping warning:', scrapedData.error);
      }
    }

    // Step 2: Analyzing
    await job.updateProgress(STEP_PROGRESS.analyzing);
    await updateGenerationStatus(businessId, 'processing', 'analyzing');

    // Analysis is already done via businessUnderstanding
    // Just validate the data is complete
    const analysis = {
      ...businessUnderstanding,
      scrapedData,
    };

    // Step 3: Template Selection
    await job.updateProgress(STEP_PROGRESS.selecting_template);
    await updateGenerationStatus(businessId, 'processing', 'selecting_template');

    const templateResult = selectTemplate(
      businessUnderstanding.category,
      businessUnderstanding.brandTone,
      businessUnderstanding.services,
      scrapedData.images && scrapedData.images.length > 0
    );

    const templateId = templateResult.template.id;

    // Step 4: Config Generation
    await job.updateProgress(STEP_PROGRESS.generating_config);
    await updateGenerationStatus(businessId, 'processing', 'generating_config');

    const websiteConfig = await generateWebsiteConfig({
      businessUnderstanding: {
        ...businessUnderstanding,
        imageAssets: undefined, // Will be enriched next
      },
      templateId,
      scrapedData: {
        email: scrapedData.email,
        phone: scrapedData.phone,
        images: scrapedData.images,
        title: scrapedData.title,
        description: scrapedData.description,
      },
    });

    // Step 5: Image Enrichment
    await job.updateProgress(STEP_PROGRESS.enriching_images);
    await updateGenerationStatus(businessId, 'processing', 'enriching_images');

    const imageResult = await enrichImages({
      scrapedImages: scrapedData.images,
      category: businessUnderstanding.category,
      seoKeywords: businessUnderstanding.seoKeywords,
      businessName: businessUnderstanding.name,
    });

    // Update website config with enriched images
    websiteConfig.hero.heroImage = imageResult.assets.hero;
    websiteConfig.about.image = imageResult.assets.gallery[0];

    // Step 6: Save to database
    await prisma.business.update({
      where: { id: businessId },
      data: {
        templateId,
        websiteConfig: websiteConfig as any,
        imageAssets: imageResult.assets as any,
        generationStatus: 'completed',
        generationStep: null,
        analysis: {
          ...((await prisma.business.findUnique({ where: { id: businessId } }))?.analysis as any || {}),
          templateSelection: {
            templateId,
            confidence: templateResult.confidence,
            reason: templateResult.reason,
          },
          scrapedData,
          imageEnrichment: {
            source: imageResult.source,
            count: imageResult.count,
          },
        },
      },
    });

    await job.updateProgress(STEP_PROGRESS.completed);

    return {
      success: true,
      businessId,
      templateId,
    };
  } catch (error: any) {
    console.error('Website generation error:', error);

    await updateGenerationStatus(businessId, 'failed', error.message);

    return {
      success: false,
      businessId,
      error: error.message || 'Website generation failed',
    };
  }
}

// Worker instance
let worker: Worker<WebsiteGenerationJobData, WebsiteGenerationJobResult> | null = null;

/**
 * Start the website generation worker
 */
export function startWorker(): Worker<WebsiteGenerationJobData, WebsiteGenerationJobResult> {
  if (worker) {
    return worker;
  }

  worker = new Worker(QUEUE_NAME, processWebsiteGeneration, {
    connection,
    concurrency: 2, // Process 2 jobs at a time
  });

  worker.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed:`, result);
  });

  worker.on('failed', (job, error) => {
    console.error(`Job ${job?.id} failed:`, error);
  });

  worker.on('error', (error) => {
    console.error('Worker error:', error);
  });

  console.log('Website generation worker started');

  return worker;
}

/**
 * Stop the worker
 */
export async function stopWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
    console.log('Website generation worker stopped');
  }
}

export { worker };
