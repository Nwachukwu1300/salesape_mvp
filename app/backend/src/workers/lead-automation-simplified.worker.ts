import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { scoreLead } from '../utils/lead-scorer.js';

const prisma = new PrismaClient();

/**
 * Lead Automation Worker (Simplified)
 * Processes lead scoring and scoring updates
 */

interface LeadAutomationJob {
  leadId: string;
  businessId: string;
  email: string;
  name?: string;
  message?: string;
  source?: string;
}

const worker = new Worker<LeadAutomationJob>(
  'lead-automation',
  async (job) => {
    const { leadId, businessId, email, message } = job.data;

    try {
      console.log(`[Lead Automation] Processing lead ${leadId}`);

      // Fetch lead
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
      });

      if (!lead) {
        throw new Error(`Lead not found: ${leadId}`);
      }

      // Score the lead
      const scored = scoreLead({
        name: lead.name || 'Unknown',
        email: lead.email,
        message: message || '',
        source: lead.source || '',
      });

      console.log(`[Lead Automation] ✅ Scored lead: ${scored.totalScore}/100`);

      return {
        success: true,
        leadId,
        score: scored.totalScore,
      };
    } catch (error) {
      console.error(`[Lead Automation] ❌ Error:`, error);
      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
    },
    concurrency: 10,
  }
);

worker.on('completed', (job) => {
  console.log(`[Lead Automation] Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`[Lead Automation] Job ${job?.id} failed:`, err);
});

export { worker as leadAutomationWorker };
