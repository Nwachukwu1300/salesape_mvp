/**
 * Lead Automation Worker
 * Processes lead automation jobs asynchronously
 * 
 * Responsibilities:
 * - Score incoming leads based on intelligence
 * - Send welcome email to leads
 * - Add leads to email sequences
 * - Track lead routing to team members
 */

import dotenv from 'dotenv';
// Ensure env vars are loaded before evaluating Redis config
dotenv.config({ path: '.env.local' });
dotenv.config();

import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import type { LeadAutomationJob } from '../queues/index.js';
import { getRedisClient, createRedisClient } from '../utils/redis-client.js';

const prisma = new PrismaClient();

// Initialize email transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// SendGrid fallback
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const worker = new Worker<LeadAutomationJob>(
  'lead-automation',
  async (job: Job<LeadAutomationJob>) => {
    console.log(`[Lead Automation] Processing lead: ${job.data.leadId}`);
    const startTime = Date.now();

    try {
      const { leadId, businessId, email, name, message, source } = job.data;

      // Get lead and business from database
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
      });

      if (!lead) {
        throw new Error(`Lead not found: ${leadId}`);
      }

      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: {
          user: true,
          emailSequences: { where: { triggerEvent: 'lead_created' } },
          team: {
            include: { leadRoutingRules: true },
          },
        },
      });

      if (!business) {
        throw new Error(`Business not found: ${businessId}`);
      }

      // Step 1: Score the lead
      const leadScore = await scoreLeadIntelligence(lead, message || '');
      
      // Update lead with score
      await (prisma as any).lead.update({
        where: { id: leadId },
        data: {
          priorityScore: Math.min(100, Math.max(0, leadScore)),
          intentCategory: categorizeIntent(leadScore),
        },
      });

      console.log(`[Lead Automation] Scored lead: ${leadScore}/100`);

      // Step 2: Send welcome email
      const emailResult = await sendLeadWelcomeEmail({
        toEmail: email,
        name: name || 'Valued Lead',
        businessName: business.name,
        businessEmail: business.user.email,
        ...(message ? { message } : {}),
      });

      console.log(`[Lead Automation] Email sent: ${emailResult ? 'success' : 'failed'}`);

      // Step 3: Add to email sequences
      if (business.emailSequences.length > 0) {
        const activeSequence = business.emailSequences.find(seq => seq.isActive);
        
        if (activeSequence) {
          console.log(`[Lead Automation] Queueing email sequence: ${activeSequence.name}`);
          // In a real system, you'd queue the email sends based on delayMinutes
          // For now, we log the intention
        }
      }

      // Step 4: Route to team member if applicable
      if (business.team?.leadRoutingRules && business.team.leadRoutingRules.length > 0) {
        const applicableRule = business.team.leadRoutingRules.find(rule => {
          const serviceMatch = !rule.service || (lead.company && lead.company.includes(rule.service));
          const sourceMatch = !rule.leadSource || lead.source === rule.leadSource;
          return rule.isActive && serviceMatch && sourceMatch;
        });

        if (applicableRule) {
          console.log(`[Lead Automation] Routing to: ${applicableRule.assignTo}`);
          // In a real system, send notification to assigned team member
        }
      }

      // Step 5: Update lead status
      await prisma.lead.update({
        where: { id: leadId },
        data: { status: 'contacted' },
      });

      const duration = Date.now() - startTime;
      console.log(`[Lead Automation] Completed in ${duration}ms`);

      return {
        success: true,
        leadId,
        score: leadScore,
        emailSent: emailResult,
        duration,
      };
    } catch (error: any) {
      console.error('[Lead Automation] Error:', error?.message);
      throw error;
    }
  },
  {
    connection: getRedisClient(),
    concurrency: 10,
    maxStalledCount: 2,
    stalledInterval: 30000,
  }
);

createRedisClient();

/**
 * Score lead based on message content and engagement signals
 */
async function scoreLeadIntelligence(lead: any, message: string): Promise<number> {
  let score = 50; // Base score

  // Message quality signals
  if (message && message.length > 100) score += 15; // Detailed inquiry
  if (message && message.toLowerCase().includes('interested')) score += 10;
  if (message && message.toLowerCase().includes('urgent')) score += 15;
  if (message && message.toLowerCase().includes('budget')) score += 10;

  // Contact quality signals
  if (lead.email && lead.email.includes('@')) score += 5;
  if (lead.company && lead.company.length > 2) score += 10;

  // Source signals
  if (lead.source === 'instagram') score += 5;
  if (lead.source === 'direct') score += 10;
  if (lead.source === 'web') score += 8;

  // Recency boost
  const hoursOld = (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60);
  if (hoursOld < 1) score += 10;
  if (hoursOld < 24) score += 5;

  return Math.min(100, score);
}

/**
 * Categorize lead intent based on score
 */
function categorizeIntent(score: number): string {
  if (score >= 75) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

/**
 * Send welcome email to new lead
 */
async function sendLeadWelcomeEmail(params: {
  toEmail: string;
  name: string;
  businessName: string;
  businessEmail: string;
  message?: string;
}): Promise<boolean> {
  try {
    const { toEmail, name, businessName, businessEmail, message } = params;

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Thank you for reaching out, ${name}!</h2>
          <p>We received your inquiry and want to thank you for your interest in ${businessName}.</p>
          
          ${message ? `<p><strong>Your Message:</strong></p><p>${message}</p>` : ''}
          
          <p>Our team is reviewing your request and will get back to you shortly with more information.</p>
          
          <p>If you have any urgent questions in the meantime, feel free to reply to this email.</p>
          
          <p>Best regards,<br>${businessName} Team</p>
          
          <hr style="border: none; border-top: 1px solid #ccc;">
          <p style="font-size: 12px; color: #666;">
            This email was sent because you contacted ${businessName} through our website.
          </p>
        </body>
      </html>
    `;

    // Try SendGrid first
    if (process.env.SENDGRID_API_KEY) {
      await sgMail.send({
        to: toEmail,
        from: businessEmail || process.env.SMTP_FROM || 'noreply@salesape.com',
        subject: `${businessName} - Thank you for your inquiry`,
        html: htmlContent,
      });
      return true;
    }

    // Fall back to nodemailer
    await transporter.sendMail({
      to: toEmail,
      from: businessEmail || process.env.SMTP_FROM || 'noreply@salesape.com',
      subject: `${businessName} - Thank you for your inquiry`,
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error('[Lead Automation] Email send failed:', error);
    return false;
  }
}

worker.on('completed', (job) => {
  console.log(`[Lead Automation] Job completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
  console.error(`[Lead Automation] Job failed: ${job?.id} - ${err?.message}`);
});

worker.on('error', (err) => {
  console.error('[Lead Automation] Worker error:', err);
});

export default worker;
