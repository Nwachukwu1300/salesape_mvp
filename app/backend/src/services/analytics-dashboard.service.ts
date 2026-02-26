/**
 * Analytics Dashboard Service
 * Aggregates metrics from existing Phase 3 data models
 * Provides comprehensive dashboard queries without duplication
 */

import { prisma } from '../prisma.js';

interface MetricsAggregation {
  totalImpressions: number;
  totalEngagement: number;
  avgEngagementRate: number;
  totalReach: number;
  topPlatforms: Array<{ platform: string; count: number; engagement: number }>;
  topContent: Array<{
    id: string;
    platform: string;
    content: string;
    engagement: number;
  }>;
  recentActivity: Array<{
    platform: string;
    action: string;
    timestamp: Date;
    metrics: any;
  }>;
}

interface PlatformMetrics {
  platform: string;
  totalPosts: number;
  totalImpressions: number;
  totalEngagement: number;
  avgEngagementRate: number;
  topPost: {
    id: string;
    content: string;
    metrics: any;
  } | null;
}

interface TrendData {
  date: Date;
  engagementRate: number;
  views: number;
  conversions: number;
}

/**
 * Get comprehensive dashboard metrics
 */
export async function getDashboardMetrics(businessId: string): Promise<MetricsAggregation> {
  try {
    const distributions = await prisma.platformDistribution.findMany({
      where: { businessId },
      include: { repurposedContent: true },
      orderBy: { createdAt: 'desc' },
    });

    const snapshots = await prisma.analyticsSnapshot.findMany({
      where: { businessId },
      orderBy: { snapshotDate: 'desc' },
      take: 30,
    });

    // Aggregate metrics
    let totalImpressions = 0;
    let totalEngagement = 0;
    const platformEngagement: { [key: string]: { posts: number; engagement: number } } = {};

    distributions.forEach((dist) => {
      const metrics = (dist.metrics as any) || {};
      const views = parseInt(metrics.views || '0') || 0;
      const likes = parseInt(metrics.likes || '0') || 0;
      const shares = parseInt(metrics.shares || '0') || 0;
      const comments = parseInt(metrics.comments || '0') || 0;

      totalImpressions += views;
      totalEngagement += likes + shares + comments;

      if (!platformEngagement[dist.platform]) {
        platformEngagement[dist.platform] = { posts: 0, engagement: 0 };
      }
      const pe = platformEngagement[dist.platform];
      if (pe) {
        pe.posts += 1;
        pe.engagement += likes + shares + comments;
      }
    });

    // Calculate top platforms
    const topPlatforms = Object.entries(platformEngagement)
      .map(([platform, data]) => ({
        platform,
        count: data.posts,
        engagement: data.engagement,
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 5);

    // Get top content
    const topContent = distributions
      .sort((a, b) => {
        const aEngagement =
          (parseInt((a.metrics as any)?.likes || '0') || 0) +
          (parseInt((a.metrics as any)?.shares || '0') || 0) +
          (parseInt((a.metrics as any)?.comments || '0') || 0);
        const bEngagement =
          (parseInt((b.metrics as any)?.likes || '0') || 0) +
          (parseInt((b.metrics as any)?.shares || '0') || 0) +
          (parseInt((b.metrics as any)?.comments || '0') || 0);
        return bEngagement - aEngagement;
      })
      .slice(0, 5)
      .map((dist) => ({
        id: dist.id,
        platform: dist.platform,
        content: dist.repurposedContent?.content.substring(0, 100) || '',
        engagement:
          (parseInt((dist.metrics as any)?.likes || '0') || 0) +
          (parseInt((dist.metrics as any)?.shares || '0') || 0) +
          (parseInt((dist.metrics as any)?.comments || '0') || 0),
      }));

    // Calculate average engagement rate
    const avgEngagementRate =
      snapshots.length > 0
        ? snapshots.reduce((sum, s) => sum + (s.engagementRate || 0), 0) / snapshots.length
        : 0;

    // Recent activity
    const recentActivity = distributions
      .slice(0, 10)
      .map((dist) => ({
        platform: dist.platform,
        action: 'published',
        timestamp: dist.publishedAt || dist.createdAt,
        metrics: dist.metrics,
      }));

    return {
      totalImpressions,
      totalEngagement,
      avgEngagementRate,
      totalReach: totalImpressions, // simplified for now
      topPlatforms,
      topContent,
      recentActivity,
    };
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    throw error;
  }
}

/**
 * Get detailed metrics for a specific platform
 */
export async function getPlatformMetrics(businessId: string, platform: string): Promise<PlatformMetrics> {
  try {
    const distributions = await prisma.platformDistribution.findMany({
      where: { businessId, platform },
      include: { repurposedContent: true },
      orderBy: { createdAt: 'desc' },
    });

    let totalImpressions = 0;
    let totalEngagement = 0;

    distributions.forEach((dist) => {
      const metrics = (dist.metrics as any) || {};
      const views = parseInt(metrics.views || '0') || 0;
      const likes = parseInt(metrics.likes || '0') || 0;
      const shares = parseInt(metrics.shares || '0') || 0;
      const comments = parseInt(metrics.comments || '0') || 0;

      totalImpressions += views;
      totalEngagement += likes + shares + comments;
    });

    // Get top post for this platform
    let topPost = null;
    if (distributions.length > 0) {
      const sortedByEngagement = distributions
        .map((dist) => ({
          ...dist,
          engagement:
            (parseInt((dist.metrics as any)?.likes || '0') || 0) +
            (parseInt((dist.metrics as any)?.shares || '0') || 0) +
            (parseInt((dist.metrics as any)?.comments || '0') || 0),
        }))
        .sort((a, b) => b.engagement - a.engagement);

      const top = sortedByEngagement[0];
      if (top) {
        topPost = {
          id: top.id,
          content: top.repurposedContent?.content.substring(0, 100) || '',
          metrics: top.metrics,
        };
      }
    }

    const avgEngagementRate =
      totalImpressions > 0 ? (totalEngagement / (totalImpressions || 1)) * 100 : 0;

    return {
      platform,
      totalPosts: distributions.length,
      totalImpressions,
      totalEngagement,
      avgEngagementRate,
      topPost,
    };
  } catch (error) {
    console.error('Platform metrics error:', error);
    throw error;
  }
}

/**
 * Get trend data over time
 */
export async function getTrendData(
  businessId: string,
  days: number = 30
): Promise<TrendData[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const snapshots = await prisma.analyticsSnapshot.findMany({
      where: {
        businessId,
        snapshotDate: { gte: startDate },
      },
      orderBy: { snapshotDate: 'asc' },
    });

    return snapshots.map((snapshot) => ({
      date: snapshot.snapshotDate,
      engagementRate: snapshot.engagementRate,
      views: ((snapshot.metadata as any)?.totalViews as number) || 0,
      conversions: snapshot.conversionSignals,
    }));
  } catch (error) {
    console.error('Trend data error:', error);
    throw error;
  }
}

/**
 * Get comparison metrics between two date ranges
 */
export async function getComparison(
  businessId: string,
  startDate1: Date,
  endDate1: Date,
  startDate2: Date,
  endDate2: Date
) {
  try {
    const period1 = await prisma.platformDistribution.findMany({
      where: {
        businessId,
        publishedAt: {
          gte: startDate1,
          lte: endDate1,
        },
      },
    });

    const period2 = await prisma.platformDistribution.findMany({
      where: {
        businessId,
        publishedAt: {
          gte: startDate2,
          lte: endDate2,
        },
      },
    });

    const calculateMetrics = (
      items: typeof period1
    ) => {
      let impressions = 0;
      let engagement = 0;

      items.forEach((item) => {
        const metrics = (item.metrics as any) || {};
        impressions += parseInt(metrics.views || '0') || 0;
        engagement +=
          (parseInt(metrics.likes || '0') || 0) +
          (parseInt(metrics.shares || '0') || 0) +
          (parseInt(metrics.comments || '0') || 0);
      });

      return { impressions, engagement };
    };

    const metrics1 = calculateMetrics(period1);
    const metrics2 = calculateMetrics(period2);

    return {
      period1: {
        dateRange: { start: startDate1, end: endDate1 },
        ...metrics1,
      },
      period2: {
        dateRange: { start: startDate2, end: endDate2 },
        ...metrics2,
      },
      change: {
        impressions: metrics2.impressions - metrics1.impressions,
        engagement: metrics2.engagement - metrics1.engagement,
        impressionsPercent:
          metrics1.impressions > 0
            ? ((metrics2.impressions - metrics1.impressions) / metrics1.impressions) * 100
            : 0,
        engagementPercent:
          metrics1.engagement > 0
            ? ((metrics2.engagement - metrics1.engagement) / metrics1.engagement) * 100
            : 0,
      },
    };
  } catch (error) {
    console.error('Comparison error:', error);
    throw error;
  }
}

/**
 * Get revenue attribution from content
 */
export async function getRevenueAttribution(businessId: string) {
  try {
    const distributions = await prisma.platformDistribution.findMany({
      where: { businessId },
      include: { repurposedContent: true },
    });

    // For now, this is a placeholder - in production, would connect to booking/payment data
    const platformRevenue: { [key: string]: number } = {};

    distributions.forEach((dist) => {
      const conversions = (dist.metrics as any)?.conversions || 0;
      const avgValue = 100; // placeholder

      if (!platformRevenue[dist.platform]) {
        platformRevenue[dist.platform] = 0;
      }
      const pr = platformRevenue[dist.platform];
      if (pr !== undefined) {
        platformRevenue[dist.platform] = pr + (conversions * avgValue);
      }
    });

    return {
      totalRevenue: Object.values(platformRevenue).reduce((a, b) => a + b, 0),
      byPlatform: platformRevenue,
    };
  } catch (error) {
    console.error('Revenue attribution error:', error);
    throw error;
  }
}
