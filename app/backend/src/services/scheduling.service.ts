/**
 * Content Scheduling Service
 * Manages scheduled publishing of repurposed content
 * Integrates with existing RepurposedContent model
 */

import { prisma } from '../prisma.js';
import { logger } from '../utils/logger.js';

interface ScheduleRequest {
  repurposedContentId: string;
  scheduledFor: Date;
}

interface ScheduleUpdate {
  scheduledFor?: Date;
  status?: string;
}

/**
 * Schedule content for future publishing
 */
export async function scheduleContent(
  businessId: string,
  repurposedContentId: string,
  scheduledFor: Date
) {
  try {
    // Validate repurposed content exists
    const content = await prisma.repurposedContent.findFirst({
      where: { id: repurposedContentId, businessId },
    });

    if (!content) {
      throw new Error('Content not found');
    }

    // Validate scheduled time is in the future
    if (scheduledFor <= new Date()) {
      throw new Error('Scheduled time must be in the future');
    }

    // Check if already scheduled
    // @ts-ignore - Model exists at runtime in Prisma client
    const existingSchedule = await prisma.scheduledPost.findFirst({
      where: { repurposedContentId },
    });

    if (existingSchedule) {
      throw new Error('Content is already scheduled');
    }

    // Create scheduled post
    // @ts-ignore - Model exists at runtime in Prisma client
    const scheduledPost = await prisma.scheduledPost.create({
      data: {
        businessId,
        repurposedContentId,
        scheduledFor,
        status: 'pending',
      },
      include: { repurposedContent: true },
    });

    return scheduledPost;
  } catch (error) {
    console.error('Schedule content error:', error);
    throw error;
  }
}

/**
 * Get all scheduled posts for a business
 */
export async function getScheduledPosts(
  businessId: string,
  filters?: { status?: string; platformFilter?: string; from?: Date; to?: Date }
) {
  try {
    const where: any = { businessId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.platformFilter) {
      where.repurposedContent = { platform: filters.platformFilter };
    }

    if (filters?.from || filters?.to) {
      where.scheduledFor = {};
      if (filters.from) where.scheduledFor.gte = filters.from;
      if (filters.to) where.scheduledFor.lte = filters.to;
    }

    // @ts-ignore - Model exists at runtime in Prisma client
    const scheduled = await prisma.scheduledPost.findMany({
      where,
      include: {
        repurposedContent: { include: { contentInput: true } },
      },
      orderBy: { scheduledFor: 'asc' },
    });

    return scheduled;
  } catch (error) {
    console.error('Get scheduled posts error:', error);
    throw error;
  }
}

/**
 * Get schedule view (grouped by date for calendar)
 */
export async function getScheduleCalendar(businessId: string, month: Date) {
  try {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // @ts-ignore - Model exists at runtime in Prisma client
    const scheduled = await prisma.scheduledPost.findMany({
      where: {
        businessId,
        scheduledFor: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: { repurposedContent: true },
      orderBy: { scheduledFor: 'asc' },
    });

    // Group by date
    const calendar: Record<string, typeof scheduled> = {};

    // @ts-ignore - Model exists at runtime in Prisma client
    scheduled.forEach((post) => {
      const dateKey = post.scheduledFor.toISOString().split('T')[0] || 'unknown';
      if (!calendar[dateKey]) {
        calendar[dateKey] = [] as typeof scheduled;
      }
      const arr = calendar[dateKey];
      if (Array.isArray(arr)) {
        arr.push(post);
      }
    });

    return calendar;
  } catch (error) {
    console.error('Get schedule calendar error:', error);
    throw error;
  }
}

/**
 * Update scheduled post time or status
 */
export async function updateSchedule(
  businessId: string,
  scheduledPostId: string,
  updates: ScheduleUpdate
) {
  try {
    // @ts-ignore - Model exists at runtime in Prisma client
    const scheduled = await prisma.scheduledPost.findFirst({
      where: { id: scheduledPostId, businessId },
    });

    if (!scheduled) {
      throw new Error('Scheduled post not found');
    }

    if (updates.scheduledFor && updates.scheduledFor <= new Date()) {
      throw new Error('New scheduled time must be in the future');
    }

    // @ts-ignore - Model exists at runtime in Prisma client
    const updated = await prisma.scheduledPost.update({
      where: { id: scheduledPostId },
      data: updates,
      include: { repurposedContent: true },
    });

    return updated;
  } catch (error) {
    console.error('Update schedule error:', error);
    throw error;
  }
}

/**
 * Cancel a scheduled post
 */
export async function cancelSchedule(businessId: string, scheduledPostId: string) {
  try {
    // @ts-ignore - Model exists at runtime in Prisma client
    const scheduled = await prisma.scheduledPost.findFirst({
      where: { id: scheduledPostId, businessId },
    });

    if (!scheduled) {
      throw new Error('Scheduled post not found');
    }

    // @ts-ignore - Model exists at runtime in Prisma client
    await prisma.scheduledPost.update({
      where: { id: scheduledPostId },
      data: { status: 'cancelled' },
    });

    return { message: 'Post cancelled' };
  } catch (error) {
    console.error('Cancel schedule error:', error);
    throw error;
  }
}

/**
 * Bulk schedule multiple posts
 */
export async function bulkSchedule(
  businessId: string,
  schedules: Array<{
    repurposedContentId: string;
    scheduledFor: Date;
  }>
) {
  try {
    const results = {
      successful: [] as any[],
      failed: [] as Array<{ id: string; error: string }>,
    };

    for (const schedule of schedules) {
      try {
        const scheduled = await scheduleContent(
          businessId,
          schedule.repurposedContentId,
          schedule.scheduledFor
        );
        results.successful.push(scheduled);
      } catch (error) {
        results.failed.push({
          id: schedule.repurposedContentId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Bulk schedule error:', error);
    throw error;
  }
}

/**
 * Get upcoming scheduled posts (for the next N days)
 */
export async function getUpcomingSchedules(businessId: string, daysAhead: number = 7) {
  try {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + daysAhead);

    // @ts-ignore - Model exists at runtime in Prisma client
    const scheduled = await prisma.scheduledPost.findMany({
      where: {
        businessId,
        status: 'pending',
        scheduledFor: {
          gte: now,
          lte: future,
        },
      },
      include: {
        repurposedContent: { include: { contentInput: true } },
      },
      orderBy: { scheduledFor: 'asc' },
    });

    return scheduled;
  } catch (error) {
    console.error('Get upcoming schedules error:', error);
    throw error;
  }
}

/**
 * Get scheduling statistics
 */
export async function getSchedulingStats(businessId: string) {
  try {
    // @ts-ignore - Model exists at runtime in Prisma client
    const total = await prisma.scheduledPost.count({
      where: { businessId },
    });

    // @ts-ignore - Model exists at runtime in Prisma client
    const pending = await prisma.scheduledPost.count({
      where: { businessId, status: 'pending' },
    });

    // @ts-ignore - Model exists at runtime in Prisma client
    const published = await prisma.scheduledPost.count({
      where: { businessId, status: 'published' },
    });

    // @ts-ignore - Model exists at runtime in Prisma client
    const failed = await prisma.scheduledPost.count({
      where: { businessId, status: 'failed' },
    });

    // @ts-ignore - Model exists at runtime in Prisma client
    const cancelled = await prisma.scheduledPost.count({
      where: { businessId, status: 'cancelled' },
    });

    return {
      total,
      pending,
      published,
      failed,
      cancelled,
    };
  } catch (error) {
    logger.error('Get scheduling stats error:', error);
    throw error;
  }
}
