import { Router } from 'express';
import type { Response } from 'express';
import {
  getComparison,
  getDashboardMetrics,
  getPlatformMetrics,
  getRevenueAttribution,
  getTrendData,
} from '../services/analytics-dashboard.service.js';
import { requirePermission } from '../services/team-permissions.service.js';
import { logger } from '../utils/logger.js';
import type { AuthMiddleware, AuthRequest } from './types.js';

type BusinessParams = { businessId: string };
type PlatformParams = BusinessParams & { platform: string };

export function createAnalyticsDashboardRouter(authenticateToken: AuthMiddleware) {
  const router = Router();

  router.get('/businesses/:businessId/dashboard', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { businessId } = req.params as BusinessParams;

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

  router.get('/businesses/:businessId/analytics/by-platform/:platform', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { businessId, platform } = req.params as PlatformParams;

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

  router.get('/businesses/:businessId/analytics/trends', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { businessId } = req.params as BusinessParams;
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

  router.post('/businesses/:businessId/analytics/compare', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { businessId } = req.params as BusinessParams;
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

  router.get('/businesses/:businessId/analytics/revenue', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { businessId } = req.params as BusinessParams;

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

  return router;
}
