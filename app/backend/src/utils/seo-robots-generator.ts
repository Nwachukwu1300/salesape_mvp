/**
 * Robots.txt Generator
 * Creates optimized robots.txt for search engine crawlers
 */

export interface RobotsConfig {
  domain: string;
  sitemapUrls?: string[];
  disallowPaths?: string[];
  crawlDelay?: number;
  requestRate?: number;
  userAgents?: {
    name: string;
    allowPaths?: string[];
    disallowPaths?: string[];
    crawlDelay?: number;
  }[];
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(config: RobotsConfig): string {
  let content = '';

  // Comment header
  content += `# Robots.txt for ${config.domain}
# Generated for optimal search engine optimization
# This file helps search engines discover and crawl your website efficiently

`;

  // Default user agent rules
  content += `# Allow all directories by default for major search engines
User-agent: *
Allow: /
`;

  // Add disallow paths if specified
  if (config.disallowPaths && config.disallowPaths.length > 0) {
    content += `
# Disallowed paths
`;
    config.disallowPaths.forEach((path) => {
      content += `Disallow: ${path}\n`;
    });
  }

  // Add crawl delay
  if (config.crawlDelay) {
    content += `Crawl-delay: ${config.crawlDelay}\n`;
  }

  // Add request rate
  if (config.requestRate) {
    content += `Request-rate: ${config.requestRate}\n`;
  }

  // Add custom user agent rules
  if (config.userAgents && config.userAgents.length > 0) {
    config.userAgents.forEach((agent) => {
      content += `
# Rules for ${agent.name}
User-agent: ${agent.name}
`;

      if (agent.allowPaths && agent.allowPaths.length > 0) {
        agent.allowPaths.forEach((path) => {
          content += `Allow: ${path}\n`;
        });
      }

      if (agent.disallowPaths && agent.disallowPaths.length > 0) {
        agent.disallowPaths.forEach((path) => {
          content += `Disallow: ${path}\n`;
        });
      }

      if (agent.crawlDelay) {
        content += `Crawl-delay: ${agent.crawlDelay}\n`;
      }
    });
  }

  // Add sitemap URLs
  if (config.sitemapUrls && config.sitemapUrls.length > 0) {
    content += `
# Sitemaps
`;
    config.sitemapUrls.forEach((url) => {
      content += `Sitemap: ${url}\n`;
    });
  }

  return content;
}

/**
 * Generate default robots.txt for business websites
 */
export function generateDefaultRobotsTxt(domain: string, sitemapUrl?: string): string {
  return generateRobotsTxt({
    domain,
    sitemapUrls: sitemapUrl ? [sitemapUrl] : [],
    disallowPaths: [
      '/admin/',
      '/private/',
      '/temp/',
      '/*.json$',
      '/*.xml$',
    ],
    crawlDelay: 1,
  });
}

/**
 * Generate SEO-optimized robots.txt for AEO (Answer Engine Optimization)
 */
export function generateAEOOptimizedRobotsTxt(
  domain: string,
  sitemapUrl: string,
  config?: {
    allowGPT?: boolean;
    allowPerplexity?: boolean;
    allowClaude?: boolean;
    allowOther?: boolean;
  }
): string {
  const defaultConfig = {
    allowGPT: true,
    allowPerplexity: true,
    allowClaude: true,
    allowOther: true,
    ...config,
  };

  let content = `# AEO (Answer Engine Optimization) Optimized Robots.txt
# Generated for ${domain}
# Optimized for Answer Engines like Perplexity, Claude, ChatGPT, and Google

User-agent: *
Allow: /

# Disable crawling of private and temporary content
Disallow: /admin/
Disallow: /private/
Disallow: /temp/
Disallow: /api/
Disallow: /dashboard/
Disallow: /*.json$
Disallow: /*?*sort=

# Standard crawl delay
Crawl-delay: 1

# Allow content for Answer Engine Optimization (AEO)
`;

  if (defaultConfig.allowGPT) {
    content += `
# GPT Bot (OpenAI's content crawler)
User-agent: GPTBot
Allow: /

`;
  }

  if (defaultConfig.allowPerplexity) {
    content += `# Perplexity Bot
User-agent: PerplexityBot
Allow: /

`;
  }

  if (defaultConfig.allowClaude) {
    content += `# Claude Bot (Anthropic)
User-agent: Claude-Web
Allow: /

`;
  }

  if (defaultConfig.allowOther) {
    content += `# Other AI/ML crawlers
User-agent: CCBot
Allow: /

User-agent: Applebot
Allow: /

`;
  }

  // Add sitemaps
  content += `
# Sitemaps for better indexing
Sitemap: ${sitemapUrl}
`;

  return content;
}
