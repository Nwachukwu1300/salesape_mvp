/**
 * SEO Meta Tags and Canonical URL Generator
 * Generates comprehensive meta tags including canonical URLs for duplicate content prevention
 */

export interface MetaTagsConfig {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'business.business' | 'article' | 'product';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterImage?: string;
  twitterCreator?: string;
  author?: string;
  robots?: string;
  language?: string;
  locale?: string;
  alternateUrls?: { lang: string; url: string }[];
  structuredData?: Record<string, any>;
}

/**
 * Generate canonical link tag
 */
export function generateCanonicalLink(canonicalUrl: string): string {
  return `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`;
}

/**
 * Generate alternate language links (hreflang)
 */
export function generateHreflangTags(alternateUrls: { lang: string; url: string }[]): string {
  return alternateUrls
    .map((alt) => `<link rel="alternate" hreflang="${alt.lang}" href="${escapeHtml(alt.url)}" />`)
    .join('\n');
}

/**
 * Generate Open Graph meta tags
 */
export function generateOpenGraphTags(config: Partial<MetaTagsConfig>): string {
  const tags: string[] = [];

  if (config.ogType) {
    tags.push(`<meta property="og:type" content="${config.ogType}" />`);
  }

  if (config.ogTitle) {
    tags.push(`<meta property="og:title" content="${escapeHtml(config.ogTitle)}" />`);
  }

  if (config.ogDescription) {
    tags.push(`<meta property="og:description" content="${escapeHtml(config.ogDescription)}" />`);
  }

  if (config.ogImage) {
    tags.push(`<meta property="og:image" content="${escapeHtml(config.ogImage)}" />`);
    tags.push(`<meta property="og:image:width" content="1200" />`);
    tags.push(`<meta property="og:image:height" content="630" />`);
  }

  if (config.canonicalUrl) {
    tags.push(`<meta property="og:url" content="${escapeHtml(config.canonicalUrl)}" />`);
  }

  return tags.join('\n');
}

/**
 * Generate Twitter Card meta tags
 */
export function generateTwitterCardTags(config: Partial<MetaTagsConfig>): string {
  const tags: string[] = [];

  const cardType = config.twitterCard || 'summary_large_image';
  tags.push(`<meta name="twitter:card" content="${cardType}" />`);

  if (config.title) {
    tags.push(`<meta name="twitter:title" content="${escapeHtml(config.title)}" />`);
  }

  if (config.description) {
    tags.push(`<meta name="twitter:description" content="${escapeHtml(config.description)}" />`);
  }

  if (config.twitterImage) {
    tags.push(`<meta name="twitter:image" content="${escapeHtml(config.twitterImage)}" />`);
  }

  if (config.twitterCreator) {
    tags.push(`<meta name="twitter:creator" content="${config.twitterCreator}" />`);
  }

  return tags.join('\n');
}

/**
 * Generate basic meta tags
 */
export function generateBasicMetaTags(config: Partial<MetaTagsConfig>): string {
  const tags: string[] = [];

  if (config.title) {
    tags.push(`<meta name="title" content="${escapeHtml(config.title)}" />`);
  }

  if (config.description) {
    tags.push(`<meta name="description" content="${escapeHtml(config.description)}" />`);
  }

  if (config.keywords && config.keywords.length > 0) {
    const keywordString = config.keywords.join(', ');
    tags.push(`<meta name="keywords" content="${escapeHtml(keywordString)}" />`);
  }

  if (config.author) {
    tags.push(`<meta name="author" content="${escapeHtml(config.author)}" />`);
  }

  if (config.robots) {
    tags.push(`<meta name="robots" content="${config.robots}" />`);
  }

  if (config.language) {
    tags.push(`<meta name="language" content="${config.language}" />`);
  }

  return tags.join('\n');
}

/**
 * Generate all meta tags (comprehensive)
 */
export function generateAllMetaTags(config: MetaTagsConfig): string {
  const sections: string[] = [];

  // Basic meta tags
  sections.push(generateBasicMetaTags(config));

  // Canonical link
  sections.push(generateCanonicalLink(config.canonicalUrl));

  // Open Graph
  sections.push(generateOpenGraphTags(config));

  // Twitter Card
  sections.push(generateTwitterCardTags(config));

  // Alternate language links
  if (config.alternateUrls && config.alternateUrls.length > 0) {
    sections.push(generateHreflangTags(config.alternateUrls));
  }

  // Structured data (JSON-LD)
  if (config.structuredData) {
    sections.push(
      `<script type="application/ld+json">\n${JSON.stringify(config.structuredData, null, 2)}\n</script>`
    );
  }

  return sections.filter((s) => s.length > 0).join('\n');
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

/**
 * Generate SEO-optimized head section for HTML
 */
export function generateSeoHead(config: MetaTagsConfig): string {
  return `<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(config.title)}</title>
  
  <!-- SEO Meta Tags -->
  ${generateAllMetaTags(config)}
  
  <!-- Additional SEO Optimizations -->
  <meta name="format-detection" content="telephone=no" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black" />
  
  <!-- Preconnect to external domains for performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preconnect" href="https://api.unsplash.com" />
  
  <!-- DNS Prefetch for tracking/analytics -->
  <link rel="dns-prefetch" href="https://www.google-analytics.com" />
</head>`;
}
