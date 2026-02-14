/**
 * AI Business Intelligence Generator
 * Extracts business profile, generates marketing copy, lead questions, SEO keywords
 */

import type { BusinessUnderstanding } from '../types/index.js';
import { validateBusinessUnderstanding } from './business-validation.js';

interface ScrapedData {
  title?: string;
  description?: string;
  email?: string;
  phone?: string;
  images?: string[];
  socialLinks?: string[];
}

interface BusinessIntelligence {
  businessName?: string;
  services?: string[];
  industryCategory?: string;
  targetAudience?: string;
  uniqueValue?: string;
  marketingCopy?: string;
  heroHeadline?: string;
  seoKeywords?: string[];
  leadQualificationQuestions?: string[];
  brandColors?: string[];
  tone?: string;
}

/**
 * Generate structured BusinessUnderstanding JSON from scraped data
 * Returns valid BusinessUnderstanding object with all required fields
 */
export function generateStructuredBusinessUnderstanding(
  scraped: ScrapedData,
  conversationalInput?: string
): BusinessUnderstanding {
  try {
    // Extract basic info from scraped data
    const businessName = scraped.title || 'Business';
    const description = scraped.description || conversationalInput || '';

    // Generate all required fields deterministically
    const category = detectIndustry(description, businessName);
    const location = extractLocation(description) || 'Local Service Area';
    const services = extractServices(description, businessName);
    const brandTone = detectBrandTone(description);
    const seoKeywords = generateSEOKeywords(businessName, description);
    const targetAudience = generateTargetAudience(description);
    const valueProposition = extractUniqueValue(description);
    const trustSignals = generateTrustSignals(businessName, description);
    const brandColors = extractBrandColors();

    // Build strictly typed BusinessUnderstanding object
    const businessUnderstanding: BusinessUnderstanding = {
      name: businessName,
      category,
      location,
      services,
      valueProposition,
      targetAudience,
      brandTone,
      brandColors,
      trustSignals,
      seoKeywords,
      contactPreferences: {
        email: !!scraped.email,
        phone: !!scraped.phone,
        booking: true, // Default to true for better conversion
      },
      ...(scraped.images?.[0] ? {
        logoUrl: scraped.images[0],
        imageAssets: {
          hero: scraped.images[0],
          gallery: scraped.images.slice(0, 5),
        },
      } : {}),
    };

    return businessUnderstanding;
  } catch (err) {
    console.error('[Business Understanding Generation Error]', err);
    // Return minimum valid object on error
    return {
      name: 'Business',
      category: 'Services',
      location: 'Local',
      services: ['Services'],
      valueProposition: 'Quality service delivered professionally',
      targetAudience: 'Businesses and individuals',
      brandTone: 'professional',
      brandColors: ['#3B82F6', '#10B981'],
      trustSignals: ['Professional', 'Reliable'],
      seoKeywords: ['service', 'professional', 'quality'],
      contactPreferences: {
        email: true,
        phone: true,
        booking: true,
      },
    };
  }
}

/**
 * Analyze scraped business data and generate AI intelligence
 * NOTE: This is the legacy function, use generateStructuredBusinessUnderstanding instead
 */
export async function generateBusinessIntelligence(
  scraped: ScrapedData,
  conversationalInput?: string
): Promise<BusinessUnderstanding> {
  // Use the new structured generator
  return generateStructuredBusinessUnderstanding(scraped, conversationalInput);
}

/**
 * Extract service offerings from description
 */
function extractServices(description: string, name: string): string[] {
  const services: string[] = [];
  const keywords = {
    design: ['design', 'ui', 'ux', 'branding', 'logo', 'visual'],
    development: ['development', 'coding', 'programming', 'software', 'app', 'web'],
    marketing: ['marketing', 'seo', 'advertising', 'social', 'content'],
    consulting: ['consulting', 'advisory', 'strategy', 'business'],
    services: ['services', 'repair', 'maintenance', 'cleaning', 'installation'],
    landscaping: ['garden', 'landscaping', 'landscape', 'outdoor', 'plants'],
    photography: ['photography', 'photo', 'portrait', 'wedding', 'event'],
  };

  const lowerDesc = (description + ' ' + name).toLowerCase();

  Object.entries(keywords).forEach(([service, keywordList]) => {
    if (keywordList.some(kw => lowerDesc.includes(kw))) {
      services.push(service.charAt(0).toUpperCase() + service.slice(1));
    }
  });

  return services.length > 0 ? services : ['Services'];
}

/**
 * Detect industry category
 */
function detectIndustry(description: string, name: string): string {
  const text = (description + ' ' + name).toLowerCase();

  if (text.match(/landscape|garden|plant|outdoor/)) return 'Landscaping';
  if (text.match(/photo|event|wedding|portrait/)) return 'Photography';
  if (text.match(/design|graphic|ui|ux|branding/)) return 'Design';
  if (text.match(/develop|code|software|web/)) return 'Software Development';
  if (text.match(/consult|advise|strategy/)) return 'Consulting';
  if (text.match(/market|advertis|social|content/)) return 'Marketing';
  if (text.match(/teach|train|course|education/)) return 'Education';
  if (text.match(/retail|shop|store|ecommerce/)) return 'Retail';

  return 'Services';
}

/**
 * Extract location from description
 */
function extractLocation(description: string): string {
  const text = description.toLowerCase();
  
  // Look for city/state patterns or location indicators
  const locationPatterns = [
    /(?:in|based in|located in|serving|available in)\s+([A-Za-z\s]+?)(?:\.|,|$)/i,
    /([A-Z][A-Za-z]+),\s*([A-Z]{2})/,
  ];

  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }

  return '';
}

/**
 * Generate trust signals / social proof
 */
function generateTrustSignals(name: string, description: string): string[] {
  const signals: string[] = [];
  const text = description.toLowerCase();

  // Check for quality indicators
  if (text.includes('award') || text.includes('certified')) {
    signals.push('Industry certified and award-winning');
  }
  if (text.includes('year') || text.includes('since')) {
    signals.push('Established business with proven track record');
  }
  if (text.includes('client') || text.includes('customer')) {
    signals.push('Hundreds of satisfied clients');
  }
  if (text.includes('expert') || text.includes('professional')) {
    signals.push('Expert team of professionals');
  }
  if (text.includes('guarantee') || text.includes('money back')) {
    signals.push('100% satisfaction guarantee');
  }
  
  // Default signals
  if (signals.length === 0) {
    signals.push('Professional service delivered');
    signals.push('Customer-focused approach');
    signals.push('Quality guaranteed');
  }

  return signals.slice(0, 5); // Max 5 trust signals
}

/**
 * Detect brand tone matching BusinessUnderstanding requirements
 */
function detectBrandTone(description: string): 'professional' | 'friendly' | 'luxury' | 'bold' | 'casual' {
  const text = description.toLowerCase();

  if (text.includes('luxury') || text.includes('premium') || text.includes('exclusive')) {
    return 'luxury';
  }
  if (text.includes('bold') || text.includes('aggressive') || text.includes('innovative')) {
    return 'bold';
  }
  if (text.includes('casual') || text.includes('fun') || text.includes('relaxed')) {
    return 'casual';
  }
  if (text.includes('friendly') || text.includes('approachable') || text.includes('warm')) {
    return 'friendly';
  }
  
  // Default to professional
  return 'professional';
}

/**
 * Generate target audience description
 */
function generateTargetAudience(description: string): string {
  const text = description.toLowerCase();

  if (text.includes('local')) return 'Local businesses and homeowners';
  if (text.includes('b2b')) return 'Other businesses';
  if (text.includes('b2c')) return 'Individual consumers';
  if (text.includes('startup')) return 'Startups and entrepreneurs';
  if (text.includes('enterprise')) return 'Large organizations';

  return 'Businesses and entrepreneurs';
}

/**
 * Extract unique value proposition
 */
function extractUniqueValue(description: string): string {
  if (!description || description.length < 10) {
    return 'Professional services delivered with attention to detail';
  }

  // Take first meaningful sentence
  const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 20);
  return sentences[0]?.trim() || 'Quality service you can trust';
}

/**
 * Generate marketing copy
 */
function generateMarketingCopy(name: string, description: string): string {
  const industry = detectIndustry(description, name);
  const services = extractServices(description, name);

  const copies = {
    Landscaping: `Transform your outdoor space with ${name}'s professional landscaping services. We design and maintain beautiful gardens that enhance your property.`,
    Photography: `Capture your most precious moments with ${name}. Professional photography for weddings, events, and portraits.`,
    Design: `Elevate your brand with ${name}'s creative design solutions. From logos to complete visual identities.`,
    'Software Development': `${name} builds custom software solutions for modern businesses. Fast, reliable, and scalable.`,
    Consulting: `Strategic guidance for your business growth. ${name} provides expert consulting tailored to your needs.`,
    Marketing: `Grow your business with ${name}'s proven marketing strategies. Increase leads, sales, and customer loyalty.`,
  };

  return (
    copies[industry as keyof typeof copies] ||
    `Experience professional ${services.join(' and ')} from ${name}. Quality service, guaranteed results.`
  );
}

/**
 * Generate hero headline for website
 */
function generateHeroHeadline(name: string, description: string): string {
  const industry = detectIndustry(description, name);
  const headlines = {
    Landscaping: 'Beautiful Gardens, Expertly Designed',
    Photography: 'Moments Captured, Memories Preserved',
    Design: 'Design That Tells Your Story',
    'Software Development': 'Technology Built for Your Success',
    Consulting: 'Strategic Growth, Proven Results',
    Marketing: 'Grow Your Business Online',
  };

  return (
    headlines[industry as keyof typeof headlines] ||
    `Professional ${industry} from ${name}`
  );
}

/**
 * Generate SEO keywords (minimum 5, maximum 20)
 */
function generateSEOKeywords(name: string, description: string): string[] {
  const industry = detectIndustry(description, name);
  const keywords: string[] = [];

  const industryKeywords: Record<string, string[]> = {
    Landscaping: ['landscaping', 'garden design', 'lawn care', 'outdoor design', 'landscape maintenance'],
    Photography: ['photography', 'photographer', 'photo services', 'event photography', 'professional photos'],
    Design: ['graphic design', 'web design', 'branding', 'ui design', 'visual design'],
    'Software Development': ['web development', 'software development', 'app development', 'coding', 'custom software'],
    Consulting: ['consulting', 'business consulting', 'strategy', 'advisory', 'strategic planning'],
    Marketing: ['digital marketing', 'social media marketing', 'seo services', 'marketing', 'online marketing'],
  };

  // Add business name
  if (name && name.length > 0) {
    keywords.push(name);
  }

  // Add industry-specific keywords
  const kw = industryKeywords[industry] || industryKeywords['Services'] || ['service', 'professional', 'quality'];
  keywords.push(...kw);
  
  // Add generic keywords as fallback
  keywords.push('local services', 'professional services', industry.toLowerCase());

  // Remove duplicates and ensure minimum 5 keywords
  const uniqueKeywords = Array.from(new Set(keywords.filter((k, idx) => k && keywords.indexOf(k) === idx)));
  
  // Ensure we have at least 5 keywords
  if (uniqueKeywords.length < 5) {
    uniqueKeywords.push('service', 'professional', 'quality', 'trusted', 'experienced');
  }

  // Return up to 20 keywords
  return uniqueKeywords.slice(0, 20);
}

/**
 * Generate lead qualification questions
 */
function generateLeadQuestions(description: string): string[] {
  const industry = detectIndustry(description, description);

  const questions = {
    Landscaping: [
      'What is the size of your garden or outdoor space?',
      'When would you like to start?',
    ],
    Photography: [
      'What type of event is this for?',
      'How many hours of coverage do you need?',
      'What is your preferred photography style?',
    ],
    Design: [
      'What is the scope of your design project?',
      'What is your brand vision?',
      'When do you need the designs completed?',
    ],
    'Software Development': [
      'What problem does your software need to solve?',
      'What is your timeline?',
      'What features are essential?',
    ],
    Consulting: [
      'What are your main business challenges?',
      'What is your growth target?',
      'What is your timeline?',
    ],
    Marketing: [
      'What are your marketing goals?',
      'What channels have you tried?',
      'What platforms do you want to focus on?',
    ],
  };

  return (
    questions[industry as keyof typeof questions] || [
      'What are your main needs?',
      'When do you need this completed?',
    ]
  );
}

/**
 * Extract brand colors from description or use defaults
 */
function extractBrandColors(): string[] {
  // In production, could analyze images or ask AI
  // For now, return professional color palette
  return ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
}

/**
 * Detect tone/style of business
 */
function detectTone(description: string): string {
  const text = description.toLowerCase();

  if (text.includes('professional') || text.includes('corporate')) return 'Professional';
  if (text.includes('fun') || text.includes('creative')) return 'Creative';
  if (text.includes('casual') || text.includes('friendly')) return 'Friendly';
  if (text.includes('luxury') || text.includes('premium')) return 'Premium';

  return 'Professional';
}

/**
 * Generate lead score based on engagement and source
 */
export function calculateLeadScore(lead: {
  source?: string;
  messageLength?: number;
  responseTime?: number;
  engagementLevel?: number;
}): number {
  let score = 0;

  // Source scoring
  const sourceScores = {
    instagram: 70,
    web: 80,
    direct: 90,
    referral: 85,
    organic: 75,
  };
  score += sourceScores[lead.source as keyof typeof sourceScores] || 60;

  // Message length scoring (longer = more interested)
  if (lead.messageLength) {
    score += Math.min(20, Math.floor(lead.messageLength / 10));
  }

  // Response time scoring (faster = more interested)
  if (lead.responseTime) {
    if (lead.responseTime < 300) score += 20; // < 5 min
    else if (lead.responseTime < 3600) score += 15; // < 1 hour
    else if (lead.responseTime < 86400) score += 10; // < 1 day
  }

  // Engagement level
  if (lead.engagementLevel) {
    score += Math.min(20, lead.engagementLevel);
  }

  return Math.min(100, score);
}
