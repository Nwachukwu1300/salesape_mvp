/**
 * SEO Utilities Index
 * Centralized export of all SEO and AEO optimization utilities
 */

export * from './seo-sitemap-generator.js';
export * from './seo-robots-generator.js';
export * from './seo-meta-tags.js';
export * from './aeo-optimizer.js';

// Re-export enhanced schema functions
export {
  generateReviewSchema,
  generateAggregateRatingSchema,
  generateMultipleReviewsSchema,
  generateProductRatingSchema,
  generateTestimonialSchema,
} from './schema-generator.js';

// Export commonly used functions with simplified names
export { generateSitemap, generateStandardSitemapUrls } from './seo-sitemap-generator.js';
export { generateDefaultRobotsTxt, generateAEOOptimizedRobotsTxt } from './seo-robots-generator.js';
export { generateCanonicalLink, generateAllMetaTags } from './seo-meta-tags.js';
export { generateAEOSchema, optimizeForNLU, generateStructuredQA } from './aeo-optimizer.js';
