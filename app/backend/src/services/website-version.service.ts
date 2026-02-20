/**
 * Website Version Service
 * Manages website version control and publishing
 */

import { prisma } from '../prisma.js';
import type { WebsiteVersion, CreateWebsiteVersionInput, UpdateWebsiteVersionInput } from '../types/workflow.types.js';

/**
 * Create a new website version
 */
export async function createWebsiteVersion(
  input: CreateWebsiteVersionInput
): Promise<WebsiteVersion> {
  try {
    const version = await prisma.websiteVersion.create({
      data: {
        businessId: input.businessId,
        versionNumber: input.versionNumber,
        config: input.config,
        template: input.template,
        status: input.status || 'draft',
      },
    });
    return version as WebsiteVersion;
  } catch (error) {
    console.error('Failed to create website version:', error);
    throw error;
  }
}

/**
 * Get website version by ID
 */
export async function getWebsiteVersion(id: string): Promise<WebsiteVersion | null> {
  try {
    const version = await prisma.websiteVersion.findUnique({
      where: { id },
    });
    return (version as WebsiteVersion) || null;
  } catch (error) {
    console.error('Failed to get website version:', error);
    throw error;
  }
}

/**
 * Get all versions for a business
 */
export async function getBusinessVersions(businessId: string): Promise<WebsiteVersion[]> {
  try {
    const versions = await prisma.websiteVersion.findMany({
      where: { businessId },
      orderBy: { versionNumber: 'desc' },
    });
    return versions as WebsiteVersion[];
  } catch (error) {
    console.error('Failed to get business versions:', error);
    throw error;
  }
}

/**
 * Get the latest published version
 */
export async function getLatestPublishedVersion(businessId: string): Promise<WebsiteVersion | null> {
  try {
    const version = await prisma.websiteVersion.findFirst({
      where: { businessId, status: 'published' },
      orderBy: { versionNumber: 'desc' },
    });
    return (version as WebsiteVersion) || null;
  } catch (error) {
    console.error('Failed to get latest published version:', error);
    throw error;
  }
}

/**
 * Update website version status
 */
export async function updateWebsiteVersion(
  id: string,
  input: UpdateWebsiteVersionInput
): Promise<WebsiteVersion> {
  try {
    const version = await prisma.websiteVersion.update({
      where: { id },
      data: input,
    });
    return version as WebsiteVersion;
  } catch (error) {
    console.error('Failed to update website version:', error);
    throw error;
  }
}

/**
 * Publish a website version
 */
export async function publishWebsiteVersion(id: string): Promise<WebsiteVersion> {
  try {
    // Unpublish all other versions for this business
    const version = await prisma.websiteVersion.findUnique({
      where: { id },
    });

    if (!version) {
      throw new Error('Website version not found');
    }

    await prisma.websiteVersion.updateMany({
      where: {
        businessId: version.businessId,
        id: { not: id },
        status: 'published',
      },
      data: { status: 'archived' },
    });

    // Publish the new version
    const updated = await prisma.websiteVersion.update({
      where: { id },
      data: { status: 'published' },
    });

    return updated as WebsiteVersion;
  } catch (error) {
    console.error('Failed to publish website version:', error);
    throw error;
  }
}

/**
 * Delete a website version
 */
export async function deleteWebsiteVersion(id: string): Promise<void> {
  try {
    await prisma.websiteVersion.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Failed to delete website version:', error);
    throw error;
  }
}

/**
 * Get version count for a business
 */
export async function getVersionCount(businessId: string): Promise<number> {
  try {
    const count = await prisma.websiteVersion.count({
      where: { businessId },
    });
    return count;
  } catch (error) {
    console.error('Failed to get version count:', error);
    throw error;
  }
}
