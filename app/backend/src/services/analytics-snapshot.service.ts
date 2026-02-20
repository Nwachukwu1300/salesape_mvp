/**
 * Analytics Snapshot Service
 * Manages storage and retrieval of analytics data snapshots
 */

import { prisma } from '../prisma.js';
import type { AnalyticsSnapshot, CreateAnalyticsSnapshotInput, TrendDirection } from '../types/workflow.types.js';

/**
 * Create analytics snapshot
 */
export async function createAnalyticsSnapshot(input: CreateAnalyticsSnapshotInput): Promise<AnalyticsSnapshot> {
  try {
    const data: any = {
      businessId: input.businessId,
      snapshotDate: input.snapshotDate,
      engagementRate: input.engagementRate ?? 0,
      completionRate: input.completionRate ?? 0,
      viewVelocity: input.viewVelocity ?? 0,
      ctr: input.ctr ?? 0,
      conversionSignals: input.conversionSignals ?? 0,
      aiCitationFrequency: input.aiCitationFrequency ?? 0,
      seoImpactTrend: input.seoImpactTrend ?? 'neutral',
      aeoImpactTrend: input.aeoImpactTrend ?? 'neutral',
    };
    if (input.metadata !== undefined) {
      data.metadata = input.metadata;
    }
    const snapshot = await prisma.analyticsSnapshot.create({ data });
    return snapshot as AnalyticsSnapshot;
  } catch (error) {
    console.error('Failed to create analytics snapshot:', error);
    throw error;
  }
}

/**
 * Get latest analytics snapshot for business
 */
export async function getLatestSnapshot(businessId: string): Promise<AnalyticsSnapshot | null> {
  try {
    const snapshot = await prisma.analyticsSnapshot.findFirst({
      where: { businessId },
      orderBy: { snapshotDate: 'desc' },
    });
    return (snapshot as AnalyticsSnapshot) || null;
  } catch (error) {
    console.error('Failed to get latest snapshot:', error);
    throw error;
  }
}

/**
 * Get analytics snapshot for specific date
 */
export async function getSnapshotForDate(businessId: string, date: Date): Promise<AnalyticsSnapshot | null> {
  try {
    const snapshot = await prisma.analyticsSnapshot.findUnique({
      where: {
        businessId_snapshotDate: {
          businessId,
          snapshotDate: date,
        },
      },
    });
    return (snapshot as AnalyticsSnapshot) || null;
  } catch (error) {
    console.error('Failed to get snapshot for date:', error);
    throw error;
  }
}

/**
 * Get analytics snapshots for a date range
 */
export async function getSnapshotsForDateRange(
  businessId: string,
  startDate: Date,
  endDate: Date
): Promise<AnalyticsSnapshot[]> {
  try {
    const snapshots = await prisma.analyticsSnapshot.findMany({
      where: {
        businessId,
        snapshotDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { snapshotDate: 'asc' },
    });
    return snapshots as AnalyticsSnapshot[];
  } catch (error) {
    console.error('Failed to get snapshots for date range:', error);
    throw error;
  }
}

/**
 * Get last 7 snapshots
 */
export async function getLast7Snapshots(businessId: string): Promise<AnalyticsSnapshot[]> {
  try {
    const snapshots = await prisma.analyticsSnapshot.findMany({
      where: { businessId },
      orderBy: { snapshotDate: 'desc' },
      take: 7,
    });
    return snapshots.reverse() as AnalyticsSnapshot[];
  } catch (error) {
    console.error('Failed to get last 7 snapshots:', error);
    throw error;
  }
}

/**
 * Get last 30 snapshots
 */
export async function getLast30Snapshots(businessId: string): Promise<AnalyticsSnapshot[]> {
  try {
    const snapshots = await prisma.analyticsSnapshot.findMany({
      where: { businessId },
      orderBy: { snapshotDate: 'desc' },
      take: 30,
    });
    return snapshots.reverse() as AnalyticsSnapshot[];
  } catch (error) {
    console.error('Failed to get last 30 snapshots:', error);
    throw error;
  }
}

/**
 * Update analytics snapshot
 */
export async function updateAnalyticsSnapshot(
  id: string,
  input: Partial<CreateAnalyticsSnapshotInput>
): Promise<AnalyticsSnapshot> {
  try {
    const data: any = {};
    if (input.engagementRate !== undefined) data.engagementRate = input.engagementRate;
    if (input.completionRate !== undefined) data.completionRate = input.completionRate;
    if (input.viewVelocity !== undefined) data.viewVelocity = input.viewVelocity;
    if (input.ctr !== undefined) data.ctr = input.ctr;
    if (input.conversionSignals !== undefined) data.conversionSignals = input.conversionSignals;
    if (input.aiCitationFrequency !== undefined) data.aiCitationFrequency = input.aiCitationFrequency;
    if (input.seoImpactTrend !== undefined) data.seoImpactTrend = input.seoImpactTrend;
    if (input.aeoImpactTrend !== undefined) data.aeoImpactTrend = input.aeoImpactTrend;
    if (input.metadata !== undefined) data.metadata = input.metadata;

    const snapshot = await prisma.analyticsSnapshot.update({
      where: { id },
      data,
    });
    return snapshot as AnalyticsSnapshot;
  } catch (error) {
    console.error('Failed to update analytics snapshot:', error);
    throw error;
  }
}

/**
 * Calculate trend direction based on comparison
 */
export function calculateTrendDirection(newValue: number, previousValue: number): TrendDirection {
  if (newValue > previousValue) return 'positive';
  if (newValue < previousValue) return 'negative';
  return 'neutral';
}

/**
 * Get engagement trend
 */
export async function getEngagementTrend(businessId: string): Promise<{
  current: number;
  previous: number;
  trend: TrendDirection;
} | null> {
  try {
    const snapshots = await getLast7Snapshots(businessId);
    if (snapshots.length < 2) return null;

    const current = snapshots[snapshots.length - 1];
    const previous = snapshots[snapshots.length - 2];
    
    if (!current || !previous) return null;

    return {
      current: current.engagementRate,
      previous: previous.engagementRate,
      trend: calculateTrendDirection(current.engagementRate, previous.engagementRate),
    };
  } catch (error) {
    console.error('Failed to get engagement trend:', error);
    throw error;
  }
}

/**
 * Get SEO impact trend over time
 */
export async function getSEOImpactTrend(businessId: string): Promise<TrendDirection> {
  try {
    const snapshots = await getLast30Snapshots(businessId);
    if (snapshots.length === 0) return 'neutral';

    const latest = snapshots[snapshots.length - 1];
    if (!latest) return 'neutral';
    
    return (latest.seoImpactTrend || 'neutral') as TrendDirection;
  } catch (error) {
    console.error('Failed to get SEO impact trend:', error);
    throw error;
  }
}

/**
 * Get AEO impact trend over time
 */
export async function getAEOImpactTrend(businessId: string): Promise<TrendDirection> {
  try {
    const snapshots = await getLast30Snapshots(businessId);
    if (snapshots.length === 0) return 'neutral';

    const latest = snapshots[snapshots.length - 1];
    if (!latest) return 'neutral';
    
    return (latest.aeoImpactTrend || 'neutral') as TrendDirection;
  } catch (error) {
    console.error('Failed to get AEO impact trend:', error);
    throw error;
  }
}

/**
 * Check if today's snapshot already exists
 */
export async function hasTodaySnapshot(businessId: string): Promise<boolean> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const snapshot = await prisma.analyticsSnapshot.findFirst({
      where: {
        businessId,
        snapshotDate: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    return snapshot !== null;
  } catch (error) {
    console.error('Failed to check today snapshot:', error);
    throw error;
  }
}
