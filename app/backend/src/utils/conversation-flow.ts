import type { ConversationMessage } from './conversation-schema.js';
import type { BusinessUnderstandingType } from './conversation-schema.js';

/**
 * Conversation stage tracking - determines what questions to ask next
 */
export type ConversationStage = 
  | 'business_name'
  | 'category'
  | 'location'
  | 'website_or_instagram'
  | 'services'
  | 'value_proposition'
  | 'contact_preferences'
  | 'summary';

/**
 * Get current stage based on extracted data
 */
export function getCurrentStage(extracted: Partial<BusinessUnderstandingType> | undefined): ConversationStage {
  if (!extracted) return 'business_name';
  if (!extracted.name) return 'business_name';
  if (!extracted.category) return 'category';
  if (!extracted.location) return 'location';
  if (typeof extracted.sourceUrl === 'undefined') return 'website_or_instagram';
  if (!extracted.services || extracted.services.length === 0) return 'services';
  if (!extracted.valueProposition) return 'value_proposition';
  if (!extracted.contactPreferences) return 'contact_preferences';
  return 'summary';
}

/**
 * Generate next assistant question based on conversation stage
 */
export function generateNextQuestion(stage: ConversationStage): string {
  const questions: Record<ConversationStage, string> = {
    business_name: `Hi, I'm APE. What is your business name?`,
    
    category: `Great! I've got your business name. Now, what category best describes your business? (e.g., "Consulting", "E-commerce", "SaaS", "Personal Services", etc.)`,
    
    location: `Got it! Where is your business located? (City, State or Country)`,

    website_or_instagram: `Optional: share your website URL or Instagram profile URL so I can learn your brand faster. Reply "none" or "no" to skip.`,
    
    services: `Perfect! What services or products do you offer? Please list them separated by commas. (e.g., "Web Design, Consulting, Maintenance")`,
    
    value_proposition: `Excellent! What's your unique value proposition? In other words, what makes your business different or better than competitors? (At least 10 words)`,
    
    contact_preferences: `Almost done! How should customers contact you? Reply with any of: email, phone, booking.`,
    
    summary: `Your onboarding is complete!`,
  };

  return questions[stage];
}

/**
 * Extract structured data from user message based on current stage
 */
export function extractDataFromMessage(
  userMessage: string,
  stage: ConversationStage,
  currentData: Partial<BusinessUnderstandingType>
): Partial<BusinessUnderstandingType> {
  const updated = { ...currentData };
  const trimmed = userMessage.trim();

  switch (stage) {
    case 'business_name':
      updated.name = trimmed;
      break;

    case 'category':
      updated.category = trimmed;
      break;

    case 'location':
      updated.location = trimmed;
      break;

    case 'website_or_instagram': {
      const normalized = trimmed.toLowerCase();
      if (normalized === 'none' || normalized === 'no' || normalized === 'n/a' || normalized === 'na') {
        updated.sourceUrl = 'none';
      } else {
        updated.sourceUrl = trimmed;
      }
      break;
    }

    case 'services':
      updated.services = trimmed
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      break;

    case 'value_proposition':
      updated.valueProposition = trimmed;
      break;

    case 'contact_preferences': {
      const msg = trimmed.toLowerCase();
      updated.contactPreferences = {
        email: msg.includes('email'),
        phone: msg.includes('phone'),
        booking: msg.includes('booking'),
      };
      break;
    }

    default:
      break;
  }

  return updated;
}

/**
 * Validate if enough data has been collected for current stage
 */
export function isStageDataValid(
  stage: ConversationStage,
  data: Partial<BusinessUnderstandingType>
): { valid: boolean; message?: string } {
  switch (stage) {
    case 'business_name':
      if (!data.name || data.name.trim().length === 0) {
        return { valid: false, message: 'Please provide a business name' };
      }
      break;

    case 'category':
      if (!data.category || data.category.trim().length === 0) {
        return { valid: false, message: 'Please provide a business category' };
      }
      break;

    case 'location':
      if (!data.location || data.location.trim().length === 0) {
        return { valid: false, message: 'Please provide a location' };
      }
      break;

    case 'website_or_instagram': {
      const val = String(data.sourceUrl || '').trim();
      if (!val) return { valid: false, message: 'Share a URL or reply "none" to skip' };
      const lowered = val.toLowerCase();
      if (['none', 'no', 'n/a', 'na'].includes(lowered)) {
        return { valid: true };
      }
      const looksLikeUrl =
        /^https?:\/\//i.test(val) ||
        /instagram\.com\/[A-Za-z0-9_.-]+\/?$/i.test(val) ||
        /^[a-z0-9.-]+\.[a-z]{2,}([\/?#].*)?$/i.test(val);
      if (!looksLikeUrl) {
        return { valid: false, message: 'Please enter a valid website/Instagram URL or reply "none"' };
      }
      break;
    }

    case 'services':
      if (!data.services || data.services.length === 0) {
        return { valid: false, message: 'Please provide at least one service' };
      }
      break;

    case 'value_proposition':
      if (!data.valueProposition || data.valueProposition.trim().length < 10) {
        return { valid: false, message: 'Value proposition must be at least 10 characters' };
      }
      break;

    case 'contact_preferences':
      if (!data.contactPreferences) {
        return { valid: false, message: 'Please select at least one contact preference' };
      }
      if (!data.contactPreferences.email && !data.contactPreferences.phone && !data.contactPreferences.booking) {
        return { valid: false, message: 'Please choose at least one: email, phone, booking' };
      }
      break;

    default:
      break;
  }

  return { valid: true };
}

/**
 * Generate a summary message showing what was collected
 */
export function generateSummaryMessage(data: Partial<BusinessUnderstandingType>): string {
  const lines: string[] = [];

  lines.push('Business Profile Summary');
  
  if (data.name) lines.push(`Business Name: ${data.name}`);
  if (data.category) lines.push(`Category: ${data.category}`);
  if (data.location) lines.push(`Location: ${data.location}`);
  if (data.sourceUrl && data.sourceUrl !== 'none') lines.push(`Source URL: ${data.sourceUrl}`);
  if (data.services && data.services.length > 0) {
    lines.push(`Services: ${data.services.join(', ')}`);
  }
  if (data.valueProposition) lines.push(`Value Proposition: ${data.valueProposition}`);
  if (data.targetAudience) lines.push(`Target Audience: ${data.targetAudience}`);
  if (data.brandTone) lines.push(`Brand Tone: ${data.brandTone}`);
  if (data.brandColors && data.brandColors.length > 0) {
    lines.push(`Brand Colors: ${data.brandColors.join(', ')}`);
  }
  if (data.trustSignals && data.trustSignals.length > 0) {
    lines.push(`Trust Signals: ${data.trustSignals.join(', ')}`);
  }
  if (data.seoKeywords && data.seoKeywords.length > 0) {
    lines.push(`SEO Keywords: ${data.seoKeywords.slice(0, 5).join(', ')}${data.seoKeywords.length > 5 ? ', ...' : ''}`);
  }

  lines.push('');
  lines.push('Everything looks good. Ready to create your website?');

  return lines.join('\n');
}
