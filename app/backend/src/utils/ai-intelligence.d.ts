/**
 * AI Business Intelligence Generator
 * Extracts business profile, generates marketing copy, lead questions, SEO keywords
 */
interface ScrapedData {
    title?: string;
    description?: string;
    email?: string;
    phone?: string;
    images?: string[];
    socialLinks?: string[];
}
interface BusinessIntelligence {
    businessName?: string;
    services?: string[];
    industryCategory?: string;
    targetAudience?: string;
    uniqueValue?: string;
    marketingCopy?: string;
    heroHeadline?: string;
    seoKeywords?: string[];
    leadQualificationQuestions?: string[];
    brandColors?: string[];
    tone?: string;
}
/**
 * Analyze scraped business data and generate AI intelligence
 */
export declare function generateBusinessIntelligence(scraped: ScrapedData, conversationalInput?: string): Promise<BusinessIntelligence>;
/**
 * Generate lead score based on engagement and source
 */
export declare function calculateLeadScore(lead: {
    source?: string;
    messageLength?: number;
    responseTime?: number;
    engagementLevel?: number;
}): number;
export {};
//# sourceMappingURL=ai-intelligence.d.ts.map