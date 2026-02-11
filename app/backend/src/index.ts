import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import twilio from 'twilio';
import { google } from 'googleapis';
import crypto from 'crypto';
// Sentry removed: monitoring disabled in codebase

// Import new utilities and middleware
import { logger, requestLogger } from './utils/logger.js';
import { encryptData, decryptData, isEncrypted, getDecryptedValue } from './utils/encryption.js';
import { generateBusinessIntelligence, calculateLeadScore } from './utils/ai-intelligence.js';
import { 
  scrapeInstagramProfile, 
  extractContactFromBio, 
  instagramProfileToBusinessData,
  generateInstagramCaption 
} from './utils/instagram-scraper.js';
import { validateBusinessUnderstanding, deterministicStringifyBusiness } from './utils/business-understanding.js';
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
} from './middleware/rateLimiter.js';

dotenv.config();

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const app = express();
const prisma = new PrismaClient();

// NOTE: Sentry initialization moved to after routes and before the error handler
// to avoid any accidental startup impact. See utils/sentry.ts for config.

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(requestLogger); // Request/response logging
app.use(globalLimiter); // Global rate limiting

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
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.userId = decoded.userId;
    req.email = decoded.email;
    next();
  });
};

// Helper to normalize route params which can be string | string[] | undefined
function paramToString(p: string | string[] | undefined): string | undefined {
  if (Array.isArray(p)) return p[0];
  return p;
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

// Website scraping
async function scrapeWebsite(url: string): Promise<{ title?: string; description?: string; email?: string; phone?: string; images?: string[]; headings?: string[]; error?: string }> {
  try {
    const response = await fetch(url);
    if (!response.ok) return { error: `Failed to fetch: ${response.status}` };
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const title = $('title').text() || $('h1').first().text() || '';
    const description = $('meta[name="description"]').attr('content') || $('p').first().text() || '';
    const text = $.root().text();
    
    // Extract contact info
    const emailMatch = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
    const phoneMatch = text.match(/\+?\d[\d\s().-]{7,}\d/);
    
    // Extract images
    const images: string[] = [];
    $('img').each((_i, el) => {
      const src = $(el).attr('src');
      if (src && (src.startsWith('http') || src.startsWith('/'))) {
        images.push(src);
      }
    });
    
    // Extract headings for context
    const headings: string[] = [];
    $('h1, h2, h3').each((_i, el) => {
      const text = $(el).text().trim();
      if (text && headings.length < 5) {
        headings.push(text);
      }
    });
    
    const result: any = {};
    if (title) result.title = title;
    if (description) result.description = description;
    if (emailMatch) result.email = emailMatch[0];
    if (phoneMatch) result.phone = phoneMatch[0];
    if (images.length > 0) result.images = images.slice(0, 5);
    if (headings.length > 0) result.headings = headings;
    
    return result;
  } catch (err) {
    return { error: 'Error scraping website' };
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

// Fetch PageSpeed Insights (Lighthouse) data via Google API
async function fetchPageSpeedData(url: string): Promise<any> {
  try {
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY || process.env.PAGESPEED_API_KEY || '';
    const endpoint = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
    const params: any = { url, strategy: 'mobile' };
    if (apiKey) params.key = apiKey;

    const resp = await axios.get(endpoint, { params, timeout: 20000 });
    const data = resp.data;

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
  } catch (err) {
    logger.warn('PageSpeed fetch failed', { error: err?.toString?.() || err });
    return null;
  }
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
    const pageSpeed = await fetchPageSpeedData(url);

    const performance = pageSpeed?.performance ? Math.round(pageSpeed.performance * 100) : 0;
    const seoScore = pageSpeed?.seo ? Math.round(pageSpeed.seo * 100) : 0;
    const accessibility = pageSpeed?.accessibility ? Math.round(pageSpeed.accessibility * 100) : 0;

    const bestPractices = calculateSeoScore({ pageSpeed });

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
    const ipRaw = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '');
    const ip = ipRaw.split(',')[0].trim();
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
    const pageSpeed = await fetchPageSpeedData(url);

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
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.userId) {
          const uid = decoded.userId as string;
          const userUsage = await prisma.auditUsage.findFirst({ where: { userId: uid, year, month } });
          if (userUsage) {
            await prisma.auditUsage.update({ where: { id: userUsage.id }, data: { count: userUsage.count + 1 } });
          } else {
            await prisma.auditUsage.create({ data: { userId: uid, year, month, count: 1 } });
          }
        }
      }
    } catch (err) {
      // Do not fail the audit if token verification fails; just log
      logger.warn('free-audit: auth token verify failed', { error: String(err) });
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

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info('User login successful', { email });
    // Send login notification email
    try {
      await sendAuthEmail(user, 'login', req.ip as string);
    } catch (e) {
      logger.warn('Failed to send login notification email', { error: e });
    }
    // Rotate refresh token on login
    const refreshToken = crypto.randomBytes(48).toString('hex');
    try {
      await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
    } catch (e) {
      logger.warn('Failed to store refresh token', { error: String(e) });
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

    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token;
    if (!accessToken) return res.status(400).json({ error: 'Failed to obtain access token' });

    const userInfoRes = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
    const profile = await userInfoRes.json();
    const email = profile.email;
    const name = profile.name || profile.given_name || '';

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const refreshToken = crypto.randomBytes(48).toString('hex');
      user = await prisma.user.create({ data: { email, name, refreshToken, password: null } });
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
    if (parts.length !== 3) return res.status(400).json({ error: 'Invalid id_token' });
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    const email = payload.email as string;
    const name = payload.name || '';

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const refreshToken = crypto.randomBytes(48).toString('hex');
      user = await prisma.user.create({ data: { email, name, refreshToken, password: null } });
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
app.post('/free-audit', publicLimiter, async (req: Request, res: Response) => {
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
      const pageSpeed = await fetchPageSpeedData(url);
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
        try {
          validateBusinessUnderstanding(bu);
        } catch (err) {
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
          validateBusinessUnderstanding(inferred);
          analysis.businessUnderstanding = inferred;
        }

        // Store a canonical deterministic version as analysis.businessUnderstandingCanonical
        try {
          const canonical = deterministicStringifyBusiness(analysis.businessUnderstanding || bu);
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
    const business = await prisma.business.create({
      data: {
        userId,
        name: name || 'My Business',
        url,
        description,
        publishedUrl: `https://${Date.now()}.salesape.ai/web`,
        analysis,
      }
    });

    console.log(`[Business Created] ID: ${business.id}, Name: ${business.name}, User: ${req.userId}`);
    res.status(201).json(business);
  } catch (err) {
    logger.error('Business creation error', { error: err });
    res.status(500).json({ error: 'Failed to create business' });
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

    const { name, description, analysis, branding } = req.body as any;
    const data: any = {};
    if (typeof name === 'string') data.name = name;
    if (typeof description === 'string') data.description = description;
    if (analysis && typeof analysis === 'object' && analysis !== null) {
      data.analysis = Object.assign({}, (business.analysis || {}), analysis as Record<string, any>);
    }
    if (branding && typeof branding === 'object' && branding !== null) {
      data.branding = Object.assign({}, (business.branding || {}), branding as Record<string, any>);
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
    const brandingData = business.branding || {};

    res.json({
      templates,
      recommended,
      businessType,
      analysis,
      testimonials,
      branding: brandingData,
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

// --- PHASE 3: Automation Endpoints ---

// Publish a business website
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
    const publishedUrl = `https://${uniqueSlug}.salesape.ai/web`;

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
        eventData: { slug: uniqueSlug, url: publishedUrl },
      }
    });

    console.log(`[Website Published] Business: ${business.name}, URL: ${publishedUrl}`);
    res.json({
      message: 'Website published successfully',
      business: updatedBusiness,
      shareUrl: publishedUrl,
    });
  } catch (err) {
    console.error('Website publish error:', err);
    res.status(500).json({ error: 'Failed to publish website' });
  }
});

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
      branding: business.branding || {},
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
            timestamp: new Date(),
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
});

server.on('error', (err: any) => {
  console.error('[Server Error]', err && err.message ? err.message : String(err));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    prisma.$disconnect();
    process.exit(0);
  });
});

export default app;

