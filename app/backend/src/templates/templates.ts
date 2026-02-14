/**
 * Website Template Definitions
 * Contains the three core templates: image-heavy, service-heavy, luxury
 */

import type { WebsiteTemplate } from './website-template.types.js';

export const imageHeavyTemplate: WebsiteTemplate = {
  id: 'image-heavy',
  name: 'Image Heavy',
  description: 'Visual-first design with large hero images and grid-based service showcase. Perfect for creative industries, restaurants, and lifestyle brands.',
  layout: {
    heroStyle: 'image-full',
    servicesLayout: 'grid',
    typography: 'modern',
  },
  defaultSections: ['hero', 'services', 'about', 'testimonials', 'contact', 'booking'],
  stylingRules: {
    spacing: 'comfortable',
    imageRadius: 12,
    shadowIntensity: 'medium',
    borderStyle: 'none',
  },
  categories: [
    'photography',
    'creative',
    'restaurant',
    'food',
    'fashion',
    'beauty',
    'fitness',
    'art',
    'design',
    'lifestyle',
    'travel',
    'hospitality',
    'events',
    'wedding',
    'interior-design',
  ],
  tones: ['bold', 'friendly', 'casual'],
};

export const serviceHeavyTemplate: WebsiteTemplate = {
  id: 'service-heavy',
  name: 'Service Heavy',
  description: 'Content-focused layout emphasizing services and expertise. Ideal for consultants, agencies, and professional service providers.',
  layout: {
    heroStyle: 'image-left',
    servicesLayout: 'list',
    typography: 'classic',
  },
  defaultSections: ['hero', 'services', 'about', 'testimonials', 'contact', 'booking'],
  stylingRules: {
    spacing: 'compact',
    imageRadius: 8,
    shadowIntensity: 'light',
    borderStyle: 'subtle',
  },
  categories: [
    'consulting',
    'legal',
    'accounting',
    'finance',
    'insurance',
    'marketing',
    'agency',
    'tech',
    'software',
    'saas',
    'healthcare',
    'medical',
    'dental',
    'education',
    'coaching',
    'home-services',
    'plumbing',
    'electrical',
    'hvac',
    'cleaning',
    'landscaping',
    'construction',
    'real-estate',
  ],
  tones: ['professional', 'friendly'],
};

export const luxuryTemplate: WebsiteTemplate = {
  id: 'luxury',
  name: 'Luxury',
  description: 'Elegant, spacious design with premium aesthetics. Perfect for high-end brands, luxury services, and exclusive experiences.',
  layout: {
    heroStyle: 'centered',
    servicesLayout: 'grid',
    typography: 'luxury',
  },
  defaultSections: ['hero', 'services', 'about', 'testimonials', 'contact', 'booking'],
  stylingRules: {
    spacing: 'spacious',
    imageRadius: 0,
    shadowIntensity: 'none',
    borderStyle: 'bold',
  },
  categories: [
    'luxury',
    'jewelry',
    'watches',
    'automotive',
    'yacht',
    'private-jet',
    'spa',
    'wellness',
    'fine-dining',
    'wine',
    'spirits',
    'fashion',
    'couture',
    'architecture',
    'art-gallery',
    'concierge',
    'private-banking',
    'luxury-real-estate',
  ],
  tones: ['luxury', 'professional'],
};

/**
 * All available templates
 */
export const allTemplates: WebsiteTemplate[] = [
  imageHeavyTemplate,
  serviceHeavyTemplate,
  luxuryTemplate,
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): WebsiteTemplate | undefined {
  return allTemplates.find((t) => t.id === id);
}

/**
 * Get all templates
 */
export function getAllTemplates(): WebsiteTemplate[] {
  return allTemplates;
}
