import type { ConversationMessage } from './conversation-schema.js';
import type { BusinessUnderstandingType } from './conversation-schema.js';

/**
 * Conversation stage tracking - determines what questions to ask next
 */
export type ConversationStage = 
  | 'greeting'
  | 'business_name'
  | 'category'
  | 'location'
  | 'services'
  | 'value_proposition'
  | 'audience'
  | 'brand_tone'
  | 'colors'
  | 'trust_signals'
  | 'keywords'
  | 'contact_preferences'
  | 'summary';

/**
 * Get current stage based on extracted data
 */
export function getCurrentStage(extracted: Partial<BusinessUnderstandingType> | undefined): ConversationStage {
  if (!extracted) return 'greeting';
  if (!extracted.name) return 'business_name';
  if (!extracted.category) return 'category';
  if (!extracted.location) return 'location';
  if (!extracted.services || extracted.services.length === 0) return 'services';
  if (!extracted.valueProposition) return 'value_proposition';
  if (!extracted.targetAudience) return 'audience';
  if (!extracted.brandTone) return 'brand_tone';
  if (!extracted.brandColors || extracted.brandColors.length === 0) return 'colors';
  if (!extracted.trustSignals || extracted.trustSignals.length === 0) return 'trust_signals';
  if (!extracted.seoKeywords || extracted.seoKeywords.length < 5) return 'keywords';
  if (!extracted.contactPreferences) return 'contact_preferences';
  return 'summary';
}

/**
 * Generate next assistant question based on conversation stage
 */
export function generateNextQuestion(stage: ConversationStage): string {
  const questions: Record<ConversationStage, string> = {
    greeting: `Hi! 👋 I'll help you build your perfect website by asking a few questions about your business. Let's start with the basics.\n\nWhat's the name of your business?`,
    
    business_name: `Great! I've got your business name. Now, what category best describes your business? (e.g., "Consulting", "E-commerce", "SaaS", "Personal Services", etc.)`,
    
    category: `Got it! Where is your business located? (City, State or Country)`,
    
    location: `Perfect! What services or products do you offer? Please list them separated by commas. (e.g., "Web Design, Consulting, Maintenance")`,
    
    services: `Excellent! What's your unique value proposition? In other words, what makes your business different or better than competitors? (At least 10 words)`,
    
    value_proposition: `Great articulation! Who is your target audience? Describe them briefly. (e.g., "Small business owners", "Tech startups", "Individual professionals")`,
    
    audience: `Perfect! What's the tone of your brand? Choose one:\n1. Professional (corporate, authoritative)\n2. Friendly (approachable, warm)\n3. Luxury (premium, exclusive)\n4. Bold (energetic, daring)\n5. Casual (relaxed, conversational)\n\nReply with the number (1-5) or the name.`,
    
    brand_tone: `Nice choice! What are your brand colors? Provide 2-3 colors (e.g., "#1E40AF", "blue", "navy blue"). You can use hex codes or color names.`,
    
    colors: `Wonderful! What are your trust signals? What credentials, certifications, or social proof do you have? (e.g., "10+ years experience", "Award-winning", "1000+ satisfied clients")`,
    
    trust_signals: `Awesome! Finally, let's think about SEO. What keywords do you want to rank for? Give me 5-20 keywords related to your business. (separated by commas)`,
    
    keywords: `Perfect! How should customers contact you? Which of these apply? (Reply: email, phone, booking, or any combination)`,
    
    contact_preferences: `Fantastic! Let me verify everything I've learned about your business. Here's what I have:`,
    
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

    case 'services':
      updated.services = trimmed
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      break;

    case 'value_proposition':
      updated.valueProposition = trimmed;
      break;

    case 'audience':
      updated.targetAudience = trimmed;
      break;

    case 'brand_tone': {
      const toneMap: Record<string | number, 'professional' | 'friendly' | 'luxury' | 'bold' | 'casual'> = {
        '1': 'professional',
        'professional': 'professional',
        '2': 'friendly',
        'friendly': 'friendly',
        '3': 'luxury',
        'luxury': 'luxury',
        '4': 'bold',
        'bold': 'bold',
        '5': 'casual',
        'casual': 'casual',
      };
      const key = trimmed.toLowerCase();
      updated.brandTone = toneMap[key] || 'professional';
      break;
    }

    case 'colors': {
      const colorStrings = trimmed.split(',').map((c) => c.trim());
      updated.brandColors = colorStrings.filter((c) => c.length > 0);
      break;
    }

    case 'trust_signals': {
      const signals = trimmed.split(',').map((s) => s.trim());
      updated.trustSignals = signals.filter((s) => s.length > 0);
      break;
    }

    case 'keywords': {
      const keywords = trimmed
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k.length > 0)
        .slice(0, 20);
      updated.seoKeywords = keywords;
      break;
    }

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

    case 'audience':
      if (!data.targetAudience || data.targetAudience.trim().length === 0) {
        return { valid: false, message: 'Please describe your target audience' };
      }
      break;

    case 'brand_tone':
      if (!data.brandTone) {
        return { valid: false, message: 'Please select a brand tone' };
      }
      break;

    case 'colors':
      if (!data.brandColors || data.brandColors.length === 0) {
        return { valid: false, message: 'Please provide at least one brand color' };
      }
      break;

    case 'trust_signals':
      if (!data.trustSignals || data.trustSignals.length === 0) {
        return { valid: false, message: 'Please provide at least one trust signal' };
      }
      break;

    case 'keywords':
      if (!data.seoKeywords || data.seoKeywords.length < 5) {
        return { valid: false, message: 'Please provide at least 5 keywords' };
      }
      break;

    case 'contact_preferences':
      if (!data.contactPreferences) {
        return { valid: false, message: 'Please select at least one contact preference' };
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

  lines.push('📋 **Business Profile Summary**\\n');
  
  if (data.name) lines.push(`**Business Name:** ${data.name}`);
  if (data.category) lines.push(`**Category:** ${data.category}`);
  if (data.location) lines.push(`**Location:** ${data.location}`);
  if (data.services && data.services.length > 0) {
    lines.push(`**Services:** ${data.services.join(', ')}`);
  }
  if (data.valueProposition) lines.push(`**Value Prop:** ${data.valueProposition}`);
  if (data.targetAudience) lines.push(`**Target Audience:** ${data.targetAudience}`);
  if (data.brandTone) lines.push(`**Brand Tone:** ${data.brandTone}`);
  if (data.brandColors && data.brandColors.length > 0) {
    lines.push(`**Brand Colors:** ${data.brandColors.join(', ')}`);
  }
  if (data.trustSignals && data.trustSignals.length > 0) {
    lines.push(`**Trust Signals:** ${data.trustSignals.join(', ')}`);
  }
  if (data.seoKeywords && data.seoKeywords.length > 0) {
    lines.push(`**SEO Keywords:** ${data.seoKeywords.slice(0, 5).join(', ')}${data.seoKeywords.length > 5 ? ', ...' : ''}`);
  }

  lines.push('\\n✅ Everything looks good! Ready to create your website?');

  return lines.join('\\n');
}
