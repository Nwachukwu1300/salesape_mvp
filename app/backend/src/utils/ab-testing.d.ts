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
export declare function calculateCTR(clicks: number, views: number): number;
/**
 * Calculate conversion rate
 */
export declare function calculateConversionRate(conversions: number, clicks: number): number;
/**
 * Perform chi-square test for statistical significance
 * Returns confidence level (0-100)
 */
export declare function calculateStatisticalSignificance(variantA: {
    conversions: number;
    views: number;
}, variantB: {
    conversions: number;
    views: number;
}): number;
/**
 * Determine winning variant with confidence threshold
 */
export declare function determineWinner(test: ABTest, confidenceThreshold?: number): 'a' | 'b' | null;
/**
 * Generate test recommendations
 */
export declare function generateTestRecommendations(test: ABTest): string[];
/**
 * Calculate recommended sample size for test
 * Based on effect size and desired confidence
 */
export declare function calculateSampleSize(baselineConversionRate: number, minimalDetectableEffect?: number, // 20% relative improvement
confidenceLevel?: number, statisticalPower?: number): number;
//# sourceMappingURL=ab-testing.d.ts.map