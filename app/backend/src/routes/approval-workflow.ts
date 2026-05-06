import { Router } from 'express';
import type { Response } from 'express';
import {
  approveContent,
  bulkApprove,
  getApprovalHistory,
  getApprovalQueue,
  getApprovalStats,
  rejectContent,
} from '../services/approval-workflow.service.js';
import { requirePermission } from '../services/team-permissions.service.js';
import { logger } from '../utils/logger.js';
import type { AuthMiddleware, AuthRequest } from './types.js';

type BusinessParams = { businessId: string };
type RepurposedContentParams = BusinessParams & { repurposedContentId: string };

export function createApprovalWorkflowRouter(authenticateToken: AuthMiddleware) {
  const router = Router();

  router.get('/businesses/:businessId/approval-queue', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { businessId } = req.params as BusinessParams;
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

  router.post('/businesses/:businessId/repurposed-content/:repurposedContentId/approve', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { businessId, repurposedContentId } = req.params as RepurposedContentParams;
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

  router.post('/businesses/:businessId/repurposed-content/:repurposedContentId/reject', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { businessId, repurposedContentId } = req.params as RepurposedContentParams;
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

  router.get('/businesses/:businessId/repurposed-content/:repurposedContentId/approval-history', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { businessId, repurposedContentId } = req.params as RepurposedContentParams;

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

  router.get('/businesses/:businessId/approval-stats', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { businessId } = req.params as BusinessParams;

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

  router.post('/businesses/:businessId/approval/bulk', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { businessId } = req.params as BusinessParams;
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

  return router;
}
