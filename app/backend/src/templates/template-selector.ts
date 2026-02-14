/**
 * Template Selection Logic
 * Automatically selects the best template based on business characteristics
 */

import type {
  WebsiteTemplate,
  TemplateSelectionCriteria,
  TemplateSelectionResult,
} from './website-template.types.js';
import {
  allTemplates,
  imageHeavyTemplate,
  serviceHeavyTemplate,
  luxuryTemplate,
} from './templates.js';

/**
 * Normalize a string for matching (lowercase, trim, remove special chars)
 */
function normalize(str: string): string {
  return str.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

/**
 * Check if a category matches any of the template's target categories
 */
function categoryMatchScore(category: string, template: WebsiteTemplate): number {
  const normalizedCategory = normalize(category);

  // Direct match
  for (const cat of template.categories) {
    if (normalize(cat) === normalizedCategory) {
      return 100;
    }
  }

  // Partial match (category contains template category or vice versa)
  for (const cat of template.categories) {
    const normalizedCat = normalize(cat);
    if (normalizedCategory.includes(normalizedCat) || normalizedCat.includes(normalizedCategory)) {
      return 70;
    }
  }

  // Keyword-based matching
  const categoryWords = normalizedCategory.split(/\s+/);
  for (const word of categoryWords) {
    if (word.length < 3) continue;
    for (const cat of template.categories) {
      if (normalize(cat).includes(word)) {
        return 50;
      }
    }
  }

  return 0;
}

/**
 * Check if a brand tone matches the template
 */
function toneMatchScore(tone: string, template: WebsiteTemplate): number {
  const normalizedTone = normalize(tone);

  for (const t of template.tones) {
    if (normalize(t) === normalizedTone) {
      return 100;
    }
  }

  // Partial tone matching
  if (normalizedTone.includes('luxur') || normalizedTone.includes('premium') || normalizedTone.includes('elegant')) {
    if (template.id === 'luxury') return 80;
  }

  if (normalizedTone.includes('professional') || normalizedTone.includes('corporate') || normalizedTone.includes('formal')) {
    if (template.id === 'service-heavy') return 80;
  }

  if (normalizedTone.includes('creative') || normalizedTone.includes('bold') || normalizedTone.includes('fun') || normalizedTone.includes('casual')) {
    if (template.id === 'image-heavy') return 80;
  }

  return 0;
}

/**
 * Select the best template based on business criteria
 */
export function selectTemplate(
  category: string,
  brandTone: string,
  services?: string[],
  hasImages?: boolean
): TemplateSelectionResult {
  let bestTemplate: WebsiteTemplate = serviceHeavyTemplate;
  let bestScore = 0;
  let bestReason = 'Default template for general businesses';

  for (const template of allTemplates) {
    let score = 0;
    const reasons: string[] = [];

    // Category matching (40% weight)
    const catScore = categoryMatchScore(category, template);
    if (catScore > 0) {
      score += catScore * 0.4;
      reasons.push(`category match (${catScore}%)`);
    }

    // Tone matching (35% weight)
    const toneScore = toneMatchScore(brandTone, template);
    if (toneScore > 0) {
      score += toneScore * 0.35;
      reasons.push(`tone match (${toneScore}%)`);
    }

    // Services-based scoring (15% weight)
    if (services && services.length > 0) {
      // More services = favor service-heavy template
      if (services.length >= 5 && template.id === 'service-heavy') {
        score += 15;
        reasons.push('many services');
      } else if (services.length <= 2 && template.id === 'image-heavy') {
        score += 10;
        reasons.push('few services, visual focus');
      }
    }

    // Image availability scoring (10% weight)
    if (hasImages !== undefined) {
      if (hasImages && template.id === 'image-heavy') {
        score += 10;
        reasons.push('has images');
      } else if (!hasImages && template.id === 'service-heavy') {
        score += 10;
        reasons.push('no images, text focus');
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestTemplate = template;
      bestReason = reasons.length > 0 ? `Selected based on: ${reasons.join(', ')}` : 'Best overall match';
    }
  }

  // Fallback logic for luxury tone
  if (bestScore < 30 && normalize(brandTone) === 'luxury') {
    return {
      template: luxuryTemplate,
      confidence: 70,
      reason: 'Luxury brand tone detected',
    };
  }

  // Fallback logic for professional/corporate categories
  if (bestScore < 30) {
    const professionalKeywords = ['consult', 'legal', 'account', 'finance', 'medical', 'health', 'law'];
    const normalizedCat = normalize(category);
    for (const keyword of professionalKeywords) {
      if (normalizedCat.includes(keyword)) {
        return {
          template: serviceHeavyTemplate,
          confidence: 60,
          reason: 'Professional service industry detected',
        };
      }
    }

    // Fallback for creative/visual categories
    const visualKeywords = ['photo', 'design', 'art', 'food', 'restaurant', 'fashion', 'beauty'];
    for (const keyword of visualKeywords) {
      if (normalizedCat.includes(keyword)) {
        return {
          template: imageHeavyTemplate,
          confidence: 60,
          reason: 'Visual-focused industry detected',
        };
      }
    }
  }

  return {
    template: bestTemplate,
    confidence: Math.min(100, Math.round(bestScore)),
    reason: bestReason,
  };
}

/**
 * Get template recommendation with multiple options
 */
export function getTemplateRecommendations(
  criteria: TemplateSelectionCriteria
): { recommended: TemplateSelectionResult; alternatives: TemplateSelectionResult[] } {
  const results: TemplateSelectionResult[] = [];

  for (const template of allTemplates) {
    const catScore = categoryMatchScore(criteria.category, template);
    const toneScore = toneMatchScore(criteria.brandTone, template);
    const totalScore = catScore * 0.5 + toneScore * 0.5;

    results.push({
      template,
      confidence: Math.min(100, Math.round(totalScore)),
      reason: `Category: ${catScore}%, Tone: ${toneScore}%`,
    });
  }

  // Sort by confidence
  results.sort((a, b) => b.confidence - a.confidence);

  return {
    recommended: results[0],
    alternatives: results.slice(1),
  };
}
