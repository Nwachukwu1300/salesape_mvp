import { prisma } from '../prisma.js';
import type { Platform } from '../types/workflow.types.js';
import type { ScoreWeights } from '../utils/content-scoring.js';
import { getDefaultScoreWeights } from '../utils/content-scoring.js';

type PerformanceMetrics = {
  views?: number;
  watchTime?: number;
  shares?: number;
  saves?: number;
  ctr?: number;
};

function getAverage(metrics: PerformanceMetrics[]): PerformanceMetrics {
  if (metrics.length === 0) return {};
  const totals = metrics.reduce<Required<PerformanceMetrics>>(
    (acc, item) => ({
      views: acc.views + (item.views ?? 0),
      watchTime: acc.watchTime + (item.watchTime ?? 0),
      shares: acc.shares + (item.shares ?? 0),
      saves: acc.saves + (item.saves ?? 0),
      ctr: acc.ctr + (item.ctr ?? 0),
    }),
    { views: 0, watchTime: 0, shares: 0, saves: 0, ctr: 0 },
  );

  return {
    views: totals.views / metrics.length,
    watchTime: totals.watchTime / metrics.length,
    shares: totals.shares / metrics.length,
    saves: totals.saves / metrics.length,
    ctr: totals.ctr / metrics.length,
  };
}

function adjustWeights(defaultWeights: ScoreWeights, performance: PerformanceMetrics): ScoreWeights {
  const weights = { ...defaultWeights };
  const watchTime = performance.watchTime || 0;
  const shares = performance.shares || 0;
  const saves = performance.saves || 0;
  const ctr = performance.ctr || 0;

  if (watchTime > 30) {
    weights.pacing += 0.03;
    weights.clarity += 0.02;
  }
  if (shares > 5 || saves > 5) {
    weights.hookStrength += 0.03;
    weights.novelty += 0.02;
  }
  if (ctr > 1.5) {
    weights.platformFit += 0.03;
  }

  const total =
    weights.hookStrength +
    weights.pacing +
    weights.clarity +
    weights.platformFit +
    weights.novelty;
  if (total === 0) return defaultWeights;

  return {
    hookStrength: weights.hookStrength / total,
    pacing: weights.pacing / total,
    clarity: weights.clarity / total,
    platformFit: weights.platformFit / total,
    novelty: weights.novelty / total,
  };
}

export async function getScoreWeightsForPlatform(businessId: string, platform: Platform): Promise<ScoreWeights> {
  const defaults = getDefaultScoreWeights(platform);

  const recent = await (prisma as any).repurposedContent.findMany({
    where: { businessId, platform, performance: { not: null } },
    select: { performance: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const metrics = recent
    .map((row: { performance?: PerformanceMetrics | null }) => row.performance ?? null)
    .filter((row: PerformanceMetrics | null): row is PerformanceMetrics => Boolean(row));

  if (metrics.length === 0) return defaults;

  const averages = getAverage(metrics);
  return adjustWeights(defaults, averages);
}
