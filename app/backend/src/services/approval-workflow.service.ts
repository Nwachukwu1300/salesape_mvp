/**
 * Approval Workflow Service
 * Manages content approval workflow with tracking
 * Uses RepurposedContent.status and ApprovalHistory model
 */

import { prisma } from '../prisma.js';

interface ApprovalCheckResult {
  requiresApproval: boolean;
  currentStatus: string;
  canPublish: boolean;
}

/**
 * Check if content requires approval
 */
export async function checkIfApprovalRequired(
  businessId: string,
  repurposedContentId: string
): Promise<ApprovalCheckResult> {
  try {
    const [content, publishingControl] = await Promise.all([
      prisma.repurposedContent.findFirst({
        where: { id: repurposedContentId, businessId },
      }),
      prisma.publishingControl.findFirst({
        where: { businessId },
      }),
    ]);

    if (!content) {
      throw new Error('Content not found');
    }

    const requiresApproval = publishingControl?.requiresApproval || false;

    return {
      requiresApproval,
      currentStatus: content.status,
      canPublish: !requiresApproval || content.status === 'approved',
    };
  } catch (error) {
    console.error('Check approval required error:', error);
    throw error;
  }
}

/**
 * Submit content for approval
 */
export async function submitForApproval(
  businessId: string,
  repurposedContentId: string,
  comment?: string
) {
  try {
    const content = await prisma.repurposedContent.findFirst({
      where: { id: repurposedContentId, businessId },
    });

    if (!content) {
      throw new Error('Content not found');
    }

    if (content.status !== 'draft') {
      throw new Error('Only draft content can be submitted for approval');
    }

    // Record in approval history
    // @ts-ignore - Model exists at runtime in Prisma client
    await prisma.approvalHistory.create({
      data: {
        businessId,
        repurposedContentId,
        action: 'submitted_for_approval',
        comment: comment || null,
        approvedBy: null,
      },
    });

    return {
      message: 'Content submitted for approval',
      status: 'submitted',
    };
  } catch (error) {
    console.error('Submit for approval error:', error);
    throw error;
  }
}

/**
 * Approve content
 */
export async function approveContent(
  businessId: string,
  repurposedContentId: string,
  approverId: string,
  comment?: string
) {
  try {
    const content = await prisma.repurposedContent.findFirst({
      where: { id: repurposedContentId, businessId },
    });

    if (!content) {
      throw new Error('Content not found');
    }

    if (content.status === 'published') {
      throw new Error('Content is already published');
    }

    if (content.status === 'approved') {
      throw new Error('Content is already approved');
    }

    // Update content status
    const updated = await prisma.repurposedContent.update({
      where: { id: repurposedContentId },
      data: { status: 'approved' },
    });

    // Record in approval history
    // @ts-ignore - Model exists at runtime in Prisma client
    await prisma.approvalHistory.create({
      data: {
        businessId,
        repurposedContentId,
        action: 'approved',
        approvedBy: approverId,
        comment: comment || null,
      },
    });

    return {
      message: 'Content approved',
      content: updated,
    };
  } catch (error) {
    console.error('Approve content error:', error);
    throw error;
  }
}

/**
 * Reject content
 */
export async function rejectContent(
  businessId: string,
  repurposedContentId: string,
  approverId: string,
  reason: string
) {
  try {
    const content = await prisma.repurposedContent.findFirst({
      where: { id: repurposedContentId, businessId },
    });

    if (!content) {
      throw new Error('Content not found');
    }

    if (content.status === 'published') {
      throw new Error('Cannot reject published content');
    }

    // Update content status back to draft
    const updated = await prisma.repurposedContent.update({
      where: { id: repurposedContentId },
      data: { status: 'draft' },
    });

    // Record in approval history
    // @ts-ignore - Model exists at runtime in Prisma client
    await prisma.approvalHistory.create({
      data: {
        businessId,
        repurposedContentId,
        action: 'rejected',
        approvedBy: approverId,
        comment: reason || null,
      },
    });

    return {
      message: 'Content rejected',
      reason,
      content: updated,
    };
  } catch (error) {
    console.error('Reject content error:', error);
    throw error;
  }
}

/**
 * Get approval queue (pending approval)
 */
export async function getApprovalQueue(businessId: string, limit: number = 20) {
  try {
    const pendingContent = await prisma.repurposedContent.findMany({
      where: {
        businessId,
        status: { in: ['draft', 'approved'] },
      },
      include: {
        contentInput: true,
        // @ts-ignore - Model exists at runtime in Prisma client
        approvalHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return pendingContent;
  } catch (error) {
    console.error('Get approval queue error:', error);
    throw error;
  }
}

/**
 * Get approval history for a specific content
 */
export async function getApprovalHistory(
  businessId: string,
  repurposedContentId: string
) {
  try {
    // @ts-ignore - Model exists at runtime in Prisma client
    const history = await prisma.approvalHistory.findMany({
      where: { businessId, repurposedContentId },
      include: { approver: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return history;
  } catch (error) {
    console.error('Get approval history error:', error);
    throw error;
  }
}

/**
 * Get approval statistics
 */
export async function getApprovalStats(businessId: string) {
  try {
    const [total, draft, approved, published, rejected] = await Promise.all([
      prisma.repurposedContent.count({
        where: { businessId },
      }),
      prisma.repurposedContent.count({
        where: { businessId, status: 'draft' },
      }),
      prisma.repurposedContent.count({
        where: { businessId, status: 'approved' },
      }),
      prisma.repurposedContent.count({
        where: { businessId, status: 'published' },
      }),
      // @ts-ignore - Model exists at runtime in Prisma client
      prisma.approvalHistory.count({
        where: { businessId, action: 'rejected' },
      }),
    ]);

    return {
      total,
      draft,
      approved,
      published,
      rejected,
      pendingApproval: draft,
      approvalRate: total > 0 ? (approved / total) * 100 : 0,
      rejectionRate: total > 0 ? (rejected / total) * 100 : 0,
    };
  } catch (error) {
    console.error('Get approval stats error:', error);
    throw error;
  }
}

/**
 * Bulk approve content
 */
export async function bulkApprove(
  businessId: string,
  contentIds: string[],
  approverId: string,
  comment?: string
) {
  try {
    const results = {
      successful: [] as string[],
      failed: [] as Array<{ id: string; error: string }>,
    };

    for (const contentId of contentIds) {
      try {
        await approveContent(businessId, contentId, approverId, comment);
        results.successful.push(contentId);
      } catch (error) {
        results.failed.push({
          id: contentId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Bulk approve error:', error);
    throw error;
  }
}

/**
 * Auto-publish approved content (called by scheduler)
 */
export async function autoPublishApproved(businessId: string) {
  try {
    const publishingControl = await prisma.publishingControl.findFirst({
      where: { businessId },
    });

    if (!publishingControl?.autoPublish) {
      return { message: 'Auto-publish is disabled' };
    }

    const approved = await prisma.repurposedContent.findMany({
      where: {
        businessId,
        status: 'approved',
        updatedAt: { lte: new Date(Date.now() - 60 * 1000) }, // at least 1 minute old
      },
      include: { distributions: true },
      take: 10,
    });

    const published = [];

    for (const content of approved) {
      // Only publish if not already distributed
      if (content.distributions.length === 0) {
        const updated = await prisma.repurposedContent.update({
          where: { id: content.id },
          data: {
            status: 'published',
            publishedAt: new Date(),
          },
        });

        // Record in approval history
        // @ts-ignore - Model exists at runtime in Prisma client
        await prisma.approvalHistory.create({
          data: {
            businessId,
            repurposedContentId: content.id,
            action: 'published',
            approvedBy: null, // system action
          },
        });

        published.push(updated.id);
      }
    }

    return {
      message: `Auto-published ${published.length} content items`,
      publishedIds: published,
    };
  } catch (error) {
    console.error('Auto-publish error:', error);
    throw error;
  }
}
