/**
 * Content Sanitization Utility
 * Prevents XSS attacks and content injection
 * 
 * Sanitizes:
 * - AI-generated HTML sections
 * - User-submitted testimonials
 * - Blog content
 * - Lead messages
 * - Generated website config
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes script tags, event handlers, data URIs
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') return '';

  const config = {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'p', 'br',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'img', 'a',
      'div', 'span', 'section', 'article',
      'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'src', 'alt',
      'class', 'style', 'target',
      'loading' // for lazy loading
    ],
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
    FORCE_BODY: false,
    SANITIZE_DOM: true,
    IN_PLACE: false,
  };

  const clean = DOMPurify.sanitize(html, config);

  // Additional custom sanitization for edge cases
  return removeDataURI(removeInlineEventHandlers(clean));
}

/**
 * Sanitize plain text to prevent injection
 * Escapes HTML entities
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Remove inline event handlers (onclick, onerror, etc)
 * Uses regex to catch common patterns
 */
function removeInlineEventHandlers(html: string): string {
  // Remove all event handler attributes
  return html
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')  // onclick="...", onerror='...'
    .replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')  // unquoted event handlers
    .replace(/javascript:/gi, '')  // javascript: protocol
    .replace(/vbscript:/gi, '')  // vbscript: protocol
    .replace(/data:text\/html/gi, '');  // data: URI with HTML
}

/**
 * Block data: URIs which can contain embedded scripts
 */
function removeDataURI(html: string): string {
  // Remove data:text/html and data:application/javascript URIs
  return html
    .replace(/data:text\/html[^"']*["']?[^"']*["']?/gi, '')
    .replace(/data:application\/javascript[^"']*["']?[^"']*["']?/gi, '')
    // Keep safe data URIs like data:image
    .replace(/src="data:text\/.*?"/gi, '');
}

/**
 * Sanitize JSON structure for safe output
 * Used for WebsiteConfig, BusinessUnderstanding
 */
export function sanitizeJSON(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeText(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeJSON(item));
  }

  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize the key
      const cleanKey = sanitizeText(key);
      // Recursively sanitize the value
      sanitized[cleanKey] = sanitizeJSON(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Sanitize URL to prevent javascript: and other unsafe protocols
 */
export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') return '';

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('file:')
  ) {
    return '';
  }

  // Allow http, https, mailto, tel
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:')
  ) {
    return url;
  }

  // Allow relative URLs
  if (trimmed.startsWith('/')) {
    return url;
  }

  return '';
}

/**
 * Sanitize testimonial content
 * Ensures user-contributed content is safe
 */
export function sanitizeTestimonial(testimonial: {
  clientName: string;
  clientTitle?: string;
  content: string;
}): {
  clientName: string;
  clientTitle?: string;
  content: string;
} {
  return {
    clientName: sanitizeText(testimonial.clientName),
    clientTitle: sanitizeText(testimonial.clientTitle || ''),
    content: sanitizeHTML(testimonial.content),
  };
}

/**
 * Sanitize lead message
 */
export function sanitizeLead(data: any): any {
  return {
    ...data,
    name: sanitizeText(data.name),
    email: sanitizeText(data.email),
    company: sanitizeText(data.company || ''),
    message: sanitizeHTML(data.message || ''),
  };
}

/**
 * Validate and sanitize website config before rendering
 * This is critical - config gets rendered directly to HTML
 */
export function sanitizeWebsiteConfig(config: any): any {
  if (!config) return null;

  return {
    meta: {
      title: sanitizeText(config.meta?.title || ''),
      description: sanitizeText(config.meta?.description || ''),
      keywords: Array.isArray(config.meta?.keywords)
        ? config.meta.keywords.map((k: string) => sanitizeText(k))
        : [],
    },
    theme: {
      primaryColor: validateHexColor(config.theme?.primaryColor),
      secondaryColor: validateHexColor(config.theme?.secondaryColor),
      font: sanitizeText(config.theme?.font || 'inter'),
    },
    sections: Array.isArray(config.sections)
      ? config.sections.map((section: any) => ({
          type: sanitizeText(section.type),
          title: sanitizeText(section.title || ''),
          content: sanitizeHTML(section.content || ''),
          image: sanitizeURL(section.image || ''),
          items: Array.isArray(section.items)
            ? section.items.map((item: any) => ({
                title: sanitizeText(item.title || ''),
                description: sanitizeHTML(item.description || ''),
                icon: sanitizeText(item.icon || ''),
              }))
            : [],
        }))
      : [],
    bookingEnabled: Boolean(config.bookingEnabled),
  };
}

/**
 * Validate hex color to prevent injection
 */
function validateHexColor(color: string): string {
  if (!color || typeof color !== 'string') return '#000000';

  const hex = color.trim();

  // Check if valid hex color
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) {
    return hex;
  }

  // Fallback
  return '#000000';
}

export default {
  sanitizeHTML,
  sanitizeText,
  sanitizeJSON,
  sanitizeURL,
  sanitizeTestimonial,
  sanitizeLead,
  sanitizeWebsiteConfig,
};
