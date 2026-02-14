/**
 * Image Enrichment Service
 * Handles image extraction, fallback fetching, and optimization
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ImageAssets {
  hero: string;
  gallery: string[];
}

export interface ImageEnrichmentInput {
  scrapedHtml?: string;
  scrapedImages?: string[];
  category: string;
  seoKeywords: string[];
  businessName: string;
}

export interface ImageEnrichmentResult {
  assets: ImageAssets;
  source: 'scraped' | 'unsplash' | 'fallback';
  count: number;
}

// Unsplash collection IDs for different categories
const UNSPLASH_COLLECTIONS: Record<string, string> = {
  restaurant: 'food-drink',
  food: 'food-drink',
  photography: 'arts-culture',
  art: 'arts-culture',
  fitness: 'health',
  gym: 'health',
  spa: 'health',
  wellness: 'health',
  technology: 'business-work',
  consulting: 'business-work',
  marketing: 'business-work',
  legal: 'business-work',
  finance: 'business-work',
  construction: 'architecture-interior',
  architecture: 'architecture-interior',
  'real-estate': 'architecture-interior',
  beauty: 'fashion-beauty',
  fashion: 'fashion-beauty',
  travel: 'travel',
  nature: 'nature',
  default: 'business-work',
};

// Fallback images by category (Unsplash direct links)
const FALLBACK_IMAGES: Record<string, string[]> = {
  business: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
  ],
  restaurant: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
    'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
  ],
  fitness: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
  ],
  beauty: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
    'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800',
    'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800',
  ],
  technology: [
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
  ],
  medical: [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
    'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800',
  ],
  construction: [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800',
    'https://images.unsplash.com/photo-1541976590-713941681591?w=800',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
  ],
  default: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
    'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
  ],
};

/**
 * Extract images from HTML content
 */
export function extractImagesFromHtml(html: string, baseUrl?: string): string[] {
  const $ = cheerio.load(html);
  const images: string[] = [];

  $('img').each((_i, el) => {
    let src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');

    if (!src) return;

    // Skip tiny images, icons, and tracking pixels
    const width = parseInt($(el).attr('width') || '0', 10);
    const height = parseInt($(el).attr('height') || '0', 10);
    if ((width > 0 && width < 100) || (height > 0 && height < 100)) return;

    // Skip common icon/logo patterns
    if (src.includes('icon') || src.includes('logo') || src.includes('favicon')) return;
    if (src.includes('1x1') || src.includes('pixel')) return;

    // Make relative URLs absolute
    if (src.startsWith('//')) {
      src = `https:${src}`;
    } else if (src.startsWith('/') && baseUrl) {
      try {
        const url = new URL(baseUrl);
        src = `${url.protocol}//${url.host}${src}`;
      } catch {
        return;
      }
    } else if (!src.startsWith('http')) {
      if (baseUrl) {
        try {
          src = new URL(src, baseUrl).href;
        } catch {
          return;
        }
      } else {
        return;
      }
    }

    // Basic validation
    if (src.startsWith('http') && !images.includes(src)) {
      images.push(src);
    }
  });

  // Also look for background images in style attributes
  $('[style*="background"]').each((_i, el) => {
    const style = $(el).attr('style') || '';
    const urlMatch = style.match(/url\(['"]?([^'")\s]+)['"]?\)/);
    if (urlMatch && urlMatch[1]) {
      let bgUrl = urlMatch[1];
      if (bgUrl.startsWith('http') && !images.includes(bgUrl)) {
        images.push(bgUrl);
      }
    }
  });

  return images.slice(0, 10); // Limit to 10 images
}

/**
 * Get category for Unsplash search
 */
function getUnsplashCategory(category: string): string {
  const normalizedCategory = category.toLowerCase();

  for (const [key, collection] of Object.entries(UNSPLASH_COLLECTIONS)) {
    if (normalizedCategory.includes(key)) {
      return collection;
    }
  }

  return UNSPLASH_COLLECTIONS.default;
}

/**
 * Fetch images from Unsplash API
 */
export async function fetchUnsplashImages(
  query: string,
  count: number = 4
): Promise<string[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    console.warn('UNSPLASH_ACCESS_KEY not set, using fallback images');
    return [];
  }

  try {
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query,
        per_page: count,
        orientation: 'landscape',
      },
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
      timeout: 5000,
    });

    if (response.data && response.data.results) {
      return response.data.results.map((photo: any) => photo.urls.regular);
    }
  } catch (error) {
    console.error('Unsplash API error:', error);
  }

  return [];
}

/**
 * Get fallback images based on category
 */
function getFallbackImages(category: string): string[] {
  const normalizedCategory = category.toLowerCase();

  for (const [key, images] of Object.entries(FALLBACK_IMAGES)) {
    if (normalizedCategory.includes(key)) {
      return images;
    }
  }

  return FALLBACK_IMAGES.default;
}

/**
 * Validate that an image URL is accessible
 */
async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await axios.head(url, { timeout: 3000 });
    const contentType = response.headers['content-type'] || '';
    return response.status === 200 && contentType.startsWith('image/');
  } catch {
    return false;
  }
}

/**
 * Main image enrichment function
 */
export async function enrichImages(input: ImageEnrichmentInput): Promise<ImageEnrichmentResult> {
  const { scrapedImages, category, seoKeywords, businessName } = input;

  let images: string[] = [];
  let source: 'scraped' | 'unsplash' | 'fallback' = 'fallback';

  // Step 1: Use scraped images if available and valid
  if (scrapedImages && scrapedImages.length > 0) {
    // Validate first few images
    const validatedImages: string[] = [];
    for (const img of scrapedImages.slice(0, 5)) {
      const isValid = await validateImageUrl(img);
      if (isValid) {
        validatedImages.push(img);
      }
    }

    if (validatedImages.length >= 3) {
      images = validatedImages;
      source = 'scraped';
    }
  }

  // Step 2: Try Unsplash if scraped images are insufficient
  if (images.length < 3) {
    const searchQuery = `${category} ${businessName}`.trim();
    const unsplashImages = await fetchUnsplashImages(searchQuery, 4);

    if (unsplashImages.length > 0) {
      images = [...images, ...unsplashImages];
      source = images.length > 0 && source === 'scraped' ? 'scraped' : 'unsplash';
    }
  }

  // Step 3: Use keyword-based Unsplash search
  if (images.length < 3 && seoKeywords.length > 0) {
    const keywordQuery = seoKeywords.slice(0, 2).join(' ');
    const keywordImages = await fetchUnsplashImages(keywordQuery, 4 - images.length);
    images = [...images, ...keywordImages];
  }

  // Step 4: Fall back to category-based stock images
  if (images.length < 3) {
    const fallbackImages = getFallbackImages(category);
    const neededCount = Math.max(0, 4 - images.length);
    images = [...images, ...fallbackImages.slice(0, neededCount)];
    source = images.length > 0 && source !== 'scraped' && source !== 'unsplash' ? 'fallback' : source;
  }

  // Deduplicate images
  images = [...new Set(images)];

  // Ensure minimum 3 images
  while (images.length < 3) {
    const fallback = FALLBACK_IMAGES.default[images.length] || FALLBACK_IMAGES.default[0];
    if (!images.includes(fallback)) {
      images.push(fallback);
    } else {
      break;
    }
  }

  return {
    assets: {
      hero: images[0] || FALLBACK_IMAGES.default[0],
      gallery: images.slice(1),
    },
    source,
    count: images.length,
  };
}

/**
 * Quick image enrichment using only fallbacks (no API calls)
 */
export function enrichImagesSync(category: string): ImageAssets {
  const images = getFallbackImages(category);
  return {
    hero: images[0],
    gallery: images.slice(1),
  };
}

export default enrichImages;
