/**
 * Schema Markup Generator
 * Auto-generates JSON-LD structured data for SEO
 * Supports: LocalBusiness, Service, LegalService, BreadcrumbList, FAQPage
 */

// Business understanding type definition
interface BusinessUnderstanding {
  name: string;
  category: string;
  address?: string;
  location: string;
  phone?: string;
  email?: string;
  valueProposition: string;
  services: string[];
  targetMarket?: string;
}

/**
 * Detect schema.org type based on business category
 */
export function detectSchemaType(category: string): string {
  const category_lower = category.toLowerCase();

  const typeMap: { [key: string]: string } = {
    plumbing: 'PlumberService',
    electrician: 'ElectricalService',
    landscaping: 'LandscapeService',
    legal: 'LegalService',
    medical: 'MedicalService',
    dental: 'DentalService',
    cleaning: 'CleaningService',
    hvac: 'HVAC',
    roofing: 'RoofingService',
    moving: 'MovingService',
    photography: 'PhotographyService',
    realtor: 'RealEstateAgent',
    contractor: 'HomeServiceBusiness',
    beauty: 'HealthAndBeautyBusiness',
    salon: 'HealthAndBeautyBusiness',
    spa: 'HealthAndBeautyBusiness',
    restaurant: 'Restaurant',
    cafe: 'Restaurant',
    retail: 'Store',
    fitness: 'HealthAndBeautyBusiness',
    gym: 'HealthAndBeautyBusiness',
  };

  return typeMap[category_lower] || 'LocalBusiness';
}

/**
 * Extract city from location string
 */
function extractCity(location: string): string {
  if (!location) return '';
  
  // Common pattern: "City, State" or "City, State ZIP"
  const parts = location.split(',');
  return parts[0]?.trim() || '';
}

/**
 * Infer state from location
 */
function extractState(location: string): string {
  if (!location) return '';
  
  const parts = location.split(',');
  if (parts.length >= 2) {
    const trimmed = parts[1]?.trim() || '';
    const statePart = trimmed.split(/\s+/)[0] || '';
    return statePart;
  }
  return '';
}

/**
 * Extract postal code from location
 */
function extractPostalCode(location: string): string {
  const match = location.match(/\b\d{5}(-\d{4})?\b/);
  return match ? match[0] : '';
}

/**
 * Generate LocalBusiness schema
 */
export function generateLocalBusinessSchema(business: BusinessUnderstanding) {
  const city = extractCity(business.location);
  const state = extractState(business.location);
  const postalCode = extractPostalCode(business.location);

  return {
    '@context': 'https://schema.org',
    '@type': detectSchemaType(business.category),
    'name': business.name,
    'description': business.valueProposition,
    'telephone': business.phone || '',
    'email': business.email || '',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': business.address || '',
      'addressLocality': city,
      'addressRegion': state,
      'postalCode': postalCode,
      'addressCountry': 'US',
    },
    'areaServed': {
      '@type': 'GeoCircle',
      'geoMidpoint': {
        '@type': 'GeoCoordinates',
        'latitude': 0,  // Would be filled in from geocoding
        'longitude': 0,
      },
      'geoRadius': '25 miles',
    },
    'image': '',  // Would be filled in from Business.imageAssets
    'url': '',    // Would be filled in from Business.publishedUrl
    'priceRange': '$$$',
    'openingHoursSpecification': [],  // Would be filled from Business.hours
    'sameAs': [],  // Social media links
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '5',
      'ratingCount': '0',
      'bestRating': '5',
      'worstRating': '1',
    },
  };
}

/**
 * Generate Service schema
 */
export function generateServiceSchema(business: BusinessUnderstanding) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': business.name,
    'description': business.valueProposition,
    'serviceType': business.category,
    'areaServed': {
      '@type': 'AdministrativeArea',
      'name': business.location,
    },
    'provider': {
      '@type': 'LocalBusiness',
      'name': business.name,
      'telephone': business.phone || '',
      'address': business.address || '',
    },
    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'USD',
      'price': 'Contact for quote',
    },
    'image': '',
  };
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(business: BusinessUnderstanding) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': business.name,
    'description': business.valueProposition,
    'url': '',
    'logo': '',
    'foundingDate': new Date().getFullYear().toString(),
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'Customer Service',
      'telephone': business.phone || '',
      'email': business.email || '',
    },
    'sameAs': [],
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': business.address || '',
      'addressLocality': extractCity(business.location),
      'addressRegion': extractState(business.location),
      'postalCode': extractPostalCode(business.location),
      'addressCountry': 'US',
    },
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(pages: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': pages.map((page, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': page.name,
      'item': page.url,
    })),
  };
}

/**
 * Generate FAQPage schema for common questions
 */
export function generateFAQSchema(business: BusinessUnderstanding) {
  const faqs = generateCommonFAQs(business.category, business.services);

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer,
      },
    })),
  };
}

/**
 * Generate common FAQs based on category
 */
export function generateCommonFAQs(category: string, services: string[]): Array<{ question: string; answer: string }> {
  const categoryLower = category.toLowerCase();

  const faqMap: { [key: string]: Array<{ question: string; answer: string }> } = {
    plumbing: [
      { question: 'How quickly can you respond to an emergency?', answer: 'We offer 24/7 emergency plumbing services with rapid response times. Call us immediately for urgent issues.' },
      { question: 'Do you offer maintenance contracts?', answer: 'Yes, we provide preventative maintenance contracts to keep your plumbing system in top condition.' },
      { question: 'What payment methods do you accept?', answer: 'We accept cash, credit cards, checks, and can arrange financing for larger projects.' },
    ],
    landscaping: [
      { question: 'What services are included in lawn maintenance?', answer: 'Our maintenance includes mowing, edging, trimming, leaf removal, and seasonal cleanup.' },
      { question: 'Do you design custom landscapes?', answer: 'Yes, our design team creates custom landscape plans tailored to your vision and budget.' },
      { question: 'What is the best time to plant in this area?', answer: 'Spring and fall are ideal for most plantings in our region. Consult with us for specific recommendations.' },
    ],
    legal: [
      { question: 'How much does legal representation cost?', answer: 'We offer flexible billing options including hourly rates, flat fees, and contingency arrangements.' },
      { question: 'How long is the legal process?', answer: 'Timeline varies depending on case complexity. We provide honest estimates during your initial consultation.' },
      { question: 'What should I bring to my consultation?', answer: 'Bring any relevant documents, contracts, court papers, and a detailed description of your situation.' },
    ],
  };

  return faqMap[categoryLower] || [
    { question: `What services does ${category} offer?`, answer: `We provide professional ${category} services including: ${services.join(', ')}.` },
    { question: 'How do I get started?', answer: 'Contact us today for a free consultation. We\'ll discuss your needs and provide a detailed estimate.' },
    { question: 'Are you licensed and insured?', answer: 'Yes, we are fully licensed, bonded, and insured to protect your peace of mind.' },
  ];
}

/**
 * Generate complete schema markup for website
 */
export function generateCompleteSchema(business: BusinessUnderstanding & {
  websiteUrl?: string;
  logoUrl?: string;
  socialMediaLinks?: string[];
}): string {
  const schemas = [
    generateLocalBusinessSchema(business),
    generateOrganizationSchema(business),
    generateBreadcrumbSchema([
      { name: 'Home', url: business.websiteUrl || '' },
      { name: business.category, url: `${business.websiteUrl}/services` || '/services' },
    ]),
    generateFAQSchema(business),
  ];

  // Return as JSON-LD script content
  return JSON.stringify(schemas[0], null, 2);
}

/**
 * Inject schema markup into website config
 */
export function injectSchemaIntoConfig(config: any, business: BusinessUnderstanding & {
  websiteUrl?: string;
  logoUrl?: string;
}): any {
  return {
    ...config,
    meta: {
      ...config.meta,
      schemaMarkup: {
        localBusiness: generateLocalBusinessSchema(business),
        organization: generateOrganizationSchema(business),
        faq: generateFAQSchema(business),
        breadcrumb: generateBreadcrumbSchema([
          { name: 'Home', url: business.websiteUrl || '' },
          { name: business.category, url: `${business.websiteUrl}/services` || '/services' },
        ]),
      },
    },
  };
}

/**
 * Format schema markup as HTML script tag
 */
export function formatSchemaAsHTML(business: BusinessUnderstanding): string {
  const schema = generateLocalBusinessSchema(business);

  return `<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>`;
}

/**
 * Generate Review schema markup
 */
export function generateReviewSchema(
  businessName: string,
  reviewText: string,
  authorName: string,
  ratingValue: number = 5,
  reviewDate?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    'reviewRating': {
      '@type': 'Rating',
      'ratingValue': ratingValue.toString(),
      'bestRating': '5',
      'worstRating': '1',
    },
    'author': {
      '@type': 'Person',
      'name': authorName,
    },
    'reviewBody': reviewText,
    'datePublished': reviewDate || new Date().toISOString().split('T')[0],
    'itemReviewed': {
      '@type': 'LocalBusiness',
      'name': businessName,
    },
  };
}

/**
 * Generate aggregate rating from multiple reviews
 */
export function generateAggregateRatingSchema(
  businessName: string,
  averageRating: number,
  ratingCount: number
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    'ratingValue': averageRating.toFixed(1),
    'ratingCount': ratingCount.toString(),
    'bestRating': '5',
    'worstRating': '1',
    'itemReviewed': {
      '@type': 'LocalBusiness',
      'name': businessName,
    },
  };
}

/**
 * Generate collection of reviews as JSON-LD
 */
export function generateMultipleReviewsSchema(
  businessName: string,
  reviews: Array<{
    text: string;
    author: string;
    rating: number;
    date?: string;
  }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': businessName,
    'review': reviews.map((review) =>
      generateReviewSchema(businessName, review.text, review.author, review.rating, review.date)
    ),
  };
}

/**
 * Generate Product/Service Rating schema
 */
export function generateProductRatingSchema(
  productName: string,
  ratingValue: number = 5,
  ratingCount: number = 1,
  description?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': productName,
    'description': description || `${productName} service`,
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': ratingValue.toFixed(1),
      'ratingCount': ratingCount.toString(),
      'bestRating': '5',
      'worstRating': '1',
    },
  };
}

/**
 * Generate rich snippet for testimonials with ratings
 */
export function generateTestimonialSchema(
  businessName: string,
  testimonials: Array<{
    text: string;
    author: string;
    title?: string;
    rating?: number;
    image?: string;
  }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': businessName,
    'review': testimonials.map((testimonial) => ({
      '@type': 'Review',
      'author': {
        '@type': 'Person',
        'name': testimonial.author,
        'image': testimonial.image,
        'jobTitle': testimonial.title,
      },
      'reviewBody': testimonial.text,
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': (testimonial.rating || 5).toString(),
        'bestRating': '5',
        'worstRating': '1',
      },
      'datePublished': new Date().toISOString().split('T')[0],
    })),
  };
}

export default {
  generateLocalBusinessSchema,
  generateServiceSchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateCompleteSchema,
  injectSchemaIntoConfig,
  formatSchemaAsHTML,
  detectSchemaType,
  generateReviewSchema,
  generateAggregateRatingSchema,
  generateMultipleReviewsSchema,
  generateProductRatingSchema,
  generateTestimonialSchema,
};
