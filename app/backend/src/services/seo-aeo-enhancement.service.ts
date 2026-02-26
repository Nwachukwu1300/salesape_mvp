/**
 * SEO & AEO Enhancement Service
 * 
 * Automatically enhances content with:
 * - Structured data (JSON-LD)
 * - Meta tags
 * - AI extract blocks
 * - FAQ sections
 * - Internal linking suggestions
 * 
 * This service is applied automatically to all generated content.
 * No user-facing SEO controls are exposed.
 */

interface EnhancedContent {
  structuredData: any;
  metaTags: MetaTags;
  faqSection: FAQItem[];
  aiExtractBlocks: string[];
  linkSuggestions: string[];
}

interface MetaTags {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  ogTitle: string;
  ogDescription: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Extract key topics from content for SEO optimization
 */
function extractKeyTopics(content: string): string[] {
  // Simple keyword extraction - in production, use NLP
  const words = content.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 4);
  
  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

/**
 * Generate FAQ section from content
 */
function generateFAQSection(content: string, topic: string): FAQItem[] {
  // Template FAQ items based on common patterns
  const faqs: FAQItem[] = [];

  faqs.push({
    question: `What is ${topic}?`,
    answer: content.split('\n')[0] || `Learn about ${topic} and its importance.`,
  });

  faqs.push({
    question: `Why is ${topic} important?`,
    answer: 'It helps improve your online presence and visibility.',
  });

  faqs.push({
    question: `How can I get started with ${topic}?`,
    answer: 'Start by understanding the basics and implementing best practices.',
  });

  return faqs;
}

/**
 * Generate AI extract blocks (key takeaways)
 */
function generateAIExtractBlocks(content: string): string[] {
  const sentences = content
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10)
    .slice(0, 5);

  return sentences.map(s => `✨ ${s}`);
}

/**
 * Generate meta tags for SEO
 */
function generateMetaTags(title: string, content: string, topics: string[]): MetaTags {
  const description = content.substring(0, 155);
  
  return {
    title: `${title} | ${topics[0] || 'SalesAPE'}`,
    description,
    keywords: topics,
    ogImage: 'https://salesape.ai/og-image.jpg',
    ogTitle: title,
    ogDescription: description,
  };
}

/**
 * Generate JSON-LD structured data
 */
function generateStructuredData(
  title: string,
  description: string,
  contentType: string = 'Article'
): any {
  return {
    '@context': 'https://schema.org',
    '@type': contentType,
    headline: title,
    description,
    author: {
      '@type': 'Organization',
      name: 'SalesAPE',
    },
    datePublished: new Date().toISOString(),
    publisher: {
      '@type': 'Organization',
      name: 'SalesAPE',
      logo: {
        '@type': 'ImageObject',
        url: 'https://salesape.ai/logo.png',
      },
    },
  };
}

/**
 * Enhance content with SEO/AEO optimizations
 * Called automatically during content generation
 */
export function enhanceContentWithSeoAeo(
  title: string,
  content: string
): EnhancedContent {
  const topics = extractKeyTopics(content);
  const mainTopic = topics[0] || 'Content';

  return {
    structuredData: generateStructuredData(title, content, 'Article'),
    metaTags: generateMetaTags(title, content, topics),
    faqSection: generateFAQSection(content, mainTopic),
    aiExtractBlocks: generateAIExtractBlocks(content),
    linkSuggestions: topics.slice(1, 4),
  };
}

/**
 * Apply enhancements to reel captions
 */
export function enhanceReelCaption(
  originalCaption: string,
  hook: string,
  platform: 'instagram' | 'tiktok' | 'youtube'
): string {
  // Platform-specific optimizations
  const platformOptimizations: Record<string, string> = {
    instagram: '🎯 ',
    tiktok: '⚡ ',
    youtube: '📹 ',
  };

  const prefix = platformOptimizations[platform];
  
  // Add hook emphasis
  const enhanced = `${prefix}${hook}\n\n${originalCaption}`;

  // Add relevant hashtags/CTAs
  let withCTA = enhanced;
  if (platform === 'tiktok') {
    withCTA += '\n\n💬 Comment your thoughts!';
  } else if (platform === 'instagram') {
    withCTA += '\n\n📱 Follow for more insights';
  }

  return withCTA;
}

export type { EnhancedContent, MetaTags, FAQItem };
