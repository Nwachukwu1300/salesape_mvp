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
import { initializeSentry, attachSentryErrorHandler } from './utils/sentry.js';

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

// Initialize Sentry (no-op when SENTRY_DSN not set)
try {
  initializeSentry(app);
} catch (err) {
  logger.warn('Sentry initialization failed', { error: String(err) });
}

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

// Helper to normalize route params which can be string | string[] | undefined
function paramToString(p: string | string[] | undefined): string | undefined {
  if (Array.isArray(p)) return p[0];
  return p;
}

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

// --- Authentication Middleware ---
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
        const verifyJson = await verifyRes.json();
        if (!verifyJson.success) return res.status(403).json({ error: 'Captcha verification failed' });
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
    const ipRaw = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') as string;
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

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      }
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info('User registered', { userId: user.id, email: user.email });
    // Send welcome email to new user
    try {
      await sendAuthEmail(user, 'welcome');
    } catch (e) {
      logger.warn('Failed to queue welcome email', { error: e });
    }
    res.status(201).json({
      token,
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
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err: any) {
    logger.error('Login error', { error: err && err.message ? err.message : String(err) });
    res.status(500).json({ error: 'Login failed', details: err && err.message ? err.message : undefined });
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
        publishedUrl: `https://${Date.now()}.salesape.app/website`,
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
    if (analysis && typeof analysis === 'object') data.analysis = { ...(business.analysis || {}), ...analysis };
    if (branding && typeof branding === 'object') data.branding = { ...(business.branding || {}), ...branding };

    if (Object.keys(data).length === 0) return res.status(400).json({ error: 'No valid fields to update' });

    const updated = await prisma.business.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    logger.error('Business update error', { error: err });
    res.status(500).json({ error: 'Failed to update business' });
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
        preview: '/templates/modern.png',
        style: { color: '#1a202c', accent: '#3182ce', font: 'Inter, sans-serif' },
        sections: [
          { heading: 'About', content: business.description || '' },
          { heading: 'Services', content: Array.isArray(analysisAny['Main services offered']) ? analysisAny['Main services offered'].join(', ') : (analysisAny['Main services offered'] || '') },
          { heading: 'Contact', content: JSON.stringify(analysisAny['Any contact info'] || {}) },
        ],
      },
      {
        id: 'creative',
        name: 'Creative Portfolio',
        preview: '/templates/creative.png',
        style: { color: '#fff', accent: '#e53e3e', font: 'Montserrat, sans-serif' },
        sections: [
          { heading: 'Our Story', content: business.description || '' },
          { heading: 'What We Do', content: Array.isArray(analysisAny['Main services offered']) ? analysisAny['Main services offered'].join(', ') : (analysisAny['Main services offered'] || '') },
          { heading: 'Get in Touch', content: JSON.stringify(analysisAny['Any contact info'] || {}) },
        ],
      },
      {
        id: 'minimal',
        name: 'Minimal Elegant',
        preview: '/templates/minimal.png',
        style: { color: '#f7fafc', accent: '#2d3748', font: 'Roboto, sans-serif' },
        sections: [
          { heading: 'Welcome', content: business.description || '' },
          { heading: 'Services', content: Array.isArray(analysisAny['Main services offered']) ? analysisAny['Main services offered'].join(', ') : (analysisAny['Main services offered'] || '') },
          { heading: 'Contact', content: JSON.stringify(analysisAny['Any contact info'] || {}) },
        ],
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

    res.json({
      templates,
      recommended,
      businessType,
      analysis,
    });
  } catch (err) {
    console.error('Template fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch template' });
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
    const publishedUrl = `https://${uniqueSlug}.salesape.app/website`;

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
      business,
      template: business.analysis || {},
      leadForm: {
        title: `Get in touch with ${business.name}`,
        fields: ['name', 'email', 'company', 'message'],
      },
      bookingForm: {
        enabled: business.bookings && business.bookings.length > 0,
      }
    });
  } catch (err) {
    console.error('Website fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch website' });
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
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3003'}/join-team?token=${Buffer.from(`${team.id}:${email}`).toString('base64')}`;
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

// Attach Sentry error handler (must be after all routes but before listen)
try {
  attachSentryErrorHandler(app);
} catch (err) {
  logger.warn('Failed to attach Sentry error handler', { error: String(err) });
}

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

