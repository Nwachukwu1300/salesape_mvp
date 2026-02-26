/**
 * Lead Scoring System
 * Automatically scores leads based on quality factors
 * Helps prioritize follow-ups and identifies high-intent customers
 */

interface LeadScoreResult {
  totalScore: number;  // 0-100
  intentCategory: 'high' | 'medium' | 'low';
  factors: {
    messageScore: number;
    keywordScore: number;
    urgencyScore: number;
    budgetScore: number;
    sourceScore: number;
  };
  explanation: string[];
}

/**
 * Urgency keywords that indicate high intent
 */
const URGENCY_KEYWORDS = {
  high: [
    'urgent', 'asap', 'emergency', 'immediately', 'right away',
    'today', 'this week', 'need ASAP', 'time sensitive',
    'stuck', 'broken', 'not working', 'critical', 'down',
    'hurry', 'rush', 'now', 'quickly', 'soon',
  ],
  medium: [
    'need', 'looking for', 'want', 'interested',
    'planning to', 'considering', 'thinking about',
    'next month', 'this month', 'upcoming',
  ],
};

/**
 * Budget indicators
 */
const BUDGET_KEYWORDS = {
  high: [
    'budget', 'investment', 'premium', 'high-end',
    'unlimited', 'no budget constraints', 'enterprise',
    'annual contract', 'retainer',
  ],
  medium: [
    'cost', 'price', 'affordable', 'reasonable',
    'quote', 'estimate', 'proposal',
  ],
};

/**
 * Industry/service match keywords
 */
const SERVICE_KEYWORDS: { [key: string]: string[] } = {
  plumbing: ['plumbing', 'pipes', 'leak', 'drain', 'water', 'faucet', 'toilet'],
  landscaping: ['landscaping', 'lawn', 'garden', 'yard', 'outdoor', 'grass', 'trim'],
  legal: ['legal', 'attorney', 'lawyer', 'law', 'contract', 'agreement', 'lawsuit'],
  tech: ['software', 'app', 'web', 'development', 'it', 'tech', 'coding'],
  healthcare: ['medical', 'health', 'dental', 'doctor', 'clinic', 'therapy', 'treatment'],
  cleaning: ['cleaning', 'clean', 'janitorial', 'housekeeping', 'maid', 'sanitize'],
};

/**
 * Score message quality and detail level
 */
function scoreMessage(message: string | null | undefined): number {
  if (!message) return 0;

  const words = message.trim().split(/\s+/);
  let score = 0;

  // Length indicates effort (longer = more specific need)
  if (words.length > 10) score += 10;
  if (words.length > 25) score += 10;
  if (words.length > 50) score += 10;

  // Punctuation indicates professionalism
  if (message.includes('?')) score += 5;
  if (message.includes('.')) score += 5;

  // Details/specificity
  if (/\d+/.test(message)) score += 5; // contains numbers
  if (/[A-Z]{2,}/.test(message)) score += 3; // acronyms

  // Avoid all caps (lower quality)
  if (message === message.toUpperCase() && message.length > 20) score -= 10;

  return Math.min(score, 30);
}

/**
 * Score urgency level
 */
function scoreUrgency(message: string | undefined, source?: string): number {
  const messageLC = message ? message.toLowerCase() : '';
  message = messageLC;
  let score = 0;

  // Check for urgent keywords
  for (const keyword of URGENCY_KEYWORDS.high) {
    if (message.includes(keyword)) {
      score += 20;
      break; // Only count once
    }
  }

  if (score === 0) {
    for (const keyword of URGENCY_KEYWORDS.medium) {
      if (message.includes(keyword)) {
        score += 10;
        break;
      }
    }
  }

  // Phone leads are typically more urgent
  if (source === 'phone') score += 5;

  return Math.min(score, 25);
}

/**
 * Score budget/investment signals
 */
function scoreBudget(message: string): number {
  message = message ? message.toLowerCase() : '';
  let score = 0;

  // Check for budget keywords
  for (const keyword of BUDGET_KEYWORDS.high) {
    if (message.includes(keyword)) {
      score += 15;
      break;
    }
  }

  if (score === 0) {
    for (const keyword of BUDGET_KEYWORDS.medium) {
      if (message.includes(keyword)) {
        score += 8;
        break;
      }
    }
  }

  return Math.min(score, 20);
}

/**
 * Score keyword relevance to business category
 */
function scoreKeywordMatch(message: string, businessCategory?: string): number {
  if (!businessCategory || !message) return 0;

  const category = businessCategory.toLowerCase();
  const keywords = SERVICE_KEYWORDS[category] || [];

  if (keywords.length === 0) return 5; // Default small boost for unknown category

  let matches = 0;
  const messageLower = message.toLowerCase();

  for (const keyword of keywords) {
    if (messageLower.includes(keyword)) {
      matches++;
    }
  }

  // Score based on keyword matches
  return Math.min(matches * 5, 20);
}

/**
 * Score source reliability
 */
function scoreSource(source?: string): number {
  const sourceScores: { [key: string]: number } = {
    phone: 15,
    email: 12,
    web_form: 10,
    instagram: 8,
    direct: 12,
    referral: 15,
  };

  return sourceScores[source || 'web_form'] || 10;
}

/**
 * Determine intent category based on total score
 */
function determineIntentCategory(score: number): 'high' | 'medium' | 'low' {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

/**
 * Main lead scoring function
 */
export function scoreLead(leadData: {
  name: string;
  email: string;
  company?: string;
  message?: string;
  source?: string;
  businessCategory?: string;
}): LeadScoreResult {
  const explanation: string[] = [];

  // Score each factor
  const messageScore = scoreMessage(leadData.message);
  const urgencyScore = scoreUrgency(leadData.message || '', leadData.source);
  const budgetScore = scoreBudget(leadData.message || '');
  const keywordScore = scoreKeywordMatch(leadData.message || '', leadData.businessCategory);
  const sourceScore = scoreSource(leadData.source);

  // Calculate total (weighted)
  const totalScore = Math.round(
    (messageScore * 0.15) +
    (urgencyScore * 0.25) +
    (budgetScore * 0.20) +
    (keywordScore * 0.20) +
    (sourceScore * 0.20)
  );

  const intentCategory = determineIntentCategory(totalScore);

  // Build explanation
  if (messageScore > 15) {
    explanation.push('✓ Detailed message (high intent signal)');
  } else if (messageScore > 5) {
    explanation.push('→ Brief message');
  } else {
    explanation.push('⚠ Minimal message detail');
  }

  if (urgencyScore > 20) {
    explanation.push('🔥 URGENT keywords detected');
  } else if (urgencyScore > 10) {
    explanation.push('↑ Time-sensitive language');
  }

  if (budgetScore > 15) {
    explanation.push('💰 High budget signals');
  } else if (budgetScore > 8) {
    explanation.push('💳 Budget mentioned');
  }

  if (keywordScore > 10) {
    explanation.push(`✓ Service keywords matched (${leadData.businessCategory})`);
  }

  if (sourceScore > 12) {
    explanation.push(`✓ High-intent source (${leadData.source})`);
  }

  return {
    totalScore,
    intentCategory,
    factors: {
      messageScore,
      urgencyScore,
      budgetScore,
      keywordScore,
      sourceScore,
    },
    explanation,
  };
}

/**
 * Calculate lead priority for routing/assignment
 * 0-100 where 100 is highest priority
 */
export function calculateLeadPriority(leadData: {
  name: string;
  email: string;
  company?: string;
  message?: string;
  source?: string;
  businessCategory?: string;
  createdAt?: Date;
}): {
  priority: number;  // 0-100
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  recommendation: string;
} {
  const score = scoreLead(leadData);
  let priority = score.totalScore;

  // Boost priority for very recent leads
  if (leadData.createdAt) {
    const ageMinutes = (Date.now() - new Date(leadData.createdAt).getTime()) / (1000 * 60);
    if (ageMinutes < 5) priority += 5;
    if (ageMinutes < 60) priority += 3;
  }

  priority = Math.min(priority, 100);

  let tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  let recommendation: string;

  if (priority >= 85) {
    tier = 'platinum';
    recommendation = '⭐ Contact immediately - hot lead';
  } else if (priority >= 70) {
    tier = 'gold';
    recommendation = '🔥 High priority - contact within 2 hours';
  } else if (priority >= 50) {
    tier = 'silver';
    recommendation = '→ Follow up within 24 hours';
  } else {
    tier = 'bronze';
    recommendation = '▸ Standard follow-up';
  }

  return { priority, tier, recommendation };
}

export default {
  scoreLead,
  calculateLeadPriority,
  URGENCY_KEYWORDS,
  BUDGET_KEYWORDS,
  SERVICE_KEYWORDS,
};
