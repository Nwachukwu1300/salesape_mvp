import { Router } from 'express';
import type { Request, Response } from 'express';
import {
  getPermissionsMatrix,
  getRoleDescriptions,
  getUserPermissions,
  removeMember,
  requirePermission,
  updateMemberRole,
  validateRoleChange,
} from '../services/team-permissions.service.js';
import { logger } from '../utils/logger.js';
import type { AuthMiddleware, AuthRequest } from './types.js';

type TeamRole = 'admin' | 'content-manager' | 'approver' | 'viewer';

const TEAM_ROLES: TeamRole[] = ['admin', 'content-manager', 'approver', 'viewer'];
type BusinessParams = { businessId: string };
type MemberParams = BusinessParams & { memberId: string };

export function createTeamPermissionsRouter(authenticateToken: AuthMiddleware) {
  const router = Router();

  router.put('/businesses/:businessId/team/members/:memberId/role', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { businessId, memberId } = req.params as MemberParams;
      const { role } = req.body;

      await requirePermission(businessId, req.userId || '', 'manageTeam');

      if (!TEAM_ROLES.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

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

  router.delete('/businesses/:businessId/team/members/:memberId', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { businessId, memberId } = req.params as MemberParams;

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

  router.get('/businesses/:businessId/team/permissions', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { businessId } = req.params as BusinessParams;

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

  router.get('/team/role-descriptions', authenticateToken, async (_req: Request, res: Response) => {
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

  router.get('/team/permissions-matrix', authenticateToken, async (_req: Request, res: Response) => {
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

  return router;
}
