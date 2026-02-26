/**
 * Answer Engine Optimization (AEO) Generator
 * Optimizes generated websites for AI-powered answer engines
 * (Perplexity, Claude, ChatGPT, Google AI Overviews, etc.)
 */

export interface AEOContent {
  title: string;
  description: string;
  keyFacts: string[];
  faqs?: Array<{ question: string; answer: string }>;
  callToAction?: string;
}

/**
 * Generate AEO-optimized FAQ markup with structured data
 */
export function generateAEOFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map((faq) => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.question,
      },
    })),
  };
}

/**
 * Generate Knowledge Panel optimized schema
 */
export function generateKnowledgePanelSchema(
  businessName: string,
  description: string,
  category: string,
  location: string,
  imageUrl?: string,
  socialProfiles?: string[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': businessName,
    'description': description,
    'category': category,
    'location': {
      '@type': 'Place',
      'name': location,
    },
    'image': imageUrl,
    'url': '',
    'sameAs': socialProfiles || [],
    'foundationDate': new Date().getFullYear().toString(),
  };
}

/**
 * Generate Answer Engine optimized content sections
 */
export function generateAEOContentSections(businessData: {
  name: string;
  category: string;
  services: string[];
  location: string;
  valueProposition: string;
  targetAudience: string;
  contactInfo?: { email?: string; phone?: string };
}): Record<string, AEOContent> {
  return {
    overview: {
      title: `About ${businessData.name}`,
      description: businessData.valueProposition,
      keyFacts: [
        `${businessData.name} is a ${businessData.category} service provider`,
        `Located in ${businessData.location}`,
        `Specializes in: ${businessData.services.join(', ')}`,
        `Serves: ${businessData.targetAudience}`,
      ],
    },
    services: {
      title: `Services Offered by ${businessData.name}`,
      description: `${businessData.name} offers the following professional services`,
      keyFacts: businessData.services.map((service) => `• ${service}`),
    },
    location: {
      title: `${businessData.name} - Service Area`,
      description: `${businessData.name} serves customers in ${businessData.location}`,
      keyFacts: [businessData.location],
    },
    contact: {
      title: `How to Contact ${businessData.name}`,
      description: `Get in touch with ${businessData.name} for services`,
      keyFacts: [
        businessData.contactInfo?.phone ? `Phone: ${businessData.contactInfo.phone}` : '',
        businessData.contactInfo?.email ? `Email: ${businessData.contactInfo.email}` : '',
      ].filter((fact) => fact.length > 0),
    },
  };
}

/**
 * Generate structured Q&A for common questions (optimized for answer engines)
 */
export function generateStructuredQA(
  businessName: string,
  category: string,
  services: string[]
): Array<{ question: string; answer: string; confidence: number }> {
  const primaryService = services[0] || category;

  return [
    {
      question: `What is ${businessName}?`,
      answer: `${businessName} is a professional ${category} service provider specializing in ${services.join(', ')}.`,
      confidence: 0.95,
    },
    {
      question: `What services does ${businessName} offer?`,
      answer: `${businessName} offers the following services: ${services.join(', ')}.`,
      confidence: 0.98,
    },
    {
      question: `How can I contact ${businessName}?`,
      answer: `You can contact ${businessName} through their website or by calling their main line.`,
      confidence: 0.9,
    },
    {
      question: `Is ${businessName} licensed and insured?`,
      answer: `${businessName} maintains professional licensing and insurance coverage in their industry.`,
      confidence: 0.85,
    },
    {
      question: `What is the typical cost of ${primaryService} from ${businessName}?`,
      answer: `Pricing varies based on specific project requirements. Contact ${businessName} for a detailed quote.`,
      confidence: 0.8,
    },
    {
      question: `How experienced is ${businessName} in ${primaryService}?`,
      answer: `${businessName} brings professional expertise and proven track record in ${primaryService} services.`,
      confidence: 0.85,
    },
  ];
}

/**
 * Generate snippet optimization for SERPs and answer engines
 */
export function generateSnippetOptimization(
  content: string,
  maxLength: number = 160
): { snippet: string; length: number; optimized: boolean } {
  // Ensure snippet starts with a clear, complete sentence
  let snippet = content.substring(0, maxLength);

  // Find the last complete sentence within the limit
  const lastPeriod = snippet.lastIndexOf('.');
  if (lastPeriod > 0 && lastPeriod > maxLength * 0.7) {
    snippet = snippet.substring(0, lastPeriod + 1);
  }

  return {
    snippet,
    length: snippet.length,
    optimized: snippet.endsWith('.') && snippet.length > 100,
  };
}

/**
 * Generate AEO meta tags for answer engines
 */
export function generateAEOMetaTags(businessName: string, content: string): string {
  const tags = [
    `<meta name="aeo:business-name" content="${escapeHtml(businessName)}" />`,
    `<meta name="aeo:content-type" content="local-business" />`,
    `<meta property="aeo:content-structuredness" content="high" />`,
    `<meta name="aeo:question-answerable" content="true" />`,
  ];

  return tags.join('\n');
}

/**
 * Optimize content for natural language understanding
 */
export function optimizeForNLU(businessData: {
  name: string;
  category: string;
  services: string[];
  targetAudience: string;
  location: string;
}): { optimizedTitle: string; optimizedDescription: string; entities: string[] } {
  // Named Entity Recognition optimization
  const entities = [
    businessData.name,
    businessData.category,
    businessData.location,
    ...businessData.services,
    businessData.targetAudience,
  ].filter((e) => e?.length > 0);

  // Create natural language optimized title
  const optimizedTitle = `${businessData.name} | Professional ${businessData.category} in ${businessData.location}`;

  // Create comprehensive description
  const optimizedDescription = `${businessData.name} provides professional ${businessData.services.join(', ')} services for ${businessData.targetAudience} in ${businessData.location}. Contact us for expert service delivery.`;

  return {
    optimizedTitle: truncate(optimizedTitle, 60),
    optimizedDescription: truncate(optimizedDescription, 160),
    entities,
  };
}

/**
 * Generate Answer Engine specific JSON-LD
 */
export function generateAEOSchema(businessData: {
  name: string;
  category: string;
  description: string;
  services: string[];
  location: string;
  phone?: string;
  email?: string;
  website?: string;
}) {
  return {
    '@context': ['https://schema.org', 'https://aeo.schema.org'],
    '@type': 'LocalBusiness',
    'name': businessData.name,
    'description': businessData.description,
    'businessCategory': businessData.category,
    'availableServices': businessData.services,
    'areaServed': businessData.location,
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': businessData.phone,
      'email': businessData.email,
      'contactType': 'Customer Service',
    },
    'url': businessData.website,
    'answerableTopics': generateStructuredQA(businessData.name, businessData.category, businessData.services).map(
      (qa) => ({
        '@type': 'Question',
        'text': qa.question,
        'confidence': qa.confidence,
      })
    ),
  };
}

/**
 * Generate AEO-friendly headline
 */
export function generateAEOHeadline(businessName: string, primaryService: string, location: string): string {
  return `Professional ${primaryService} in ${location} | ${businessName}`;
}

/**
 * Generate AEO-friendly subheadline
 */
export function generateAEOSubheadline(
  businessName: string,
  targetAudience: string,
  services: string[]
): string {
  const serviceList = services.slice(0, 2).join(' and ');
  return `Expert ${serviceList} for ${targetAudience} - Trusted by Local Community`;
}

/**
 * Helper: Truncate text to max length
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Helper: Escape HTML
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

export default {
  generateAEOFAQSchema,
  generateKnowledgePanelSchema,
  generateAEOContentSections,
  generateStructuredQA,
  generateSnippetOptimization,
  generateAEOMetaTags,
  optimizeForNLU,
  generateAEOSchema,
  generateAEOHeadline,
  generateAEOSubheadline,
};
