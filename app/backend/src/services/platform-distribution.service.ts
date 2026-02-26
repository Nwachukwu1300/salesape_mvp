/**
 * Platform Distribution Service
 * Tracks where repurposed content has been published
 */

import { prisma } from '../prisma.js';
import type { PlatformDistribution, CreatePlatformDistributionInput, UpdatePlatformDistributionInput, Platform, PlatformDistributionMetrics } from '../types/workflow.types.js';

/**
 * Create platform distribution record
 */
export async function createPlatformDistribution(
  input: CreatePlatformDistributionInput
): Promise<PlatformDistribution> {
  try {
    const data: any = {
      businessId: input.businessId,
      repurposedContentId: input.repurposedContentId,
      platform: input.platform,
      publishedAt: input.publishedAt || new Date(),
    };
    
    // Only add optional fields if they're defined (to avoid Prisma exactOptionalPropertyTypes issues)
    if (input.externalId !== undefined && input.externalId !== null) {
      data.externalId = input.externalId;
    }
    if (input.url !== undefined && input.url !== null) {
      data.url = input.url;
    }
    if (input.metrics !== undefined && input.metrics !== null) {
      data.metrics = input.metrics;
    }

    const distribution = await prisma.platformDistribution.create({ data } as any);
    return distribution as PlatformDistribution;
  } catch (error) {
    console.error('Failed to create platform distribution:', error);
    throw error;
  }
}

/**
 * Get distribution by ID
 */
export async function getPlatformDistribution(id: string): Promise<PlatformDistribution | null> {
  try {
    const distribution = await prisma.platformDistribution.findUnique({
      where: { id },
    });
    return (distribution as PlatformDistribution) || null;
  } catch (error) {
    console.error('Failed to get platform distribution:', error);
    throw error;
  }
}

/**
 * Get distributions for repurposed content
 */
export async function getDistributionsForContent(repurposedContentId: string): Promise<PlatformDistribution[]> {
  try {
    const distributions = await prisma.platformDistribution.findMany({
      where: { repurposedContentId },
      orderBy: { publishedAt: 'desc' },
    });
    return distributions as PlatformDistribution[];
  } catch (error) {
    console.error('Failed to get distributions for content:', error);
    throw error;
  }
}

/**
 * Get all distributions for business
 */
export async function getBusinessDistributions(businessId: string): Promise<PlatformDistribution[]> {
  try {
    const distributions = await prisma.platformDistribution.findMany({
      where: { businessId },
      orderBy: { publishedAt: 'desc' },
    });
    return distributions as PlatformDistribution[];
  } catch (error) {
    console.error('Failed to get business distributions:', error);
    throw error;
  }
}

/**
 * Get distributions by platform
 */
export async function getDistributionsByPlatform(businessId: string, platform: Platform): Promise<PlatformDistribution[]> {
  try {
    const distributions = await prisma.platformDistribution.findMany({
      where: { businessId, platform },
      orderBy: { publishedAt: 'desc' },
    });
    return distributions as PlatformDistribution[];
  } catch (error) {
    console.error('Failed to get distributions by platform:', error);
    throw error;
  }
}

/**
 * Update distribution metrics
 */
export async function updateDistributionMetrics(
  id: string,
  metrics: PlatformDistributionMetrics
): Promise<PlatformDistribution> {
  try {
    const distribution = await prisma.platformDistribution.findUnique({
      where: { id },
    });

    if (!distribution) {
      throw new Error('Distribution not found');
    }

    const updated = await prisma.platformDistribution.update({
      where: { id },
      data: {
        metrics: {
          ...(distribution.metrics as Record<string, any>),
          ...metrics,
        },
      },
    });

    return updated as PlatformDistribution;
  } catch (error) {
    console.error('Failed to update distribution metrics:', error);
    throw error;
  }
}

/**
 * Update distribution
 */
export async function updatePlatformDistribution(
  id: string,
  input: UpdatePlatformDistributionInput
): Promise<PlatformDistribution> {
  try {
    const data: any = {};
    
    // Only add fields if they're defined (to avoid Prisma exactOptionalPropertyTypes issues)
    if (input.metrics !== undefined && input.metrics !== null) {
      data.metrics = input.metrics;
    }
    if (input.url !== undefined && input.url !== null) {
      data.url = input.url;
    }
    if (input.externalId !== undefined && input.externalId !== null) {
      data.externalId = input.externalId;
    }

    const distribution = await prisma.platformDistribution.update({
      where: { id },
      data,
    });
    return distribution as PlatformDistribution;
  } catch (error) {
    console.error('Failed to update platform distribution:', error);
    throw error;
  }
}

/**
 * Delete distribution
 */
export async function deleteDistribution(id: string): Promise<void> {
  try {
    await prisma.platformDistribution.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Failed to delete distribution:', error);
    throw error;
  }
}

/**
 * Get distribution statistics for business
 */
export async function getDistributionStats(businessId: string): Promise<{
  totalDistributions: number;
  byPlatform: Record<string, number>;
  totalMetrics: PlatformDistributionMetrics;
}> {
  try {
    const distributions = await getBusinessDistributions(businessId);

    const byPlatform: Record<string, number> = {};
    const totalMetrics: PlatformDistributionMetrics = {
      views: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      saves: 0,
      clicks: 0,
      impressions: 0,
    };

    distributions.forEach((dist) => {
      byPlatform[dist.platform] = (byPlatform[dist.platform] || 0) + 1;

      if (dist.metrics) {
        Object.entries(dist.metrics).forEach(([key, value]) => {
          if (typeof value === 'number') {
            totalMetrics[key] = (totalMetrics[key] || 0) + value;
          }
        });
      }
    });

    return {
      totalDistributions: distributions.length,
      byPlatform,
      totalMetrics,
    };
  } catch (error) {
    console.error('Failed to get distribution stats:', error);
    throw error;
  }
}

/**
 * Get top performing platforms for business
 */
export async function getTopPerformingPlatforms(
  businessId: string,
  limit: number = 5
): Promise<Array<{ platform: Platform; totalViews: number; totalEngagement: number }>> {
  try {
    const distributions = await getBusinessDistributions(businessId);

    const platformStats: Record<string, { views: number; engagement: number }> = {};

    distributions.forEach((dist) => {
      if (!platformStats[dist.platform]) {
        platformStats[dist.platform] = { views: 0, engagement: 0 };
      }

      const stats = platformStats[dist.platform];
      if (stats) {
        const metrics = dist.metrics || {};
        stats.views += (metrics.views as number) || 0;
        stats.engagement +=
          ((metrics.likes as number) || 0) +
          ((metrics.shares as number) || 0) +
          ((metrics.comments as number) || 0);
      }
    });

    return Object.entries(platformStats)
      .map(([platform, stats]) => ({
        platform: platform as Platform,
        totalViews: stats.views,
        totalEngagement: stats.engagement,
      }))
      .sort((a, b) => b.totalEngagement - a.totalEngagement)
      .slice(0, limit);
  } catch (error) {
    console.error('Failed to get top performing platforms:', error);
    throw error;
  }
}

/**
 * Get viral potential score (simplified)
 */
export function calculateViralPotential(metrics: PlatformDistributionMetrics | undefined | null): number {
  if (!metrics) return 0;

  const views = (metrics.views as number) || 0;
  const likes = (metrics.likes as number) || 0;
  const shares = (metrics.shares as number) || 0;
  const comments = (metrics.comments as number) || 0;

  if (views === 0) return 0;

  // Simple engagement rate calculation
  const engagementRate = (likes + shares * 2 + comments) / views; // Shares weighted higher
  return Math.min(100, Math.round(engagementRate * 1000)); // 0-100 scale
}
