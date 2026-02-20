/**
 * Repurposed Content Service
 * Manages content that has been repurposed for different platforms
 */

import { prisma } from '../prisma.js';
import type { RepurposedContent, CreateRepurposedContentInput, UpdateRepurposedContentInput, Platform, RepurposedContentStatus } from '../types/workflow.types.js';

/**
 * Create repurposed content
 */
export async function createRepurposedContent(input: CreateRepurposedContentInput): Promise<RepurposedContent> {
  try {
    const data: any = {
      businessId: input.businessId,
      contentInputId: input.contentInputId,
      platform: input.platform,
      content: input.content || '',
      status: input.status || 'draft',
    };
    
    // Only add optional fields if they're defined and not null
    if (input.caption !== undefined && input.caption !== null) {
      data.caption = input.caption;
    }
    if (input.hashtags !== undefined && input.hashtags !== null) {
      data.hashtags = input.hashtags;
    }

    const content = await prisma.repurposedContent.create({ data } as any);
    return content as RepurposedContent;
  } catch (error) {
    console.error('Failed to create repurposed content:', error);
    throw error;
  }
}

/**
 * Get repurposed content by ID
 */
export async function getRepurposedContent(id: string): Promise<RepurposedContent | null> {
  try {
    const content = await prisma.repurposedContent.findUnique({
      where: { id },
    });
    return (content as RepurposedContent) || null;
  } catch (error) {
    console.error('Failed to get repurposed content:', error);
    throw error;
  }
}

/**
 * Get all repurposed content for a business
 */
export async function getBusinessRepurposedContent(businessId: string): Promise<RepurposedContent[]> {
  try {
    const contents = await prisma.repurposedContent.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
    return contents as RepurposedContent[];
  } catch (error) {
    console.error('Failed to get business repurposed content:', error);
    throw error;
  }
}

/**
 * Get repurposed content by content input ID
 */
export async function getRepurposedContentByInput(contentInputId: string): Promise<RepurposedContent[]> {
  try {
    const contents = await prisma.repurposedContent.findMany({
      where: { contentInputId },
      orderBy: { createdAt: 'desc' },
    });
    return contents as RepurposedContent[];
  } catch (error) {
    console.error('Failed to get repurposed content by input:', error);
    throw error;
  }
}

/**
 * Get repurposed content by platform
 */
export async function getRepurposedContentByPlatform(businessId: string, platform: Platform): Promise<RepurposedContent[]> {
  try {
    const contents = await prisma.repurposedContent.findMany({
      where: { businessId, platform },
      orderBy: { createdAt: 'desc' },
    });
    return contents as RepurposedContent[];
  } catch (error) {
    console.error('Failed to get repurposed content by platform:', error);
    throw error;
  }
}

/**
 * Get repurposed content by status
 */
export async function getRepurposedContentByStatus(
  businessId: string,
  status: RepurposedContentStatus
): Promise<RepurposedContent[]> {
  try {
    const contents = await prisma.repurposedContent.findMany({
      where: { businessId, status },
      orderBy: { createdAt: 'desc' },
    });
    return contents as RepurposedContent[];
  } catch (error) {
    console.error('Failed to get repurposed content by status:', error);
    throw error;
  }
}

/**
 * Update repurposed content
 */
export async function updateRepurposedContent(
  id: string,
  input: UpdateRepurposedContentInput
): Promise<RepurposedContent> {
  try {
    const content = await prisma.repurposedContent.update({
      where: { id },
      data: input,
    });
    return content as RepurposedContent;
  } catch (error) {
    console.error('Failed to update repurposed content:', error);
    throw error;
  }
}

/**
 * Publish repurposed content
 */
export async function publishRepurposedContent(id: string): Promise<RepurposedContent> {
  try {
    const content = await prisma.repurposedContent.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    });
    return content as RepurposedContent;
  } catch (error) {
    console.error('Failed to publish repurposed content:', error);
    throw error;
  }
}

/**
 * Approve repurposed content
 */
export async function approveRepurposedContent(id: string): Promise<RepurposedContent> {
  try {
    const content = await prisma.repurposedContent.update({
      where: { id },
      data: { status: 'approved' },
    });
    return content as RepurposedContent;
  } catch (error) {
    console.error('Failed to approve repurposed content:', error);
    throw error;
  }
}

/**
 * Delete repurposed content
 */
export async function deleteRepurposedContent(id: string): Promise<void> {
  try {
    await prisma.repurposedContent.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Failed to delete repurposed content:', error);
    throw error;
  }
}

/**
 * Get pending review content
 */
export async function getPendingReviewContent(businessId: string): Promise<RepurposedContent[]> {
  try {
    const contents = await prisma.repurposedContent.findMany({
      where: {
        businessId,
        status: 'draft',
      },
      orderBy: { createdAt: 'asc' },
    });
    return contents as RepurposedContent[];
  } catch (error) {
    console.error('Failed to get pending review content:', error);
    throw error;
  }
}

/**
 * Get ready to publish content
 */
export async function getReadyToPublishContent(businessId: string): Promise<RepurposedContent[]> {
  try {
    const contents = await prisma.repurposedContent.findMany({
      where: {
        businessId,
        status: 'approved',
        publishedAt: null,
      },
      orderBy: { updatedAt: 'asc' },
    });
    return contents as RepurposedContent[];
  } catch (error) {
    console.error('Failed to get ready to publish content:', error);
    throw error;
  }
}

/**
 * Count repurposed content for growth mode limit validation
 */
export async function countRepurposedContentForInput(contentInputId: string): Promise<number> {
  try {
    const count = await prisma.repurposedContent.count({
      where: { contentInputId },
    });
    return count;
  } catch (error) {
    console.error('Failed to count repurposed content:', error);
    throw error;
  }
}
