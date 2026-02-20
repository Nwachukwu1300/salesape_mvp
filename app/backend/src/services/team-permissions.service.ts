/**
 * Team Permissions Service
 * Manages role-based access control for Phase 4 features
 */

import { prisma } from '../prisma.js';

type Role = 'admin' | 'content-manager' | 'approver' | 'viewer';

interface PermissionSet {
  viewDashboard: boolean;
  viewAnalytics: boolean;
  manageContent: boolean;
  scheduleContent: boolean;
  approveContent: boolean;
  rejectContent: boolean;
  publishContent: boolean;
  manageTeam: boolean;
  viewSchedule: boolean;
  viewApprovalQueue: boolean;
  bulkActions: boolean;
}

// Define role-based permissions
const ROLE_PERMISSIONS: { [key in Role]: PermissionSet } = {
  admin: {
    viewDashboard: true,
    viewAnalytics: true,
    manageContent: true,
    scheduleContent: true,
    approveContent: true,
    rejectContent: true,
    publishContent: true,
    manageTeam: true,
    viewSchedule: true,
    viewApprovalQueue: true,
    bulkActions: true,
  },
  'content-manager': {
    viewDashboard: true,
    viewAnalytics: true,
    manageContent: true,
    scheduleContent: true,
    approveContent: false,
    rejectContent: false,
    publishContent: false,
    manageTeam: false,
    viewSchedule: true,
    viewApprovalQueue: true,
    bulkActions: true,
  },
  approver: {
    viewDashboard: true,
    viewAnalytics: true,
    manageContent: false,
    scheduleContent: false,
    approveContent: true,
    rejectContent: true,
    publishContent: false,
    manageTeam: false,
    viewSchedule: false,
    viewApprovalQueue: true,
    bulkActions: false,
  },
  viewer: {
    viewDashboard: true,
    viewAnalytics: true,
    manageContent: false,
    scheduleContent: false,
    approveContent: false,
    rejectContent: false,
    publishContent: false,
    manageTeam: false,
    viewSchedule: true,
    viewApprovalQueue: false,
    bulkActions: false,
  },
};

/**
 * Get permissions for a user in a business
 */
export async function getUserPermissions(
  businessId: string,
  userId: string
): Promise<PermissionSet> {
  try {
    const teamMember = await prisma.teamMember.findFirst({
      where: { teamId: businessId, userId },
    });

    if (!teamMember) {
      // Not a team member, return viewer permissions
      return ROLE_PERMISSIONS.viewer;
    }

    const role = teamMember.role as Role;
    return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.viewer;
  } catch (error) {
    console.error('Get user permissions error:', error);
    throw error;
  }
}

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(
  businessId: string,
  userId: string,
  permission: keyof PermissionSet
): Promise<boolean> {
  try {
    const permissions = await getUserPermissions(businessId, userId);
    return permissions[permission] || false;
  } catch (error) {
    console.error('Check permission error:', error);
    return false;
  }
}

/**
 * Enforce permission check (throws if not allowed)
 */
export async function requirePermission(
  businessId: string,
  userId: string,
  permission: keyof PermissionSet
): Promise<void> {
  const allowed = await hasPermission(businessId, userId, permission);

  if (!allowed) {
    throw new Error(`Permission denied: ${permission}`);
  }
}

/**
 * Get all team members and their roles
 */
export async function getTeamMembers(businessId: string) {
  try {
    // Get the team
    const team = await prisma.team.findFirst({
      where: { businessId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      return [];
    }

    return team.members.map((member) => ({
      id: member.id,
      userId: member.userId,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
      joinedAt: member.createdAt,
      permissions: ROLE_PERMISSIONS[member.role as Role],
    }));
  } catch (error) {
    console.error('Get team members error:', error);
    throw error;
  }
}

/**
 * Update a team member's role
 */
export async function updateMemberRole(
  businessId: string,
  memberId: string,
  newRole: Role
) {
  try {
    // Verify the member belongs to this business
    const member = await prisma.teamMember.findFirst({
      where: { id: memberId },
      include: { team: true },
    });

    if (!member || member.team.businessId !== businessId) {
      throw new Error('Team member not found');
    }

    const updated = await prisma.teamMember.update({
      where: { id: memberId },
      data: { role: newRole },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      ...updated,
      permissions: ROLE_PERMISSIONS[newRole],
    };
  } catch (error) {
    console.error('Update member role error:', error);
    throw error;
  }
}

/**
 * Remove team member
 */
export async function removeMember(businessId: string, memberId: string) {
  try {
    const member = await prisma.teamMember.findFirst({
      where: { id: memberId },
      include: { team: true },
    });

    if (!member || member.team.businessId !== businessId) {
      throw new Error('Team member not found');
    }

    await prisma.teamMember.delete({
      where: { id: memberId },
    });

    return { message: 'Team member removed' };
  } catch (error) {
    console.error('Remove member error:', error);
    throw error;
  }
}

/**
 * Get role descriptions
 */
export function getRoleDescriptions() {
  return {
    admin: {
      name: 'Administrator',
      description: 'Full access to all features and team management',
      level: 4,
    },
    'content-manager': {
      name: 'Content Manager',
      description: 'Can create, edit, and schedule content. Cannot approve or publish',
      level: 3,
    },
    approver: {
      name: 'Content Approver',
      description: 'Can view content and approve/reject submissions for publishing',
      level: 2,
    },
    viewer: {
      name: 'Viewer',
      description: 'View-only access to dashboard and analytics',
      level: 1,
    },
  };
}

/**
 * Validate role transition (prevent downgrading last admin)
 */
export async function validateRoleChange(
  businessId: string,
  memberId: string,
  newRole: Role
): Promise<{ valid: boolean; message?: string }> {
  try {
    const member = await prisma.teamMember.findFirst({
      where: { id: memberId },
      include: { team: true },
    });

    if (!member || member.team.businessId !== businessId) {
      return { valid: false, message: 'Member not found' };
    }

    // If changing from admin, check if it's the last admin
    if (member.role === 'admin' && newRole !== 'admin') {
      const adminCount = await prisma.teamMember.count({
        where: {
          teamId: businessId,
          role: 'admin',
        },
      });

      if (adminCount === 1) {
        return {
          valid: false,
          message: 'Cannot remove the last administrator',
        };
      }
    }

    return { valid: true };
  } catch (error) {
    console.error('Validate role change error:', error);
    return { valid: false, message: 'Validation error' };
  }
}

/**
 * Export permissions matrix for display
 */
export function getPermissionsMatrix() {
  const permissions = Object.keys(ROLE_PERMISSIONS.admin) as Array<keyof PermissionSet>;
  const roles: Role[] = ['admin', 'content-manager', 'approver', 'viewer'];

  return {
    permissions,
    roles,
    matrix: roles.reduce(
      (acc, role) => {
        acc[role] = ROLE_PERMISSIONS[role];
        return acc;
      },
      {} as { [key in Role]: PermissionSet }
    ),
  };
}
