import { Router } from 'express';
import type { Response } from 'express';
import {
  bulkSchedule,
  cancelSchedule,
  getScheduleCalendar,
  getScheduledPosts,
  getSchedulingStats,
  getUpcomingSchedules,
  scheduleContent,
  updateSchedule,
} from '../services/scheduling.service.js';
import { requirePermission } from '../services/team-permissions.service.js';
import { logger } from '../utils/logger.js';
import type { AuthMiddleware, AuthRequest } from './types.js';

type BusinessParams = { businessId: string };
type ScheduledPostParams = BusinessParams & { scheduledPostId: string };

export function createSchedulingRouter(authenticateToken: AuthMiddleware) {
  const router = Router();

  router.get('/businesses/:businessId/schedule', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { businessId } = req.params as BusinessParams;
      const { status, platform, from, to } = req.query;

      await requirePermission(businessId, req.userId || '', 'viewSchedule');

      const filters: {
        status?: string;
        platformFilter?: string;
        from?: Date;
        to?: Date;
      } = {};
      if (typeof status === 'string') filters.status = status;
      if (typeof platform === 'string') filters.platformFilter = platform;
      if (typeof from === 'string') filters.from = new Date(from);
      if (typeof to === 'string') filters.to = new Date(to);

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

  router.post('/businesses/:businessId/schedule', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { businessId } = req.params as BusinessParams;
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

  router.get('/businesses/:businessId/schedule/calendar', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { businessId } = req.params as BusinessParams;
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

  router.put('/businesses/:businessId/schedule/:scheduledPostId', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { businessId, scheduledPostId } = req.params as ScheduledPostParams;
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

  router.delete('/businesses/:businessId/schedule/:scheduledPostId', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { businessId, scheduledPostId } = req.params as ScheduledPostParams;

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

  router.post('/businesses/:businessId/schedule/bulk', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { businessId } = req.params as BusinessParams;
      const { schedules } = req.body;

      await requirePermission(businessId, req.userId || '', 'scheduleContent');
      await requirePermission(businessId, req.userId || '', 'bulkActions');

      if (!Array.isArray(schedules)) {
        return res.status(400).json({ error: 'schedules must be an array' });
      }

      const normalizedSchedules = schedules.map((schedule) => ({
        ...schedule,
        scheduledFor: new Date(schedule.scheduledFor),
      }));
      const results = await bulkSchedule(businessId, normalizedSchedules);

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      logger.error('Bulk schedule error', { error: String(error) });
      res.status(500).json({ error: 'Failed to bulk schedule' });
    }
  });

  router.get('/businesses/:businessId/schedule/upcoming', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { businessId } = req.params as BusinessParams;
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

  router.get('/businesses/:businessId/schedule/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { businessId } = req.params as BusinessParams;

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

  return router;
}
