/**
 * A/B Testing & Conversion Optimization
 */

export interface ABTest {
  id: string;
  businessId: string;
  name: string;
  variant_a: {
    headline?: string;
    cta?: string;
    image?: string;
    color?: string;
  };
  variant_b: {
    headline?: string;
    cta?: string;
    image?: string;
    color?: string;
  };
  startDate: Date;
  endDate?: Date;
  status: 'running' | 'completed' | 'paused';
  metrics: {
    variant_a: {
      views: number;
      clicks: number;
      conversions: number;
      ctr?: number;
      conversionRate?: number;
    };
    variant_b: {
      views: number;
      clicks: number;
      conversions: number;
      ctr?: number;
      conversionRate?: number;
    };
  };
  winner?: 'a' | 'b';
  confidence?: number;
}

/**
 * Calculate click-through rate
 */
export function calculateCTR(clicks: number, views: number): number {
  if (views === 0) return 0;
  return (clicks / views) * 100;
}

/**
 * Calculate conversion rate
 */
export function calculateConversionRate(conversions: number, clicks: number): number {
  if (clicks === 0) return 0;
  return (conversions / clicks) * 100;
}

/**
 * Perform chi-square test for statistical significance
 * Returns confidence level (0-100)
 */
export function calculateStatisticalSignificance(
  variantA: { conversions: number; views: number },
  variantB: { conversions: number; views: number }
): number {
  const conversionA = variantA.conversions / variantA.views;
  const conversionB = variantB.conversions / variantB.views;
  
  if (variantA.views < 100 || variantB.views < 100) {
    return 0; // Need more data
  }

  const pooled = (variantA.conversions + variantB.conversions) /
    (variantA.views + variantB.views);
  
  const seA = Math.sqrt((pooled * (1 - pooled)) / variantA.views);
  const seB = Math.sqrt((pooled * (1 - pooled)) / variantB.views);
  const se = Math.sqrt(seA * seA + seB * seB);
  
  const zScore = (conversionA - conversionB) / se;
  const confidence = erf(Math.abs(zScore) / Math.sqrt(2)) * 100;
  
  return Math.min(99, confidence);
}

/**
 * Error function approximation for normal distribution
 */
function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y =
    1.0 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

/**
 * Determine winning variant with confidence threshold
 */
export function determineWinner(
  test: ABTest,
  confidenceThreshold: number = 95
): 'a' | 'b' | null {
  const rateA = calculateConversionRate(
    test.metrics.variant_a.conversions,
    test.metrics.variant_a.clicks
  );
  const rateB = calculateConversionRate(
    test.metrics.variant_b.conversions,
    test.metrics.variant_b.clicks
  );

  const confidence = calculateStatisticalSignificance(
    { conversions: test.metrics.variant_a.conversions, views: test.metrics.variant_a.views },
    { conversions: test.metrics.variant_b.conversions, views: test.metrics.variant_b.views }
  );

  if (confidence < confidenceThreshold) {
    return null; // Not enough confidence
  }

  return rateA > rateB ? 'a' : 'b';
}

/**
 * Generate test recommendations
 */
export function generateTestRecommendations(test: ABTest): string[] {
  const recommendations: string[] = [];
  
  const rateA = calculateConversionRate(
    test.metrics.variant_a.conversions,
    test.metrics.variant_a.clicks
  );
  const rateB = calculateConversionRate(
    test.metrics.variant_b.conversions,
    test.metrics.variant_b.clicks
  );

  if (test.metrics.variant_a.views < 500 || test.metrics.variant_b.views < 500) {
    recommendations.push('Collect more data for statistical significance (aim for 500+ impressions per variant)');
  }

  if (rateA > rateB * 1.1) {
    recommendations.push('Variant A shows 10%+ better performance. Consider making it the primary version.');
  }

  if (rateB > rateA * 1.1) {
    recommendations.push('Variant B shows 10%+ better performance. Consider making it the primary version.');
  }

  if (Math.abs(rateA - rateB) < 5) {
    recommendations.push('Performance is similar. Test different elements next (colors, headlines, CTAs)');
  }

  if (test.metrics.variant_a.clicks === 0 || test.metrics.variant_b.clicks === 0) {
    recommendations.push('One variant has no clicks. Check visibility and placement.');
  }

  return recommendations.length > 0
    ? recommendations
    : ['Test is performing well. Monitor and compare against baseline.'];
}

/**
 * Calculate recommended sample size for test
 * Based on effect size and desired confidence
 */
export function calculateSampleSize(
  baselineConversionRate: number,
  minimalDetectableEffect: number = 0.2, // 20% relative improvement
  confidenceLevel: number = 0.95,
  statisticalPower: number = 0.8
): number {
  // Simplified calculation
  // In production, use G*Power or similar tool
  const alpha = 1 - confidenceLevel;
  const beta = 1 - statisticalPower;
  
  const z_alpha = 1.96; // 95% confidence
  const z_beta = 0.84; // 80% power
  
  const p1 = baselineConversionRate;
  const p2 = baselineConversionRate * (1 + minimalDetectableEffect);
  
  const numerator = (z_alpha + z_beta) * (z_alpha + z_beta);
  const denominator =
    ((p2 - p1) * (p2 - p1)) / (p1 * (1 - p1) + p2 * (1 - p2));
  
  return Math.ceil(numerator / denominator);
}
