/**
 * Review Request Worker
 * Sends automated review requests to customers
 * 
 * Responsibilities:
 * - Send personalized review request emails
 * - Generate platform-specific review links (Google, Yelp, Trustpilot)
 * - Track email delivery and opens
 * - Handle bounces and failures
 */

import dotenv from 'dotenv';
// Ensure env vars are loaded before evaluating Redis config
dotenv.config({ path: '.env.local' });
dotenv.config();

import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import type { ReviewRequestJob } from '../queues/index.js';
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

const worker = new Worker<ReviewRequestJob>(
  'review-request',
  async (job: Job<ReviewRequestJob>) => {
    console.log(`[Review Request] Processing booking: ${job.data.bookingId}`);
    const startTime = Date.now();

    try {
      const { bookingId, businessId, bookingEmail, bookingName, serviceTitle, completionDate } = job.data;

      // Get booking and business
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new Error(`Booking not found: ${bookingId}`);
      }

      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: { user: true },
      });

      if (!business) {
        throw new Error(`Business not found: ${businessId}`);
      }

      // Generate review links
      const reviewLinks = generateReviewLinks(business.name, business.url || '');

      // Send review request email
      const emailSent = await sendReviewRequestEmail({
        toEmail: bookingEmail,
        customerName: bookingName || 'Valued Customer',
        businessName: business.name,
        businessEmail: business.user.email,
        serviceTitle: serviceTitle || 'Your Service',
        reviewLinks,
      });

      console.log(`[Review Request] Email sent: ${emailSent ? 'success' : 'failed'}`);

      // Create ReviewRequest record
      const reviewRequest = await (prisma as any).reviewRequest.create({
        data: {
          businessId,
          bookingId,
          email: bookingEmail,
          status: emailSent ? 'sent' : 'failed',
          sentAt: new Date(),
        },
      });

      // Update BookingAnalytics
      await (prisma as any).bookingAnalytics.upsert({
        where: { businessId },
        create: {
          businessId,
          totalBookings: 1,
          canceledBookings: 0,
          avgResponseTime: 0,
        },
        update: {
          totalBookings: { increment: 1 },
        },
      });

      const duration = Date.now() - startTime;
      console.log(`[Review Request] Completed in ${duration}ms`);

      return {
        success: emailSent,
        reviewRequestId: reviewRequest.id,
        emailSent,
        duration,
      };
    } catch (error: any) {
      console.error('[Review Request] Error:', error?.message);
      throw error;
    }
  },
  {
    connection: getRedisClient(),
    concurrency: 5,
    maxStalledCount: 2,
    stalledInterval: 30000,
  }
);

createRedisClient();

/**
 * Generate platform-specific review links
 */
function generateReviewLinks(businessName: string, websiteUrl: string): Record<string, string> {
  const encodedName = encodeURIComponent(businessName);
  
  return {
    google: `https://search.google.com/local/writereview?placeid=${encodedName}`,
    yelp: `https://www.yelp.com/biz/search?find_desc=${encodedName}&find_loc=${websiteUrl}`,
    trustpilot: `https://www.trustpilot.com/review/${websiteUrl.replace(/https?:\/\//, '')}`,
    facebook: `https://www.facebook.com/search/top/?q=${encodedName}`,
  };
}

/**
 * Send review request email
 */
async function sendReviewRequestEmail(params: {
  toEmail: string;
  customerName: string;
  businessName: string;
  businessEmail: string;
  serviceTitle: string;
  reviewLinks: Record<string, string>;
}): Promise<boolean> {
  try {
    const { toEmail, customerName, businessName, businessEmail, serviceTitle, reviewLinks } = params;

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
            <h2 style="color: #1a1a1a;">Please Share Your Experience</h2>
            
            <p>Hi ${customerName},</p>
            
            <p>Thank you for choosing <strong>${businessName}</strong> for ${serviceTitle}. We'd love to hear about your experience!</p>
            
            <p style="margin-top: 20px; margin-bottom: 10px;"><strong>Help others discover us:</strong></p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              ${reviewLinks.google ? `
                <p>
                  <a href="${reviewLinks.google}" style="color: #1a73e8; text-decoration: none; font-weight: bold;">
                    ⭐ Review us on Google
                  </a>
                </p>
              ` : ''}
              ${reviewLinks.facebook ? `
                <p>
                  <a href="${reviewLinks.facebook}" style="color: #1a73e8; text-decoration: none; font-weight: bold;">
                    👍 Review us on Facebook
                  </a>
                </p>
              ` : ''}
              ${reviewLinks.yelp ? `
                <p>
                  <a href="${reviewLinks.yelp}" style="color: #1a73e8; text-decoration: none; font-weight: bold;">
                    🌟 Review us on Yelp
                  </a>
                </p>
              ` : ''}
              ${reviewLinks.trustpilot ? `
                <p>
                  <a href="${reviewLinks.trustpilot}" style="color: #1a73e8; text-decoration: none; font-weight: bold;">
                    ✅ Review us on Trustpilot
                  </a>
                </p>
              ` : ''}
            </div>
            
            <p>Your feedback helps us improve and helps future customers make informed decisions.</p>
            
            <p style="margin-top: 30px;">Best regards,<br><strong>${businessName} Team</strong></p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin-top: 30px;">
            <p style="font-size: 12px; color: #999; margin: 15px 0;">
              This email was sent to ${toEmail} because you recently completed a service with ${businessName}.
            </p>
          </div>
        </body>
      </html>
    `;

    // Try SendGrid first
    if (process.env.SENDGRID_API_KEY) {
      await sgMail.send({
        to: toEmail,
        from: businessEmail || process.env.SMTP_FROM || 'noreply@salesape.com',
        subject: `Share Your Feedback: ${businessName} Review`,
        html: htmlContent,
      });
      return true;
    }

    // Fall back to nodemailer
    await transporter.sendMail({
      to: toEmail,
      from: businessEmail || process.env.SMTP_FROM || 'noreply@salesape.com',
      subject: `Share Your Feedback: ${businessName} Review`,
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error('[Review Request] Email send failed:', error);
    return false;
  }
}

worker.on('completed', (job) => {
  console.log(`[Review Request] Job completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
  console.error(`[Review Request] Job failed: ${job?.id} - ${err?.message}`);
});

worker.on('error', (err) => {
  console.error('[Review Request] Worker error:', err);
});

export default worker;
