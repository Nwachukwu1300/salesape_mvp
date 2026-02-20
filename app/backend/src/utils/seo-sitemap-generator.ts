/**
 * SEO Sitemap Generator
 * Generates XML sitemap and index files for search engine optimization
 * Supports dynamic content with proper priority and update frequency
 */

export interface SitemapUrl {
  url: string;
  lastModified?: string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface SitemapGeneratorConfig {
  domain: string;
  baseUrl: string;
  websiteConfig?: any;
}

/**
 * Generate XML sitemap from URLs
 */
export function generateSitemap(urls: SitemapUrl[]): string {
  const xmlUrls = urls
    .map((url) => {
      let xml = `  <url>
    <loc>${escapeXml(url.url)}</loc>`;

      if (url.lastModified) {
        xml += `\n    <lastmod>${url.lastModified}</lastmod>`;
      }

      if (url.changeFrequency) {
        xml += `\n    <changefreq>${url.changeFrequency}</changefreq>`;
      }

      if (url.priority !== undefined) {
        xml += `\n    <priority>${url.priority.toFixed(1)}</priority>`;
      }

      xml += `\n  </url>`;
      return xml;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0">
${xmlUrls}
</urlset>`;
}

/**
 * Generate sitemap index file for multiple sitemaps
 */
export function generateSitemapIndex(sitemaps: string[]): string {
  const xmlSitemaps = sitemaps
    .map((sitemap) => {
      return `  <sitemap>
    <loc>${escapeXml(sitemap)}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlSitemaps}
</sitemapindex>`;
}

/**
 * Generate standard URLs for a business website
 */
export function generateStandardSitemapUrls(config: SitemapGeneratorConfig): SitemapUrl[] {
  const { baseUrl, websiteConfig } = config;
  const nowDate = new Date().toISOString().split('T')[0];
  const lastModified = nowDate && nowDate.length > 0 ? nowDate : undefined;

  const urls: SitemapUrl[] = [];

  // Home page
  urls.push({
    url: baseUrl,
    changeFrequency: 'weekly',
    priority: 1.0,
  });

  // Services
  urls.push({
    url: `${baseUrl}/#services`,
    changeFrequency: 'weekly',
    priority: 0.9,
  });

  // About
  urls.push({
    url: `${baseUrl}/#about`,
    changeFrequency: 'monthly',
    priority: 0.8,
  });

  // Testimonials
  urls.push({
    url: `${baseUrl}/#testimonials`,
    changeFrequency: 'monthly',
    priority: 0.7,
  });

  // Contact
  urls.push({
    url: `${baseUrl}/#contact`,
    changeFrequency: 'weekly',
    priority: 0.9,
  });

  // Gallery if available
  if (websiteConfig?.gallery?.images?.length) {
    urls.push({
      url: `${baseUrl}/#gallery`,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  // Booking if available
  if (websiteConfig?.booking) {
    urls.push({
      url: `${baseUrl}/#booking`,
      changeFrequency: 'weekly',
      priority: 0.85,
    });
  }

  // Pricing if available
  if (websiteConfig?.pricingTable) {
    urls.push({
      url: `${baseUrl}/#pricing`,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  // Add lastModified after all items are added
  if (lastModified) {
    return urls.map(url => ({
      ...url,
      lastModified,
    }));
  }

  return urls;
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate video sitemap entries (for hero/gallery videos)
 */
export function generateVideoSitemapEntry(
  pageUrl: string,
  videoUrl: string,
  title: string,
  description: string,
  thumbnailUrl?: string
): string {
  return `  <url>
    <loc>${escapeXml(pageUrl)}</loc>
    <video:video>
      <video:content_loc>${escapeXml(videoUrl)}</video:content_loc>
      <video:title>${escapeXml(title)}</video:title>
      <video:description>${escapeXml(description)}</video:description>
      ${thumbnailUrl ? `<video:thumbnail_loc>${escapeXml(thumbnailUrl)}</video:thumbnail_loc>` : ''}
    </video:video>
  </url>`;
}

/**
 * Generate image sitemap entries
 */
export function generateImageSitemapUrls(
  baseUrl: string,
  images: { url: string; title?: string; caption?: string }[]
): string {
  return images
    .map((img) => {
      return `  <url>
    <loc>${escapeXml(baseUrl)}</loc>
    <image:image>
      <image:loc>${escapeXml(img.url)}</image:loc>
      ${img.title ? `<image:title>${escapeXml(img.title)}</image:title>` : ''}
      ${img.caption ? `<image:caption>${escapeXml(img.caption)}</image:caption>` : ''}
    </image:image>
  </url>`;
    })
    .join('\n');
}
