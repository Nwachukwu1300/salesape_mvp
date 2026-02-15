/**
 * Website Config Generator
 * Generates a complete WebsiteConfig from BusinessUnderstanding and template selection
 */

import type {
  WebsiteConfig,
  WebsiteConfigGenerationInput,
  ServiceItem,
  TestimonialItem,
  GalleryConfig,
  PricingTableConfig,
} from './website-config.types.js';
import { getTemplateById } from '../templates/templates.js';

/**
 * Generate a compelling headline from business data
 */
function generateHeadline(name: string, services: string[], valueProposition: string): string {
  if (valueProposition && valueProposition.length > 10 && valueProposition.length < 100) {
    return valueProposition;
  }

  if (services.length > 0) {
    const primaryService = services[0];
    return `Professional ${primaryService} Services You Can Trust`;
  }

  return `Welcome to ${name}`;
}

/**
 * Generate a subheadline from business data
 */
function generateSubheadline(
  targetAudience: string,
  services: string[],
  location: string
): string {
  const parts: string[] = [];

  if (targetAudience) {
    parts.push(`Helping ${targetAudience}`);
  }

  if (services.length > 0) {
    const serviceList = services.slice(0, 3).join(', ');
    parts.push(`with ${serviceList}`);
  }

  if (location) {
    parts.push(`in ${location}`);
  }

  if (parts.length === 0) {
    return 'Quality services tailored to your needs';
  }

  return parts.join(' ');
}

/**
 * Generate CTA text based on contact preferences
 */
function generateCtaText(contactPreferences: { email: boolean; phone: boolean; booking: boolean }): string {
  if (contactPreferences.booking) {
    return 'Book Now';
  }
  if (contactPreferences.phone) {
    return 'Call Us Today';
  }
  if (contactPreferences.email) {
    return 'Get in Touch';
  }
  return 'Learn More';
}

/**
 * Generate service items with descriptions and images
 */
function generateServiceItems(
  services: string[],
  brandTone: string,
  galleryImages?: string[]
): ServiceItem[] {
  const toneDescriptions: Record<string, (service: string) => string> = {
    professional: (s) => `Our expert team delivers exceptional ${s.toLowerCase()} with precision and reliability.`,
    friendly: (s) => `We love providing ${s.toLowerCase()} that makes a real difference in your life!`,
    luxury: (s) => `Experience the finest ${s.toLowerCase()} crafted with unparalleled attention to detail.`,
    bold: (s) => `Revolutionary ${s.toLowerCase()} that sets us apart from the competition.`,
    casual: (s) => `Great ${s.toLowerCase()} without the hassle. Simple as that.`,
  };

  const descriptionGenerator = toneDescriptions[brandTone] || toneDescriptions.professional;

  return services.map((service, index) => ({
    name: service,
    description: descriptionGenerator(service),
    // Assign gallery images to services, cycling through available images
    image: galleryImages && galleryImages.length > 0
      ? galleryImages[index % galleryImages.length]
      : undefined,
  }));
}

/**
 * Generate about section content
 */
function generateAboutContent(
  name: string,
  valueProposition: string,
  targetAudience: string,
  trustSignals: string[],
  brandTone: string
): string {
  const intro = valueProposition || `${name} is dedicated to providing exceptional services.`;

  let content = intro;

  if (targetAudience) {
    content += ` We specialize in serving ${targetAudience}, understanding their unique needs and delivering solutions that exceed expectations.`;
  }

  if (trustSignals.length > 0) {
    const signalsText = trustSignals.slice(0, 3).join(', ');
    content += ` Our commitment to excellence is demonstrated through ${signalsText}.`;
  }

  // Add tone-specific closing
  const closings: Record<string, string> = {
    professional: ' Contact us today to discuss how we can assist you.',
    friendly: ' We can\'t wait to work with you!',
    luxury: ' Experience the difference of premium service.',
    bold: ' Ready to transform your experience? Let\'s talk.',
    casual: ' Drop us a line anytime!',
  };

  content += closings[brandTone] || closings.professional;

  return content;
}

/**
 * Generate placeholder testimonials if none provided
 */
function generatePlaceholderTestimonials(name: string, services: string[]): TestimonialItem[] {
  const service = services[0] || 'service';

  return [
    {
      name: 'Happy Customer',
      title: 'Valued Client',
      content: `${name} provided excellent ${service}. Highly recommended!`,
      rating: 5,
    },
    {
      name: 'Satisfied Client',
      title: 'Repeat Customer',
      content: `Professional, reliable, and great results. Will definitely use ${name} again.`,
      rating: 5,
    },
    {
      name: 'Local Business Owner',
      title: 'Partner',
      content: `Working with ${name} has been a pleasure. Their attention to detail is outstanding.`,
      rating: 5,
    },
  ];
}

/**
 * Generate meta description for SEO
 */
function generateMetaDescription(
  name: string,
  services: string[],
  location: string,
  targetAudience: string
): string {
  const serviceList = services.slice(0, 3).join(', ');
  let description = `${name} offers ${serviceList || 'professional services'}`;

  if (location) {
    description += ` in ${location}`;
  }

  if (targetAudience) {
    description += ` for ${targetAudience}`;
  }

  description += '. Contact us today!';

  // Ensure description is not too long (max 160 chars for SEO)
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  }

  return description;
}

/**
 * Generate local SEO keywords
 */
function generateLocalSEOKeywords(
  location: string,
  services: string[],
  category: string
): string[] {
  const keywords: string[] = [];

  // Add location-based keywords
  if (location) {
    keywords.push(`${category} in ${location}`);
    keywords.push(`${location} ${category}`);

    for (const service of services.slice(0, 3)) {
      keywords.push(`${service} ${location}`);
      keywords.push(`${service} near me`);
    }
  }

  // Add service-based keywords
  for (const service of services.slice(0, 5)) {
    keywords.push(`best ${service}`);
    keywords.push(`professional ${service}`);
  }

  return keywords;
}

/**
 * Get default hero image based on category
 */
function getDefaultHeroImage(category: string): string {
  const categoryImages: Record<string, string> = {
    restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    photography: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d',
    fitness: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
    spa: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef',
    consulting: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
    legal: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f',
    medical: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d',
    construction: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd',
    beauty: 'https://images.unsplash.com/photo-1560066984-138dadb4c035',
    technology: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
  };

  const normalizedCategory = category.toLowerCase();

  for (const [key, url] of Object.entries(categoryImages)) {
    if (normalizedCategory.includes(key)) {
      return url;
    }
  }

  // Default professional image
  return 'https://images.unsplash.com/photo-1497366216548-37526070297c';
}

/**
 * Main function to generate website config
 */
export async function generateWebsiteConfig(
  input: WebsiteConfigGenerationInput
): Promise<WebsiteConfig> {
  const { businessUnderstanding, templateId, scrapedData } = input;
  const template = getTemplateById(templateId);

  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  const {
    name,
    category,
    location,
    services,
    valueProposition,
    targetAudience,
    brandTone,
    brandColors,
    trustSignals,
    seoKeywords,
    contactPreferences,
    desiredFeatures = [],
    logoUrl,
    imageAssets,
  } = businessUnderstanding;

  // Helper to check if a feature is enabled
  const hasFeature = (feature: string) =>
    desiredFeatures.some(f => f.toLowerCase().includes(feature.toLowerCase()));

  // Determine hero image
  let heroImage = imageAssets?.hero || scrapedData?.images?.[0] || getDefaultHeroImage(category);

  // Generate the config
  const config: WebsiteConfig = {
    meta: {
      title: `${name} | ${category} Services${location ? ` in ${location}` : ''}`,
      description: generateMetaDescription(name, services, location, targetAudience),
      keywords: seoKeywords,
      ogImage: heroImage,
    },
    branding: {
      colors: brandColors.length > 0 ? brandColors : ['#3B82F6', '#1E40AF'],
      tone: brandTone,
      logoUrl,
      fontFamily: template.layout.typography === 'luxury' ? 'Playfair Display' :
                  template.layout.typography === 'modern' ? 'Inter' : 'Georgia',
    },
    hero: {
      headline: generateHeadline(name, services, valueProposition),
      subheadline: generateSubheadline(targetAudience, services, location),
      ctaText: generateCtaText(contactPreferences),
      ctaLink: contactPreferences.booking ? '#booking' : '#contact',
      heroImage,
      overlayOpacity: template.layout.heroStyle === 'image-full' ? 0.4 : 0,
    },
    services: {
      title: 'Our Services',
      subtitle: `What ${name} Can Do For You`,
      items: generateServiceItems(services, brandTone, imageAssets?.gallery),
    },
    about: {
      title: `About ${name}`,
      content: generateAboutContent(name, valueProposition, targetAudience, trustSignals, brandTone),
      image: imageAssets?.gallery?.[0] || scrapedData?.images?.[1],
      highlights: trustSignals.slice(0, 4),
    },
    // Testimonials - only if feature selected
    testimonials: hasFeature('testimonial') ? {
      title: 'What Our Clients Say',
      subtitle: 'Real feedback from real customers',
      items: generatePlaceholderTestimonials(name, services),
    } : undefined,
    // Contact form - only if feature selected
    contact: hasFeature('contact') ? {
      title: 'Get In Touch',
      subtitle: 'We\'d love to hear from you',
      email: scrapedData?.email,
      phone: scrapedData?.phone,
      address: location,
      formFields: ['name', 'email', 'phone', 'message'],
      showMap: !!location,
    } : undefined,
    // Booking - only if feature selected
    booking: (hasFeature('booking') || contactPreferences.booking) ? {
      title: 'Book an Appointment',
      subtitle: 'Choose a time that works for you',
      provider: 'internal',
      availableSlots: true,
    } : undefined,
    // Gallery - only if feature selected
    gallery: hasFeature('gallery') ? {
      title: 'Our Work',
      subtitle: 'See what we\'ve accomplished',
      images: (imageAssets?.gallery || []).map((url, i) => ({
        url,
        title: `Project ${i + 1}`,
      })),
    } : undefined,
    // Pricing table - only if feature selected
    pricingTable: hasFeature('pricing') ? {
      title: 'Our Pricing',
      subtitle: 'Transparent pricing for all services',
      items: services.slice(0, 4).map(service => ({
        name: service,
        price: 'Contact for quote',
        description: `Professional ${service.toLowerCase()} services`,
      })),
    } : undefined,
    localSEO: {
      location,
      keywords: generateLocalSEOKeywords(location, services, category),
      businessHours: 'Mon-Fri: 9am-5pm',
    },
    trustSignals: {
      items: trustSignals,
      badges: [],
      certifications: [],
    },
    footer: {
      copyrightText: `© ${new Date().getFullYear()} ${name}. All rights reserved.`,
      quickLinks: [
        { label: 'Services', anchor: '#services' },
        { label: 'About', anchor: '#about' },
        { label: 'Contact', anchor: '#contact' },
      ],
    },
    templateId,
    generatedAt: new Date().toISOString(),
  };

  return config;
}

export default generateWebsiteConfig;
