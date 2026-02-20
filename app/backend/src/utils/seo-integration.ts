/**
 * Complete SEO/AEO Integration
 * Integrates all SEO and AEO utilities into the website generation process
 */

import type { WebsiteConfig } from '../website-config/website-config.types.js';
import {
  generateSitemap,
  generateStandardSitemapUrls,
  generateDefaultRobotsTxt,
  generateAEOOptimizedRobotsTxt,
  generateCanonicalLink,
  generateAllMetaTags,
  generateAEOSchema,
  optimizeForNLU,
  generateStructuredQA,
} from './seo-index.js';
import {
  generateReviewSchema,
  generateTestimonialSchema,
} from './schema-generator.js';

export interface SEOIntegrationConfig {
  baseUrl: string;
  domain: string;
  websiteConfig: WebsiteConfig;
  businessData: {
    name: string;
    category: string;
    services: string[];
    location: string;
    email?: string;
    phone?: string;
  };
}

/**
 * Generate complete SEO/AEO package for a website
 */
export async function generateCompleteSEOPackage(config: SEOIntegrationConfig): Promise<{
  sitemap: string;
  robotsTxt: string;
  canonicalLink: string;
  metaTags: string;
  schemaMarkups: Record<string, any>;
  aeoConfig: any;
}> {
  const { baseUrl, domain, websiteConfig, businessData } = config;

  // Generate sitemap
  const sitemapUrls = generateStandardSitemapUrls({
    domain,
    baseUrl,
    websiteConfig,
  });
  const sitemap = generateSitemap(sitemapUrls);

  // Generate robots.txt (AEO-optimized)
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  const robotsTxt = generateAEOOptimizedRobotsTxt(domain, sitemapUrl);

  // Generate canonical link
  const canonicalLink = generateCanonicalLink(baseUrl);

  // Generate meta tags
  const metaTagsConfig: any = {
    title: websiteConfig.meta.title,
    description: websiteConfig.meta.description,
    keywords: websiteConfig.meta.keywords,
    canonicalUrl: baseUrl,
    ogType: 'business.business',
    twitterCard: 'summary_large_image',
  };
  
  if (websiteConfig.meta.ogImage) {
    metaTagsConfig.ogImage = websiteConfig.meta.ogImage;
  }
  
  const metaTags = generateAllMetaTags(metaTagsConfig);

  // Generate schema markups
  const aeoSchemaConfig: any = {
    name: businessData.name,
    category: businessData.category,
    description: websiteConfig.meta.description,
    services: businessData.services,
    location: businessData.location,
    website: baseUrl,
  };
  
  if (businessData.phone) {
    aeoSchemaConfig.phone = businessData.phone;
  }
  
  if (businessData.email) {
    aeoSchemaConfig.email = businessData.email;
  }
  
  const schemaMarkups: Record<string, any> = {
    aeo: generateAEOSchema(aeoSchemaConfig),
    reviews: generateTestimonialSchema(
      businessData.name,
      (websiteConfig.testimonials?.items || []).map((item: any) => ({
        text: item.text || item.content || '',
        author: item.author || item.name || 'Anonymous',
        title: item.title,
        rating: item.rating,
        image: item.image,
      }))
    ),
    structuredQA: generateStructuredQA(businessData.name, businessData.category, businessData.services),
  };

  // Generate AEO optimization config
  const nluOptimization = optimizeForNLU({
    name: businessData.name,
    category: businessData.category,
    services: businessData.services,
    targetAudience: websiteConfig.about.content,
    location: businessData.location,
  });

  return {
    sitemap,
    robotsTxt,
    canonicalLink,
    metaTags,
    schemaMarkups,
    aeoConfig: {
      nluOptimization,
      answerEngineOptimized: true,
      sitemapUrl,
      robotsUrl: `${baseUrl}/robots.txt`,
    },
  };
}

/**
 * Inject SEO config into HTML head
 */
export function injectSEOIntoHead(
  htmlContent: string,
  seoPackage: Awaited<ReturnType<typeof generateCompleteSEOPackage>>
): string {
  const headBeforeClosing = htmlContent.replace('</head>', `    ${seoPackage.canonicalLink}\n    ${seoPackage.metaTags}\n</head>`);
  return headBeforeClosing;
}

/**
 * Generate HTML endpoints for SEO files
 */
export function generateSEOEndpoints(config: SEOIntegrationConfig): Record<string, string> {
  const robotsTxt = generateAEOOptimizedRobotsTxt(
    config.domain,
    `${config.baseUrl}/sitemap.xml`
  );

  const sitemapUrls = generateStandardSitemapUrls({
    domain: config.domain,
    baseUrl: config.baseUrl,
    websiteConfig: config.websiteConfig,
  });
  const sitemap = generateSitemap(sitemapUrls);

  return {
    '/robots.txt': robotsTxt,
    '/sitemap.xml': sitemap,
    '/.well-known/humans.txt': `User-agent: *
Website: ${config.baseUrl}
Canonical: ${config.baseUrl}
Technology: Next.js, TypeScript, React
SEO: SalesAPE AEO/SEO Optimization Engine
`,
  };
}

/**
 * Validate SEO configuration readiness
 */
export function validateSEOReadiness(websiteConfig: WebsiteConfig): {
  ready: boolean;
  issues: string[];
  warnings: string[];
} {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!websiteConfig.meta.title) issues.push('Missing meta title');
  if (!websiteConfig.meta.description) issues.push('Missing meta description');
  if (!websiteConfig.meta.keywords || websiteConfig.meta.keywords.length === 0)
    warnings.push('No keywords defined');

  // Title length check
  if (websiteConfig.meta.title.length > 60)
    warnings.push(`Meta title too long (${websiteConfig.meta.title.length}), should be 50-60 chars`);
  if (websiteConfig.meta.title.length < 30)
    warnings.push(`Meta title too short (${websiteConfig.meta.title.length}), should be 30-60 chars`);

  // Description length check
  if (websiteConfig.meta.description.length > 160)
    warnings.push(`Meta description too long (${websiteConfig.meta.description.length}), should be 150-160 chars`);
  if (websiteConfig.meta.description.length < 120)
    warnings.push(`Meta description too short (${websiteConfig.meta.description.length}), should be 120-160 chars`);

  // Schema validation
  if (!websiteConfig.seoConfig?.schemaMarkup)
    warnings.push('Schema markup not configured');

  // Open Graph validation
  if (!websiteConfig.meta.ogImage)
    warnings.push('OG image not configured');

  return {
    ready: issues.length === 0,
    issues,
    warnings,
  };
}

export default {
  generateCompleteSEOPackage,
  injectSEOIntoHead,
  generateSEOEndpoints,
  validateSEOReadiness,
};
