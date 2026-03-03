// @ts-nocheck
import dotenv from 'dotenv';
// Load environment variables immediately, before any other imports
// Priority: .env.local (overrides) → .env
dotenv.config({ path: '.env.local' });
dotenv.config(); // Load .env if .env.local doesn't exist

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';
import { google } from 'googleapis';
import crypto from 'crypto';
// Sentry removed: monitoring disabled in codebase

// Website Generation Engine imports
import { selectTemplate, getAllTemplates, getTemplateById } from './templates/index.js';
import { generateWebsiteConfig } from './website-config/index.js';
import type { WebsiteConfig } from './website-config/index.js';
import { enrichImages, enrichImagesSync } from './images/index.js';
import {
  enqueueWebsiteGeneration,
  getJobStatus,
} from './queues/website.queue.js';
import type { WebsiteGenerationJobData } from './queues/website.queue.js';
import authRouter from './routes/auth.js';
import apeChatRouter from './routes/apeChat.js';
import settingsRouter from './routes/settings.js';
import supabaseServer from './lib/supabase.server.js';

// Import Phase 2B services
import {
  createWebsiteVersion,
  getWebsiteVersion,
  getBusinessVersions,
  getLatestPublishedVersion,
  updateWebsiteVersion,
  publishWebsiteVersion,
  deleteWebsiteVersion,
  getVersionCount,
} from './services/website-version.service.js';

// Import Phase 3 services
import {
  createContentInput,
  getContentInput,
  getBusinessContentInputs,
  updateContentInput,
  deleteContentInput,
} from './services/content-input.service.js';
import { storageService } from './services/storage.service.js';
import {
  getRepurposedContent,
  getRepurposedContentByInput,
  updateRepurposedContent,
  deleteRepurposedContent,
  getBusinessRepurposedContent,
} from './services/repurposed-content.service.js';
import {
  createPlatformDistribution,
  getPlatformDistribution,
  getDistributionsForContent,
  updatePlatformDistribution,
  deleteDistribution,
  getBusinessDistributions,
} from './services/platform-distribution.service.js';

// Import unified publisher orchestrator
import {
  publishToAllPlatforms,
  validateContentForPlatform,
} from './publishers/unified-publisher.js';

// Import new utilities and middleware
import { logger, requestLogger } from './utils/logger.js';
import { encryptData, decryptData, isEncrypted, getDecryptedValue } from './utils/encryption.js';
import { generateBusinessIntelligence, generateStructuredBusinessUnderstanding, generateSEOKeywords, calculateLeadScore } from './utils/ai-intelligence.js';
import OpenAIClient from './utils/openai-client.js';

// Import Phase 4 services
import {
  getDashboardMetrics,
  getPlatformMetrics,
  getTrendData,
  getComparison,
  getRevenueAttribution,
} from './services/analytics-dashboard.service.js';
import {
  scheduleContent,
  getScheduledPosts,
  getScheduleCalendar,
  updateSchedule,
  cancelSchedule,
  bulkSchedule,
  getUpcomingSchedules,
  getSchedulingStats,
} from './services/scheduling.service.js';
import {
  checkIfApprovalRequired,
  submitForApproval,
  approveContent,
  rejectContent,
  getApprovalQueue,
  getApprovalHistory,
  getApprovalStats,
  bulkApprove,
  autoPublishApproved,
} from './services/approval-workflow.service.js';
import {
  getUserPermissions,
  hasPermission,
  requirePermission,
  getTeamMembers,
  updateMemberRole,
  removeMember,
  getRoleDescriptions,
  validateRoleChange,
  getPermissionsMatrix,
} from './services/team-permissions.service.js';
import { 
  scrapeInstagramProfile, 
  extractContactFromBio, 
  instagramProfileToBusinessData,
  generateInstagramCaption 
} from './utils/instagram-scraper.js';
import { 
  validateBusinessUnderstanding as validateBUStructure,
  validateBusinessUnderstandingResponse,
} from './utils/business-validation.js';
import {
  validateAIResponse,
  extractJSONFromResponse,
} from './utils/conversation-schema.js';
import type { ConversationMessage } from './utils/conversation-schema.js';
import { getStockImagesForCategory } from './utils/unsplash.js';
import {
  getCurrentStage,
  generateNextQuestion,
  extractDataFromMessage,
  isStageDataValid,
  generateSummaryMessage,
} from './utils/conversation-flow.js';

// A+ Upgrade: New Security & Content Utilities
import { 
  sanitizeHTML, 
  sanitizeText, 
  sanitizeJSON,
  sanitizeWebsiteConfig,
  sanitizeLead,
  sanitizeTestimonial
} from './utils/sanitizer.js';
import {
  validateConversationInput,
  validateStructuredData,
  sanitizeConversationMessage,
  validateAIOutput
} from './utils/prompt-guard.js';
import {
  scoreLead,
  calculateLeadPriority
} from './utils/lead-scorer.js';
import {
  injectSchemaIntoConfig,
  detectSchemaType
} from './utils/schema-generator.js';
import {
  repurposeContent,
  calculatePrePublishScore
} from './utils/content-repurposer.js';
import {
  enqueueLeadAutomation,
  enqueueContentGeneration,
  enqueueRepurposing,
  enqueueSocialPosting,
  enqueueReviewRequest,
  getQueueStats,
  getQueuesHealth
} from './queues/index.js';
import { getQueueProvider } from './queues/provider.js';
import { 
  validationErrorHandler, 
  authValidation, 
  businessValidation,
  leadValidation,
  bookingValidation,
  emailSequenceValidation,
  websiteValidation,
} from './middleware/validation.js';
import {
  globalLimiter,
  authLimiter,
  apiLimiter,
  notificationLimiter,
  publicLimiter,
  publicSeoAuditLimiter,
  conversationLimiter,
} from './middleware/rateLimiter.js';

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const app = express();
const prisma = new PrismaClient();
const isDevelopment = process.env.NODE_ENV !== 'production';

// NOTE: Sentry initialization moved to after routes and before the error handler
// to avoid any accidental startup impact. See utils/sentry.ts for config.

// --- Middleware ---
app.use(cors());
// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: [
        "'self'",
        ...(isDevelopment ? ["http://localhost:*", "ws://localhost:*"] : []),
        "https://api.unsplash.com",
        "https://www.googleapis.com",
      ],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for preview
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
// Limit request body size to 10MB to prevent abuse
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(requestLogger); // Request/response logging
app.use(globalLimiter); // Global rate limiting

// Register auth routes
app.use(authRouter);

// Start website generation worker (if Redis available) — ensure Redis is ready first
async function initWorkers() {
  try {
    const queueProvider = getQueueProvider();
    console.log(`[Startup] Queue provider: ${queueProvider}`);

    // Allow skipping starting any Redis-backed workers in local/dev
    if (process.env.REDIS_SKIP_WORKERS === 'true') {
      console.log('[Startup] REDIS_SKIP_WORKERS=true — skipping worker initialization');
      return;
    }

    if (queueProvider === 'bullmq') {
      // Check Redis health - non-blocking (warn on failure but continue)
      // Allow skipping the readiness check in local/dev by setting REDIS_SKIP_READY=true
      const skipRedisReady = process.env.REDIS_SKIP_READY === 'true';
      if (skipRedisReady) {
        console.log('[Startup] REDIS_SKIP_READY=true — skipping Redis readiness check');
      } else if (process.env.REDIS_HOST || process.env.NODE_ENV === 'development') {
        try {
          const { ensureRedisReady } = await import('./utils/redis-health.js');
          await ensureRedisReady({ retries: 3, timeoutMs: 3000 });
          console.log('[Startup] Redis is ready for workers');
        } catch (err) {
          console.warn('[Startup] Redis readiness check failed — workers will not initialize but server will run.', err instanceof Error ? err.message : String(err));
          return; // Exit early if Redis fails - don't try to start workers
        }
      }
    }

    // Ensure Supabase is reachable before starting workers that rely on storage.
    // Keep this optional in non-BullMQ mode to avoid unnecessary local startup delay.
    if (queueProvider === 'bullmq' && process.env.SUPABASE_SKIP_READY !== 'true') {
      try {
        const { ensureSupabaseReady } = await import('./utils/supabase-health.js');
        await ensureSupabaseReady({ retries: 3, timeoutMs: 5000 });
        console.log('[Startup] Supabase is ready');
      } catch (err) {
        console.warn('[Startup] Supabase readiness check failed — proceeding but storage ops may fail.', err instanceof Error ? err.message : String(err));
      }
    } else if (process.env.SUPABASE_SKIP_READY === 'true') {
      console.log('[Startup] SUPABASE_SKIP_READY=true — skipping Supabase readiness check');
    }

    if (queueProvider === 'bullmq') {
      // Initialize BullMQ workers after readiness checks (dynamically import so modules
      // that create Redis connections at import-time are not evaluated until
      // we're ready to start workers).
      {
        const { startWorker } = await import('./workers/website.worker.js');
        await startWorker();
        console.log('[Worker] Website generation worker initialized');
      }

      {
        const { startContentIngestionWorker } = await import('./workers/content-ingestion.worker.js');
        await startContentIngestionWorker();
        console.log('[Worker] Content ingestion worker initialized');
      }

      {
        const { startRepurposingWorker } = await import('./workers/repurposing.worker.js');
        await startRepurposingWorker();
        console.log('[Worker] Repurposing worker initialized');
      }

      {
        const { startDistributionWorker } = await import('./workers/distribution.worker.js');
        await startDistributionWorker();
        console.log('[Worker] Distribution worker initialized');
      }
    } else {
      // In local/dev pg-boss mode, start only repurposing worker pipeline.
      const { startRepurposingWorker } = await import('./workers/repurposing.worker.js');
      await startRepurposingWorker();
      console.log('[Worker] Repurposing worker initialized (pg-boss)');
    }
  } catch (err) {
    console.warn('[Worker] Failed to start workers:', err instanceof Error ? err.message : String(err));
  }
}

// Kick off worker initialization without blocking module evaluation
initWorkers().catch(err => console.warn('[Worker] initWorkers error:', err instanceof Error ? err.message : String(err)));

// --- TypeScript Interfaces ---
interface AuthRequest extends Request {
  userId?: string;
  email?: string;
}

interface TokenPayload {
  userId: string;
  email: string;
}

// --- Authentication Middleware (must be defined before route usage) ---
const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    let userId: string | undefined;
    let email: string | undefined;
    let decodedToken: any;

    // Primary path: validate Supabase JWT signature by asking Supabase auth
    if (supabaseServer) {
      const { data, error } = await supabaseServer.auth.getUser(token);
      if (!error && data?.user?.id) {
        userId = data.user.id;
        email = data.user.email ?? undefined;
      }
    }

    // Dev fallback: decode Supabase JWT without verification when server key is missing
    if (!userId && !supabaseServer && process.env.NODE_ENV !== 'production') {
      decodedToken = jwt.decode(token) as any;
      userId = decodedToken?.sub || decodedToken?.user_id;
      email = decodedToken?.email;
    }

    // Fallback path: verify app-issued JWTs
    if (!userId) {
      decodedToken = jwt.verify(token, JWT_SECRET) as any;
      userId = decodedToken?.sub || decodedToken?.userId;
      email = decodedToken?.email;
    }

    if (!email && userId && process.env.NODE_ENV !== 'production') {
      email =
        decodedToken?.email ||
        decodedToken?.user_metadata?.email ||
        `user-${userId}@local.test`;
    }
    
    if (!userId) {
      return res.status(403).json({ error: 'Invalid token: missing user ID' });
    }
    if (!email) {
      return res.status(403).json({ error: 'Invalid token: missing email' });
    }

    // ensure the user exists in our database; create a lightweight record if not
    let existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      console.warn('[Auth] no DB user for token userId, creating one:', userId);
      existing = await prisma.user.create({
        data: {
          id: userId,
          email,
          password: 'SUPABASE_AUTH',
          name: email.split('@')[0] || 'User',
        },
      });
    }

    req.userId = userId;
    req.email = email;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Failed to parse token' });
  }
};

// Protected API routers
app.use('/api/ape', authenticateToken, apeChatRouter);
app.use('/api/settings', authenticateToken, settingsRouter);

// OpenAI TTS proxy (streaming)
app.post('/api/tts', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const text = String(req.body?.text || '').trim();
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY missing' });
    }

    const voice = String(req.body?.voice || 'nova');
    const model = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';

    const upstream = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        voice,
        input: text,
        response_format: 'mp3',
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      return res.status(upstream.status).json({
        error: 'OpenAI TTS request failed',
        details: errText,
      });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Transfer-Encoding', 'chunked');

    const body = (upstream as any).body;
    if (!body || typeof body.pipe !== 'function') {
      const buffer = await upstream.arrayBuffer();
      return res.status(200).send(Buffer.from(buffer));
    }

    body.pipe(res);
  } catch (err) {
    logger.error('TTS proxy error', { error: String(err) });
    res.status(500).json({ error: 'Failed to generate TTS audio' });
  }
});

// Helper to normalize route params which can be string | string[] | undefined
function paramToString(p: string | string[] | undefined): string | undefined {
  if (Array.isArray(p)) return p[0];
  return p;
}

function sseSend(res: Response, data: string, event?: string) {
  if (event) res.write(`event: ${event}\n`);
  res.write(`data: ${data}\n\n`);
}

function buildConversationQuestionPrompt(params: {
  stage: string;
  requiredQuestion: string;
  extracted: any;
  recentMessages: any[];
}) {
  const { stage, requiredQuestion, extracted, recentMessages } = params;
  return [
    'You are APE, the SalesAPE onboarding assistant.',
    'Ask the user ONLY the next required question, friendly and concise.',
    'Do not ask multiple questions. Do not add bullets or markdown.',
    'Return only the question text.',
    '',
    `Stage: ${stage}`,
    `Required question intent: ${requiredQuestion}`,
    '',
    `Current extracted data: ${JSON.stringify(extracted || {}, null, 2)}`,
    '',
    `Recent conversation: ${JSON.stringify(recentMessages || [], null, 2)}`,
  ].join('\n');
}

function buildConversationSummaryPrompt(extracted: any) {
  return [
    'You are APE, the SalesAPE onboarding assistant.',
    'Generate a plain-text business summary in simple lines.',
    'No markdown, no bullets, no asterisks.',
    'Format exactly as:',
    'Business Profile Summary',
    'Business Name: ...',
    'Category: ...',
    'Location: ...',
    'Services: ...',
    'Value Proposition: ...',
    'SEO Keywords: ...',
    '',
    'End with: Everything looks good. Ready to create your website?',
    '',
    `Business data: ${JSON.stringify(extracted || {}, null, 2)}`,
  ].join('\n');
}

function isAffirmativeConfirmation(input: string): boolean {
  const normalized = String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ');

  const confirmations = new Set([
    'yes',
    'y',
    'yep',
    'yeah',
    'ok',
    'okay',
    'sure',
    'go ahead',
    'goahead',
    'proceed',
    'continue',
    'sounds good',
  ]);
  return confirmations.has(normalized);
}

function normalizeOnboardingExtracted(extractedInput: any): any {
  const extracted = { ...(extractedInput || {}) };
  const name = String(extracted.name || '').trim() || 'My Business';
  const category = String(extracted.category || '').trim() || 'Local Business';
  const location = String(extracted.location || '').trim() || 'Your City';
  const services = Array.isArray(extracted.services)
    ? extracted.services.map((s: any) => String(s).trim()).filter(Boolean)
    : [];
  const valueProposition = String(extracted.valueProposition || '').trim() || 'Reliable service with a focus on quality and customer results.';
  const targetAudience =
    String(extracted.targetAudience || '').trim() ||
    `People looking for ${category.toLowerCase()} in ${location}`;

  const contactPreferences = extracted.contactPreferences || {};
  const normalizedContact = {
    email: Boolean(contactPreferences.email),
    phone: Boolean(contactPreferences.phone),
    booking: Boolean(contactPreferences.booking),
  };
  if (!normalizedContact.email && !normalizedContact.phone && !normalizedContact.booking) {
    normalizedContact.email = true;
  }

  const trustSignals =
    Array.isArray(extracted.trustSignals) && extracted.trustSignals.length > 0
      ? extracted.trustSignals
      : ['Trusted by local customers', 'Fast response times', 'Quality-first service'];

  const seed = [name, category, location, services.join(', '), valueProposition, targetAudience]
    .filter(Boolean)
    .join(' ');
  const seoKeywords =
    Array.isArray(extracted.seoKeywords) && extracted.seoKeywords.length >= 5
      ? extracted.seoKeywords
      : generateSEOKeywords(name, seed);
  const rawSourceUrl = String(extracted.sourceUrl || '').trim();
  let sourceUrl = 'none';
  if (rawSourceUrl) {
    const lowered = rawSourceUrl.toLowerCase();
    if (!['none', 'no', 'n/a', 'na'].includes(lowered)) {
      sourceUrl = /^https?:\/\//i.test(rawSourceUrl) ? rawSourceUrl : `https://${rawSourceUrl}`;
    }
  }

  return {
    ...extracted,
    name,
    category,
    location,
    services: services.length ? services : [category],
    valueProposition,
    targetAudience,
    brandTone: extracted.brandTone || 'friendly',
    brandColors:
      Array.isArray(extracted.brandColors) && extracted.brandColors.length > 0
        ? extracted.brandColors
        : ['#F724DE', '#111827', '#FFFFFF'],
    trustSignals,
    seoKeywords,
    sourceUrl,
    contactPreferences: normalizedContact,
  };
}

async function refineBusinessUnderstandingWithModel(
  extracted: any,
  conversationMessages: any[]
): Promise<any> {
  try {
    if (process.env.NODE_ENV !== 'production') return extracted;
    if (!process.env.OPENAI_API_KEY) return extracted;

    const recentMessages = (conversationMessages || []).slice(-12).map((m: any) => ({
      role: m?.role || 'user',
      content: String(m?.content || ''),
    }));

    const prompt = `
You are improving structured business-understanding JSON for website generation.
Keep the same schema fields, improve quality/clarity, and normalize values:
- brandTone must be one of: professional, friendly, luxury, bold, casual
- brandColors should be valid hex colors when possible (e.g. #1E40AF)
- seoKeywords should be specific, local-intent friendly, and between 5 and 20
- preserve user intent from the conversation

Return ONLY valid JSON for this schema:
{
  "name": string,
  "category": string,
  "location": string,
  "sourceUrl"?: string,
  "services": string[],
  "valueProposition": string,
  "targetAudience": string,
  "brandTone": "professional"|"friendly"|"luxury"|"bold"|"casual",
  "brandColors": string[],
  "trustSignals": string[],
  "seoKeywords": string[],
  "contactPreferences": { "email": boolean, "phone": boolean, "booking": boolean },
  "logoUrl"?: string,
  "imageAssets"?: { "hero"?: string, "gallery"?: string[] }
}

Current extracted JSON:
${JSON.stringify(extracted, null, 2)}

Recent conversation:
${JSON.stringify(recentMessages, null, 2)}
`.trim();

    const model = process.env.OPENAI_CHAT_MODEL || 'gpt-5-mini';
    const stream = await (OpenAIClient as any).responses.stream({
      model,
      input: prompt,
    });

    let output = '';
    for await (const event of stream as any) {
      if (!event) continue;
      if (typeof event === 'string') {
        output += event;
        continue;
      }
      if (event.type === 'response.delta' && event.delta?.content) {
        output += Array.isArray(event.delta.content)
          ? event.delta.content.join('')
          : String(event.delta.content);
        continue;
      }
      if (event.delta?.content) {
        output += Array.isArray(event.delta.content)
          ? event.delta.content.join('')
          : String(event.delta.content);
      }
    }

    const parsed = extractJSONFromResponse(output);
    const validation = validateAIResponse(parsed);
    if (validation.valid && validation.data) return validation.data;
    return extracted;
  } catch (err) {
    logger.warn('Business understanding refinement failed', { error: String(err) });
    return extracted;
  }
}

// Lightweight health endpoint for readiness checks
app.get('/health', async (_req, res) => {
  try {
    // quick DB check
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});


// Get monthly usage (SEO/free audits) for a business (returns counts for current month)
app.get('/businesses/:businessId/usage', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    if (!businessId) return res.status(400).json({ error: 'Business id is required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // auditUsage stores counts per userId (or IP for free-audit)
    const usage = await prisma.auditUsage.findFirst({ where: { userId: req.userId!, year, month } });
    const seoAudits = usage ? usage.count : 0;

    res.json({ seoAudits });
  } catch (err) {
    console.error('Get usage error:', err);
    res.status(500).json({ error: 'Failed to fetch usage' });
  }
});



// Helper to apply automation rules for lead status changes
async function applyLeadAutomationRules(businessId: string, leadId: string, triggerEvent: string) {
  try {
    // Find all active email sequences for this trigger
    const sequences = await prisma.emailSequence.findMany({
      where: {
        businessId,
        triggerEvent,
        isActive: true,
      }
    });

    // Queue emails for sending (in real app, would use a job queue)
    for (const sequence of sequences) {
      // Delay would be handled by a job queue in production
      console.log(`[Automation] Queued email: ${sequence.name} for lead ${leadId}`);
    }
  } catch (err) {
    logger.error('Automation rule error', { error: err });
  }
}

// --- Helper Functions ---

// Website scraping with security hardening
async function scrapeWebsite(url: string): Promise<{ title?: string; description?: string; email?: string; phone?: string; images?: string[]; headings?: string[]; error?: string }> {
  try {
    // Validate URL format
    let urlObj: URL;
    try {
      urlObj = new URL(url);
    } catch {
      return { error: 'Invalid URL format' };
    }

    // Block private/internal IPs
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
      hostname.startsWith('172.31.') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) {
      return { error: 'Invalid URL: private IP addresses not allowed' };
    }

    // Use axios with timeout and size limit
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

    // Verify content size
    if (typeof html !== 'string' || html.length > 5 * 1024 * 1024) {
      return { error: 'Response too large' };
    }

    const $ = cheerio.load(html);

    // Strip all script tags for security before processing
    $('script').remove();
    $('noscript').remove();
    $('style').remove();
    $('iframe').remove();

    const title = ($('title').text() || $('h1').first().text() || '').trim().substring(0, 200);
    const description = (
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      $('p').first().text() || ''
    ).trim().substring(0, 500);

    // Limit text extraction for AI input (max 50000 characters)
    const text = $.root().text().substring(0, 50000);

    // Extract contact info
    const emailMatch = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
    const phoneMatch = text.match(/\+?\d[\d\s().-]{7,}\d/);

    // Extract images with base URL resolution
    const images: string[] = [];
    $('img').each((_i, el) => {
      let src = $(el).attr('src') || $(el).attr('data-src');
      if (!src) return;

      // Skip tiny images and icons
      const width = parseInt($(el).attr('width') || '0', 10);
      const height = parseInt($(el).attr('height') || '0', 10);
      if ((width > 0 && width < 50) || (height > 0 && height < 50)) return;
      if (src.includes('icon') || src.includes('logo') || src.includes('favicon')) return;

      // Make relative URLs absolute
      if (src.startsWith('//')) {
        src = `https:${src}`;
      } else if (src.startsWith('/')) {
        src = `${urlObj.protocol}//${urlObj.host}${src}`;
      } else if (!src.startsWith('http')) {
        try {
          src = new URL(src, url).href;
        } catch {
          return;
        }
      }

      if (src.startsWith('http') && !images.includes(src)) {
        images.push(src);
      }
    });

    // Extract headings for context
    const headings: string[] = [];
    $('h1, h2, h3').each((_i, el) => {
      const headingText = $(el).text().trim();
      if (headingText && headingText.length < 200 && headings.length < 5) {
        headings.push(headingText);
      }
    });

    const result: any = {};
    if (title) result.title = title;
    if (description) result.description = description;
    if (emailMatch) result.email = emailMatch[0];
    if (phoneMatch) result.phone = phoneMatch[0];
    if (images.length > 0) result.images = images.slice(0, 10);
    if (headings.length > 0) result.headings = headings;

    return result;
  } catch (err: any) {
    logger.warn('Scraping error', { url, error: err?.message });
    return { error: err?.message || 'Error scraping website' };
  }
}

// Business analysis with AI/NLP
async function analyzeBusiness(description: string, scraped?: { title?: string; description?: string; email?: string; phone?: string }) {
  try {
    // Use new AI intelligence generator
    const intelligence = await generateBusinessIntelligence(scraped || {}, description);
    return intelligence;
  } catch (err) {
    logger.error('Business analysis error', { error: err });
    return { error: 'Analysis failed' };
  }
}

// Instagram URL parsing
function parseInstagramUrl(url: string): { username: string } | { error: string } {
  try {
    const regex = /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?!p\/|reel\/|tv\/|stories\/)([A-Za-z0-9_.]+)\/?/i;
    const match = url.match(regex);
    if (match && match[1]) {
      return { username: match[1] };
    } else {
      return { error: 'Invalid Instagram profile URL' };
    }
  } catch {
    return { error: 'Error parsing URL' };
  }
}

// Helper: Generate URL slug from business name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper: Extract services from description (used in social content generation)
function extractServices(description: string, name: string): string[] {
  if (!description) return ['Services'];
  const words = description.toLowerCase().split(/\s+/);
  const serviceKeywords = ['design', 'develop', 'consult', 'market', 'build', 'create', 'manage'];
  return words.filter(w => serviceKeywords.some(sk => w.includes(sk))).slice(0, 3);
}

// Helper: Calculate SEO audit score
function calculateSeoScore(scraped: any): number {
  // Base heuristic: title/description/contact/https
  let score = 40;
  if (scraped.title) score += 15;
  if (scraped.description) score += 15;
  if (scraped.url && typeof scraped.url === 'string' && scraped.url.includes('https')) score += 10;
  if (scraped.phone || scraped.email) score += 10;

  // Incorporate PageSpeed / Lighthouse metrics when available
  // performance (0-1) -> up to +20
  if (scraped.pageSpeed && typeof scraped.pageSpeed.performance === 'number') {
    const p = Math.round(scraped.pageSpeed.performance * 20);
    score += p;
  }

  // lighthouse SEO category (0-1) -> up to +10
  if (scraped.pageSpeed && typeof scraped.pageSpeed.seo === 'number') {
    const s = Math.round(scraped.pageSpeed.seo * 10);
    score += s;
  }

  return Math.min(100, score);
}

// Helper: Calculate audit scores with a fallback when PageSpeed is unavailable
function calculateAuditScores(scraped: any, pageSpeed: any) {
  if (pageSpeed) {
    const performance = pageSpeed?.performance ? Math.round(pageSpeed.performance * 100) : 0;
    const seoScore = pageSpeed?.seo ? Math.round(pageSpeed.seo * 100) : 0;
    const accessibility = pageSpeed?.accessibility ? Math.round(pageSpeed.accessibility * 100) : 0;
    const bestPractices = calculateSeoScore({ pageSpeed });
    const mobile = Math.round((performance + accessibility) / 2);
    return { performance, seoScore, accessibility, bestPractices, mobile };
  }

  // Fallback heuristic scores from scraped metadata so audits aren't all zero.
  const hasTitle = !!scraped?.title;
  const hasDescription = !!scraped?.description;
  const hasImages = Array.isArray(scraped?.images) && scraped.images.length > 0;
  const hasContact = !!(scraped?.email || scraped?.phone);

  const performance = Math.min(
    80,
    45 + (hasTitle ? 10 : 0) + (hasDescription ? 10 : 0) + (hasImages ? 10 : 0),
  );
  const seoScore = calculateSeoScore(scraped);
  const accessibility = Math.min(
    80,
    40 + (hasTitle ? 10 : 0) + (hasDescription ? 10 : 0) + (hasContact ? 10 : 0),
  );
  const bestPractices = Math.min(100, Math.round((seoScore + performance) / 2));
  const mobile = Math.round((performance + accessibility) / 2);

  return { performance, seoScore, accessibility, bestPractices, mobile };
}

// Fetch PageSpeed Insights (Lighthouse) data via Google API
async function fetchPageSpeedData(url: string): Promise<any> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY || process.env.PAGESPEED_API_KEY || '';
  if (!apiKey) {
    throw new Error('Missing PageSpeed API key');
  }

  const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  endpoint.searchParams.set('url', url);
  endpoint.searchParams.set('strategy', 'mobile');
  endpoint.searchParams.set('key', apiKey);
  // Limit to required categories to reduce payload/latency.
  endpoint.searchParams.append('category', 'PERFORMANCE');
  endpoint.searchParams.append('category', 'SEO');
  endpoint.searchParams.append('category', 'ACCESSIBILITY');

  const timeoutMs = Number(process.env.PAGESPEED_TIMEOUT_MS || 120000);
  const maxAttempts = Number(process.env.PAGESPEED_MAX_ATTEMPTS || 1);

  let lastErrorMessage = 'Unknown PageSpeed error';

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const resp = await fetch(endpoint.toString(), {
        method: 'GET',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      });

      clearTimeout(timeout);

      const data = await resp.json();
      if (!resp.ok) {
        const apiMsg = data?.error?.message || data?.error?.status || `HTTP ${resp.status}`;
        throw new Error(apiMsg);
      }

      // Extract a few useful metrics
      const lighthouse = data.lighthouseResult || {};
      const categories = lighthouse.categories || {};
      const audits = lighthouse.audits || {};

      const performance = (categories.performance && categories.performance.score) || null;
      const seo = (categories.seo && categories.seo.score) || null;
      const accessibility = (categories.accessibility && categories.accessibility.score) || null;

      const fcp = audits['first-contentful-paint']?.numericValue || null;
      const lcp = audits['largest-contentful-paint']?.numericValue || null;
      const cls = audits['cumulative-layout-shift']?.numericValue || null;

      return {
        raw: data,
        performance,
        seo,
        accessibility,
        fcp,
        lcp,
        cls,
      };
    } catch (err: any) {
      const status = err?.status || null;
      const timeout = err?.name === 'AbortError' || /timed out|aborted/i.test(String(err?.message || ''));
      lastErrorMessage = err?.message || String(err);

      logger.warn('PageSpeed fetch failed', {
        attempt,
        maxAttempts,
        status,
        timeout,
        error: lastErrorMessage,
      });

      const retryable = timeout || status === 429 || (typeof status === 'number' && status >= 500);
      if (!retryable || attempt === maxAttempts) break;

      const backoffMs = attempt * 1500;
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  throw new Error(`PageSpeed API failed after ${maxAttempts} attempts: ${lastErrorMessage}`);
}

function isPubliclyReachableAuditUrl(rawUrl?: string | null): boolean {
  if (!rawUrl) return false;
  try {
    const parsed = new URL(rawUrl);
    const hostname = parsed.hostname.toLowerCase();

    if (hostname === 'localhost' || hostname === '0.0.0.0' || hostname === '127.0.0.1') {
      return false;
    }
    if (hostname.endsWith('.local')) return false;
    if (hostname.startsWith('10.')) return false;
    if (hostname.startsWith('192.168.')) return false;
    if (
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

type AutoAuditBusiness = {
  id: string;
  userId: string;
  name: string;
  slug: string | null;
  publishedUrl: string | null;
  isPublished: boolean;
};

async function runAutoPageSpeedAuditForBusiness(
  business: AutoAuditBusiness,
  minIntervalMinutes: number,
): Promise<'audited' | 'skipped_recent' | 'skipped_url' | 'failed'> {
  const targetUrl = business.publishedUrl;
  if (!business.isPublished || !isPubliclyReachableAuditUrl(targetUrl)) {
    return 'skipped_url';
  }

  const minMs = Math.max(1, minIntervalMinutes) * 60 * 1000;
  const latest = await prisma.seoAudit.findFirst({
    where: { userId: business.userId, businessId: business.id },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });

  if (latest && Date.now() - new Date(latest.createdAt).getTime() < minMs) {
    return 'skipped_recent';
  }

  try {
    const pageSpeed = await fetchPageSpeedData(targetUrl!);
    const { performance, seoScore, accessibility, bestPractices } =
      calculateAuditScores({}, pageSpeed);

    const issues: any = { critical: [], warnings: [], opportunities: [] };
    if (performance < 40) issues.critical.push('Low performance score');
    if (seoScore < 50) issues.warnings.push('SEO score is low');

    const recommendations = generateAuditRecommendations({
      seoKeywords: [],
      heroHeadline: business.name || '',
    });

    await prisma.seoAudit.create({
      data: {
        userId: business.userId,
        businessId: business.id,
        url: targetUrl!,
        performance,
        seo: seoScore,
        accessibility,
        bestPractices,
        issues,
        recommendations,
        raw: {
          source: 'auto_pagespeed_scheduler',
          pageSpeed,
          auditedAt: new Date().toISOString(),
        } as any,
      },
    });
    return 'audited';
  } catch (error) {
    logger.warn('Auto PageSpeed audit failed for business', {
      businessId: business.id,
      businessName: business.name,
      url: targetUrl,
      error: String(error),
    });
    return 'failed';
  }
}

async function runAutoPageSpeedAuditCycle() {
  const minIntervalMinutes = Number(
    process.env.AUTO_PAGESPEED_AUDIT_MIN_INTERVAL_MINUTES || 60,
  );
  const businesses = await prisma.business.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      userId: true,
      name: true,
      slug: true,
      publishedUrl: true,
      isPublished: true,
    },
  });

  if (!businesses.length) return;

  let audited = 0;
  let skippedRecent = 0;
  let skippedUrl = 0;
  let failed = 0;

  for (const business of businesses) {
    const result = await runAutoPageSpeedAuditForBusiness(
      business as AutoAuditBusiness,
      minIntervalMinutes,
    );
    if (result === 'audited') audited += 1;
    if (result === 'skipped_recent') skippedRecent += 1;
    if (result === 'skipped_url') skippedUrl += 1;
    if (result === 'failed') failed += 1;
  }

  logger.info('Auto PageSpeed audit cycle completed', {
    total: businesses.length,
    audited,
    skippedRecent,
    skippedUrl,
    failed,
  });
}

let autoAuditTimer: NodeJS.Timeout | null = null;
let autoAuditRunning = false;

function startAutoPageSpeedAuditScheduler() {
  const enabled = process.env.AUTO_PAGESPEED_AUDIT_ENABLED !== 'false';
  if (!enabled) {
    console.log('[AutoAudit] AUTO_PAGESPEED_AUDIT_ENABLED=false, scheduler disabled');
    return;
  }

  const intervalMinutes = Math.max(
    5,
    Number(process.env.AUTO_PAGESPEED_AUDIT_INTERVAL_MINUTES || 30),
  );

  const run = async () => {
    if (autoAuditRunning) return;
    autoAuditRunning = true;
    try {
      await runAutoPageSpeedAuditCycle();
    } catch (error) {
      logger.warn('Auto PageSpeed scheduler cycle error', { error: String(error) });
    } finally {
      autoAuditRunning = false;
    }
  };

  void run();
  autoAuditTimer = setInterval(() => {
    void run();
  }, intervalMinutes * 60 * 1000);
  if (typeof autoAuditTimer.unref === 'function') autoAuditTimer.unref();

  console.log(
    `[AutoAudit] PageSpeed scheduler started (interval=${intervalMinutes}m, minInterval=${process.env.AUTO_PAGESPEED_AUDIT_MIN_INTERVAL_MINUTES || 60}m)`,
  );
}

// Helper: Calculate brand audit score
function calculateBrandScore(intelligence: any): number {
  let score = 40;
  if (intelligence.businessName) score += 10;
  if (intelligence.services && intelligence.services.length > 0) score += 15;
  if (intelligence.brandColors && intelligence.brandColors.length > 0) score += 15;
  if (intelligence.heroHeadline) score += 10;
  if (intelligence.marketingCopy) score += 10;
  return Math.min(100, score);
}

// Helper: Calculate lead capture audit score
function calculateLeadCaptureScore(scraped: any): number {
  let score = 30;
  if (scraped.email) score += 20;
  if (scraped.phone) score += 20;
  if (scraped.description) score += 15;
  if (scraped.images && scraped.images.length > 0) score += 15;
  return Math.min(100, score);
}

// Helper: Generate audit recommendations
function generateAuditRecommendations(intelligence: any): string[] {
  const recommendations: string[] = [];
  
  if (!intelligence.seoKeywords || intelligence.seoKeywords.length < 5) {
    recommendations.push('Add more SEO-optimized keywords to your website');
  }
  if (!intelligence.heroHeadline) {
    recommendations.push('Create a compelling headline for your website hero section');
  }
  if (!intelligence.services || intelligence.services.length === 0) {
    recommendations.push('Clearly define your services or products');
  }
  if (!intelligence.leadQualificationQuestions || intelligence.leadQualificationQuestions.length === 0) {
    recommendations.push('Add qualifying questions to better understand your leads');
  }
  if (recommendations.length === 0) {
    recommendations.push('Your business profile looks great! Set up lead capture to start growing.');
  }
  
  return recommendations;
}

// --- SEO Audit Endpoint (enforces per-user monthly quota) ---
app.post('/seo-audit', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const userId = req.userId!;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Check usage for this month (limit 2)
    const usage = await prisma.auditUsage.findFirst({ where: { userId, year, month } });
    if (usage && usage.count >= 2) {
      return res.status(429).json({ error: 'Monthly audit limit reached (2 per month)' });
    }

    // Run scraping + PageSpeed
    const scraped = await (async () => { try { return await scrapeWebsite(url); } catch { return {}; } })();
    let pageSpeed: any;
    try {
      pageSpeed = await fetchPageSpeedData(url);
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch PageSpeed data';
      return res.status(502).json({ error: message });
    }

    const { performance, seoScore, accessibility, bestPractices } =
      calculateAuditScores(scraped, pageSpeed);

    // Issues/opportunities - simple extraction from audits
    const issues = { critical: [], warnings: [], opportunities: [] } as any;
    if (!scraped || Object.keys(scraped).length === 0) issues.warnings.push('Failed to scrape site content');
    if (performance < 40) issues.critical.push('Low performance score');
    if (seoScore < 50) issues.warnings.push('SEO score is low');

    const recommendations = generateAuditRecommendations({ seoKeywords: scraped.headings || [], heroHeadline: scraped.title || '' });

    const audit = await prisma.seoAudit.create({
      data: {
        userId,
        businessId: null,
        url,
        performance,
        seo: seoScore,
        accessibility,
        bestPractices,
        issues: issues as any,
        recommendations: recommendations as any,
        raw: { pageSpeed, scraped },
      }
    });

    // Increment/create usage
    if (usage) {
      await prisma.auditUsage.update({ where: { id: usage.id }, data: { count: usage.count + 1 } });
    } else {
      await prisma.auditUsage.create({ data: { userId, year, month, count: 1 } });
    }

    // Build a response shape expected by the frontend UI
    const overallScore = Math.round((performance + seoScore + accessibility + bestPractices) / 4);
    const auditResponse = {
      id: audit.id,
      url: audit.url,
      performance: audit.performance,
      seoScore: audit.seo,
      accessibility: audit.accessibility,
      bestPractices: audit.bestPractices,
      recommendations: Array.isArray(audit.recommendations) ? audit.recommendations : (audit.recommendations ? [audit.recommendations] : []),
      issues: audit.issues,
      raw: audit.raw,
      overallScore,
      createdAt: audit.createdAt,
    };

    res.json({ audit: auditResponse });
  } catch (err) {
    logger.error('SEO audit error', { error: String(err) });
    res.status(500).json({ error: 'Failed to run SEO audit' });
  }
});

// --- Public SEO Audit Endpoint (no auth, 1 per week per IP) ---
app.post('/seo-audit-public', publicSeoAuditLimiter, async (req: Request, res: Response) => {
  try {
    const { website, email } = req.body;

    // Validate inputs
    if (!website || typeof website !== 'string') {
      return res.status(400).json({ error: 'Website URL is required' });
    }

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate website length (prevent abuse with extremely long URLs)
    const trimmedWebsite = website.trim();
    if (trimmedWebsite.length > 500) {
      return res.status(400).json({ error: 'Website URL is too long' });
    }

    // Trim and validate email length
    const trimmedEmail = email.trim();
    if (trimmedEmail.length > 254) {
      return res.status(400).json({ error: 'Email is too long' });
    }

    // Enhanced email validation (RFC 5322 simplified)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Additional email validation to prevent common abuse patterns
    if (trimmedEmail.includes('..') || trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Normalize URL: add https:// if no protocol is specified
    let normalizedUrl = trimmedWebsite;
    if (normalizedUrl && !normalizedUrl.match(/^https?:\/\//)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // Basic URL validation
    try {
      const urlObj = new URL(normalizedUrl);
      
      // Prevent localhost and private IP addresses
      const hostname = urlObj.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '0.0.0.0' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.') ||
        hostname === 'example.com' ||
        hostname === 'example.org'
      ) {
        return res.status(400).json({ error: 'Invalid website URL' });
      }
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Get client IP for rate limiting tracking
    const clientIp = (req.ip || req.socket.remoteAddress || 'unknown').toString();

    // Run scraping + PageSpeed
    const scraped = await (async () => { try { return await scrapeWebsite(normalizedUrl); } catch { return {}; } })();
    let pageSpeed: any;
    try {
      pageSpeed = await fetchPageSpeedData(normalizedUrl);
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch PageSpeed data';
      return res.status(502).json({ error: message });
    }

    const { performance, seoScore, accessibility, bestPractices, mobile } =
      calculateAuditScores(scraped, pageSpeed);

    // Issues/opportunities - simple extraction from audits
    const issues: any = { critical: [], warnings: [], opportunities: [] };
    if (!scraped || Object.keys(scraped).length === 0) issues.warnings.push('Failed to scrape site content');
    if (performance < 40) issues.critical.push('Low performance score');
    if (seoScore < 50) issues.warnings.push('SEO score is low');
    if (mobile < 50) issues.warnings.push('Mobile experience needs improvement');

    const recommendations = generateAuditRecommendations({ seoKeywords: scraped.headings || [], heroHeadline: scraped.title || '' });

    // Calculate overall score
    const overallScore = Math.round((performance + seoScore + mobile) / 3);

    // Create public audit record
    const audit = await prisma.publicSeoAudit.create({
      data: {
        url: normalizedUrl,
        email,
        ipAddress: clientIp,
        performance,
        seo: seoScore,
        mobile,
        overallScore,
        issues,
        recommendations,
        raw: { pageSpeed, scraped },
      },
    });

    // Build response
    const auditResponse = {
      id: audit.id,
      url: audit.url,
      overallScore: audit.overallScore,
      seoScore: audit.seo,
      performanceScore: audit.performance,
      mobileScore: audit.mobile,
      issues: Array.isArray((audit.issues as any)?.critical) ? (audit.issues as any).critical : [],
      recommendations: Array.isArray(audit.recommendations) ? audit.recommendations : [],
      createdAt: audit.createdAt,
    };

    res.json(auditResponse);
  } catch (err) {
    logger.error('Public SEO audit error', { error: String(err) });
    res.status(500).json({ error: 'Failed to run SEO audit' });
  }
});

// --- Free Audit Proxy (unauthenticated, IP-limited, optional CAPTCHA) ---
app.post('/free-audit', publicLimiter, async (req: Request, res: Response) => {
  try {
    const { url, instagramUrl, description, captchaToken } = req.body || {};
    if (!url && !instagramUrl && !description) return res.status(400).json({ error: 'Provide a url, instagramUrl, or description' });

    // CAPTCHA verification (optional): if RECAPTCHA_SECRET set, verify token
    const recaptchaSecret = process.env.RECAPTCHA_SECRET || process.env.RECAPTCHA_KEY || '';
    if (recaptchaSecret) {
      if (!captchaToken) return res.status(400).json({ error: 'captchaToken required' });
      try {
        const verifyRes = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `secret=${encodeURIComponent(recaptchaSecret)}&response=${encodeURIComponent(captchaToken)}`,
        });
        const verifyJson = await verifyRes.json() as any;
        if (!verifyJson || !verifyJson.success) return res.status(403).json({ error: 'Captcha verification failed' });
      } catch (err) {
        return res.status(500).json({ error: 'Captcha verification error' });
      }
    } else {
      // In non-production/dev mode allow a special token to avoid blocking local development
      if (captchaToken !== 'mock') {
        return res.status(400).json({ error: 'captchaToken required (use token "mock" in dev)' });
      }
    }

    // Identify client IP for monthly quota tracking
    const ipRaw = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1');
    const ip = ipRaw.split(',')[0]?.trim() || '127.0.0.1';
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Check usage for this IP this month (limit 1)
    const usage = await prisma.auditUsage.findFirst({ where: { userId: ip, year, month } });
    if (usage && usage.count >= 1) {
      return res.status(429).json({ error: 'Monthly free audit limit reached for this IP' });
    }

    // Run scraping + PageSpeed
    const scraped = await (async () => { try { return await scrapeWebsite(url); } catch { return {}; } })();
    let pageSpeed: any;
    try {
      pageSpeed = await fetchPageSpeedData(url);
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch PageSpeed data';
      return res.status(502).json({ error: message });
    }

    const performance = pageSpeed?.performance ? Math.round(pageSpeed.performance * 100) : 0;
    const seoScore = pageSpeed?.seo ? Math.round(pageSpeed.seo * 100) : 0;
    const accessibility = pageSpeed?.accessibility ? Math.round(pageSpeed.accessibility * 100) : 0;

    const bestPractices = calculateSeoScore({ pageSpeed });
    const recommendations = generateAuditRecommendations({ seoKeywords: scraped.headings || [], heroHeadline: scraped.title || '' });

    const audit = await prisma.seoAudit.create({
      data: {
        userId: null,
        businessId: null,
        url: url || (instagramUrl ? instagramUrl : (description ? 'description' : '')),
        performance,
        seo: seoScore,
        accessibility,
        bestPractices,
        issues: (Object.keys(scraped || {}).length === 0 ? { warnings: ['Failed to scrape site content'] } : {}) as any,
        recommendations: recommendations as any,
        raw: { pageSpeed, scraped },
      }
    });

    // Increment/create usage tracked by IP in auditUsage table
    if (usage) {
      await prisma.auditUsage.update({ where: { id: usage.id }, data: { count: usage.count + 1 } });
    } else {
      await prisma.auditUsage.create({ data: { userId: ip, year, month, count: 1 } });
    }

    // If an Authorization token was provided, also increment the authenticated user's usage
    try {
      const authHeader = String(req.headers.authorization || '');
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        const decoded: any = jwt.decode(token);
        // Extract userId from Supabase JWT structure (uses 'sub' field)
        const uid = decoded?.sub || decoded?.userId;
        if (uid) {
          const userUsage = await prisma.auditUsage.findFirst({ where: { userId: uid, year, month } });
          if (userUsage) {
            await prisma.auditUsage.update({ where: { id: userUsage.id }, data: { count: userUsage.count + 1 } });
          } else {
            await prisma.auditUsage.create({ data: { userId: uid, year, month, count: 1 } });
          }
        }
      }
    } catch (err) {
      // Do not fail the audit if token parsing fails; just log
      logger.warn('free-audit: auth token parsing failed', { error: String(err) });
    }

    const overallScore = Math.round((performance + seoScore + accessibility + bestPractices) / 4);
    const auditResponse = {
      id: audit.id,
      url: audit.url,
      performance: audit.performance,
      seoScore: audit.seo,
      accessibility: audit.accessibility,
      bestPractices: audit.bestPractices,
      recommendations: Array.isArray(audit.recommendations) ? audit.recommendations : (audit.recommendations ? [audit.recommendations] : []),
      issues: audit.issues,
      raw: audit.raw,
      overallScore,
      createdAt: audit.createdAt,
    };

    res.json({ audit: auditResponse });
  } catch (err) {
    logger.error('Free audit error', { error: String(err) });
    res.status(500).json({ error: 'Failed to run free audit' });
  }
});

// ============================================================================
// CONVERSATION ONBOARDING ENDPOINTS
// ============================================================================

// POST /conversation/start - Initialize a new conversation session
app.post('/conversation/start', authenticateToken, conversationLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      console.error('No userId in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('[Conversation] Starting for userId:', userId);

    // Step 1: Generate questions first (before DB)
    let stage: any = undefined;
    let assistantMessage = '';
    try {
      stage = getCurrentStage(undefined);
      console.log('[Conversation] Stage:', stage);
      
      assistantMessage = generateNextQuestion(stage);
      console.log('[Conversation] Generated message, length:', assistantMessage.length);
    } catch (fnErr: any) {
      console.error('[Conversation] Function error:', fnErr?.message);
      throw new Error(`Function error: ${fnErr?.message}`);
    }

    // Step 2: Create session in DB
    let session: any;
    try {
      const messages: any[] = [
        {
          role: 'assistant',
          content: assistantMessage,
          timestamp: new Date().toISOString(),
        },
      ];

      session = await prisma.conversationSession.create({
        data: {
          userId,
          messages,
          extracted: {},
          status: 'active',
        },
      });
      console.log('[Conversation] Session created:', session.id);
    } catch (dbErr: any) {
      console.error('[Conversation] Database error:', {
        message: dbErr?.message,
        code: dbErr?.code,
        meta: dbErr?.meta,
      });
      throw new Error(`Database error: ${dbErr?.message}`);
    }

    // Step 3: Return response
    res.json({
      sessionId: session.id,
      stage,
      messages: [
        {
          role: 'assistant',
          content: assistantMessage,
          timestamp: new Date().toISOString(),
        },
      ],
      currentQuestion: assistantMessage,
      extracted: {},
      isComplete: false,
      questionNumber: 1,
      totalQuestions: 7,
    });
    
  } catch (err: any) {
    console.error('[Conversation] Full error:', {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
      error: String(err),
    });
    logger.error('Conversation start error', { 
      error: String(err),
      details: {
        message: err?.message,
        code: err?.code,
      }
    });
    
    res.status(500).json({ 
      error: err?.message || 'Failed to start conversation',
      ...(process.env.NODE_ENV === 'development' && { 
        details: {
          message: err?.message,
          code: err?.code,
          type: err?.name,
        }
      }),
    });
  }
});

// POST /conversation/message - Send a user message and get assistant response
app.post('/conversation/message', authenticateToken, conversationLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sessionId, message } = req.body;

    // Validate sessionId
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Validate sessionId format (should be a UUID/CUID)
    if (!/^[a-z0-9_\-]{15,40}$/.test(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID format' });
    }

    // Validate message presence and type
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Validate message length (min 1, max 1000 characters)
    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (trimmedMessage.length > 1000) {
      return res.status(400).json({ error: 'Message is too long (max 1000 characters)' });
    }

    // Get the session
    const session = await prisma.conversationSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status !== 'active') {
      return res.status(400).json({ error: 'Conversation is not active' });
    }

    // Get current extracted data
    let extracted = (session.extracted as any) || {};

    // Get current stage
    const currentStage = getCurrentStage(extracted);

    const accept = req.headers.accept || '';
    const isSSE = accept.includes('text/event-stream');

    // Validate the candidate state produced by this user message.
    const candidateExtracted = extractDataFromMessage(trimmedMessage, currentStage, extracted);
    const dataValidation = isStageDataValid(currentStage, candidateExtracted);

    // If user input is invalid for the current stage, ask again.
    let nextStage = currentStage;
    if (!dataValidation.valid && currentStage !== 'greeting') {
      const assistantMessage = `${dataValidation.message || 'Please provide a valid response.'} ${generateNextQuestion(currentStage)}`;
      const messages = [...(session.messages as any), {
        role: 'user',
        content: trimmedMessage,
        timestamp: new Date().toISOString(),
      }, {
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date().toISOString(),
      }];

      await prisma.conversationSession.update({
        where: { id: sessionId },
        data: { messages: messages as any },
      });

      if (isSSE) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();
        sseSend(res, JSON.stringify({ delta: assistantMessage }));
        sseSend(res, JSON.stringify({
          done: true,
          payload: {
            sessionId,
            stage: currentStage,
            extracted,
            isComplete: false,
            totalQuestions: 7,
            assistantMessage,
          },
        }), 'done');
        return res.end();
      }

      return res.json({
        sessionId,
        messages,
        stage: currentStage,
        error: dataValidation.message,
        totalQuestions: 7,
      });
    }

    // Persist candidate extracted data from this valid message.
    extracted = candidateExtracted;

    // Determine next stage
    nextStage = getCurrentStage(extracted);

    // Build assistant response
    let assistantContent = '';
    
    if (nextStage === 'summary') {
      // Onboarding complete - keep rule-based flow, then refine extracted data
      // with streaming-capable model output for higher quality business understanding.
      try {
        const userConfirmed = isAffirmativeConfirmation(trimmedMessage);
        extracted = await refineBusinessUnderstandingWithModel(
          extracted,
          [...(session.messages as any), { role: 'user', content: trimmedMessage }]
        );
        if (!extracted.seoKeywords || extracted.seoKeywords.length < 5) {
          const descriptionSeed = [
            extracted.name,
            extracted.category,
            extracted.location,
            (extracted.services || []).join(', '),
            extracted.valueProposition,
            extracted.targetAudience,
          ]
            .filter(Boolean)
            .join(' ');
          extracted.seoKeywords = generateSEOKeywords(extracted.name || 'Business', descriptionSeed);
        }
        if (isSSE) {
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');
          res.flushHeaders?.();

          const model = process.env.OPENAI_CHAT_MODEL || 'gpt-5-mini';
          const prompt = buildConversationSummaryPrompt(extracted);
          try {
            const stream = await (OpenAIClient as any).responses.stream({
              model,
              input: prompt,
            });

            for await (const event of stream as any) {
              if (!event) continue;
              const deltaCandidate =
                event?.delta?.content ??
                event?.delta?.text ??
                event?.text ??
                event?.output_text ??
                event?.delta;
              const delta =
                typeof deltaCandidate === 'string'
                  ? deltaCandidate
                  : Array.isArray(deltaCandidate)
                    ? deltaCandidate.join('')
                    : '';
              if (delta) {
                assistantContent += delta;
                sseSend(res, JSON.stringify({ delta }));
              }
            }
          } catch (err) {
            assistantContent = generateSummaryMessage(extracted);
            sseSend(res, JSON.stringify({ delta: assistantContent }));
          }

          if (!assistantContent || !assistantContent.trim()) {
            assistantContent = generateSummaryMessage(extracted);
          }

          const normalizedExtracted = normalizeOnboardingExtracted(extracted);
          const messages = [...(session.messages as any), {
            role: 'user',
            content: trimmedMessage,
            timestamp: new Date().toISOString(),
          }, {
            role: 'assistant',
            content: assistantContent.trim(),
            timestamp: new Date().toISOString(),
          }];

          const validation = validateAIResponse(normalizedExtracted);
          let finalStatus = 'active';
          let finalExtracted = normalizedExtracted;
          if (validation.valid && userConfirmed) {
            finalStatus = 'completed';
            finalExtracted = validation.data;
          }

          await prisma.conversationSession.update({
            where: { id: sessionId },
            data: {
              messages: messages as any,
              extracted: finalExtracted as any,
              status: finalStatus,
            },
          });

          sseSend(res, JSON.stringify({
            done: true,
            payload: {
              sessionId,
              stage: nextStage,
              extracted: finalExtracted,
              isComplete: finalStatus === 'completed',
              totalQuestions: 7,
              assistantMessage: assistantContent.trim(),
            },
          }), 'done');
          return res.end();
        }

        try {
          const model = process.env.OPENAI_CHAT_MODEL || 'gpt-5-mini';
          const prompt = buildConversationSummaryPrompt(extracted);
          const resp = await (OpenAIClient as any).responses.create({
            model,
            input: prompt,
          });
          const text =
            (resp as any)?.output_text ||
            (resp as any)?.output?.[0]?.content?.[0]?.text ||
            '';
          assistantContent = text?.trim() || generateSummaryMessage(extracted);
        } catch {
          assistantContent = generateSummaryMessage(extracted);
        }
      } catch (err) {
        logger.warn('Conversation summary generation failed; using fallback.', { error: String(err) });
        assistantContent = generateSummaryMessage(extracted);
      }
    } else {
      // AI-driven next question (streaming when requested)
      const requiredQuestion = generateNextQuestion(nextStage);
      const recentMessages = (session.messages as any[] || []).slice(-6).map((m: any) => ({
        role: m?.role || 'user',
        content: String(m?.content || ''),
      }));

      if (isSSE) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();

        const prompt = buildConversationQuestionPrompt({
          stage: nextStage,
          requiredQuestion,
          extracted,
          recentMessages,
        });
        const model = process.env.OPENAI_CHAT_MODEL || 'gpt-5-mini';

        try {
          const stream = await (OpenAIClient as any).responses.stream({
            model,
            input: prompt,
          });

          for await (const event of stream as any) {
            if (!event) continue;
            const deltaCandidate =
              event?.delta?.content ??
              event?.delta?.text ??
              event?.text ??
              event?.output_text ??
              event?.delta;
            const delta =
              typeof deltaCandidate === 'string'
                ? deltaCandidate
                : Array.isArray(deltaCandidate)
                  ? deltaCandidate.join('')
                  : '';
            if (delta) {
              assistantContent += delta;
              sseSend(res, JSON.stringify({ delta }));
            }
          }
        } catch (err) {
          assistantContent = requiredQuestion;
          sseSend(res, JSON.stringify({ delta: assistantContent }));
        }

        if (!assistantContent || !assistantContent.trim()) {
          assistantContent = requiredQuestion;
        }

        const messages = [...(session.messages as any), {
          role: 'user',
          content: trimmedMessage,
          timestamp: new Date().toISOString(),
        }, {
          role: 'assistant',
          content: assistantContent.trim(),
          timestamp: new Date().toISOString(),
        }];

        const validation = validateAIResponse(extracted);
        let finalStatus = 'active';
        let finalExtracted = extracted;
        if (nextStage === 'summary' && validation.valid) {
          finalStatus = 'completed';
          finalExtracted = validation.data;
        }

        await prisma.conversationSession.update({
          where: { id: sessionId },
          data: {
            messages: messages as any,
            extracted: finalExtracted as any,
            status: finalStatus,
          },
        });

        sseSend(res, JSON.stringify({
          done: true,
          payload: {
            sessionId,
            stage: nextStage,
            extracted: finalExtracted,
            isComplete: finalStatus === 'completed',
            totalQuestions: 7,
            assistantMessage: assistantContent.trim(),
          },
        }), 'done');
        return res.end();
      }

      try {
        const prompt = buildConversationQuestionPrompt({
          stage: nextStage,
          requiredQuestion,
          extracted,
          recentMessages,
        });
        const model = process.env.OPENAI_CHAT_MODEL || 'gpt-5-mini';
        const resp = await (OpenAIClient as any).responses.create({
          model,
          input: prompt,
        });
        const text =
          (resp as any)?.output_text ||
          (resp as any)?.output?.[0]?.content?.[0]?.text ||
          '';
        assistantContent = text?.trim() || requiredQuestion;
      } catch {
        assistantContent = requiredQuestion;
      }
    }

    // Build updated messages array
    const messages = [...(session.messages as any), {
      role: 'user',
      content: trimmedMessage,
      timestamp: new Date().toISOString(),
    }, {
      role: 'assistant',
      content: assistantContent,
      timestamp: new Date().toISOString(),
    }];

    // Validate extracted data with Zod schema
    const normalizedExtracted = nextStage === 'summary'
      ? normalizeOnboardingExtracted(extracted)
      : extracted;
    const validation = validateAIResponse(normalizedExtracted);
    let finalStatus = 'active';
    let finalExtracted = normalizedExtracted;

    const userConfirmed = nextStage === 'summary' && isAffirmativeConfirmation(trimmedMessage);
    if (nextStage === 'summary' && validation.valid && userConfirmed) {
      finalStatus = 'completed';
      finalExtracted = validation.data;
    }

    // Save updated session
    await prisma.conversationSession.update({
      where: { id: sessionId },
      data: {
        messages: messages as any,
        extracted: finalExtracted as any,
        status: finalStatus,
      },
    });

    res.json({
      sessionId,
      messages,
      stage: nextStage,
      extracted: finalExtracted,
      isComplete: finalStatus === 'completed',
      validationErrors: validation.valid ? undefined : validation.errors,
      totalQuestions: 7,
    });
  } catch (err) {
    logger.error('Conversation message error', { error: String(err) });
    res.status(500).json({
      error: 'Failed to process message',
      ...(process.env.NODE_ENV === 'development' && {
        details: {
          message: (err as any)?.message,
          code: (err as any)?.code,
          type: (err as any)?.name,
        },
      }),
    });
  }
});

// GET /conversation/session/:sessionId - Retrieve conversation session
app.get('/conversation/session/:sessionId', authenticateToken, conversationLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sessionId } = req.params;

    // Validate sessionId format
    const sessionIdStr = Array.isArray(sessionId) ? sessionId[0] : sessionId;
    if (!sessionIdStr || !/^[a-z0-9_\-]{15,40}$/.test(sessionIdStr)) {
      return res.status(400).json({ error: 'Invalid session ID format' });
    }

    const session = await prisma.conversationSession.findUnique({
      where: { id: sessionIdStr },
    });

    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const stage = getCurrentStage((session.extracted as any) || {});

    res.json({
      sessionId: session.id,
      messages: session.messages,
      extracted: session.extracted,
      stage,
      status: session.status,
      isComplete: session.status === 'completed',
    });
  } catch (err) {
    logger.error('Get conversation error', { error: String(err) });
    res.status(500).json({ error: 'Failed to retrieve conversation' });
  }
});

// POST /conversation/session/:sessionId/complete - Complete conversation and extract business
app.post('/conversation/session/:sessionId/complete', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sessionId } = req.params;
    const { businessId } = req.body;

    // Validate sessionId format
    const sessionIdStr = Array.isArray(sessionId) ? sessionId[0] : sessionId;
    if (!sessionIdStr || !/^[a-z0-9_\-]{15,40}$/.test(sessionIdStr)) {
      return res.status(400).json({ error: 'Invalid session ID format' });
    }

    // Validate businessId presence and format
    if (!businessId || typeof businessId !== 'string') {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    if (!/^[a-z0-9_\-]{15,40}$/.test(businessId)) {
      return res.status(400).json({ error: 'Invalid business ID format' });
    }

    const session = await prisma.conversationSession.findUnique({
      where: { id: sessionIdStr },
    });

    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: 'Session not found' });
    }

    let extracted = normalizeOnboardingExtracted((session.extracted as any) || {});
    if (!extracted.seoKeywords || extracted.seoKeywords.length < 5) {
      const descriptionSeed = [
        extracted.name,
        extracted.category,
        extracted.location,
        (extracted.services || []).join(', '),
        extracted.valueProposition,
        extracted.targetAudience,
      ]
        .filter(Boolean)
        .join(' ');
      extracted.seoKeywords = generateSEOKeywords(extracted.name || 'Business', descriptionSeed);
    }

    // Verify business ownership before writing any data
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business || business.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Validate the extracted data
    const validation = validateAIResponse(extracted);
    if (!validation.valid) {
      if (process.env.NODE_ENV !== 'production') {
        const analysis = (business.analysis as any) || {};
        analysis.businessUnderstanding = extracted;
        await prisma.business.update({
          where: { id: businessId },
          data: { analysis: analysis as any },
        });
        await prisma.conversationSession.update({
          where: { id: sessionIdStr },
          data: { status: 'completed' },
        });
        return res.json({
          message: 'Business data saved with warnings (dev mode)',
          businessId,
          extracted,
          warnings: validation.errors,
        });
      }
      return res.status(400).json({
        error: 'Invalid business data',
        details: validation.errors,
      });
    }

    // Optionally scrape source URL provided in conversation (website/Instagram)
    const sourceUrl = String((validation.data as any)?.sourceUrl || extracted?.sourceUrl || '').trim();
    let scrapedFromConversation: any = {};
    if (sourceUrl && !['none', 'no', 'n/a', 'na'].includes(sourceUrl.toLowerCase())) {
      try {
        const ig = parseInstagramUrl(sourceUrl);
        if (ig.valid && ig.username) {
          const profile = await scrapeInstagramProfile(ig.username);
          scrapedFromConversation = { ...(instagramProfileToBusinessData(profile) as any), instagramUrl: sourceUrl };
        } else {
          const normalizedUrl = /^https?:\/\//i.test(sourceUrl) ? sourceUrl : `https://${sourceUrl}`;
          const websiteScraped = await scrapeWebsite(normalizedUrl);
          scrapedFromConversation = {
            ...websiteScraped,
            url: normalizedUrl,
          };
        }
      } catch (err) {
        logger.warn('Conversation source URL scrape failed', { sourceUrl, error: String(err) });
      }
    }

    // Update business with extracted data
    const analysis = (business.analysis as any) || {};
    const existingScraped = analysis.scraped || {};
    const mergedScraped = {
      ...existingScraped,
      ...scrapedFromConversation,
      images: [
        ...new Set([...(existingScraped.images || []), ...(scrapedFromConversation.images || [])]),
      ],
    };
    analysis.scraped = mergedScraped;
    analysis.businessUnderstandingValidated = validation.data;

    await prisma.business.update({
      where: { id: businessId },
      data: {
        analysis: analysis as any,
      },
    });

    // Mark conversation as completed
    await prisma.conversationSession.update({
      where: { id: sessionIdStr },
      data: { status: 'completed' },
    });

    res.json({
      message: 'Business data extracted and saved',
      businessId,
      extracted: validation.data,
    });
  } catch (err) {
    logger.error('Complete conversation error', { error: String(err) });
    res.status(500).json({ error: 'Failed to complete conversation' });
  }
});

// --- Google Calendar connect (store encrypted tokens) ---
app.post('/businesses/:businessId/connect-google-calendar', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const { tokens } = req.body; // expect { accessToken, refreshToken }
    if (!businessId) return res.status(400).json({ error: 'Business id required' });
    if (!tokens || !tokens.accessToken) return res.status(400).json({ error: 'tokens required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business || business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const encrypted = encryptData(JSON.stringify(tokens));
    await prisma.business.update({ where: { id: businessId }, data: { googleCalendarTokens: encrypted } });

    res.json({ message: 'Google Calendar connected' });
  } catch (err) {
    logger.error('Connect calendar error', { error: String(err) });
    res.status(500).json({ error: 'Failed to connect calendar' });
  }
});

// Helper: build OAuth2 client from stored tokens
function buildOAuth2ClientFromTokens(tokensObj: any) {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob';
  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oAuth2Client.setCredentials(tokensObj);
  return oAuth2Client;
}

// GET availability (freebusy) for a business's primary calendar
app.get('/businesses/:businessId/calendar/freebusy', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const { start, end } = req.query;
    if (!businessId) return res.status(400).json({ error: 'Business id required' });
    if (!start || !end) return res.status(400).json({ error: 'start and end query params required (ISO)' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    if (!business.googleCalendarTokens) return res.status(400).json({ error: 'No Google Calendar tokens connected' });

    const decrypted = getDecryptedValue(business.googleCalendarTokens);
    const tokens = JSON.parse(decrypted);
    const oAuth2Client = buildOAuth2ClientFromTokens(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    const resp = await calendar.freebusy.query({
      requestBody: {
        timeMin: String(start),
        timeMax: String(end),
        items: [{ id: 'primary' }],
      }
    });

    res.json({ freebusy: resp.data });
  } catch (err) {
    logger.error('Calendar freebusy error', { error: String(err) });
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// Create event in Google Calendar and persist as CalendarBooking
app.post('/businesses/:businessId/calendar/events', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const { startTime, endTime, summary, description, attendees, leadId } = req.body;
    if (!businessId) return res.status(400).json({ error: 'Business id required' });
    if (!startTime || !endTime || !summary) return res.status(400).json({ error: 'startTime, endTime, summary required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    if (!business.googleCalendarTokens) return res.status(400).json({ error: 'No Google Calendar tokens connected' });

    const decrypted = getDecryptedValue(business.googleCalendarTokens);
    const tokens = JSON.parse(decrypted);
    const oAuth2Client = buildOAuth2ClientFromTokens(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    const event: any = {
      summary,
      description,
      start: { dateTime: new Date(startTime).toISOString() },
      end: { dateTime: new Date(endTime).toISOString() },
    };
    if (Array.isArray(attendees) && attendees.length > 0) {
      event.attendees = attendees.map((a: any) => ({ email: a.email }));
    }

    const created = await calendar.events.insert({ calendarId: 'primary', requestBody: event });

    // Persist booking
    const booking = await prisma.calendarBooking.create({
      data: {
        businessId,
        leadId: leadId || null,
        provider: 'google',
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      }
    });

    res.json({ event: created.data, booking });
  } catch (err) {
    logger.error('Create calendar event error', { error: String(err) });
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
});

// Email notification
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.EMAIL_PORT || '2525'),
  auth: {
    user: process.env.EMAIL_USER || 'test',
    pass: process.env.EMAIL_PASS || 'test',
  },
});

// Initialize SendGrid if API key present
if (process.env.SENDGRID_API_KEY) {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('[Email] SendGrid initialized');
  } catch (err) {
    console.warn('[Email] Failed to initialize SendGrid', err);
  }
}

const sendEmailNotification = async (lead: any, business: any) => {
  try {
    // Prefer SendGrid when configured
    if (process.env.SENDGRID_API_KEY) {
      await sgMail.send({
        to: process.env.ADMIN_EMAIL || 'admin@salesape.com',
        from: 'leads@salesape.com',
        subject: `New Lead for ${business.name}: ${lead.name}`,
        html: `
          <h2>New Lead Received</h2>
          <p><strong>Business:</strong> ${business.name}</p>
          <p><strong>Name:</strong> ${lead.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></p>
          ${lead.company ? `<p><strong>Company:</strong> ${lead.company}</p>` : ''}
          ${lead.message ? `<p><strong>Message:</strong> ${lead.message}</p>` : ''}
          <p><strong>Received:</strong> ${new Date(lead.createdAt).toLocaleString()}</p>
        `,
      });
      return;
    }

    if (process.env.EMAIL_ENABLED === 'true') {
      await transporter.sendMail({
        from: 'leads@salesape.com',
        to: process.env.ADMIN_EMAIL || 'admin@salesape.com',
        subject: `New Lead for ${business.name}: ${lead.name}`,
        html: `
          <h2>New Lead Received</h2>
          <p><strong>Business:</strong> ${business.name}</p>
          <p><strong>Name:</strong> ${lead.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></p>
          ${lead.company ? `<p><strong>Company:</strong> ${lead.company}</p>` : ''}
          ${lead.message ? `<p><strong>Message:</strong> ${lead.message}</p>` : ''}
          <p><strong>Received:</strong> ${new Date(lead.createdAt).toLocaleString()}</p>
        `,
      });
    }
  } catch (err) {
    console.log(`[DEV] Email notification for ${lead.email} from ${business.name}`);
  }
};

// Send authentication-related emails (verification, welcome, login alert)
const sendAuthEmail = async (user: any, type: 'verify' | 'welcome' | 'login', ip?: string) => {
  try {
    if (process.env.EMAIL_ENABLED !== 'true') {
      console.log(`[DEV] Auth email (${type}) suppressed for ${user.email}`);
      return;
    }

    let subject = '';
    let html = '';

    if (type === 'verify') {
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
      const frontend = process.env.FRONTEND_URL || 'https://app.salesape.com';
      const verifyLink = `${frontend.replace(/\/+$/,'')}/verify?token=${token}`;
      subject = 'Welcome to SalesAPE — Verify your email';
      html = `
        <h2>Welcome, ${user.name || ''}!</h2>
        <p>Thanks for creating an account. Please verify your email by clicking the link below:</p>
        <p><a href="${verifyLink}">Verify email</a></p>
        <p>This link expires in 24 hours.</p>
      `;
    } else if (type === 'welcome') {
      subject = 'Welcome to SalesAPE';
      html = `
        <h2>Welcome, ${user.name || ''}!</h2>
        <p>Thanks for joining SalesAPE. We\'re excited to have you on board.</p>
      `;
    } else if (type === 'login') {
      subject = 'New sign-in to your SalesAPE account';
      html = `
        <h2>Sign-in detected</h2>
        <p>Your account (${user.email}) signed in at ${new Date().toLocaleString()}.</p>
        ${ip ? `<p>IP: ${ip}</p>` : ''}
        <p>If this wasn't you, reset your password immediately.</p>
      `;
    }

    if (process.env.SENDGRID_API_KEY) {
      await sgMail.send({
        to: user.email,
        from: 'no-reply@salesape.com',
        subject,
        html,
      });
    } else {
      await transporter.sendMail({
        from: 'no-reply@salesape.com',
        to: user.email,
        subject,
        html,
      });
    }
    console.log(`[Email Sent] ${type} email to ${user.email}`);
    logger.info(`Auth email sent`, { type, email: user.email });
  } catch (err) {
    logger.error('Auth email send error', { error: err });
    console.error(`[Email Error] Failed to send ${type} email to ${user.email}:`, err);
  }
};

// Twilio SMS support
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const sendSMS = async (toNumber: string, message: string): Promise<boolean> => {
  try {
    if (!twilioClient || !process.env.TWILIO_PHONE_FROM) {
      console.log(`[DEV] SMS (not configured): ${toNumber} - ${message}`);
      return false;
    }

    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_FROM,
      to: toNumber,
    });

    console.log(`[SMS Sent] to ${toNumber}`);
    return true;
  } catch (err) {
    logger.error('SMS send error', { error: err });
    return false;
  }
};

// Check booking availability and conflicts
async function isTimeSlotAvailable(businessId: string, date: string, time: string): Promise<boolean> {
  // Check if slot is already booked
  const existingBooking = await prisma.booking.findUnique({
    where: {
      businessId_date_time: {
        businessId,
        date,
        time,
      }
    }
  });

  if (existingBooking) {
    return false;
  }

  // Check if slot is within available hours
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();
  
  const availableSlots = await prisma.availableSlot.findMany({
    where: {
      businessId,
      dayOfWeek,
    }
  });

  if (availableSlots.length === 0) {
    return true; // No restrictions, slot available
  }

  const timeParts = (time || '').split(':');
  if (timeParts.length < 2) return false;
  const slotHour = Number(timeParts[0] ?? 0);
  const slotMinute = Number(timeParts[1] ?? 0);
  if (Number.isNaN(slotHour) || Number.isNaN(slotMinute)) return false;
  const slotTime = slotHour * 60 + slotMinute; // Convert to minutes

  return availableSlots.some(slot => {
    if (!slot.startTime || !slot.endTime) return false;
    const startParts = slot.startTime.split(':');
    const endParts = slot.endTime.split(':');
    if (startParts.length < 2 || endParts.length < 2) return false;
    const startHour = Number(startParts[0] ?? 0);
    const startMinute = Number(startParts[1] ?? 0);
    const endHour = Number(endParts[0] ?? 0);
    const endMinute = Number(endParts[1] ?? 0);
    if ([startHour, startMinute, endHour, endMinute].some(Number.isNaN)) return false;
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    return slotTime >= startTime && slotTime < endTime;
  });
}

// --- Health Check ---
app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// --- Authentication Endpoints ---

// Register endpoint
app.post('/auth/register', authLimiter, authValidation.register, validationErrorHandler, async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and a refresh token
    const refreshToken = crypto.randomBytes(48).toString('hex');
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        refreshToken,
      }
    });

    // Generate access token (JWT)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // (refresh token already created and stored above for registration)

    logger.info('User registered', { userId: user.id, email: user.email });
    // Send welcome email to new user
    try {
      await sendAuthEmail(user, 'welcome');
    } catch (e) {
      logger.warn('Failed to queue welcome email', { error: e });
    }
    res.status(201).json({
      token,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err: any) {
    logger.error('Register error', { error: err && err.message ? err.message : String(err) });
    if (err && err.message && err.message.includes('Unique constraint failed')) {
      return res.status(409).json({ error: 'User already exists' });
    }
    res.status(500).json({ error: 'Registration failed', details: err && err.message ? err.message : undefined });
  }
});

// Login endpoint
app.post('/auth/login', authLimiter, authValidation.login, validationErrorHandler, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Query database for user
    let user;
    try {
      user = await prisma.user.findUnique({ where: { email } });
    } catch (dbError) {
      logger.error('Database error during login', { error: dbError });
      return res.status(500).json({ error: 'Database error', details: 'Unable to query user database' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare passwords
    let passwordMatch = false;
    try {
      passwordMatch = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      logger.error('Password comparison error', { error: bcryptError });
      return res.status(500).json({ error: 'Authentication error' });
    }

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    let token;
    try {
      token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
    } catch (tokenError) {
      logger.error('Token generation error', { error: tokenError });
      return res.status(500).json({ error: 'Authentication error' });
    }

    logger.info('User login successful', { email });

    // Send login notification email (non-blocking)
    try {
      await sendAuthEmail(user, 'login', req.ip as string);
    } catch (emailError) {
      logger.warn('Failed to send login notification email', { error: emailError });
      // Don't fail login if email fails
    }

    // Rotate refresh token on login (non-blocking)
    let refreshToken = crypto.randomBytes(48).toString('hex');
    try {
      await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
    } catch (refreshError) {
      logger.warn('Failed to store refresh token', { error: refreshError });
      // Don't fail login if refresh token update fails
    }

    res.json({
      token,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err: any) {
    logger.error('Login error', { error: err && err.message ? err.message : String(err) });
    res.status(500).json({ error: 'Login failed', details: err && err.message ? err.message : undefined });
  }
});

// Refresh access token using refresh token (rotate refresh token)
app.post('/auth/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'refreshToken is required' });

    const user = await prisma.user.findFirst({ where: { refreshToken } });
    if (!user) return res.status(401).json({ error: 'Invalid refresh token' });

    // Issue new access token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    // Rotate refresh token
    const newRefresh = crypto.randomBytes(48).toString('hex');
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefresh } });

    res.json({ token, refreshToken: newRefresh, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    logger.error('Refresh token error', { error: String(err) });
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Logout - revoke current user's refresh token
app.post('/auth/logout', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
    res.json({ message: 'Logged out' });
  } catch (err) {
    logger.error('Logout error', { error: String(err) });
    res.status(500).json({ error: 'Failed to logout' });
  }
});

// Revoke a refresh token (accepts refreshToken in body)
app.post('/auth/revoke', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });
    const user = await prisma.user.findFirst({ where: { refreshToken } });
    if (!user) return res.status(404).json({ error: 'Token not found' });
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: null } });
    res.json({ message: 'Refresh token revoked' });
  } catch (err) {
    logger.error('Revoke token error', { error: String(err) });
    res.status(500).json({ error: 'Failed to revoke token' });
  }
});

// --- OAuth: Google & Apple Sign-In ---

// Start Google OAuth flow
app.get('/auth/google', (req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/callback`;
  const state = crypto.randomBytes(12).toString('hex');
  const scope = encodeURIComponent('openid email profile');
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;
  res.redirect(url);
});

// Google OAuth callback
app.get('/auth/google/callback', async (req: Request, res: Response) => {
  try {
    const code = String((req.query as any).code || '');
    if (!code) return res.status(400).json({ error: 'Code missing' });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/callback`,
        grant_type: 'authorization_code',
      } as any) as any,
    });

    const tokenJson = await tokenRes.json() as { access_token?: string };
    const accessToken = tokenJson.access_token;
    if (!accessToken) return res.status(400).json({ error: 'Failed to obtain access token' });

    const userInfoRes = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
    const profile = await userInfoRes.json() as { email: string; name?: string; given_name?: string };
    const email = profile.email;
    const name = profile.name || profile.given_name || '';

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const refreshToken = crypto.randomBytes(48).toString('hex');
      user = await prisma.user.create({ data: { email, name, refreshToken, password: '' } });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    const frontend = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
    return res.redirect(`${frontend}/auth/callback?token=${encodeURIComponent(token)}`);
  } catch (err) {
    console.error('Google OAuth callback error', err);
    res.status(500).json({ error: 'Google OAuth failed' });
  }
});

// Start Apple Sign In flow (redirect)
app.get('/auth/apple', (req: Request, res: Response) => {
  const clientId = process.env.APPLE_CLIENT_ID || '';
  const redirectUri = process.env.APPLE_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/apple/callback`;
  if (!clientId) return res.status(501).json({ error: 'Apple Sign-In not configured' });

  const state = crypto.randomBytes(12).toString('hex');
  const scope = encodeURIComponent('name email');
  const url = `https://appleid.apple.com/auth/authorize?response_type=code%20id_token&response_mode=form_post&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
  res.redirect(url);
});

// Apple callback (accepts posted id_token or code). For dev, we will accept id_token in body and decode without full verification.
app.post('/auth/apple/callback', express.urlencoded({ extended: true }), async (req: Request, res: Response) => {
  try {
    const idToken = (req.body && req.body.id_token) || (req.body && req.body.idToken) || null;
    if (!idToken) return res.status(400).json({ error: 'id_token required' });

    const parts = (idToken as string).split('.');
    if (parts.length !== 3 || !parts[1]) return res.status(400).json({ error: 'Invalid id_token' });
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    const email = payload.email as string;
    const name = payload.name || '';

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const refreshToken = crypto.randomBytes(48).toString('hex');
      user = await prisma.user.create({ data: { email, name, refreshToken, password: '' } });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const frontend = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
    return res.redirect(`${frontend}/auth/callback?token=${encodeURIComponent(token)}`);
  } catch (err) {
    console.error('Apple callback error', err);
    res.status(500).json({ error: 'Apple callback failed' });
  }
});

// --- Public Analysis Endpoints (No auth required) ---

app.post('/scrape-website', publicLimiter, websiteValidation.scrape, validationErrorHandler, async (req: Request, res: Response) => {
  const { url } = req.body;
  const result = await scrapeWebsite(url);
  if (result.error) return res.status(400).json({ error: result.error });
  res.json(result);
});

app.post('/parse-instagram', publicLimiter, async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'Instagram URL is required' });
  }
  
  try {
    const result = parseInstagramUrl(url);
    if ('error' in result) {
      return res.status(400).json(result);
    }
    
    // Scrape Instagram profile
    const profile = await scrapeInstagramProfile(result.username);
    const businessData = instagramProfileToBusinessData(profile) as any;
    
    // Analyze business data with AI intelligence
    const intelligence = await generateBusinessIntelligence(businessData as any);
    
    res.json({
      username: result.username,
      profile,
      businessData,
      intelligence,
      suggestedCaptions: [
        generateInstagramCaption(businessData.businessName, intelligence.services?.[0]),
        generateInstagramCaption(businessData.businessName, intelligence.services?.[1]),
      ],
    });
  } catch (err) {
    logger.error('Instagram parse error', { error: err });
    res.status(500).json({ error: 'Failed to parse Instagram profile' });
  }
});

app.post('/analyze-business', async (req: Request, res: Response) => {
  const { description, scraped } = req.body;
  if (!description && !scraped) return res.status(400).json({ error: 'Description or scraped info required' });
  const result = await analyzeBusiness(description || '', scraped) as any;
  if (result?.error) return res.status(400).json({ error: result.error });
  res.json(result);
});

// Free business audit (no auth required)
app.post('/free-audit-legacy', publicLimiter, async (req: Request, res: Response) => {
  try {
    const { url, instagramUrl, description } = req.body;
    if (!url && !instagramUrl && !description) {
      return res.status(400).json({ error: 'Please provide a URL, Instagram profile, or business description' });
    }

    let scrapedData: any = {};
    let businessIntelligence: any = {};

    // Scrape website if provided
    if (url) {
      const scrapeResult = await scrapeWebsite(url);
      scrapedData = scrapeResult;
      // Attach the URL for scoring/https check
      scrapedData.url = url;

      // Fetch PageSpeed / Lighthouse data and attach if available
    let pageSpeed: any;
    try {
      pageSpeed = await fetchPageSpeedData(url);
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch PageSpeed data';
      return res.status(502).json({ error: message });
    }
      if (pageSpeed) {
        scrapedData.pageSpeed = pageSpeed;
      }
    }

    // Scrape Instagram if provided
    if (instagramUrl) {
      const igResult = parseInstagramUrl(instagramUrl);
      if (!('error' in igResult)) {
        const profile = await scrapeInstagramProfile(igResult.username);
        scrapedData = { ...scrapedData, ...(instagramProfileToBusinessData(profile) as any) };
      }
    }

    // Generate business intelligence
    businessIntelligence = await generateBusinessIntelligence(scrapedData, description);

    // Calculate audit scores
    const auditScores = {
      seoScore: calculateSeoScore(scrapedData),
      brandScore: calculateBrandScore(businessIntelligence),
      leadCaptureScore: calculateLeadCaptureScore(scrapedData),
      overallScore: 0,
      recommendations: generateAuditRecommendations(businessIntelligence),
    };
    // Weighted overall score: SEO 50%, Brand 30%, Lead Capture 20%
    auditScores.overallScore = Math.round(
      auditScores.seoScore * 0.5 + auditScores.brandScore * 0.3 + auditScores.leadCaptureScore * 0.2
    );

    res.json({
      audit: auditScores,
      intelligence: businessIntelligence,
      message: `Your business audit is ready! Score: ${auditScores.overallScore}/100. Sign up to unlock your custom website and lead capture system.`,
    });
  } catch (err) {
    logger.error('Free audit error', { error: err });
    res.status(500).json({ error: 'Audit failed' });
  }
});

// Generate custom domain for business
app.post('/businesses/:businessId/generate-domain', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    if (!businessId) return res.status(400).json({ error: 'Business ID required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    // Generate custom domain
    const businessSlug = business.slug || generateSlug(business.name);
    const customDomain = `${businessSlug}.poweredbyape.ai`;

    // Update business with domain
    const updated = await prisma.business.update({
      where: { id: businessId },
      data: { slug: businessSlug, publishedUrl: customDomain },
    });

    res.json({
      domain: customDomain,
      slug: businessSlug,
      setupInstructions: `Your custom domain ${customDomain} is ready! Point your DNS to our servers for full access.`,
    });
  } catch (err) {
    logger.error('Domain generation error', { error: err });
    res.status(500).json({ error: 'Domain generation failed' });
  }
});

// Generate social media content
app.post('/businesses/:businessId/generate-social-content', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    if (!businessId) return res.status(400).json({ error: 'Business ID required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const analysis = business.analysis as any;
    const service = analysis?.services?.[0] || 'services';

    // Generate multiple captions
    const captions = [
      generateInstagramCaption(business.name, service, 'DM us to get started'),
      generateInstagramCaption(business.name, service, 'Click link in bio to book'),
      generateInstagramCaption(business.name, service, 'Limited spots available'),
    ];

    res.json({
      captions,
      hashtags: extractServices(business.description || '', business.name),
      scheduledFor: 'You can schedule these posts in Instagram Creator Studio',
    });
  } catch (err) {
    logger.error('Social content generation error', { error: err });
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// Generate deterministic WebsiteConfig from Business.analysis
app.post('/generate-website-config', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.body;
    if (!businessId) return res.status(400).json({ error: 'businessId is required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });

    const analysis = (business.analysis || {}) as any;
    // Map analysis.businessUnderstandingCanonical or inferred structure into WebsiteConfig
    const bu = analysis.businessUnderstandingCanonical || analysis.businessUnderstanding || analysis;

    const config = {
      hero: {
        title: (bu && bu.businessName) || business.name || 'Welcome',
        subtitle: (bu && (bu.heroSubtitle || bu.tagline)) || business.description || 'We help customers',
        ctaText: 'Get Started',
      },
      services: {
        title: 'Services',
        items: (bu && bu.services && bu.services.map((s: string) => ({ name: s, description: '' }))) || [],
      },
      about: {
        title: `About ${(bu && bu.businessName) || business.name || ''}`,
        content: (bu && bu.description) || business.description || '',
      },
      contact: {
        email: (analysis && analysis.scraped && analysis.scraped.email) || '',
        phone: (analysis && analysis.scraped && analysis.scraped.phone) || undefined,
      },
      theme: {
        primaryColor: (bu && bu.brandColors && bu.brandColors[0]) || '#f724de',
        secondaryColor: (bu && bu.brandColors && bu.brandColors[1]) || '#000000',
        font: 'Inter',
      }
    };

    // persist into dedicated generatedConfig field
    await prisma.business.update({ where: { id: businessId }, data: { generatedConfig: config } });

    res.json({ config });
  } catch (err) {
    logger.error('Generate website config error', { error: String(err) });
    res.status(500).json({ error: 'Failed to generate website config' });
  }
});

// ============================================================================
// WEBSITE GENERATION ENGINE ENDPOINTS
// ============================================================================

// GET /templates - List all available templates
app.get('/templates', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try {
    const templates = getAllTemplates();
    res.json({ templates });
  } catch (err) {
    logger.error('Get templates error', { error: String(err) });
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// GET /templates/:id - Get a specific template
app.get('/templates/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const templateId = paramToString(req.params.id);
    if (!templateId) return res.status(400).json({ error: 'Template ID required' });

    const template = getTemplateById(templateId);
    if (!template) return res.status(404).json({ error: 'Template not found' });

    res.json({ template });
  } catch (err) {
    logger.error('Get template error', { error: String(err) });
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// POST /businesses/:id/select-template - Auto-select template based on business
app.post('/businesses/:id/select-template', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.id);
    if (!businessId) return res.status(400).json({ error: 'Business ID required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    // Get business understanding data
    const analysis = (business.analysis || {}) as any;
    const bu = analysis.businessUnderstandingValidated || analysis.businessUnderstanding || {};

    const category = bu.category || 'general';
    const brandTone = bu.brandTone || 'professional';
    const services = bu.services || [];
    const hasImages = !!(bu.imageAssets?.hero || analysis.scraped?.images?.length);

    // Select template
    const result = selectTemplate(category, brandTone, services, hasImages);

    // Save to business
    await prisma.business.update({
      where: { id: businessId },
      data: {
        templateId: result.template.id,
        analysis: {
          ...analysis,
          templateSelection: {
            templateId: result.template.id,
            confidence: result.confidence,
            reason: result.reason,
            selectedAt: new Date(),
          },
        },
      },
    });

    res.json({
      templateId: result.template.id,
      template: result.template,
      confidence: result.confidence,
      reason: result.reason,
    });
  } catch (err) {
    logger.error('Select template error', { error: String(err) });
    res.status(500).json({ error: 'Failed to select template' });
  }
});

// POST /businesses/:id/generate-config - Generate full website config
app.post('/businesses/:id/generate-config', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.id);
    if (!businessId) return res.status(400).json({ error: 'Business ID required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    // Get business understanding
    const analysis = (business.analysis || {}) as any;
    const bu = analysis.businessUnderstandingValidated || analysis.businessUnderstanding;

    if (!bu) {
      return res.status(400).json({ error: 'Business understanding not found. Complete onboarding first.' });
    }

    const requestedTemplateId = paramToString((req.body as any)?.templateId);
    const excludeTemplateId = paramToString((req.body as any)?.excludeTemplateId);
    const variationSeed = paramToString((req.body as any)?.variationSeed) || `${Date.now()}`;

    // Get or select template
    let templateId = requestedTemplateId || business.templateId || undefined;
    if (!templateId) {
      const templateResult = selectTemplate(
        bu.category || 'general',
        bu.brandTone || 'professional',
        bu.services,
        !!(bu.imageAssets?.hero)
      );
      templateId = templateResult.template.id;
    }
    if (excludeTemplateId && templateId === excludeTemplateId) {
      const fallbackOrder = ['service-heavy', 'image-heavy', 'luxury'];
      const next = fallbackOrder.find((id) => id !== excludeTemplateId);
      if (next) templateId = next;
    }

    // Generate config
    const config = await generateWebsiteConfig({
      businessUnderstanding: {
        name: bu.name || business.name,
        category: bu.category || 'general',
        location: bu.location || '',
        services: bu.services || [],
        valueProposition: bu.valueProposition || business.description || '',
        targetAudience: bu.targetAudience || '',
        brandTone: bu.brandTone || 'professional',
        brandColors: bu.brandColors || [],
        trustSignals: bu.trustSignals || [],
        seoKeywords: bu.seoKeywords || [],
        contactPreferences: bu.contactPreferences || { email: true, phone: false, booking: true },
        logoUrl: bu.logoUrl,
        imageAssets: bu.imageAssets,
      },
      templateId,
      variationSeed,
      scrapedData: analysis.scraped || {},
    });

    // Save to business (schema stores generated config + analysis JSON)
    const nextAnalysis = {
      ...analysis,
      templateSelection: {
        ...(analysis?.templateSelection || {}),
        templateId,
        selectedAt: new Date().toISOString(),
      },
    } as any;

    await prisma.business.update({
      where: { id: businessId },
      data: {
        generatedConfig: config as any,
        analysis: nextAnalysis as any,
      },
    });

    res.json({ config, templateId });
  } catch (err) {
    logger.error('Generate config error', { error: String(err) });
    res.status(500).json({ error: 'Failed to generate website config' });
  }
});

// POST /businesses/:id/enrich-images - Enrich business with images
app.post('/businesses/:id/enrich-images', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.id);
    if (!businessId) return res.status(400).json({ error: 'Business ID required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const analysis = (business.analysis || {}) as any;
    const bu = analysis.businessUnderstandingValidated || analysis.businessUnderstanding || {};

    // Enrich images
    const enrichedCategoryQuery = [bu.category || 'business', ...(Array.isArray(bu.services) ? bu.services.slice(0, 2) : [])]
      .filter(Boolean)
      .join(' ');

    const result = await enrichImages({
      scrapedImages: analysis.scraped?.images,
      category: enrichedCategoryQuery || bu.category || 'business',
      seoKeywords: bu.seoKeywords || [],
      businessName: bu.name || business.name,
    });

    // Persist image assets inside analysis/business understanding records
    const updatedAnalysis = { ...analysis } as any;
    if (updatedAnalysis.businessUnderstandingValidated) {
      updatedAnalysis.businessUnderstandingValidated = {
        ...updatedAnalysis.businessUnderstandingValidated,
        imageAssets: result.assets,
      };
    }
    if (updatedAnalysis.businessUnderstanding) {
      updatedAnalysis.businessUnderstanding = {
        ...updatedAnalysis.businessUnderstanding,
        imageAssets: result.assets,
      };
    }
    updatedAnalysis.imageEnrichment = {
      source: result.source,
      count: result.count,
      enrichedAt: new Date(),
    };

    // Update business
    await prisma.business.update({
      where: { id: businessId },
      data: {
        analysis: updatedAnalysis as any,
      },
    });

    // Also update generated config if exists
    if (business.generatedConfig) {
      const config = business.generatedConfig as any;
      config.hero = config.hero || {};
      config.hero.heroImage = result.assets.hero;
      if (config.about) {
        config.about.image = result.assets.gallery[0];
      }
      await prisma.business.update({
        where: { id: businessId },
        data: { generatedConfig: config },
      });
    }

    res.json({
      imageAssets: result.assets,
      source: result.source,
      count: result.count,
    });
  } catch (err) {
    logger.error('Enrich images error', { error: String(err) });
    res.status(500).json({ error: 'Failed to enrich images' });
  }
});

// POST /businesses/:id/generate-website - Start async website generation
app.post('/businesses/:id/generate-website', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.id);
    if (!businessId) return res.status(400).json({ error: 'Business ID required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    // Check if already generating
    if (business.generationStatus === 'processing' || business.generationStatus === 'queued') {
      return res.status(409).json({
        error: 'Website generation already in progress',
        status: business.generationStatus,
        step: business.generationStep,
      });
    }

    // Get business understanding
    const analysis = (business.analysis || {}) as any;
    const bu = analysis.businessUnderstandingValidated || analysis.businessUnderstanding;

    if (!bu) {
      return res.status(400).json({ error: 'Business understanding not found. Complete onboarding first.' });
    }

    // Get desiredFeatures from questionnaire answers
    const questionnaire = analysis.questionnaire || {};
    const desiredFeatures = questionnaire.desiredFeatures || bu.desiredFeatures || [];

    // Prepare job data
    const jobData: WebsiteGenerationJobData = {
      businessId,
      userId: req.userId!,
      businessUnderstanding: {
        name: bu.name || business.name,
        category: bu.category || 'general',
        location: bu.location || '',
        services: bu.services || [],
        valueProposition: bu.valueProposition || '',
        targetAudience: bu.targetAudience || '',
        brandTone: bu.brandTone || 'professional',
        brandColors: bu.brandColors || [],
        trustSignals: bu.trustSignals || [],
        seoKeywords: bu.seoKeywords || [],
        contactPreferences: bu.contactPreferences || { email: true, phone: false, booking: true },
        desiredFeatures,
        logoUrl: bu.logoUrl,
      },
      ...(business.url && { sourceUrl: business.url }),
    };

    // Check if Redis/BullMQ is available
    try {
      const { jobId } = await enqueueWebsiteGeneration(jobData);

      // Update business status
      await prisma.business.update({
        where: { id: businessId },
        data: {
          generationStatus: 'queued',
          generationStep: 'queued',
        },
      });

      res.json({ jobId, status: 'queued' });
    } catch (queueError) {
      // Fallback to synchronous generation if queue not available
      logger.warn('Queue not available, falling back to sync generation');

      await prisma.business.update({
        where: { id: businessId },
        data: {
          generationStatus: 'processing',
          generationStep: 'selecting_template',
        },
      });

      // Select template
      const templateResult = selectTemplate(
        bu.category || 'general',
        bu.brandTone || 'professional',
        bu.services,
        false
      );

      await prisma.business.update({
        where: { id: businessId },
        data: { generationStep: 'generating_config' },
      });

      // Generate config
      const config = await generateWebsiteConfig({
        businessUnderstanding: {
          name: bu.name || business.name,
          category: bu.category || 'general',
          location: bu.location || '',
          services: bu.services || [],
          valueProposition: bu.valueProposition || '',
          targetAudience: bu.targetAudience || '',
          brandTone: bu.brandTone || 'professional',
          brandColors: bu.brandColors || [],
          trustSignals: bu.trustSignals || [],
          seoKeywords: bu.seoKeywords || [],
          contactPreferences: bu.contactPreferences || { email: true, phone: false, booking: true },
          desiredFeatures,
          logoUrl: bu.logoUrl,
        },
        templateId: templateResult.template.id,
        scrapedData: analysis.scraped || {},
      });

      await prisma.business.update({
        where: { id: businessId },
        data: { generationStep: 'enriching_images' },
      });

      // Enrich images (sync fallback)
      const imageAssets = enrichImagesSync(bu.category || 'business');
      config.hero.heroImage = imageAssets.hero;

      // Save final result
      await prisma.business.update({
        where: { id: businessId },
        data: {
          templateId: templateResult.template.id,
          websiteConfig: config as any,
          generatedConfig: config as any,
          imageAssets: imageAssets as any,
          generationStatus: 'completed',
          generationStep: null,
        },
      });

      res.json({
        status: 'completed',
        templateId: templateResult.template.id,
        config,
      });
    }
  } catch (err) {
    logger.error('Generate website error', { error: String(err) });
    res.status(500).json({ error: 'Failed to start website generation' });
  }
});

// GET /businesses/:id/website-status - Check website generation status
app.get('/businesses/:id/website-status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.id);
    if (!businessId) return res.status(400).json({ error: 'Business ID required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    // Map generation step to user-friendly message
    const stepMessages: Record<string, string> = {
      queued: 'Preparing to generate your website...',
      scraping: 'Analyzing your existing website...',
      analyzing: 'Understanding your business...',
      selecting_template: 'Selecting the perfect template...',
      generating_config: 'Generating website content...',
      enriching_images: 'Optimizing images...',
      completed: 'Website generation complete!',
      failed: 'Generation failed. Please try again.',
    };

    const analysis = (business.analysis || {}) as any;
    const status = analysis?.generation?.status || 'idle';
    const step = analysis?.generation?.step || status;
    const imageAssets =
      analysis?.businessUnderstandingValidated?.imageAssets ||
      analysis?.businessUnderstanding?.imageAssets ||
      null;
    const templateId =
      analysis?.templateSelection?.templateId ||
      (business.generatedConfig as any)?.templateId ||
      null;

    res.json({
      status,
      step,
      message: stepMessages[step] || stepMessages[status] || 'Processing...',
      websiteConfig: status === 'completed' ? business.generatedConfig : null,
      templateId,
      imageAssets,
    });
  } catch (err) {
    logger.error('Get website status error', { error: String(err) });
    res.status(500).json({ error: 'Failed to get website status' });
  }
});

// GET /businesses/:id/website-config - Get the generated website config
app.get('/businesses/:id/website-config', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.id);
    if (!businessId) return res.status(400).json({ error: 'Business ID required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    if (!business.generatedConfig) {
      return res.status(404).json({ error: 'Website config not generated yet' });
    }

    const analysis = (business.analysis || {}) as any;
    const templateId =
      analysis?.templateSelection?.templateId ||
      (business.generatedConfig as any)?.templateId ||
      null;
    const imageAssets =
      analysis?.businessUnderstandingValidated?.imageAssets ||
      analysis?.businessUnderstanding?.imageAssets ||
      null;

    res.json({
      config: business.generatedConfig,
      templateId,
      imageAssets,
      generationStatus: analysis?.generation?.status || 'ready',
    });
  } catch (err) {
    logger.error('Get website config error', { error: String(err) });
    res.status(500).json({ error: 'Failed to get website config' });
  }
});

// ============================================================================
// END WEBSITE GENERATION ENGINE ENDPOINTS
// ============================================================================

// --- Save validated BusinessUnderstanding from recap screen ---
app.post('/businesses/save-business-understanding', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId, businessUnderstanding } = req.body;
    const userId = req.userId!;

    if (!businessId || !businessUnderstanding) {
      return res.status(400).json({ error: 'businessId and businessUnderstanding are required' });
    }

    // Verify business belongs to user
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    if (business.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this business' });
    }

    // Validate the structure
    const validation = validateBUStructure(businessUnderstanding);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid business understanding structure',
        details: validation.errors,
      });
    }

    // Save validated JSON to business.analysis
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        analysis: {
          ...((business.analysis as any) || {}),
          businessUnderstandingValidated: businessUnderstanding,
          validatedAt: new Date(),
        },
        name: businessUnderstanding.name, // Also update business name
        description: businessUnderstanding.valueProposition,
      },
    });

    res.json({
      success: true,
      businessId: updatedBusiness.id,
      message: 'Business understanding saved successfully',
      data: businessUnderstanding,
    });
  } catch (err) {
    logger.error('Save business understanding error', { error: String(err) });
    res.status(500).json({ error: 'Failed to save business understanding' });
  }
});

// Public website data (no auth) - for preview and published sites
app.get('/businesses/:id/public', async (req: Request, res: Response) => {
  try {
    const id = paramToString(req.params.id);
    if (!id) return res.status(400).json({ error: 'Business id is required' });

    const business = await prisma.business.findUnique({
      where: { id },
      include: { bookings: true, availableSlots: true },
    });

    if (!business) return res.status(404).json({ error: 'Business not found' });

    const { googleCalendarTokens, outlookCalendarTokens, apiKeysEncrypted, ...publicData } = business;
    res.json(publicData);
  } catch (err) {
    logger.error('Public business fetch error', { error: err });
    res.status(500).json({ error: 'Failed to fetch business' });
  }
});

// Public lead submission by businessId (no auth) - for website lead forms
app.post('/businesses/:businessId/public/leads', publicLimiter, async (req: Request, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const { name, email, company, message } = req.body;

    if (!businessId) return res.status(400).json({ error: 'Business id is required' });
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });

    const lead = await prisma.lead.create({
      data: { businessId, name, email, company, message, source: 'web' },
    });
    await sendEmailNotification(lead, business);
    res.status(201).json(lead);
  } catch (err) {
    console.error('Public lead creation error:', err);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// Public booking submission by businessId (no auth) - for website booking forms
app.post('/businesses/:businessId/public/bookings', publicLimiter, async (req: Request, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const { name, email, date, time } = req.body;

    if (!businessId) return res.status(400).json({ error: 'Business id is required' });
    if (!name || !email || !date || !time) {
      return res.status(400).json({ error: 'Name, email, date, and time are required' });
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });

    const isAvailable = await isTimeSlotAvailable(businessId, date, time);
    if (!isAvailable) return res.status(409).json({ error: 'Time slot is not available' });

    const booking = await prisma.booking.create({
      data: { businessId, name, email, date, time },
    });
    res.status(201).json(booking);
  } catch (err: any) {
    if (err?.code === 'P2002') return res.status(409).json({ error: 'Time slot already booked' });
    console.error('Public booking creation error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// --- Business Endpoints (Protected) ---

// Create Business
app.post('/businesses', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { url, name, description } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Website or Instagram URL is required' });
    }

    let scraped;
    try {
      scraped = url ? await scrapeWebsite(url) : undefined;
    } catch {
      scraped = undefined;
    }

    let analysis: any;
    try {
      analysis = await analyzeBusiness(description || '', scraped);
    } catch {
      analysis = undefined;
    }

    // Ensure analysis contains a deterministic, validated BusinessUnderstanding
    try {
      if (analysis && typeof analysis === 'object') {
        // allow analysis.businessUnderstanding or top-level
        const bu = analysis.businessUnderstanding || analysis;
        let validationResult = validateBUStructure(bu);
        if (!validationResult.valid) {
          // Try to coerce minimal structure and re-validate
          const inferred = {
            businessName: name || (bu && bu.businessName) || 'My Business',
            industry: (bu && bu.industry) || 'general',
            services: (bu && bu.services) || [],
            location: (bu && bu.location) || '',
            brandTone: (bu && bu.brandTone) || 'friendly',
            brandColors: (bu && bu.brandColors) || [],
            logoUrl: (bu && bu.logoUrl) || undefined,
            contactPreferences: (bu && bu.contactPreferences) || { email: true, phone: false, booking: true },
            seoInsights: (bu && bu.seoInsights) || undefined,
          };
          validationResult = validateBUStructure(inferred);
          if (validationResult.valid) {
            analysis.businessUnderstanding = inferred;
          }
        }

        // Store a canonical deterministic version as analysis.businessUnderstandingCanonical
        try {
          const canonical = JSON.stringify(analysis.businessUnderstanding || bu, Object.keys(analysis.businessUnderstanding || bu).sort());
          analysis.businessUnderstandingCanonical = JSON.parse(canonical);
        } catch (err) {
          // swallow - not critical
          logger.warn('Deterministic stringify failed', { error: String(err) });
        }
      }
    } catch (err) {
      logger.warn('BusinessUnderstanding validation error', { error: String(err) });
    }

    const userId = req.userId!;
    let safeAnalysis: any = analysis;
    if (analysis && typeof analysis === 'object') {
      try {
        safeAnalysis = JSON.parse(JSON.stringify(analysis));
      } catch {
        safeAnalysis = undefined;
      }
    }

    const business = await prisma.business.create({
      data: {
        userId,
        name: name || 'My Business',
        url,
        description,
        publishedUrl: `https://${Date.now()}.salesape.ai/web`,
        analysis: safeAnalysis,
      }
    });

    console.log(`[Business Created] ID: ${business.id}, Name: ${business.name}, User: ${req.userId}`);
    res.status(201).json(business);
  } catch (err) {
    logger.error('Business creation error', { error: err });

    if (isDevelopment) {
      try {
        const { url, name, description } = req.body;
        const fallback = await prisma.business.create({
          data: {
            userId: req.userId!,
            name: name || 'My Business',
            url,
            description,
            publishedUrl: `https://${Date.now()}.salesape.ai/web`,
          },
        });
        return res.status(201).json(fallback);
      } catch (fallbackErr) {
        logger.error('Business creation fallback failed', { error: fallbackErr });
      }
    }

    res.status(500).json({
      error: 'Failed to create business',
      ...(process.env.NODE_ENV === 'development' && {
        details: (err as any)?.message || String(err),
      }),
    });
  }
});

// Get Business by ID
app.get('/businesses/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = paramToString(req.params.id);
    if (!id) return res.status(400).json({ error: 'Business id is required' });

    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        leads: true,
        bookings: true,
        availableSlots: true,
      }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check ownership
    const userId = req.userId!;
    if (business.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(business);
  } catch (err) {
    logger.error('Business lookup error', { error: err });
    res.status(500).json({ error: 'Failed to fetch business' });
  }
});

// Update business (partial)
app.patch('/businesses/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = paramToString(req.params.id);
    if (!id) return res.status(400).json({ error: 'Business id is required' });

    const business = await prisma.business.findUnique({ where: { id } });
    if (!business) return res.status(404).json({ error: 'Business not found' });

    const userId = req.userId!;
    if (business.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

    const {
      name,
      description,
      analysis,
      branding,
      phone,
      address,
      generatedConfig,
      isPublished,
      publishedUrl,
      publishedAt,
    } = req.body as any;
    const data: any = {};
    if (typeof name === 'string') data.name = name;
    if (typeof description === 'string') data.description = description;
    if (typeof phone === 'string') data.phone = phone;
    if (typeof address === 'string') data.address = address;
    if (analysis && typeof analysis === 'object' && analysis !== null) {
      data.analysis = Object.assign({}, (business.analysis || {}), analysis as Record<string, any>);
    }
    if (branding && typeof branding === 'object' && branding !== null) {
      const existingConfig = (business.generatedConfig as Record<string, any>) || {};
      data.generatedConfig = Object.assign({}, existingConfig, { branding: Object.assign({}, existingConfig.branding || {}, branding as Record<string, any>) });
    }
    if (generatedConfig && typeof generatedConfig === 'object' && generatedConfig !== null) {
      const existingConfig = (business.generatedConfig as Record<string, any>) || {};
      data.generatedConfig = Object.assign({}, existingConfig, generatedConfig as Record<string, any>);
    }
    if (typeof isPublished === 'boolean') data.isPublished = isPublished;
    if (publishedUrl === null || typeof publishedUrl === 'string') data.publishedUrl = publishedUrl;
    if (publishedAt === null || typeof publishedAt === 'string' || publishedAt instanceof Date) {
      data.publishedAt = publishedAt ? new Date(publishedAt) : null;
    }

    if (Object.keys(data).length === 0) return res.status(400).json({ error: 'No valid fields to update' });

    const updated = await prisma.business.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    logger.error('Business update error', { error: err });
    res.status(500).json({ error: 'Failed to update business' });
  }
});

// Delete business (and all related records)
app.delete('/businesses/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = paramToString(req.params.id);
    if (!id) return res.status(400).json({ error: 'Business id is required' });

    const userId = req.userId!;
    
    console.log(`[Delete Business] START - ID: ${id}, User: ${userId}`);

    // Verify business exists and user owns it
    const business = await prisma.business.findUnique({ 
      where: { id },
      select: { id: true, name: true, userId: true }
    });
    
    if (!business) {
      console.error(`[Delete Business] NOT FOUND`);
      return res.status(404).json({ error: 'Business not found' });
    }

    if (business.userId !== userId) {
      console.error(`[Delete Business] UNAUTHORIZED - Owner: ${business.userId}`);
      return res.status(403).json({ error: 'Unauthorized' });
    }

    console.log(`[Delete Business] Verified ownership - Name: ${business.name}`);

    // Delete business - database CASCADE will handle related records
    console.log(`[Delete Business] Attempting direct delete with CASCADE...`);
    
    const deleted = await prisma.business.delete({ where: { id } });
    
    console.log(`[Delete Business] SUCCESS - Deleted: ${deleted.name}`);

    res.json({
      message: 'Website deleted successfully',
      business: deleted,
    });
  } catch (err: any) {
    console.error(`[Delete Business] ERROR:`, {
      code: err?.code,
      message: err?.message,
      meta: err?.meta,
      stack: err?.stack
    });
    
    // Provide more detailed error response
    let errorDetails = 'Failed to delete business';
    if (err?.code === 'P2014') {
      errorDetails = 'Cannot delete: related records exist';
    } else if (err?.code === 'P2025') {
      errorDetails = 'Business record not found';
    } else if (err?.message) {
      errorDetails = err.message;
    }
    
    logger.error('Business delete error', { 
      error: err, 
      businessId: req.params.id,
      userId: req.userId
    });
    
    res.status(500).json({ 
      error: 'Failed to delete business',
      details: errorDetails,
      code: err?.code
    });
  }
});

// Upload image asset for website preview editing
app.post('/businesses/:id/assets/upload-image', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = paramToString(req.params.id);
    if (!id) return res.status(400).json({ error: 'Business id is required' });

    const business = await prisma.business.findUnique({ where: { id } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const { fileName, mimeType, dataBase64 } = req.body || {};
    if (!fileName || !mimeType || !dataBase64) {
      return res.status(400).json({ error: 'fileName, mimeType, and dataBase64 are required' });
    }

    const type = String(mimeType).toLowerCase();
    if (!type.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files are supported' });
    }

    const base64Payload = String(dataBase64).includes(',')
      ? String(dataBase64).split(',').pop()!
      : String(dataBase64);
    const fileBuffer = Buffer.from(base64Payload, 'base64');

    const maxBytes = 10 * 1024 * 1024;
    if (!fileBuffer.length || fileBuffer.length > maxBytes) {
      return res.status(400).json({ error: 'Image must be between 1 byte and 10MB' });
    }

    const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `website-images/${id}/${Date.now()}-${safeName}`;
    const upload = await storageService.uploadFile('ASSETS', storagePath, fileBuffer, {
      contentType: String(mimeType),
      upsert: false,
      metadata: {
        source: 'website_preview_edit',
        businessId: id,
        originalFileName: safeName,
      },
    });

    res.status(201).json({
      message: 'Image uploaded successfully',
      url: upload.publicUrl,
      storagePath: upload.path,
    });
  } catch (err) {
    logger.error('Website image upload error', { error: String(err) });
    res.status(500).json({ error: 'Failed to upload image' });
  }
});


// Get all Businesses for user
app.get('/businesses', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const businesses = await prisma.business.findMany({
      where: { userId },
      include: {
        leads: true,
        bookings: true,
      }
    });
    res.json(businesses);
  } catch (err) {
    logger.error('Businesses fetch error', { error: err });
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

// Get Business Template
app.get('/businesses/:id/template', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = paramToString(req.params.id);
    if (!id) return res.status(400).json({ error: 'Business id is required' });

    const business = await prisma.business.findUnique({
      where: { id }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const userId = req.userId!;
    if (business.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const analysis = business.analysis || {};
    const analysisAny = analysis as any;
    const businessType = (analysisAny['Business type'] || analysisAny.businessType || '').toLowerCase();

    const templates = [
      {
        id: 'modern',
        name: 'Modern Professional',
        description: 'Clean, corporate design perfect for services and B2B',
        preview: '/templates/modern.png',
        style: { 
          bgColor: '#ffffff',
          textColor: '#1a202c', 
          accent: '#0066cc', 
          secondary: '#f0f4f8',
          font: 'Inter, -apple-system, sans-serif',
          headingFont: 'Inter, -apple-system, sans-serif'
        },
        layout: 'modern',
        sections: [
          { 
            type: 'feature-grid',
            heading: 'Our Services', 
            content: 'Discover what we offer',
            items: ['Professional Solutions', 'Expert Results', 'Client Focused']
          },
          { 
            type: 'two-column',
            heading: 'About Our Business', 
            content: business.description || 'Professional services tailored to your needs' 
          },
          { 
            type: 'cta-section',
            heading: 'Ready to Get Started?', 
            content: 'Let\'s work together to achieve your goals',
            buttonText: 'Schedule a Consultation'
          },
        ],
        seoMeta: {
          keywords: 'professional services, consulting, business solutions',
          structuredData: 'LocalBusiness'
        }
      },
      {
        id: 'creative',
        name: 'Creative Portfolio',
        description: 'Bold, image-first design for creators and agencies',
        preview: '/templates/creative.png',
        style: { 
          bgColor: '#0a0a0a',
          textColor: '#ffffff', 
          accent: '#ff4444', 
          secondary: '#1a1a1a',
          font: 'Montserrat, sans-serif',
          headingFont: 'Montserrat, sans-serif'
        },
        layout: 'creative',
        sections: [
          { 
            type: 'hero-large',
            heading: 'Unleash Your Creativity', 
            content: business.description || 'Bold designs that stand out'
          },
          { 
            type: 'gallery-grid',
            heading: 'Our Work', 
            content: 'Showcase of recent projects'
          },
          { 
            type: 'testimonial-carousel',
            heading: 'What Clients Say',
            items: ['Exceptional work and attention to detail', 'Transformed our brand', 'Highly recommended']
          },
          { 
            type: 'cta-full',
            heading: 'Let\'s Create Something Amazing', 
            content: 'Ready to bring your vision to life?',
            buttonText: 'Start Your Project'
          },
        ],
        seoMeta: {
          keywords: 'creative design, portfolio, agency services',
          structuredData: 'CreativeWork'
        }
      },
      {
        id: 'minimal',
        name: 'Minimal Elegant',
        description: 'Luxury minimalist design with sophisticated appeal',
        preview: '/templates/minimal.png',
        style: { 
          bgColor: '#fafaf8',
          textColor: '#2c2c2c', 
          accent: '#8b7355', 
          secondary: '#f0ede6',
          font: 'Georgia, serif',
          headingFont: 'Playfair Display, serif'
        },
        layout: 'minimal',
        sections: [
          { 
            type: 'hero-centered',
            heading: 'Welcome', 
            subheading: 'Timeless elegance in every detail',
            content: business.description || 'Experience sophistication'
          },
          { 
            type: 'feature-minimal',
            heading: 'Our Offering',
            items: ['Crafted Excellence', 'Premium Quality', 'Attention to Detail']
          },
          { 
            type: 'quote-section',
            heading: 'A Philosophy',
            content: 'Simplicity is the ultimate sophistication',
            author: business.name || 'Our Brand'
          },
          { 
            type: 'cta-centered',
            heading: 'Begin Your Journey', 
            content: 'Discover the difference quality makes',
            buttonText: 'Explore More'
          },
        ],
        seoMeta: {
          keywords: 'luxury, premium, elegance, sophistication',
          structuredData: 'LocalBusiness'
        }
      },
      {
        id: 'bold',
        name: 'Bold & Vibrant',
        description: 'Eye-catching, energetic design for maximum engagement',
        preview: '/templates/bold.png',
        style: { 
          bgColor: '#fef9f0',
          textColor: '#1a1a1a', 
          accent: '#ff6b35', 
          secondary: '#ffc857',
          tertiary: '#004e89',
          font: 'Poppins, -apple-system, sans-serif',
          headingFont: 'Poppins, -apple-system, sans-serif'
        },
        layout: 'bold',
        sections: [
          { 
            type: 'hero-bold',
            heading: 'Welcome to Something Special', 
            content: business.description || 'Experience bold innovation',
            backgroundGradient: true
          },
          { 
            type: 'benefit-cards',
            heading: 'Why Choose Us',
            items: [
              { title: 'Fast & Efficient', icon: '⚡' },
              { title: 'Quality Assured', icon: '✓' },
              { title: 'Customer Focused', icon: '❤' }
            ]
          },
          { 
            type: 'social-proof',
            heading: 'Trusted by Many',
            stats: [
              { number: '500+', label: 'Happy Clients' },
              { number: '10+', label: 'Years Experience' },
              { number: '100%', label: 'Satisfaction' }
            ]
          },
          { 
            type: 'cta-bold',
            heading: 'Don\'t Wait, Join Us Today!', 
            buttonText: 'Get Started Now',
            buttonSize: 'large'
          },
        ],
        seoMeta: {
          keywords: 'dynamic, innovative, solution-focused',
          structuredData: 'LocalBusiness'
        }
      },
      {
        id: 'sleek',
        name: 'Sleek & Dark',
        description: 'Modern tech-forward design with premium feel',
        preview: '/templates/sleek.png',
        style: { 
          bgColor: '#0f1419',
          textColor: '#e2e8f0', 
          accent: '#a78bfa', 
          secondary: '#1e293b',
          tertiary: '#3b82f6',
          font: 'Ubuntu, -apple-system, sans-serif',
          headingFont: 'Ubuntu, -apple-system, sans-serif'
        },
        layout: 'sleek',
        sections: [
          { 
            type: 'hero-tech',
            heading: 'Welcome to the Future', 
            content: business.description || 'Advanced solutions for modern challenges',
            hasGradient: true
          },
          { 
            type: 'feature-tech',
            heading: 'Core Features',
            items: ['Advanced Technology', 'Seamless Integration', 'Data Security']
          },
          { 
            type: 'timeline-section',
            heading: 'Our Journey',
            content: 'Building excellence step by step'
          },
          { 
            type: 'cta-tech',
            heading: 'Ready for Next-Gen Solutions?', 
            content: 'Transform your business with cutting-edge technology',
            buttonText: 'Explore Solutions'
          },
        ],
        seoMeta: {
          keywords: 'technology, innovation, digital solutions',
          structuredData: 'SoftwareApplication'
        }
      },
    ];

    let recommended = templates[0];
    if (businessType.includes('salon') || businessType.includes('spa')) {
      recommended = templates.find(t => t.id === 'minimal') || templates[0];
    } else if (businessType.includes('consultant') || businessType.includes('agency')) {
      recommended = templates.find(t => t.id === 'modern') || templates[0];
    } else if (businessType.includes('artist') || businessType.includes('creative')) {
      recommended = templates.find(t => t.id === 'creative') || templates[0];
    }

    // Fetch real testimonials from database (Prisma client fix pending)
    let testimonials: any[] = [];
    try {
      if (prisma && prisma.testimonial) {
        testimonials = await prisma.testimonial.findMany({
          where: { businessId: id, isPublished: true },
          orderBy: { order: 'asc' }
        });
      }
    } catch (testimonyErr) {
      console.log('Testimonials query skipped, using empty array');
    }

    // Fetch branding data (which includes scraped images)
    const brandingData = ((business.generatedConfig as Record<string, any>)?.branding) || {};

    // Get imageAssets from business record
    let imageAssets = (business.imageAssets as { hero?: string; gallery?: string[] }) || {};

    // If no user images, fetch stock images from Unsplash for preview
    if (!imageAssets.gallery?.length || !imageAssets.hero) {
      try {
        const services = (analysis as any)?.services || [];
        const stockImages = await getStockImagesForCategory(businessType, services);
        const heroValue: string | undefined = imageAssets.hero || stockImages.hero || undefined;
        imageAssets = {
          ...(heroValue && { hero: heroValue }),
          gallery: imageAssets.gallery?.length ? imageAssets.gallery : (stockImages.gallery || []),
        } as any;
        console.log('📸 Fetched Unsplash stock images for preview:', {
          hero: !!stockImages.hero,
          galleryCount: stockImages.gallery?.length || 0
        });
      } catch (unsplashErr) {
        console.log('Unsplash fetch skipped:', unsplashErr);
      }
    }

    // Get desiredFeatures from questionnaire
    const questionnaire = (analysis as any)?.questionnaire || {};
    const desiredFeatures: string[] = questionnaire.desiredFeatures || [];

    console.log('🎯 Template endpoint - analysis:', JSON.stringify(analysis, null, 2));
    console.log('🎯 Template endpoint - questionnaire:', JSON.stringify(questionnaire, null, 2));
    console.log('🎯 Template endpoint - desiredFeatures:', desiredFeatures);

    // Helper to check if a feature was selected
    const hasFeature = (feature: string) =>
      desiredFeatures.some((f: string) => f.toLowerCase().includes(feature.toLowerCase()));

    // Dynamically add sections to templates based on selected features
    const templatesWithFeatures = templates.map(template => {
      const additionalSections: any[] = [];
      const existingSectionTypes = template.sections.map((s: any) => s.type);

      // Add testimonial section if selected and not already present
      if (hasFeature('testimonial') && !existingSectionTypes.includes('testimonial-carousel')) {
        additionalSections.push({
          type: 'testimonial-carousel',
          heading: 'What Our Clients Say',
          items: ['Great service and professional team', 'Exceeded our expectations', 'Highly recommended']
        });
      }

      // Add gallery section if selected and not already present
      if (hasFeature('gallery') && !existingSectionTypes.includes('gallery-grid')) {
        additionalSections.push({
          type: 'gallery-grid',
          heading: 'Our Gallery',
          content: 'See our work in action'
        });
      }

      // Add pricing section if selected and not already present
      if (hasFeature('pricing') && !existingSectionTypes.includes('pricing-table')) {
        additionalSections.push({
          type: 'pricing-table',
          heading: 'Our Pricing',
          content: 'Transparent pricing for all services'
        });
      }

      // Add blog preview section if selected
      if (hasFeature('blog') && !existingSectionTypes.includes('blog-preview')) {
        additionalSections.push({
          type: 'blog-preview',
          heading: 'Latest Articles',
          content: 'Insights and updates from our team'
        });
      }

      // Add live chat indicator if selected
      if (hasFeature('chat') && !existingSectionTypes.includes('live-chat')) {
        additionalSections.push({
          type: 'live-chat',
          heading: 'Live Chat Support',
          content: 'We\'re here to help! Chat with us anytime.'
        });
      }

      // Insert additional sections before the last section (usually CTA)
      if (additionalSections.length > 0) {
        const sections = [...template.sections];
        // Insert before the last section (typically CTA)
        const insertIndex = Math.max(sections.length - 1, 0);
        sections.splice(insertIndex, 0, ...additionalSections);
        return { ...template, sections };
      }

      return template;
    });

    // Find the recommended template from the modified templates
    const recommendedWithFeatures = recommended ? (templatesWithFeatures.find(t => t.id === recommended.id) || templatesWithFeatures[0]) : templatesWithFeatures[0];

    res.json({
      templates: templatesWithFeatures,
      recommended: recommendedWithFeatures,
      businessType,
      analysis,
      testimonials,
      desiredFeatures,
      branding: {
        ...brandingData,
        // Include gallery images from imageAssets for templates to use
        images: imageAssets.gallery?.map((url, i) => ({ url, title: `Gallery ${i + 1}` })) || [],
        heroImage: imageAssets.hero,
      },
      imageAssets,
    });
  } catch (err) {
    console.error('Template fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// --- Testimonials Endpoints (Protected) ---

// Create Testimonial
app.post('/businesses/:businessId/testimonials', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const { clientName, clientTitle, content, rating, imageUrl } = req.body;

    if (!businessId || !clientName || !content) {
      return res.status(400).json({ error: 'Business ID, client name, and content are required' });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const userId = req.userId!;
    if (business.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        businessId,
        clientName,
        clientTitle: clientTitle || null,
        content,
        rating: rating || null,
        imageUrl: imageUrl || null,
      }
    });

    res.status(201).json(testimonial);
  } catch (err) {
    console.error('Testimonial creation error:', err);
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

// Get Testimonials for a Business
app.get('/businesses/:businessId/testimonials', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);

    if (!businessId) {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const userId = req.userId!;
    if (business.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const testimonials = await prisma.testimonial.findMany({
      where: { businessId, isPublished: true },
      orderBy: { order: 'asc' }
    });

    res.json(testimonials);
  } catch (err) {
    console.error('Testimonials fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// Update Testimonial
app.patch('/businesses/:businessId/testimonials/:testimonialId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const testimonialId = paramToString(req.params.testimonialId);
    const { clientName, clientTitle, content, rating, imageUrl, isPublished, order } = req.body;

    if (!businessId || !testimonialId) {
      return res.status(400).json({ error: 'Business ID and testimonial ID are required' });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const userId = req.userId!;
    if (business.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const testimonial = await prisma.testimonial.update({
      where: { id: testimonialId },
      data: {
        ...(clientName && { clientName }),
        ...(clientTitle !== undefined && { clientTitle }),
        ...(content && { content }),
        ...(rating !== undefined && { rating }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isPublished !== undefined && { isPublished }),
        ...(order !== undefined && { order }),
      }
    });

    res.json(testimonial);
  } catch (err) {
    console.error('Testimonial update error:', err);
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

// Delete Testimonial
app.delete('/businesses/:businessId/testimonials/:testimonialId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const testimonialId = paramToString(req.params.testimonialId);

    if (!businessId || !testimonialId) {
      return res.status(400).json({ error: 'Business ID and testimonial ID are required' });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const userId = req.userId!;
    if (business.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.testimonial.delete({
      where: { id: testimonialId }
    });

    res.json({ message: 'Testimonial deleted successfully' });
  } catch (err) {
    console.error('Testimonial deletion error:', err);
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

// --- Lead Endpoints (Protected) ---

// Create Lead for a Business
app.post('/businesses/:businessId/leads', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const { name, email, company, message } = req.body;

    if (!businessId) return res.status(400).json({ error: 'Business id is required' });

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const userId = req.userId!;
    if (business.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const lead = await prisma.lead.create({
      data: {
        businessId,
        name,
        email,
        company,
        message,
      }
    });

    await sendEmailNotification(lead, business);
    res.status(201).json(lead);
  } catch (err) {
    console.error('Lead creation error:', err);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// Get Leads for a Business
app.get('/businesses/:businessId/leads', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    if (!businessId) return res.status(400).json({ error: 'Business id is required' });

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const userId = req.userId!;
    if (business.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const leads = await prisma.lead.findMany({
      where: { businessId }
    });

    res.json(leads);
  } catch (err) {
    console.error('Leads fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// --- Booking Endpoints (Protected) ---

// Create Booking with availability check
app.post('/businesses/:businessId/bookings', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const { name, email, date, time } = req.body;

    if (!businessId) return res.status(400).json({ error: 'Business id is required' });

    if (!name || !email || !date || !time) {
      return res.status(400).json({ error: 'Name, email, date, and time are required' });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const userId = req.userId!;
    if (business.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check availability and conflicts
    const isAvailable = await isTimeSlotAvailable(businessId, date, time);
    if (!isAvailable) {
      return res.status(409).json({ error: 'Time slot is not available' });
    }

    const booking = await prisma.booking.create({
      data: {
        businessId,
        name,
        email,
        date,
        time,
      }
    });

    res.status(201).json(booking);
  } catch (err: any) {
    console.error('Booking creation error:', err);
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Time slot already booked' });
    }
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get Bookings for a Business
app.get('/businesses/:businessId/bookings', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    if (!businessId) return res.status(400).json({ error: 'Business id is required' });

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const userId = req.userId!;
    if (business.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const bookings = await prisma.booking.findMany({
      where: { businessId }
    });

    res.json(bookings);
  } catch (err) {
    console.error('Bookings fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Delete Booking
app.delete('/businesses/:businessId/bookings/:bookingId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const bookingId = paramToString(req.params.bookingId);

    if (!businessId || !bookingId) {
      return res.status(400).json({ error: 'Business id and booking id are required' });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const userId = req.userId!;
    if (business.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.businessId !== businessId) {
      return res.status(403).json({ error: 'Booking does not belong to this business' });
    }

    await prisma.booking.delete({
      where: { id: bookingId }
    });

    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('Booking delete error:', err);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

// --- Available Slots Endpoints ---

// Create or update available time slots for a business
app.post('/businesses/:businessId/available-slots', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const { dayOfWeek, startTime, endTime } = req.body;

    if (!businessId) return res.status(400).json({ error: 'Business id is required' });

    if (dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({ error: 'dayOfWeek, startTime, and endTime are required' });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const userId = req.userId!;
    if (business.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete existing slot for this day
    await prisma.availableSlot.deleteMany({
      where: {
        businessId,
        dayOfWeek,
      }
    });

    // Create new slot
    const slot = await prisma.availableSlot.create({
      data: {
        businessId,
        dayOfWeek,
        startTime,
        endTime,
      }
    });

    res.status(201).json(slot);
  } catch (err) {
    console.error('Available slot creation error:', err);
    res.status(500).json({ error: 'Failed to create available slot' });
  }
});

// Get available slots for a business
app.get('/businesses/:businessId/available-slots', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    if (!businessId) return res.status(400).json({ error: 'Business id is required' });

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const userId = req.userId!;
    if (business.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const slots = await prisma.availableSlot.findMany({
      where: { businessId }
    });

    res.json(slots);
  } catch (err) {
    console.error('Available slots fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
});

// --- Legacy Endpoints (Public, for backward compatibility) ---

// Public lead submission (no auth) - requires valid businessId
app.post('/leads', publicLimiter, async (req: Request, res: Response) => {
  try {
    const { businessId, name, email, company, message } = req.body;

    if (!businessId) {
      return res.status(400).json({ error: 'businessId is required for lead submission' });
    }
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });
    if (!business || !business.isPublished) {
      return res.status(404).json({ error: 'Business not found or not published' });
    }

    const lead = await prisma.lead.create({
      data: {
        businessId,
        name,
        email,
        company,
        message,
        source: 'web',
      }
    });

    await sendEmailNotification(lead, business);
    res.status(201).json(lead);
  } catch (err) {
    console.error('Public lead creation error:', err);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// Public lead submission by website slug (for published websites)
app.post('/website/:slug/leads', publicLimiter, async (req: Request, res: Response) => {
  try {
    const slug = paramToString(req.params.slug);
    const { name, email, company, message } = req.body;

    if (!slug) return res.status(400).json({ error: 'Slug is required' });
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const business = await prisma.business.findUnique({
      where: { slug, isPublished: true }
    });
    if (!business) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const lead = await prisma.lead.create({
      data: {
        businessId: business.id,
        name,
        email,
        company,
        message,
        source: 'web',
      }
    });

    await sendEmailNotification(lead, business);
    res.status(201).json(lead);
  } catch (err) {
    console.error('Public lead creation error:', err);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// --- PHASE 3: Content Studio & Repurposing Automation ---

// ============================================================================
// PHASE 3A: CONTENT INPUT (CONTENT STUDIO) ENDPOINTS
// ============================================================================

// POST /businesses/:businessId/content-inputs/upload - Upload local file and create content input
app.post('/businesses/:businessId/content-inputs/upload', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const {
      type,
      title,
      fileName,
      mimeType,
      dataBase64,
      metadata,
    } = req.body || {};

    if (!businessId) return res.status(400).json({ error: 'Business id is required' });
    if (!type || !fileName || !mimeType || !dataBase64) {
      return res.status(400).json({ error: 'type, fileName, mimeType, and dataBase64 are required' });
    }
    if (!['video', 'audio'].includes(String(type))) {
      return res.status(400).json({ error: 'Upload endpoint supports only video/audio types' });
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const base64Payload = String(dataBase64).includes(',')
      ? String(dataBase64).split(',').pop()!
      : String(dataBase64);
    const fileBuffer = Buffer.from(base64Payload, 'base64');

    const maxBytes = 15 * 1024 * 1024;
    if (!fileBuffer.length || fileBuffer.length > maxBytes) {
      return res.status(400).json({ error: 'File must be between 1 byte and 15MB' });
    }

    const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `content-inputs/${businessId}/${Date.now()}-${safeName}`;
    const bucketKey = String(type) === 'video' ? 'VIDEOS' : 'AUDIO';

    const upload = await storageService.uploadFile(
      bucketKey as any,
      storagePath,
      fileBuffer,
      {
        contentType: String(mimeType),
        upsert: false,
        metadata: {
          source: 'local_upload',
          originalFileName: safeName,
        },
      }
    );

    const contentInput = await createContentInput({
      businessId,
      type,
      title: title || safeName,
      url: upload.publicUrl || undefined,
      storagePath: upload.path,
      metadata: {
        ...(metadata || {}),
        source: 'local_upload',
        fileName: safeName,
        mimeType,
        sizeBytes: fileBuffer.length,
      },
    });

    await prisma.analytics.create({
      data: {
        businessId,
        eventType: 'content_input_uploaded',
        eventData: { contentId: contentInput.id, type, sizeBytes: fileBuffer.length },
      }
    });

    res.status(201).json({
      message: 'File uploaded and content input created successfully',
      contentInput,
    });
  } catch (err) {
    logger.error('Upload content input error', { error: String(err) });
    res.status(500).json({ error: 'Failed to upload content input' });
  }
});

// POST /businesses/:businessId/content-inputs - Create new content input
app.post('/businesses/:businessId/content-inputs', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const { type, title, content, url, storagePath, metadata } = req.body;

    if (!businessId) return res.status(400).json({ error: 'Business id is required' });
    if (!type) return res.status(400).json({ error: 'Content type is required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const contentInput = await createContentInput({
      businessId,
      type,
      title: title || `${type}-${Date.now()}`,
      content,
      url,
      storagePath,
      metadata,
    });

    // Track event
    await prisma.analytics.create({
      data: {
        businessId,
        eventType: 'content_input_created',
        eventData: { contentId: contentInput.id, type },
      }
    });

    res.status(201).json({
      message: 'Content input created successfully',
      contentInput,
    });
  } catch (err) {
    logger.error('Create content input error', { error: String(err) });
    res.status(500).json({ error: 'Failed to create content input' });
  }
});

// GET /businesses/:businessId/content-inputs - List all content inputs
app.get('/businesses/:businessId/content-inputs', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    if (!businessId) return res.status(400).json({ error: 'Business id is required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const contentInputs = await getBusinessContentInputs(businessId);
    res.json({
      contentInputs,
      total: contentInputs.length,
    });
  } catch (err) {
    logger.error('Get content inputs error', { error: String(err) });
    res.status(500).json({ error: 'Failed to fetch content inputs' });
  }
});

// GET /businesses/:businessId/content-inputs/:contentId - Get specific content input
app.get('/businesses/:businessId/content-inputs/:contentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const contentId = paramToString(req.params.contentId);

    if (!businessId || !contentId) return res.status(400).json({ error: 'Business id and content id are required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const contentInput = await getContentInput(contentId);
    if (!contentInput) return res.status(404).json({ error: 'Content input not found' });
    if (contentInput.businessId !== businessId) return res.status(403).json({ error: 'Unauthorized' });

    res.json(contentInput);
  } catch (err) {
    logger.error('Get content input error', { error: String(err) });
    res.status(500).json({ error: 'Failed to fetch content input' });
  }
});

// PATCH /businesses/:businessId/content-inputs/:contentId - Update content input
app.patch('/businesses/:businessId/content-inputs/:contentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const contentId = paramToString(req.params.contentId);
    const { title, content, status, metadata } = req.body;

    if (!businessId || !contentId) return res.status(400).json({ error: 'Business id and content id are required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const contentInput = await getContentInput(contentId);
    if (!contentInput) return res.status(404).json({ error: 'Content input not found' });
    if (contentInput.businessId !== businessId) return res.status(403).json({ error: 'Unauthorized' });

    const updated = await updateContentInput(contentId, {
      title,
      content,
      status: status as any,
      metadata,
    });

    res.json({
      message: 'Content input updated successfully',
      contentInput: updated,
    });
  } catch (err) {
    logger.error('Update content input error', { error: String(err) });
    res.status(500).json({ error: 'Failed to update content input' });
  }
});

// DELETE /businesses/:businessId/content-inputs/:contentId - Delete content input
app.delete('/businesses/:businessId/content-inputs/:contentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const contentId = paramToString(req.params.contentId);

    if (!businessId || !contentId) return res.status(400).json({ error: 'Business id and content id are required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const contentInput = await getContentInput(contentId);
    if (!contentInput) return res.status(404).json({ error: 'Content input not found' });
    if (contentInput.businessId !== businessId) return res.status(403).json({ error: 'Unauthorized' });

    await deleteContentInput(contentId);

    res.json({ message: 'Content input deleted successfully' });
  } catch (err) {
    logger.error('Delete content input error', { error: String(err) });
    res.status(500).json({ error: 'Failed to delete content input' });
  }
});

// ============================================================================
// PHASE 3B: CONTENT REPURPOSING ENDPOINTS
// ============================================================================

// POST /businesses/:businessId/content-inputs/:contentId/repurpose - Generate repurposed content
app.post('/businesses/:businessId/content-inputs/:contentId/repurpose', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const contentId = paramToString(req.params.contentId);
    const { platforms } = req.body;

    if (!businessId || !contentId) return res.status(400).json({ error: 'Business id and content id are required' });
    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({ error: 'Platforms array is required and must not be empty' });
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const contentInput = await getContentInput(contentId);
    if (!contentInput) return res.status(404).json({ error: 'Content input not found' });
    if (contentInput.businessId !== businessId) return res.status(403).json({ error: 'Unauthorized' });

    const normalizedPlatforms = [...new Set(platforms.map((p: any) => String(p).toLowerCase().trim()))]
      .filter((p) => ['instagram', 'tiktok', 'youtube', 'twitter', 'linkedin', 'facebook'].includes(p));

    if (normalizedPlatforms.length === 0) {
      return res.status(400).json({ error: 'No valid platforms provided' });
    }

    await updateContentInput(contentId, { status: 'processing' as any });

    const queuedJob = await enqueueRepurposing({
      contentId,
      contentInputId: contentId,
      businessId,
      platforms: normalizedPlatforms as any,
      originContent: contentInput.content || contentInput.url || '',
      businessName: business.name,
      businessContext: typeof contentInput.metadata === 'string'
        ? contentInput.metadata
        : JSON.stringify(contentInput.metadata || {}),
      style: 'educational',
    });

    // Track event
    await prisma.analytics.create({
      data: {
        businessId,
        eventType: 'content_repurpose_queued',
        eventData: { sourceContentId: contentId, platformCount: normalizedPlatforms.length, jobId: queuedJob.id },
      }
    });

    res.status(202).json({
      message: 'Repurposing queued',
      jobId: queuedJob.id,
      status: 'processing',
      contentInputId: contentId,
      platforms: normalizedPlatforms,
    });
  } catch (err) {
    logger.error('Generate repurposed content error', { error: String(err) });
    res.status(500).json({ error: 'Failed to generate repurposed content' });
  }
});

// GET /businesses/:businessId/repurposed-content - List all repurposed content
app.get('/businesses/:businessId/repurposed-content', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    if (!businessId) return res.status(400).json({ error: 'Business id is required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const repurposedContent = await getBusinessRepurposedContent(businessId);
    res.json({
      repurposedContent,
      total: repurposedContent.length,
    });
  } catch (err) {
    logger.error('Get repurposed content error', { error: String(err) });
    res.status(500).json({ error: 'Failed to fetch repurposed content' });
  }
});

// GET /businesses/:businessId/repurposed-content/:repurposedId - Get specific repurposed content
app.get('/businesses/:businessId/repurposed-content/:repurposedId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const repurposedId = paramToString(req.params.repurposedId);

    if (!businessId || !repurposedId) return res.status(400).json({ error: 'Business id and repurposed id are required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const repurposed = await getRepurposedContent(repurposedId);
    if (!repurposed) return res.status(404).json({ error: 'Repurposed content not found' });
    if (repurposed.businessId !== businessId) return res.status(403).json({ error: 'Unauthorized' });

    res.json(repurposed);
  } catch (err) {
    logger.error('Get repurposed content error', { error: String(err) });
    res.status(500).json({ error: 'Failed to fetch repurposed content' });
  }
});

// PATCH /businesses/:businessId/repurposed-content/:repurposedId - Update repurposed content
app.patch('/businesses/:businessId/repurposed-content/:repurposedId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const repurposedId = paramToString(req.params.repurposedId);
    const { content, caption, hashtags, status, performance, score, scoreBreakdown, trendHooks, metadata, assetUrl, assetPath } = req.body;

    if (!businessId || !repurposedId) return res.status(400).json({ error: 'Business id and repurposed id are required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const repurposed = await getRepurposedContent(repurposedId);
    if (!repurposed) return res.status(404).json({ error: 'Repurposed content not found' });
    if (repurposed.businessId !== businessId) return res.status(403).json({ error: 'Unauthorized' });

    const updated = await updateRepurposedContent(repurposedId, {
      content,
      caption,
      hashtags,
      status: status as any,
      performance,
      score,
      scoreBreakdown,
      trendHooks,
      metadata,
      assetUrl,
      assetPath,
    });

    res.json({
      message: 'Repurposed content updated successfully',
      repurposedContent: updated,
    });
  } catch (err) {
    logger.error('Update repurposed content error', { error: String(err) });
    res.status(500).json({ error: 'Failed to update repurposed content' });
  }
});

// DELETE /businesses/:businessId/repurposed-content/:repurposedId - Delete repurposed content
app.delete('/businesses/:businessId/repurposed-content/:repurposedId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const repurposedId = paramToString(req.params.repurposedId);

    if (!businessId || !repurposedId) return res.status(400).json({ error: 'Business id and repurposed id are required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const repurposed = await getRepurposedContent(repurposedId);
    if (!repurposed) return res.status(404).json({ error: 'Repurposed content not found' });
    if (repurposed.businessId !== businessId) return res.status(403).json({ error: 'Unauthorized' });

    await deleteRepurposedContent(repurposedId);

    res.json({ message: 'Repurposed content deleted successfully' });
  } catch (err) {
    logger.error('Delete repurposed content error', { error: String(err) });
    res.status(500).json({ error: 'Failed to delete repurposed content' });
  }
});

// ============================================================================
// PHASE 3C: PLATFORM DISTRIBUTION ENDPOINTS
// ============================================================================

// POST /businesses/:businessId/repurposed-content/:repurposedId/publish - Publish repurposed content to platform
app.post('/businesses/:businessId/repurposed-content/:repurposedId/publish', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const repurposedId = paramToString(req.params.repurposedId);
    const { platformCredentials, scheduleTime, validateOnly } = req.body;

    if (!businessId || !repurposedId) return res.status(400).json({ error: 'Business id and repurposed id are required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const repurposed = await getRepurposedContent(repurposedId);
    if (!repurposed) return res.status(404).json({ error: 'Repurposed content not found' });
    if (repurposed.businessId !== businessId) return res.status(403).json({ error: 'Unauthorized' });

    // Validate content against platform requirements
    const validation = validateContentForPlatform(repurposed.platform, {
      content: repurposed.content,
      caption: repurposed.caption,
      hashtags: repurposed.hashtags,
      platforms: [repurposed.platform],
    });

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Content validation failed',
        details: validation.errors,
        warnings: validation.warnings,
      });
    }

    // If validation only, return success without publishing
    if (validateOnly) {
      return res.json({
        message: 'Content validation passed',
        warnings: validation.warnings,
      });
    }

    // Publish to platform using real API integrations
    const credentials = platformCredentials || business.platformCredentials || {};
    const publishResults = await publishToAllPlatforms(credentials, {
      content: repurposed.content,
      caption: repurposed.caption || repurposed.content,
      hashtags: repurposed.hashtags,
      platforms: [repurposed.platform],
      schedule: scheduleTime ? new Date(scheduleTime) : undefined,
    });

    const publishResult = publishResults[0];
    if (!publishResult) {
      return res.status(500).json({ error: 'Publishing failed' });
    }

    // Create distribution record with publish result
    const distribution = await createPlatformDistribution({
      businessId,
      repurposedContentId: repurposedId,
      platform: repurposed.platform,
      externalId: publishResult.postId,
      url: publishResult.externalUrl,
      metrics: {},
      publishedAt: publishResult.status === 'scheduled' ? scheduleTime : new Date(),
    });

    // Update repurposed content status based on publish result
    const newStatus = publishResult.status === 'error' ? 'failed' : 
                      publishResult.status === 'scheduled' ? 'scheduled' : 'published';
    
    await updateRepurposedContent(repurposedId, {
      status: newStatus as any,
    });

    // Track event
    await prisma.analytics.create({
      data: {
        businessId,
        eventType: 'content_published',
        eventData: {
          repurposedId,
          platform: repurposed.platform,
          postId: publishResult.postId,
          status: publishResult.status,
          externalUrl: publishResult.externalUrl,
        },
      }
    });

    res.status(201).json({
      message: `Content ${publishResult.status} successfully`,
      distribution,
      publishResult,
      warnings: validation.warnings,
    });
  } catch (err) {
    logger.error('Publish content error', { error: String(err) });
    res.status(500).json({ error: 'Failed to publish content' });
  }
});

// GET /businesses/:businessId/distributions - List all platform distributions
app.get('/businesses/:businessId/distributions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    if (!businessId) return res.status(400).json({ error: 'Business id is required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const distributions = await getBusinessDistributions(businessId);
    res.json({
      distributions,
      total: distributions.length,
    });
  } catch (err) {
    logger.error('Get distributions error', { error: String(err) });
    res.status(500).json({ error: 'Failed to fetch distributions' });
  }
});

// GET /businesses/:businessId/distributions/:distributionId - Get specific distribution
app.get('/businesses/:businessId/distributions/:distributionId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const distributionId = paramToString(req.params.distributionId);

    if (!businessId || !distributionId) return res.status(400).json({ error: 'Business id and distribution id are required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const distribution = await getPlatformDistribution(distributionId);
    if (!distribution) return res.status(404).json({ error: 'Distribution not found' });
    if (distribution.businessId !== businessId) return res.status(403).json({ error: 'Unauthorized' });

    res.json(distribution);
  } catch (err) {
    logger.error('Get distribution error', { error: String(err) });
    res.status(500).json({ error: 'Failed to fetch distribution' });
  }
});

// PATCH /businesses/:businessId/distributions/:distributionId - Update distribution metrics
app.patch('/businesses/:businessId/distributions/:distributionId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const distributionId = paramToString(req.params.distributionId);
    const { metrics } = req.body;

    if (!businessId || !distributionId) return res.status(400).json({ error: 'Business id and distribution id are required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const distribution = await getPlatformDistribution(distributionId);
    if (!distribution) return res.status(404).json({ error: 'Distribution not found' });
    if (distribution.businessId !== businessId) return res.status(403).json({ error: 'Unauthorized' });

    const updated = await updatePlatformDistribution(distributionId, {
      metrics,
    });

    res.json({
      message: 'Distribution updated successfully',
      distribution: updated,
    });
  } catch (err) {
    logger.error('Update distribution error', { error: String(err) });
    res.status(500).json({ error: 'Failed to update distribution' });
  }
});

// DELETE /businesses/:businessId/distributions/:distributionId - Delete distribution
app.delete('/businesses/:businessId/distributions/:distributionId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const distributionId = paramToString(req.params.distributionId);

    if (!businessId || !distributionId) return res.status(400).json({ error: 'Business id and distribution id are required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const distribution = await getPlatformDistribution(distributionId);
    if (!distribution) return res.status(404).json({ error: 'Distribution not found' });
    if (distribution.businessId !== businessId) return res.status(403).json({ error: 'Unauthorized' });

    await deleteDistribution(distributionId);

    res.json({ message: 'Distribution deleted successfully' });
  } catch (err) {
    logger.error('Delete distribution error', { error: String(err) });
    res.status(500).json({ error: 'Failed to delete distribution' });
  }
});

// ============================================================================
// PHASE 2B: WEBSITE VERSION MANAGEMENT ENDPOINTS
// ============================================================================

// POST /businesses/:businessId/publish - Publish website and create version
app.post('/businesses/:businessId/publish', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    if (!businessId) return res.status(400).json({ error: 'Business id is required' });

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const userId = req.userId!;
    if (business.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Generate unique slug from business name
    const slug = business.name.toLowerCase().replace(/\s+/g, '-').substring(0, 50);
    const uniqueSlug = `${slug}-${Date.now().toString(36)}`;
    const frontendBase = (process.env.FRONTEND_URL || 'http://localhost:3002').replace(/\/+$/, '');
    const publishedUrl = `${frontendBase}/live/${businessId}`;

    // Get current version count to generate next version number
    const currentVersions = await getBusinessVersions(businessId);
    const nextVersionNumber = (currentVersions.length || 0) + 1;

    // Create website version with current config
    const versionConfig = business.websiteConfig || business.generatedConfig || {};
    const versionData = {
      businessId,
      versionNumber: nextVersionNumber,
      config: versionConfig,
      template: business.templateId || 'default',
      status: 'published' as const,
    };

    const version = await createWebsiteVersion(versionData);

    // Update business
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        isPublished: true,
        publishedAt: new Date(),
        slug: uniqueSlug,
        publishedUrl,
      }
    });

    // Track analytics event
    await prisma.analytics.create({
      data: {
        businessId,
        eventType: 'website_published',
        eventData: { slug: uniqueSlug, url: publishedUrl, versionId: version.id, versionNumber: version.versionNumber },
      }
    });

    console.log(`[Website Published] Business: ${business.name}, Version: ${version.versionNumber}, URL: ${publishedUrl}`);

    // Fire-and-forget immediate audit attempt so dashboard ranking updates sooner.
    void runAutoPageSpeedAuditForBusiness(
      {
        id: updatedBusiness.id,
        userId: updatedBusiness.userId,
        name: updatedBusiness.name,
        slug: updatedBusiness.slug,
        publishedUrl: updatedBusiness.publishedUrl,
        isPublished: updatedBusiness.isPublished,
      },
      Number(process.env.AUTO_PAGESPEED_AUDIT_MIN_INTERVAL_MINUTES || 60),
    );

    res.json({
      message: 'Website published successfully',
      business: updatedBusiness,
      shareUrl: publishedUrl,
      version,
    });
  } catch (err) {
    logger.error('Website publish error', { error: String(err) });
    res.status(500).json({ error: 'Failed to publish website' });
  }
});

// GET /businesses/:businessId/website-versions - List all versions
app.get('/businesses/:businessId/website-versions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    if (!businessId) return res.status(400).json({ error: 'Business id is required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const versions = await getBusinessVersions(businessId);
    res.json({ versions, total: versions.length });
  } catch (err) {
    logger.error('Get versions error', { error: String(err) });
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

// POST /businesses/:businessId/website-versions - Create new version
app.post('/businesses/:businessId/website-versions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const { config, template, status } = req.body;

    if (!businessId) return res.status(400).json({ error: 'Business id is required' });
    if (!config) return res.status(400).json({ error: 'Config is required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const currentVersions = await getBusinessVersions(businessId);
    const nextVersionNumber = (currentVersions.length || 0) + 1;

    const version = await createWebsiteVersion({
      businessId,
      versionNumber: nextVersionNumber,
      config,
      template: template || business.templateId || 'default',
      status: status || 'draft',
    });

    res.status(201).json(version);
  } catch (err) {
    logger.error('Create version error', { error: String(err) });
    res.status(500).json({ error: 'Failed to create version' });
  }
});

// GET /businesses/:businessId/website-versions/:versionId - Get specific version
app.get('/businesses/:businessId/website-versions/:versionId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const versionId = paramToString(req.params.versionId);

    if (!businessId || !versionId) return res.status(400).json({ error: 'Business id and version id are required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const version = await getWebsiteVersion(versionId);
    if (!version) return res.status(404).json({ error: 'Version not found' });
    if (version.businessId !== businessId) return res.status(403).json({ error: 'Unauthorized' });

    res.json(version);
  } catch (err) {
    logger.error('Get version error', { error: String(err) });
    res.status(500).json({ error: 'Failed to fetch version' });
  }
});

// PATCH /businesses/:businessId/website-versions/:versionId/publish - Publish a version
app.patch('/businesses/:businessId/website-versions/:versionId/publish', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const versionId = paramToString(req.params.versionId);

    if (!businessId || !versionId) return res.status(400).json({ error: 'Business id and version id are required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const version = await getWebsiteVersion(versionId);
    if (!version) return res.status(404).json({ error: 'Version not found' });
    if (version.businessId !== businessId) return res.status(403).json({ error: 'Unauthorized' });

    // Publish the version
    const publishedVersion = await publishWebsiteVersion(versionId);

    // Update business config to match published version
    await prisma.business.update({
      where: { id: businessId },
      data: {
        websiteConfig: publishedVersion.config,
        templateId: publishedVersion.template,
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    // Track analytics
    await prisma.analytics.create({
      data: {
        businessId,
        eventType: 'version_published',
        eventData: { versionId, versionNumber: publishedVersion.versionNumber },
      }
    });

    res.json({
      message: 'Version published successfully',
      version: publishedVersion,
    });
  } catch (err) {
    logger.error('Publish version error', { error: String(err) });
    res.status(500).json({ error: 'Failed to publish version' });
  }
});

// DELETE /businesses/:businessId/website-versions/:versionId - Delete a version
app.delete('/businesses/:businessId/website-versions/:versionId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const versionId = paramToString(req.params.versionId);

    if (!businessId || !versionId) return res.status(400).json({ error: 'Business id and version id are required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const version = await getWebsiteVersion(versionId);
    if (!version) return res.status(404).json({ error: 'Version not found' });
    if (version.businessId !== businessId) return res.status(403).json({ error: 'Unauthorized' });
    if (version.status === 'published') return res.status(409).json({ error: 'Cannot delete published version' });

    await deleteWebsiteVersion(versionId);

    res.json({ message: 'Version deleted successfully' });
  } catch (err) {
    logger.error('Delete version error', { error: String(err) });
    res.status(500).json({ error: 'Failed to delete version' });
  }
});

// POST /businesses/:businessId/website-versions/:versionId/rollback - Rollback to a version
app.post('/businesses/:businessId/website-versions/:versionId/rollback', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const versionId = paramToString(req.params.versionId);

    if (!businessId || !versionId) return res.status(400).json({ error: 'Business id and version id are required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const version = await getWebsiteVersion(versionId);
    if (!version) return res.status(404).json({ error: 'Version not found' });
    if (version.businessId !== businessId) return res.status(403).json({ error: 'Unauthorized' });

    // Publish this version (makes it active)
    const rolledBackVersion = await publishWebsiteVersion(versionId);

    // Update business to use this version's config
    await prisma.business.update({
      where: { id: businessId },
      data: {
        websiteConfig: rolledBackVersion.config,
        templateId: rolledBackVersion.template,
      },
    });

    // Track analytics
    await prisma.analytics.create({
      data: {
        businessId,
        eventType: 'version_rolled_back',
        eventData: { versionId, versionNumber: rolledBackVersion.versionNumber },
      }
    });

    res.json({
      message: 'Rolled back to previous version successfully',
      version: rolledBackVersion,
    });
  } catch (err) {
    logger.error('Rollback version error', { error: String(err) });
    res.status(500).json({ error: 'Failed to rollback version' });
  }
});

// GET /businesses/:businessId/website-assets - List all assets
app.get('/businesses/:businessId/website-assets', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    if (!businessId) return res.status(400).json({ error: 'Business id is required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const assets = await prisma.websiteAsset.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ assets, total: assets.length });
  } catch (err) {
    logger.error('Get assets error', { error: String(err) });
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// GET /businesses/:businessId/website-assets/:assetId - Get specific asset
app.get('/businesses/:businessId/website-assets/:assetId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const assetId = paramToString(req.params.assetId);

    if (!businessId || !assetId) return res.status(400).json({ error: 'Business id and asset id are required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const asset = await prisma.websiteAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    if (asset.businessId !== businessId) return res.status(403).json({ error: 'Unauthorized' });

    res.json(asset);
  } catch (err) {
    logger.error('Get asset error', { error: String(err) });
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
});

// DELETE /businesses/:businessId/website-assets/:assetId - Delete asset
app.delete('/businesses/:businessId/website-assets/:assetId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const assetId = paramToString(req.params.assetId);

    if (!businessId || !assetId) return res.status(400).json({ error: 'Business id and asset id are required' });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const asset = await prisma.websiteAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    if (asset.businessId !== businessId) return res.status(403).json({ error: 'Unauthorized' });

    await prisma.websiteAsset.delete({ where: { id: assetId } });

    res.json({ message: 'Asset deleted successfully' });
  } catch (err) {
    logger.error('Delete asset error', { error: String(err) });
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

// POST /businesses/:businessId/website-versions/:fromVersion/compare/:toVersion - Compare versions
app.post('/businesses/:businessId/website-versions/:fromVersion/compare/:toVersion', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const fromVersionId = paramToString(req.params.fromVersion);
    const toVersionId = paramToString(req.params.toVersion);

    if (!businessId || !fromVersionId || !toVersionId) {
      return res.status(400).json({ error: 'Business id, from version id, and to version id are required' });
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const fromVersion = await getWebsiteVersion(fromVersionId);
    const toVersion = await getWebsiteVersion(toVersionId);

    if (!fromVersion || !toVersion) return res.status(404).json({ error: 'Version not found' });
    if (fromVersion.businessId !== businessId || toVersion.businessId !== businessId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Compare configurations
    const comparison = {
      fromVersion: fromVersion.versionNumber,
      toVersion: toVersion.versionNumber,
      changes: {} as Record<string, { from: any; to: any }>,
      summary: [] as string[],
    };

    // Deep comparison of config objects
    const fromConfig = fromVersion.config as Record<string, any>;
    const toConfig = toVersion.config as Record<string, any>;

    const allKeys = new Set([...Object.keys(fromConfig || {}), ...Object.keys(toConfig || {})]);

    for (const key of allKeys) {
      const fromVal = fromConfig?.[key];
      const toVal = toConfig?.[key];

      if (JSON.stringify(fromVal) !== JSON.stringify(toVal)) {
        comparison.changes[key] = { from: fromVal, to: toVal };
        comparison.summary.push(`${key}: ${JSON.stringify(fromVal)} → ${JSON.stringify(toVal)}`);
      }
    }

    res.json(comparison);
  } catch (err) {
    logger.error('Compare versions error', { error: String(err) });
    res.status(500).json({ error: 'Failed to compare versions' });
  }
});

// ============================================================================
// END PHASE 2B: WEBSITE VERSION MANAGEMENT ENDPOINTS
// ============================================================================

// Serve public website (no auth required)
app.get('/website/:slug', async (req: Request, res: Response) => {
  try {
    const slug = paramToString(req.params.slug);
    if (!slug) return res.status(400).json({ error: 'Slug is required' });

    const business = await prisma.business.findUnique({
      where: { slug },
      include: {
        bookings: true,
        availableSlots: true,
      }
    });

    if (!business || !business.isPublished) {
      return res.status(404).json({ error: 'Website not found' });
    }

    // Increment views count
    const updatedBusiness = await prisma.business.update({
      where: { id: business.id },
      data: { views: { increment: 1 } },
      include: {
        leads: true,
        bookings: true,
        availableSlots: true,
      }
    });

    // Track analytics
    await prisma.analytics.create({
      data: {
        businessId: business.id,
        eventType: 'website_viewed',
        source: 'web',
      }
    });

    // Return website data for frontend to render
    res.json({
      business: updatedBusiness,
      template: updatedBusiness.analysis || {},
      leadForm: {
        title: `Get in touch with ${updatedBusiness.name}`,
        fields: ['name', 'email', 'company', 'message'],
      },
      bookingForm: {
        enabled: updatedBusiness.bookings && updatedBusiness.bookings.length > 0,
      }
    });
  } catch (err) {
    console.error('Website fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch website' });
  }
});

// Development Preview - View unpublished websites (no auth required for dev/testing only)
// NOTE: This endpoint should be removed or protected in production
app.get('/public/business', async (req: Request, res: Response) => {
  try {
    const id = req.query.id as string;
    const slug = req.query.slug as string;

    if (!id && !slug) {
      return res.status(400).json({ error: 'Either id or slug parameter is required' });
    }

    let business;
    
    if (id) {
      // Find by ID (for dev preview of unpublished websites)
      business = await prisma.business.findUnique({
        where: { id },
        include: {
          bookings: true,
          availableSlots: true,
        }
      });
    } else {
      // Find by slug (for public/published websites)
      business = await prisma.business.findUnique({
        where: { slug },
        include: {
          bookings: true,
          availableSlots: true,
        }
      });
    }

    if (!business) {
      return res.status(404).json({ error: 'Website not found. Make sure you have created a website first.' });
    }

    // For dev: return business data regardless of publish status
    // Generate templates (same as template endpoint)
    const templates = [
      { 
        id: 'modern',
        name: 'Modern & Minimal',
        description: 'Clean, contemporary design with focus on content',
        style: { bgColor: '#ffffff', textColor: '#1a1a1a', accent: '#f724de', secondary: '#f0f0f0', font: 'Inter, -apple-system, sans-serif' }
      },
      { 
        id: 'creative',
        name: 'Creative Portfolio',
        description: 'Artistic layout perfect for creatives and portfolios',
        style: { bgColor: '#faf8f3', textColor: '#2d2d2d', accent: '#f724de', secondary: '#e8e4d8', font: 'Poppins, -apple-system, sans-serif' }
      },
      { 
        id: 'minimal',
        name: 'Minimal & Professional',
        description: 'Elegant minimalist design for professional services',
        style: { bgColor: '#f9f7f4', textColor: '#3a3a3a', accent: '#8b5cf6', secondary: '#e5e0d8', font: 'Georgia, serif' }
      },
      {
        id: 'bold',
        name: 'Bold & Dynamic',
        description: 'High-impact design that demands attention',
        style: { bgColor: '#1a1a1a', textColor: '#ffffff', accent: '#f724de', secondary: '#333333', font: 'Montserrat, -apple-system, sans-serif' }
      },
      {
        id: 'sleek',
        name: 'Sleek & Dark',
        description: 'Modern tech-forward design with premium feel',
        style: { bgColor: '#0f1419', textColor: '#e2e8f0', accent: '#a78bfa', secondary: '#1e293b', font: 'Ubuntu, -apple-system, sans-serif' }
      },
    ];

    let recommended = templates[0];
    const businessType = (business.description || '').toLowerCase();
    if (businessType.includes('salon') || businessType.includes('spa')) {
      recommended = templates.find(t => t.id === 'minimal') || templates[0];
    } else if (businessType.includes('consultant') || businessType.includes('agency')) {
      recommended = templates.find(t => t.id === 'modern') || templates[0];
    } else if (businessType.includes('artist') || businessType.includes('creative')) {
      recommended = templates.find(t => t.id === 'creative') || templates[0];
    }

    res.json({
      business,
      template: templates[0],
      templates,
      recommended,
      businessType,
      analysis: business.analysis || {},
      testimonials: [],
      branding: ((business.generatedConfig as Record<string, any>)?.branding) || {},
      leadForm: {
        title: `Get in touch with ${business.name}`,
        fields: ['name', 'email', 'company', 'message'],
      },
      bookingForm: {
        enabled: true,
      }
    });
  } catch (err) {
    console.error('Dev preview fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch preview' });
  }
});

// --- Lead Status Management ---

// Update lead status
app.patch('/businesses/:businessId/leads/:leadId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const leadId = paramToString(req.params.leadId);
    const { status } = req.body;

    if (!businessId || !leadId || !status) {
      return res.status(400).json({ error: 'Business id, lead id, and status are required' });
    }

    // Verify ownership
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const userId = req.userId!;
    if (business.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: { status }
    });

    // Track status change
    await prisma.analytics.create({
      data: {
        businessId,
        eventType: 'lead_status_changed',
        eventData: { leadId, newStatus: status },
      }
    });

    // Apply automation rules based on status change
    const triggerMap: any = {
      'contacted': 'lead_contacted',
      'converted': 'lead_converted',
      'declined': 'lead_declined',
    };
    if (triggerMap[status]) {
      await applyLeadAutomationRules(businessId, leadId, triggerMap[status]);
    }

    res.json(lead);
  } catch (err) {
    console.error('Lead update error:', err);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Get leads with filtering by status
app.get('/businesses/:businessId/leads-filtered', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const status = paramToString(req.query.status as string);

    if (!businessId) return res.status(400).json({ error: 'Business id is required' });

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const userId = req.userId!;
    if (business.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const query: any = { businessId };
    if (status) query.status = status;

    const leads = await prisma.lead.findMany({
      where: query,
      orderBy: { createdAt: 'desc' }
    });

    res.json(leads);
  } catch (err) {
    console.error('Leads filter error:', err);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// --- Email Sequences ---

// Create email sequence
app.post('/businesses/:businessId/email-sequences', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const { name, subject, body, delayMinutes, triggerEvent } = req.body;

    if (!businessId || !name || !subject || !body || !triggerEvent) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const userId = req.userId!;
    if (business.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const sequence = await prisma.emailSequence.create({
      data: {
        businessId,
        name,
        subject,
        body,
        delayMinutes: delayMinutes || 0,
        triggerEvent,
      }
    });

    res.status(201).json(sequence);
  } catch (err) {
    console.error('Email sequence creation error:', err);
    res.status(500).json({ error: 'Failed to create email sequence' });
  }
});

// Get email sequences for a business
app.get('/businesses/:businessId/email-sequences', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);

    if (!businessId) return res.status(400).json({ error: 'Business id is required' });

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const userId = req.userId!;
    if (business.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const sequences = await prisma.emailSequence.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(sequences);
  } catch (err) {
    console.error('Email sequences fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch email sequences' });
  }
});

// --- Analytics Endpoints ---

// Get analytics summary for a business
app.get('/businesses/:businessId/analytics', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);

    if (!businessId) return res.status(400).json({ error: 'Business id is required' });

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const userId = req.userId!;
    if (business.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get analytics data
    const allAnalytics = await prisma.analytics.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate summary metrics
    const websiteViews = allAnalytics.filter(a => a.eventType === 'website_viewed').length;
    const leadsCreated = allAnalytics.filter(a => a.eventType === 'lead_created').length;
    const bookingsCreated = allAnalytics.filter(a => a.eventType === 'booking_created').length;
    const websitePublished = allAnalytics.find(a => a.eventType === 'website_published');

    // Get conversion rate (leads to bookings)
    const totalLeads = await prisma.lead.count({ where: { businessId } });
    const convertedLeads = await prisma.lead.count({
      where: { businessId, status: 'converted' }
    });
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : '0.00';

    res.json({
      summary: {
        websiteViews,
        leadsCreated,
        bookingsCreated,
        totalLeads,
        convertedLeads,
        conversionRate: parseFloat(conversionRate),
        publishedAt: websitePublished?.createdAt,
      },
      recentEvents: allAnalytics.slice(0, 20),
    });
  } catch (err) {
    console.error('Analytics fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Track custom analytics event
app.post('/businesses/:businessId/analytics', async (req: Request, res: Response) => {
  try {
    const businessId = paramToString((req.params as any).businessId);
    const { eventType, eventData, source } = req.body;

    if (!businessId || !eventType) {
      return res.status(400).json({ error: 'Business id and event type are required' });
    }

    const event = await prisma.analytics.create({
      data: {
        businessId,
        eventType,
        eventData: eventData || {},
        source,
      }
    });

    res.status(201).json(event);
  } catch (err) {
    console.error('Analytics track error:', err);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// --- Dashboard KPI Stats Endpoint ---
app.get('/dashboard/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Get all businesses for this user
    const businesses = await prisma.business.findMany({
      where: { userId },
      include: {
        leads: true,
        bookings: true,
        analytics: true,
      },
    });

    // Calculate overall stats
    const totalWebsites = businesses.length;
    const liveWebsites = businesses.filter(b => b.isPublished).length;
    const totalLeads = businesses.reduce((sum, b) => sum + b.leads.length, 0);
    const totalBookings = businesses.reduce((sum, b) => sum + b.bookings.length, 0);

    // Calculate conversion rate
    const convertedLeads = businesses.reduce(
      (sum, b) => sum + b.leads.filter(l => l.status === 'converted').length,
      0
    );
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0';

    // Calculate average SEO score
    const seoAudits = await prisma.seoAudit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    const avgSeoScore = seoAudits.length > 0
      ? Math.round(seoAudits.reduce((sum, a) => sum + a.seo, 0) / seoAudits.length)
      : 0;

    // Get this month's stats
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthLeads = businesses.reduce(
      (sum, b) => sum + b.leads.filter(l => new Date(l.createdAt) >= monthStart).length,
      0
    );
    const thisMonthBookings = businesses.reduce(
      (sum, b) => sum + b.bookings.filter(b => new Date(b.createdAt) >= monthStart).length,
      0
    );

    // Get average performance across all websites
    const totalAnalyticsEvents = businesses.reduce((sum, b) => sum + b.analytics.length, 0);
    const avgWebsiteViews = businesses.length > 0
      ? Math.floor(
          businesses.reduce(
            (sum, b) =>
              sum + b.analytics.filter(a => a.eventType === 'website_viewed').length,
            0
          ) / businesses.length
        )
      : 0;

    res.json({
      summary: {
        totalWebsites,
        liveWebsites,
        totalLeads,
        totalBookings,
        thisMonthLeads,
        thisMonthBookings,
        conversionRate: parseFloat(conversionRate),
        avgSeoScore,
        avgWebsiteViews,
      },
      breakdown: {
        byStatus: {
          live: liveWebsites,
          draft: totalWebsites - liveWebsites,
        },
        leads: {
          total: totalLeads,
          converted: convertedLeads,
          pending: totalLeads - convertedLeads,
        },
      },
      recentStats: {
        thisMonth: {
          leads: thisMonthLeads,
          bookings: thisMonthBookings,
        },
      },
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// --- Per-website SEO rankings for Dashboard ---
app.get('/dashboard/seo-rankings', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const businesses = await prisma.business.findMany({
      where: { userId },
      select: { id: true, name: true, isPublished: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });

    const rankings = await Promise.all(
      businesses.map(async (business) => {
        const audits = await prisma.seoAudit.findMany({
          where: {
            userId,
            businessId: business.id,
          },
          select: {
            seo: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        });

        const latestSeoScore = audits[0]?.seo ?? null;
        const avgSeoScore =
          audits.length > 0
            ? Math.round(audits.reduce((sum, a) => sum + a.seo, 0) / audits.length)
            : null;

        return {
          businessId: business.id,
          businessName: business.name,
          isPublished: business.isPublished,
          latestSeoScore,
          avgSeoScore,
          auditsCount: audits.length,
          lastAuditAt: audits[0]?.createdAt ?? null,
          score: latestSeoScore ?? avgSeoScore ?? 0,
        };
      }),
    );

    rankings.sort((a, b) => b.score - a.score);

    res.json({
      rankings: rankings.map((item, index) => ({
        ...item,
        rank: index + 1,
      })),
    });
  } catch (err) {
    console.error('SEO rankings fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch SEO rankings' });
  }
});

// --- Content Studio Endpoints ---

// POST /businesses/:businessId/content-projects - Create a content project
app.post('/businesses/:businessId/content-projects', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const {
      inputType,
      inputUrl,
      inputText,
      reelsRequested = 3,
      style = 'educational',
      autoPublish = false,
      growthMode,
    } = req.body;

    if (!businessId || !inputType) {
      return res.status(400).json({ error: 'Business ID and input type are required' });
    }

    // Verify business ownership
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business || business.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Create content project
    const project = await prisma.contentProject.create({
      data: {
        businessId,
        inputType: inputType as any,
        inputUrl: inputUrl || null,
        inputText: inputText || null,
        reelsRequested: Math.min(reelsRequested, 5),
        style: style as any,
        autoPublish,
        status: 'processing',
      },
    });

    // Enqueue content generation job (non-fatal in dev)
    let enqueueWarning: string | null = null;
    try {
      await enqueueContentGeneration({
        projectId: project.id,
        businessId,
        inputType: inputType as any,
        inputUrl,
        inputText,
        reelsRequested: Math.min(reelsRequested, 5),
        style: style as any,
        autoPublish,
        growthMode: ['CONSERVATIVE', 'BALANCED', 'AGGRESSIVE'].includes(String(growthMode))
          ? (String(growthMode) as any)
          : 'BALANCED',
      });
    } catch (err) {
      console.warn('Content generation enqueue failed:', err);
      if (process.env.NODE_ENV !== 'production') {
        enqueueWarning = 'Generation enqueued failed; project saved for later processing.';
      } else {
        throw err;
      }
    }

    res.status(201).json({
      project: {
        id: project.id,
        status: project.status,
        reelsRequested: project.reelsRequested,
        createdAt: project.createdAt,
      },
      ...(enqueueWarning ? { warning: enqueueWarning } : {}),
    });
  } catch (err) {
    console.error('Content project creation error:', err);
    res.status(500).json({
      error: 'Failed to create content project',
      ...(process.env.NODE_ENV === 'development' && {
        details: {
          message: (err as any)?.message,
          code: (err as any)?.code,
          type: (err as any)?.name,
        },
      }),
    });
  }
});

// GET /businesses/:businessId/content-projects - List content projects
app.get('/businesses/:businessId/content-projects', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);

    if (!businessId) {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    // Verify business ownership
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business || business.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const projects = await prisma.contentProject.findMany({
      where: { businessId },
      include: { reels: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      projects: projects.map(p => ({
        id: p.id,
        inputType: p.inputType,
        status: p.status,
        reelsGenerated: p.reels.length,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    });
  } catch (err) {
    console.error('Content projects fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch content projects' });
  }
});

// GET /businesses/:businessId/content-projects/:projectId - Get project details
app.get('/businesses/:businessId/content-projects/:projectId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const projectId = paramToString(req.params.projectId);

    if (!businessId || !projectId) {
      return res.status(400).json({ error: 'Business ID and project ID are required' });
    }

    // Verify business ownership
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business || business.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const project = await prisma.contentProject.findUnique({
      where: { id: projectId },
      include: { reels: { include: { analytics: true } } },
    });

    if (!project || project.businessId !== businessId) {
      return res.status(404).json({ error: 'Content project not found' });
    }

    res.json({
      project: {
        id: project.id,
        inputType: project.inputType,
        status: project.status,
        reelsRequested: project.reelsRequested,
        reels: project.reels.map(r => ({
          id: r.id,
          title: r.title,
          hook: r.hook,
          platform: r.platform,
          status: r.status,
          prePublishScore: r.prePublishScore,
          engagement: r.analytics?.engagementRate || 0,
        })),
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  } catch (err) {
    console.error('Content project fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch content project' });
  }
});

// DELETE /businesses/:businessId/content-projects/:projectId - Delete a content project
app.delete('/businesses/:businessId/content-projects/:projectId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const projectId = paramToString(req.params.projectId);

    if (!businessId || !projectId) {
      return res.status(400).json({ error: 'Business ID and project ID are required' });
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business || business.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const project = await prisma.contentProject.findUnique({ where: { id: projectId } });
    if (!project || project.businessId !== businessId) {
      return res.status(404).json({ error: 'Content project not found' });
    }

    await prisma.contentProject.delete({ where: { id: projectId } });

    res.json({ message: 'Content project deleted successfully' });
  } catch (err) {
    console.error('Content project delete error:', err);
    res.status(500).json({ error: 'Failed to delete content project' });
  }
});

// POST /reel/:reelId/publish - Publish a reel to social media
app.post('/reel/:reelId/publish', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const reelId = paramToString(req.params.reelId);
    const { platforms = ['instagram', 'tiktok'] } = req.body;

    if (!reelId || !platforms || platforms.length === 0) {
      return res.status(400).json({ error: 'Reel ID and platforms are required' });
    }

    const reel = await prisma.reelVariant.findUnique({
      where: { id: reelId },
      include: { contentProject: { include: { business: true } } },
    });

    if (!reel) {
      return res.status(404).json({ error: 'Reel not found' });
    }

    // Verify ownership
    if (reel.contentProject.business.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Enqueue social posting job
    await enqueueSocialPosting({
      reelId,
      reelVariantId: reelId,
      platforms: platforms as any,
      businessId: reel.contentProject.businessId,
    });

    res.json({
      success: true,
      message: `Reel queued for publishing to ${platforms.join(', ')}`,
      reelId,
    });
  } catch (err) {
    console.error('Reel publish error:', err);
    res.status(500).json({ error: 'Failed to publish reel' });
  }
});

// GET /reel/:reelId/analytics - Get reel analytics
app.get('/reel/:reelId/analytics', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const reelId = paramToString(req.params.reelId);

    if (!reelId) {
      return res.status(400).json({ error: 'Reel ID is required' });
    }

    const reel = await prisma.reelVariant.findUnique({
      where: { id: reelId },
      include: { analytics: true, contentProject: { include: { business: true } } },
    });

    if (!reel) {
      return res.status(404).json({ error: 'Reel not found' });
    }

    // Verify ownership
    if (reel.contentProject.business.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      reel: {
        id: reel.id,
        title: reel.title,
        platform: reel.platform,
        status: reel.status,
        prePublishScore: reel.prePublishScore,
        analytics: reel.analytics || {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          engagementRate: 0,
        },
      },
    });
  } catch (err) {
    console.error('Reel analytics fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch reel analytics' });
  }
});

// --- SMS Notifications ---

// Send SMS to a lead
app.post('/businesses/:businessId/leads/:leadId/send-sms', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const leadId = paramToString(req.params.leadId);
    const { message, phoneNumber } = req.body;

    if (!businessId || !leadId || !message) {
      return res.status(400).json({ error: 'Business id, lead id, and message are required' });
    }

    // Verify ownership
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const userId = req.userId!;
    if (business.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Use provided phone number or try to infer from lead (in real app, store phone in DB)
    const phone = phoneNumber || lead.email; // In production, would have phone field in DB
    
    const success = await sendSMS(phone, message);

    if (success) {
      // Track SMS event
      await prisma.analytics.create({
        data: {
          businessId,
          eventType: 'sms_sent',
          eventData: { leadId, to: phone },
          source: 'sms',
        }
      });
    }

    res.json({
      success,
      message: success ? 'SMS sent successfully' : 'SMS sending failed (not configured)',
    });
  } catch (err) {
    console.error('SMS send error:', err);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

// Send SMS for booking confirmation
app.post('/businesses/:businessId/bookings/:bookingId/send-sms-confirmation', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const bookingId = paramToString(req.params.bookingId);
    const { phoneNumber } = req.body;

    if (!businessId || !bookingId) {
      return res.status(400).json({ error: 'Business id and booking id are required' });
    }

    // Verify ownership
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const userId = req.userId!;
    if (business.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const phone = phoneNumber || booking.email;
    const message = `Booking confirmed with ${business.name} on ${booking.date} at ${booking.time}. We look forward to seeing you!`;

    const success = await sendSMS(phone, message);

    if (success) {
      await prisma.analytics.create({
        data: {
          businessId,
          eventType: 'sms_booking_confirmation',
          eventData: { bookingId, to: phone },
          source: 'sms',
        }
      });
    }

    res.json({
      success,
      message: success ? 'Confirmation SMS sent' : 'SMS sending failed (not configured)',
    });
  } catch (err) {
    console.error('Booking SMS error:', err);
    res.status(500).json({ error: 'Failed to send booking confirmation SMS' });
  }
});

// --- Calendar Integration (Google Calendar / Outlook) ---

// OAuth callback for Google Calendar
app.get('/calendar/oauth-callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      return res.status(400).json({ error: 'Missing authorization code or state' });
    }

    // In production, exchange code for tokens and store in DB
    // For now, log the intent
    console.log(`[Calendar OAuth] Authorization received for state: ${state}`);
    
    res.json({
      message: 'Calendar OAuth callback received. Please store the authorization code.',
      code,
      state,
    });
  } catch (err) {
    console.error('Calendar OAuth error:', err);
    res.status(500).json({ error: 'OAuth callback failed' });
  }
});

// Connect Google Calendar to a business
app.post('/businesses/:businessId/calendar/connect-google', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const { accessToken, refreshToken } = req.body;

    if (!businessId) return res.status(400).json({ error: 'Business id is required' });
    if (!accessToken || !refreshToken) {
      return res.status(400).json({ error: 'Access token and refresh token are required' });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const userId = req.userId!;
    if (business.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Encrypt calendar credentials before storage
    const credentialsJson = JSON.stringify({ accessToken, refreshToken });
    const encryptedCredentials = encryptData(credentialsJson);

    // Store encrypted calendar credentials
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        googleCalendarTokens: encryptedCredentials,
        analysis: {
          ...(business.analysis as any || {}),
          calendarType: 'google',
          calendarConnected: true,
        }
      }
    });

    // Track calendar integration
    await prisma.analytics.create({
      data: {
        businessId,
        eventType: 'calendar_connected',
        eventData: { provider: 'google' },
      }
    });

    logger.info('Google Calendar connected', { businessId });
    res.json({
      message: 'Google Calendar connected successfully',
      business: { ...updatedBusiness, googleCalendarTokens: undefined }, // Don't expose tokens
    });
  } catch (err) {
    console.error('Calendar connect error:', err);
    res.status(500).json({ error: 'Failed to connect calendar' });
  }
});

// Sync bookings to Google Calendar
app.post('/businesses/:businessId/calendar/sync-bookings', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);

    if (!businessId) return res.status(400).json({ error: 'Business id is required' });

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { bookings: true }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const userId = req.userId!;
    if (business.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // In production: use google.calendar().events.insert() for each booking
    // For now, log the sync intent
    console.log(`[Calendar Sync] Syncing ${business.bookings.length} bookings for business ${businessId}`);

    // Track sync event
    await prisma.analytics.create({
      data: {
        businessId,
        eventType: 'calendar_sync',
        eventData: { bookingCount: business.bookings.length },
      }
    });

    res.json({
      message: `Synced ${business.bookings.length} bookings to Google Calendar`,
      synced: business.bookings.length,
    });
  } catch (err) {
    console.error('Calendar sync error:', err);
    res.status(500).json({ error: 'Failed to sync bookings' });
  }
});

// Get calendar availability for a business
app.get('/businesses/:businessId/calendar/availability', async (req: Request, res: Response) => {
  try {
    const businessId = paramToString(req.params.businessId);
    const { date } = req.query;

    if (!businessId) return res.status(400).json({ error: 'Business id is required' });

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        bookings: true,
        availableSlots: true,
      }
    });

    if (!business || !business.isPublished) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Get booked times for the date
    const bookedTimes = business.bookings
      .filter(b => b.date === date)
      .map(b => b.time);

    // Get available slots for the date
    const dateObj = new Date(date as string);
    const dayOfWeek = dateObj.getDay();
    const availableSlots = business.availableSlots.filter(s => s.dayOfWeek === dayOfWeek);

    res.json({
      date,
      bookedTimes,
      availableSlots,
      isCalendarConnected: (business.analysis as any)?.calendarConnected || false,
    });
  } catch (err) {
    console.error('Calendar availability error:', err);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// --- TEAM MANAGEMENT ENDPOINTS ---

// Create or get team for business
app.post('/businesses/:businessId/team', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params as { businessId: string };
    const { name } = req.body;

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { user: true },
    });

    if (!business || business.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    let team = await prisma.team.findUnique({
      where: { businessId },
      include: { members: true },
    });

    if (!team) {
      team = await prisma.team.create({
        data: {
          businessId,
          name: name || `${business.name} Team`,
          members: {
            create: {
              userId: business.userId,
              email: business.user.email,
              role: 'admin',
              status: 'active',
              joinedAt: new Date(),
            },
          },
        },
        include: { members: true },
      });
    }

    res.json(team);
  } catch (err) {
    console.error('Team creation error:', err);
    res.status(500).json({ error: 'Failed to create/get team' });
  }
});

// Invite team member
app.post('/businesses/:businessId/team/invite', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params as { businessId: string };
    const { email, role } = req.body;

    if (!email) return res.status(400).json({ error: 'Email required' });

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { user: true },
    });

    if (!business || business.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    let team = await prisma.team.findUnique({ where: { businessId } });
    if (!team) {
      team = await prisma.team.create({
        data: { businessId, name: `${business.name} Team` },
      });
    }

    const existingMember = await prisma.teamMember.findUnique({
      where: { teamId_email: { teamId: team.id, email } },
    });

    if (existingMember) {
      return res.status(400).json({ error: 'User already invited' });
    }

    const member = await prisma.teamMember.create({
      data: {
        teamId: team.id,
        email,
        role: role || 'member',
        userId: '', // Will be set when user accepts invite
        status: 'invited',
      },
    });

    // Send invitation email
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3002'}/join-team?token=${Buffer.from(`${team.id}:${email}`).toString('base64')}`;
    if (transporter) {
      await transporter.sendMail({
        to: email,
        subject: `You're invited to ${business.name}'s team`,
        html: `<p>You've been invited to join <strong>${business.name}'s team</strong> on SalesAPE.</p><p><a href="${inviteLink}">Accept Invitation</a></p>`,
      });
    }

    res.json({ member, inviteLink });
  } catch (err) {
    console.error('Team invite error:', err);
    res.status(500).json({ error: 'Failed to invite member' });
  }
});

// Get team members
app.get('/businesses/:businessId/team/members', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params as { businessId: string };

    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business || business.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const team = await prisma.team.findUnique({
      where: { businessId },
      include: { members: true },
    });

    res.json(team?.members || []);
  } catch (err) {
    console.error('Get team members error:', err);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// --- LEAD ROUTING ENDPOINTS ---

// Create lead routing rule
app.post('/businesses/:businessId/lead-routing', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params as { businessId: string };
    const { assignTo, service, leadSource, priority } = req.body;

    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business || business.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    let team = await prisma.team.findUnique({ where: { businessId } });
    if (!team) {
      team = await prisma.team.create({
        data: { businessId, name: `${business.name} Team` },
      });
    }

    const rule = await prisma.leadRoutingRule.create({
      data: {
        teamId: team.id,
        assignTo,
        service: service || null,
        leadSource: leadSource || null,
        priority: priority || 0,
      },
    });

    res.json(rule);
  } catch (err) {
    console.error('Lead routing creation error:', err);
    res.status(500).json({ error: 'Failed to create routing rule' });
  }
});

// Get lead routing rules
app.get('/businesses/:businessId/lead-routing', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params as { businessId: string };

    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business || business.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const team = await prisma.team.findUnique({
      where: { businessId },
      include: { leadRoutingRules: true },
    });

    res.json(team?.leadRoutingRules || []);
  } catch (err) {
    console.error('Get lead routing error:', err);
    res.status(500).json({ error: 'Failed to fetch routing rules' });
  }
});

// Update lead routing rule
app.patch('/lead-routing/:ruleId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { ruleId } = req.params as { ruleId: string };
    const { isActive, priority } = req.body;

    const rule = await prisma.leadRoutingRule.update({
      where: { id: ruleId },
      data: {
        isActive: isActive !== undefined ? isActive : undefined,
        priority: priority !== undefined ? priority : undefined,
      },
    });

    res.json(rule);
  } catch (err) {
    console.error('Update lead routing error:', err);
    res.status(500).json({ error: 'Failed to update routing rule' });
  }
});

// --- SUBSCRIPTION & PAYMENT ENDPOINTS ---

// Get subscription info
app.get('/businesses/:businessId/subscription', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params as { businessId: string };

    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business || business.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    let subscription = await prisma.subscription.findUnique({
      where: { businessId },
    });

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          businessId,
          planId: 'basic',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    res.json(subscription);
  } catch (err) {
    console.error('Get subscription error:', err);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Get payment history
app.get('/businesses/:businessId/payments', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params as { businessId: string };

    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business || business.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const payments = await prisma.payment.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(payments);
  } catch (err) {
    console.error('Get payments error:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Create payment (simulated for MVP)
app.post('/businesses/:businessId/payments', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params as { businessId: string };
    const { amount, planId } = req.body;

    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business || business.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const payment = await prisma.payment.create({
      data: {
        businessId,
        amount: amount * 100, // Convert to cents
        description: `Upgrade to ${planId} plan`,
        status: 'succeeded', // Simulated success for MVP
      },
    });

    // Update subscription
    await prisma.subscription.update({
      where: { businessId },
      data: {
        planId,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({ payment, message: 'Payment processed successfully' });
  } catch (err) {
    console.error('Create payment error:', err);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// --- PHASE 5: Website Creation Endpoints ---

app.get('/websites/questions', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try {
    const questions = [
      { id: 'business_name', label: 'What is your business name?' },
      { id: 'business_type', label: 'What type of business do you run?' },
      { id: 'services', label: 'What services or products do you offer?' },
      { id: 'audience', label: 'Who is your ideal customer?' },
      { id: 'location', label: 'Where are you located / who do you serve?' },
      { id: 'brand_voice', label: 'What brand tone should we use?' },
      { id: 'cta', label: 'What is your primary call to action?' },
    ];
    res.json({ questions });
  } catch (error) {
    logger.error('Get website questions error', { error: String(error) });
    res.status(500).json({ error: 'Failed to load website questions' });
  }
});

// Get questionnaire questions for website builder
app.post('/websites/questionnaire', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const questions = [
      {
        id: 1,
        category: 'businessType',
        question: 'What type of business are you?',
        type: 'select',
        options: ['E-commerce', 'Services', 'SaaS', 'Freelancer', 'Agency', 'Other']
      },
      {
        id: 2,
        category: 'businessName',
        question: 'What is your business name?',
        type: 'text',
        placeholder: 'E.g., Acme Consulting'
      },
      {
        id: 3,
        category: 'industry',
        question: 'What industry are you in?',
        type: 'text',
        placeholder: 'E.g., Digital Marketing'
      },
      {
        id: 4,
        category: 'primaryGoal',
        question: 'What is your primary goal?',
        type: 'select',
        options: ['Generate Leads', 'Make Sales', 'Build Brand', 'Get Bookings', 'Get Inquiries']
      },
      {
        id: 5,
        category: 'targetAudience',
        question: 'Describe your target audience',
        type: 'text',
        placeholder: 'E.g., Small business owners aged 25-45'
      },
      {
        id: 6,
        category: 'uniqueValue',
        question: 'What makes you unique?',
        type: 'text',
        placeholder: 'E.g., 10 years of experience, affordable prices'
      },
      {
        id: 7,
        category: 'desiredFeatures',
        question: 'Which features do you want?',
        type: 'checkbox',
        options: ['Contact Form', 'Online Booking', 'Blog', 'Testimonials', 'Gallery', 'Pricing Table', 'Live Chat']
      },
      {
        id: 8,
        category: 'budget',
        question: 'What is your budget?',
        type: 'select',
        options: ['Under $500', '$500 - $1000', '$1000 - $5000', '$5000+', 'Not sure']
      }
    ];

    res.json({ questions });
  } catch (err) {
    console.error('Get questionnaire error:', err);
    res.status(500).json({ error: 'Failed to load questions' });
  }
});

// Submit questionnaire answers and create website
app.post('/websites/questionnaire/submit', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { answers } = req.body;
    const userId = req.userId!;

    console.log('🎯 Questionnaire submit - received answers:', JSON.stringify(answers, null, 2));
    console.log('🎯 Questionnaire submit - desiredFeatures:', answers?.desiredFeatures);

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Answers are required' });
    }

    // Find or create business from answers
    const businessName = answers.businessName || 'My Business';
    const description = `${answers.uniqueValue || ''} - Primary goal: ${answers.primaryGoal || ''}`;

    const business = await prisma.business.create({
      data: {
        userId,
        name: businessName,
        url: `https://temp-${Date.now()}.example.com`,
        description,
        phone: answers.phone || undefined,
        address: answers.address || undefined,
        analysis: {
          questionnaire: answers,
          generatedAt: new Date(),
        },
      },
    });

    // Generate AI recommendation based on answers
    const recommendation = {
      suggestedPageTypes: generateSuggestedPages(answers),
      suggestedFeatures: answers.desiredFeatures || [],
      insights: generateInsights(answers),
      estimatedTimeframe: '3-5 days',
      estimatedCost: estimateCost(answers.budget),
    };

    res.json({
      businessId: business.id,
      recommendation,
      message: 'Website creation started! Check your email for next steps.'
    });
  } catch (err) {
    console.error('Submit questionnaire error:', err);
    res.status(500).json({ error: 'Failed to create website' });
  }
});

// Send message to AI chat for website inquiry
app.post('/websites/chat', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { message, sessionId, businessId } = req.body;
    const userId = req.userId!;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Simple AI response generation (can be replaced with actual LLM like OpenAI)
    const aiResponse = generateChatResponse(message);

    // Store chat history in analytics for future reference
    if (businessId) {
      await prisma.analytics.create({
        data: {
          businessId,
          eventType: 'website_chat_message',
          eventData: {
            sessionId,
            userMessage: message,
            aiResponse,
            timestamp: new Date().toISOString(),
          },
        },
      }).catch(() => {
        // Silently fail if no business ID yet
      });
    }

    res.json({
      response: aiResponse,
      sessionId: sessionId || `session_${Date.now()}`,
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Helper functions

/**
 * Generate platform-specific content using AI
 * Converts generic content into platform-optimized format
 */
async function generatePlatformContent(
  sourceContent: string,
  platform: string,
  businessName: string
): Promise<{ content: string; caption?: string; hashtags?: string[] }> {
  try {
    // For MVP, generate template-based content
    // In production, this would call an AI service (Claude, GPT, etc.)
    
    const contentMap: { [key: string]: (src: string, bn: string) => any } = {
      instagram: (src, bn) => ({
        content: src.substring(0, 2200), // Instagram caption limit
        caption: `🚀 New from ${bn}. ${src.substring(0, 100)}...`,
        hashtags: ['#business', '#socialmedia', '#content', `#${bn.toLowerCase().replace(/\s+/g, '')}`],
      }),
      twitter: (src, bn) => ({
        content: src.substring(0, 280), // Twitter limit
        caption: `💡 From ${bn}: ${src.substring(0, 150)}...`,
        hashtags: ['#business', '#news'],
      }),
      linkedin: (src, bn) => ({
        content: src.substring(0, 3000), // LinkedIn limit
        caption: `📊 Insights from ${bn}\n\n${src}`,
        hashtags: ['#business', '#insights', '#professional'],
      }),
      tiktok: (src, bn) => ({
        content: src.substring(0, 1500),
        caption: `✨ Check out ${bn}! ${src.substring(0, 80)}...`,
        hashtags: ['#trending', '#business', '#foryou'],
      }),
      facebook: (src, bn) => ({
        content: src.substring(0, 5000),
        caption: `👋 Welcome to ${bn}!\n\n${src}`,
        hashtags: ['#business', '#community'],
      }),
    };

    const generator = contentMap[platform.toLowerCase()] || contentMap.instagram;
    return generator(sourceContent, businessName);
  } catch (err) {
    logger.warn('Platform content generation error', { error: String(err), platform });
    // Return fallback content
    return {
      content: sourceContent.substring(0, 280),
      caption: sourceContent.substring(0, 100),
      hashtags: ['#business'],
    };
  }
}

function generateSuggestedPages(answers: any): string[] {
  const pages = ['Home', 'About', 'Services/Products'];
  if (answers.primaryGoal === 'Generate Leads') pages.push('Contact', 'Lead Magnet');
  if (answers.primaryGoal === 'Make Sales') pages.push('Shop', 'Checkout');
  if (answers.primaryGoal === 'Get Bookings') pages.push('Booking', 'Calendar');
  if (answers.businessType === 'SaaS') pages.push('Pricing', 'Features');
  return pages;
}

function generateInsights(answers: any): string[] {
  const insights: string[] = [];
  if (answers.desiredFeatures?.includes('Contact Form')) {
    insights.push('✓ Contact form integration will help capture leads automatically');
  }
  if (answers.primaryGoal === 'Make Sales') {
    insights.push('✓ Add social proof testimonials to increase conversion rates');
  }
  if (answers.targetAudience) {
    insights.push(`✓ Optimizing for your audience: ${answers.targetAudience}`);
  }
  if (!insights.length) {
    insights.push('✓ Mobile-optimized design for all devices');
    insights.push('✓ Fast loading speeds for better user experience');
  }
  return insights;
}

function estimateCost(budget: string): string {
  const budgetMap: { [key: string]: string } = {
    'Under $500': '$299/month',
    '$500 - $1000': '$499/month',
    '$1000 - $5000': '$799/month',
    '$5000+': 'Custom pricing',
    'Not sure': '$399/month (recommended)',
  };
  return budgetMap[budget] || '$399/month';
}

function generateChatResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hi there! 👋 I'm your AI assistant. I'll help you build the perfect website for your business. What type of business do you run?";
  }
  if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
    return "Our website builder starts at $299/month for basic sites. For more complex businesses, we have flexible plans up to $5000+. What's your budget range?";
  }
  if (lowerMessage.includes('feature') || lowerMessage.includes('feature')) {
    return "We offer many features: contact forms, booking systems, blogs, galleries, live chat, and more! Which features are most important for your business?";
  }
  if (lowerMessage.includes('how long') || lowerMessage.includes('timeline')) {
    return "Most websites are ready in 3-5 days. Complex custom builds may take 1-2 weeks. When do you need your site live?";
  }
  if (lowerMessage.includes('lead') || lowerMessage.includes('sales')) {
    return "Great! We can integrate lead capture forms, email sequences, and analytics to track your results. Tell me more about your business model?";
  }
  
  // Default response
  return "That's interesting! Tell me more about your business and what you're hoping to achieve with your website. 🚀";
}

// Sentry removed: no error handler attached here

// --- Server Startup ---
const server = app.listen(PORT, () => {
  console.log(`[Server] running on http://localhost:${PORT}`);
  console.log('[Server] ready for connections');
  console.log('[Database] Prisma client connected');
  startAutoPageSpeedAuditScheduler();
});

server.on('error', (err: any) => {
  const message = err && err.message ? err.message : String(err);
  console.error('[Server Error]', message);
  if (err?.code === 'EADDRINUSE') {
    console.error(`[Server Error] Port ${PORT} is already in use. Stop the existing backend process before starting a new one.`);
  }
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (autoAuditTimer) {
    clearInterval(autoAuditTimer);
    autoAuditTimer = null;
  }
  server.close(() => {
    console.log('Server closed');
    prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  if (autoAuditTimer) {
    clearInterval(autoAuditTimer);
    autoAuditTimer = null;
  }
  server.close(() => {
    console.log('Server closed');
    prisma.$disconnect();
    process.exit(0);
  });
});


// ===== PHASE 4: ANALYTICS, SCHEDULING, APPROVAL, TEAM COLLABORATION =====

// --- Analytics Dashboard Endpoints ---

/**
 * GET /businesses/:businessId/dashboard
 * Get comprehensive dashboard metrics
 */
app.get('/businesses/:businessId/dashboard', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params;
    
    // Check permission
    await requirePermission(businessId, req.userId || '', 'viewDashboard');

    const metrics = await getDashboardMetrics(businessId);

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error('Dashboard error', { error: String(error) });
    res.status(500).json({ error: 'Failed to get dashboard metrics' });
  }
});

/**
 * GET /businesses/:businessId/analytics/by-platform/:platform
 * Get detailed metrics for a specific platform
 */
app.get('/businesses/:businessId/analytics/by-platform/:platform', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId, platform } = req.params;
    
    await requirePermission(businessId, req.userId || '', 'viewAnalytics');

    const metrics = await getPlatformMetrics(businessId, platform);

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error('Platform metrics error', { error: String(error) });
    res.status(500).json({ error: 'Failed to get platform metrics' });
  }
});

/**
 * GET /businesses/:businessId/analytics/trends
 * Get trend data over time
 */
app.get('/businesses/:businessId/analytics/trends', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params;
    const daysParam = req.query.days as string;
    const days = daysParam ? parseInt(daysParam) : 30;

    await requirePermission(businessId, req.userId || '', 'viewAnalytics');

    const trends = await getTrendData(businessId, days);

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    logger.error('Trends error', { error: String(error) });
    res.status(500).json({ error: 'Failed to get trend data' });
  }
});

/**
 * POST /businesses/:businessId/analytics/compare
 * Compare metrics between two date ranges
 */
app.post('/businesses/:businessId/analytics/compare', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params;
    const { startDate1, endDate1, startDate2, endDate2 } = req.body;

    await requirePermission(businessId, req.userId || '', 'viewAnalytics');

    if (!startDate1 || !endDate1 || !startDate2 || !endDate2) {
      return res.status(400).json({ error: 'Missing date range parameters' });
    }

    const comparison = await getComparison(
      businessId,
      new Date(startDate1),
      new Date(endDate1),
      new Date(startDate2),
      new Date(endDate2)
    );

    res.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    logger.error('Comparison error', { error: String(error) });
    res.status(500).json({ error: 'Failed to compare metrics' });
  }
});

/**
 * GET /businesses/:businessId/analytics/revenue
 * Get revenue attribution from content
 */
app.get('/businesses/:businessId/analytics/revenue', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params;
    
    await requirePermission(businessId, req.userId || '', 'viewAnalytics');

    const revenue = await getRevenueAttribution(businessId);

    res.json({
      success: true,
      data: revenue,
    });
  } catch (error) {
    logger.error('Revenue attribution error', { error: String(error) });
    res.status(500).json({ error: 'Failed to get revenue attribution' });
  }
});

// --- Scheduling Endpoints ---

/**
 * GET /businesses/:businessId/schedule
 * Get all scheduled posts with optional filters
 */
app.get('/businesses/:businessId/schedule', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params;
    const { status, platform, from, to } = req.query;

    await requirePermission(businessId, req.userId || '', 'viewSchedule');

    const filters = {
      status: status as string | undefined,
      platformFilter: platform as string | undefined,
      from: from ? new Date(from as string) : undefined,
      to: to ? new Date(to as string) : undefined,
    };

    const scheduled = await getScheduledPosts(businessId, filters);

    res.json({
      success: true,
      data: scheduled,
    });
  } catch (error) {
    logger.error('Get schedule error', { error: String(error) });
    res.status(500).json({ error: 'Failed to get schedule' });
  }
});

/**
 * POST /businesses/:businessId/schedule
 * Schedule content for future publishing
 */
app.post('/businesses/:businessId/schedule', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params;
    const { repurposedContentId, scheduledFor } = req.body;

    await requirePermission(businessId, req.userId || '', 'scheduleContent');

    if (!repurposedContentId || !scheduledFor) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const scheduled = await scheduleContent(businessId, repurposedContentId, new Date(scheduledFor));

    res.json({
      success: true,
      message: 'Content scheduled successfully',
      data: scheduled,
    });
  } catch (error) {
    logger.error('Schedule content error', { error: String(error) });
    res.status(500).json({ error: 'Failed to schedule content' });
  }
});

/**
 * GET /businesses/:businessId/schedule/calendar
 * Get schedule view grouped by date for calendar display
 */
app.get('/businesses/:businessId/schedule/calendar', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params;
    const monthParam = req.query.month as string;
    const month = monthParam ? new Date(monthParam) : new Date();

    await requirePermission(businessId, req.userId || '', 'viewSchedule');

    const calendar = await getScheduleCalendar(businessId, month);

    res.json({
      success: true,
      data: calendar,
    });
  } catch (error) {
    logger.error('Schedule calendar error', { error: String(error) });
    res.status(500).json({ error: 'Failed to get calendar' });
  }
});

/**
 * PUT /businesses/:businessId/schedule/:scheduledPostId
 * Update scheduled post time or status
 */
app.put('/businesses/:businessId/schedule/:scheduledPostId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId, scheduledPostId } = req.params;
    const { scheduledFor, status } = req.body;

    await requirePermission(businessId, req.userId || '', 'scheduleContent');

    const updated = await updateSchedule(businessId, scheduledPostId, { scheduledFor, status } as any);

    res.json({
      success: true,
      message: 'Schedule updated',
      data: updated,
    });
  } catch (error) {
    logger.error('Update schedule error', { error: String(error) });
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

/**
 * DELETE /businesses/:businessId/schedule/:scheduledPostId
 * Cancel a scheduled post
 */
app.delete('/businesses/:businessId/schedule/:scheduledPostId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId, scheduledPostId } = req.params;

    await requirePermission(businessId, req.userId || '', 'scheduleContent');

    const result = await cancelSchedule(businessId, scheduledPostId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Cancel schedule error', { error: String(error) });
    res.status(500).json({ error: 'Failed to cancel schedule' });
  }
});

/**
 * POST /businesses/:businessId/schedule/bulk
 * Bulk schedule multiple posts
 */
app.post('/businesses/:businessId/schedule/bulk', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params;
    const { schedules } = req.body;

    await requirePermission(businessId, req.userId || '', 'scheduleContent');
    await requirePermission(businessId, req.userId || '', 'bulkActions');

    if (!Array.isArray(schedules)) {
      return res.status(400).json({ error: 'schedules must be an array' });
    }

    const results = await bulkSchedule(businessId, schedules);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    logger.error('Bulk schedule error', { error: String(error) });
    res.status(500).json({ error: 'Failed to bulk schedule' });
  }
});

/**
 * GET /businesses/:businessId/schedule/upcoming
 * Get upcoming scheduled posts
 */
app.get('/businesses/:businessId/schedule/upcoming', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params;
    const daysParam = req.query.days as string;
    const days = daysParam ? parseInt(daysParam) : 7;

    await requirePermission(businessId, req.userId || '', 'viewSchedule');

    const upcoming = await getUpcomingSchedules(businessId, days);

    res.json({
      success: true,
      data: upcoming,
    });
  } catch (error) {
    logger.error('Get upcoming error', { error: String(error) });
    res.status(500).json({ error: 'Failed to get upcoming schedules' });
  }
});

/**
 * GET /businesses/:businessId/schedule/stats
 * Get scheduling statistics
 */
app.get('/businesses/:businessId/schedule/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params;

    await requirePermission(businessId, req.userId || '', 'viewSchedule');

    const stats = await getSchedulingStats(businessId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Schedule stats error', { error: String(error) });
    res.status(500).json({ error: 'Failed to get scheduling stats' });
  }
});

// --- Approval Workflow Endpoints ---

/**
 * GET /businesses/:businessId/approval-queue
 * Get content pending approval
 */
app.get('/businesses/:businessId/approval-queue', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params;
    const limitParam = req.query.limit as string;
    const limit = limitParam ? parseInt(limitParam) : 20;

    await requirePermission(businessId, req.userId || '', 'viewApprovalQueue');

    const queue = await getApprovalQueue(businessId, limit);

    res.json({
      success: true,
      data: queue,
    });
  } catch (error) {
    logger.error('Approval queue error', { error: String(error) });
    res.status(500).json({ error: 'Failed to get approval queue' });
  }
});

/**
 * POST /businesses/:businessId/repurposed-content/:repurposedContentId/approve
 * Approve content for publishing
 */
app.post('/businesses/:businessId/repurposed-content/:repurposedContentId/approve', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId, repurposedContentId } = req.params;
    const { comment } = req.body;

    await requirePermission(businessId, req.userId || '', 'approveContent');

    const result = await approveContent(businessId, repurposedContentId, req.userId || '', comment);

    res.json({
      success: true,
      message: 'Content approved',
      data: result,
    });
  } catch (error) {
    logger.error('Approve content error', { error: String(error) });
    res.status(500).json({ error: 'Failed to approve content' });
  }
});

/**
 * POST /businesses/:businessId/repurposed-content/:repurposedContentId/reject
 * Reject content and send back for revision
 */
app.post('/businesses/:businessId/repurposed-content/:repurposedContentId/reject', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId, repurposedContentId } = req.params;
    const { reason } = req.body;

    await requirePermission(businessId, req.userId || '', 'rejectContent');

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const result = await rejectContent(businessId, repurposedContentId, req.userId || '', reason);

    res.json({
      success: true,
      message: 'Content rejected',
      data: result,
    });
  } catch (error) {
    logger.error('Reject content error', { error: String(error) });
    res.status(500).json({ error: 'Failed to reject content' });
  }
});

/**
 * GET /businesses/:businessId/repurposed-content/:repurposedContentId/approval-history
 * Get approval history for specific content
 */
app.get('/businesses/:businessId/repurposed-content/:repurposedContentId/approval-history', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId, repurposedContentId } = req.params;

    await requirePermission(businessId, req.userId || '', 'viewApprovalQueue');

    const history = await getApprovalHistory(businessId, repurposedContentId);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    logger.error('Approval history error', { error: String(error) });
    res.status(500).json({ error: 'Failed to get approval history' });
  }
});

/**
 * GET /businesses/:businessId/approval-stats
 * Get approval workflow statistics
 */
app.get('/businesses/:businessId/approval-stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params;

    await requirePermission(businessId, req.userId || '', 'viewAnalytics');

    const stats = await getApprovalStats(businessId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Approval stats error', { error: String(error) });
    res.status(500).json({ error: 'Failed to get approval stats' });
  }
});

/**
 * POST /businesses/:businessId/approval/bulk
 * Bulk approve multiple content items
 */
app.post('/businesses/:businessId/approval/bulk', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params;
    const { contentIds, comment } = req.body;

    await requirePermission(businessId, req.userId || '', 'approveContent');
    await requirePermission(businessId, req.userId || '', 'bulkActions');

    if (!Array.isArray(contentIds)) {
      return res.status(400).json({ error: 'contentIds must be an array' });
    }

    const results = await bulkApprove(businessId, contentIds, req.userId || '', comment);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    logger.error('Bulk approve error', { error: String(error) });
    res.status(500).json({ error: 'Failed to bulk approve' });
  }
});

// --- Team Permissions Endpoints ---

/**
 * GET /businesses/:businessId/team/members
 * Get all team members and their roles
 */
app.get('/businesses/:businessId/team/members', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params;

    await requirePermission(businessId, req.userId || '', 'manageTeam');

    const members = await getTeamMembers(businessId);

    res.json({
      success: true,
      data: members,
    });
  } catch (error) {
    logger.error('Get team members error', { error: String(error) });
    res.status(500).json({ error: 'Failed to get team members' });
  }
});

/**
 * PUT /businesses/:businessId/team/members/:memberId/role
 * Update team member role
 */
app.put('/businesses/:businessId/team/members/:memberId/role', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId, memberId } = req.params;
    const { role } = req.body;

    await requirePermission(businessId, req.userId || '', 'manageTeam');

    if (!role || !['admin', 'content-manager', 'approver', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Validate role change
    const validation = await validateRoleChange(businessId, memberId, role);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    const updated = await updateMemberRole(businessId, memberId, role);

    res.json({
      success: true,
      message: 'Role updated',
      data: updated,
    });
  } catch (error) {
    logger.error('Update member role error', { error: String(error) });
    res.status(500).json({ error: 'Failed to update role' });
  }
});

/**
 * DELETE /businesses/:businessId/team/members/:memberId
 * Remove team member
 */
app.delete('/businesses/:businessId/team/members/:memberId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId, memberId } = req.params;

    await requirePermission(businessId, req.userId || '', 'manageTeam');

    const result = await removeMember(businessId, memberId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Remove member error', { error: String(error) });
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

/**
 * GET /businesses/:businessId/team/permissions
 * Get current user's permissions for this business
 */
app.get('/businesses/:businessId/team/permissions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params;

    const permissions = await getUserPermissions(businessId, req.userId || '');

    res.json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    logger.error('Get permissions error', { error: String(error) });
    res.status(500).json({ error: 'Failed to get permissions' });
  }
});

/**
 * GET /team/role-descriptions
 * Get descriptions of all available roles
 */
app.get('/team/role-descriptions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const descriptions = getRoleDescriptions();

    res.json({
      success: true,
      data: descriptions,
    });
  } catch (error) {
    logger.error('Get role descriptions error', { error: String(error) });
    res.status(500).json({ error: 'Failed to get role descriptions' });
  }
});

/**
 * GET /team/permissions-matrix
 * Get full permissions matrix for display
 */
app.get('/team/permissions-matrix', authenticateToken, async (req: Request, res: Response) => {
  try {
    const matrix = getPermissionsMatrix();

    res.json({
      success: true,
      data: matrix,
    });
  } catch (error) {
    logger.error('Get permissions matrix error', { error: String(error) });
    res.status(500).json({ error: 'Failed to get permissions matrix' });
  }
});

export default app;
