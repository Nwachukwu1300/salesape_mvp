/**
 * Prompt Guard Utility
 * Detects and prevents prompt injection attacks
 * Protects conversation flow from malicious input
 */

interface PromptGuardResult {
  isClean: boolean;
  riskLevel: 'safe' | 'warning' | 'blocked';
  reason?: string;
}

/**
 * Patterns that indicate prompt injection attempts
 */
const INJECTION_PATTERNS = [
  // Instruction override attempts
  /ignore previous instructions?/i,
  /forget about the previous/i,
  /disregard all previous/i,
  /system override/i,
  /new system prompt/i,
  /new instructions/i,
  /override instructions/i,
  /bypass.*rules?/i,
  
  // Role-based override
  /you are now a/i,
  /pretend you are/i,
  /roleplay as/i,
  /you must act as/i,
  /imagine you are/i,

  // Command injection
  /execute command/i,
  /run command/i,
  /execute.*code/i,
  /eval\(/i,
  /exec\(/i,

  // SQL injection patterns
  /(\bor\b|\band\b)\s*['"]?\d+['"]*\s*=\s*['"]?\d+['"]*\s*(?:or|and)/i,
  /drop\s+table/i,
  /insert\s+into/i,
  /delete\s+from/i,
  /update\s+\w+\s+set/i,

  // API key/token attempts
  /api[_-]?key/i,
  /access[_-]?token/i,
  /secret[_-]?key/i,
  /password/i,
  /bearer\s+[a-z0-9]/i,

  // File system access
  /\/etc\/passwd/i,
  /\/etc\/shadow/i,
  /c:\\windows/i,
  /open\s+file/i,
  /read\s+file/i,

  // Environment variable leakage
  /process\.env/i,
  /environment variables?/i,
  /env\s*\(/i,

  // Context window manipulation
  /context window/i,
  /token limit/i,
  /maximum output/i,
  /conversation history/i,
];

/**
 * Suspicious patterns that need review
 */
const WARNING_PATTERNS = [
  /admin|moderator|root|sudo/i,
  /bypass|circumvent|exploit/i,
  /vulnerability|exploit|weakness/i,
  /system architecture|internal design/i,
];

/**
 * Check if input contains prompt injection attempts
 */
export function validateConversationInput(
  userInput: string,
  context?: {
    businessName?: string;
    conversationStage?: string;
  }
): PromptGuardResult {
  if (!userInput || typeof userInput !== 'string') {
    return { isClean: true, riskLevel: 'safe' };
  }

  const input = userInput.trim();

  // Check length (very long inputs might be attempts to fill context)
  if (input.length > 5000) {
    return {
      isClean: false,
      riskLevel: 'warning',
      reason: 'Input exceeds maximum length (5000 chars)',
    };
  }

  // Check for blocked patterns
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isClean: false,
        riskLevel: 'blocked',
        reason: 'Potential injection pattern detected',
      };
    }
  }

  // Check for warning patterns
  for (const pattern of WARNING_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isClean: false,
        riskLevel: 'warning',
        reason: 'Suspicious pattern detected',
      };
    }
  }

  // Context-aware validation
  if (context?.conversationStage === 'business_name') {
    // At business name stage, reject overly complex inputs
    if (input.length > 100 || /[<>{}[\]()%$#@!^&*]/.test(input)) {
      return {
        isClean: false,
        riskLevel: 'warning',
        reason: 'Business name contains suspicious characters',
      };
    }
  }

  // Check for repeated words (potential padding attack)
  const words = input.split(/\s+/);
  const wordCounts = words.reduce((acc: { [key: string]: number }, word) => {
    acc[word.toLowerCase()] = (acc[word.toLowerCase()] || 0) + 1;
    return acc;
  }, {});

  const repeatedWords = Object.entries(wordCounts).filter(([_, count]) => count > 10);
  if (repeatedWords.length > 0) {
    return {
      isClean: false,
      riskLevel: 'warning',
      reason: 'Excessive word repetition detected',
    };
  }

  return { isClean: true, riskLevel: 'safe' };
}

/**
 * Validate and clean structured data before processing
 */
export function validateStructuredData(
  data: any,
  schema: 'business_understanding' | 'conversation_input'
): { valid: boolean; cleaned: any; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, cleaned: null, error: 'Invalid input format' };
  }

  try {
    if (schema === 'business_understanding') {
      // Validate BusinessUnderstanding structure
      const required = ['name', 'category', 'services'];
      const missing = required.filter(field => !data[field]);

      if (missing.length > 0) {
        return {
          valid: false,
          cleaned: null,
          error: `Missing required fields: ${missing.join(', ')}`,
        };
      }

      // Validate name doesn't contain injection
      const nameGuard = validateConversationInput(data.name);
      if (!nameGuard.isClean && nameGuard.riskLevel === 'blocked') {
        return {
          valid: false,
          cleaned: null,
          error: 'Business name contains invalid content',
        };
      }

      // Validate arrays
      if (!Array.isArray(data.services)) {
        return {
          valid: false,
          cleaned: null,
          error: 'Services must be an array',
        };
      }

      return {
        valid: true,
        cleaned: {
          name: data.name.trim().slice(0, 100),
          category: data.category.trim().slice(0, 50),
          services: data.services.slice(0, 10).map((s: string) => String(s).slice(0, 100)),
          location: data.location ? String(data.location).slice(0, 100) : '',
          tone: ['professional', 'friendly', 'luxury', 'bold'].includes(data.tone) ? data.tone : 'professional',
        },
      };
    }

    return { valid: true, cleaned: data };
  } catch (error) {
    return {
      valid: false,
      cleaned: null,
      error: error instanceof Error ? error.message : 'Validation error',
    };
  }
}

/**
 * Sanitize and validate conversation message
 */
export function sanitizeConversationMessage(message: string): {
  clean: string;
  isValid: boolean;
} {
  const validation = validateConversationInput(message);

  if (!validation.isClean && validation.riskLevel === 'blocked') {
    return {
      clean: '',
      isValid: false,
    };
  }

  // Remove excess whitespace and escape dangerous characters
  const clean = message
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 5000);

  return {
    clean,
    isValid: validation.isClean,
  };
}

/**
 * Check if AI output looks suspicious
 * Verify AI didn't get tricked into outputting sensitive data
 */
export function validateAIOutput(output: string): {
  safe: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  const dangerousPatterns = [
    { pattern: /api[_-]?key\s*[:=]/i, message: 'Contains API key exposure' },
    { pattern: /password\s*[:=]/i, message: 'Contains password exposure' },
    { pattern: /token\s*[:=]/i, message: 'Contains token exposure' },
    { pattern: /private\s+\w+\s*[:=]/i, message: 'Contains private data' },
    { pattern: /secret\s*[:=]/i, message: 'Contains secret data' },
  ];

  for (const { pattern, message } of dangerousPatterns) {
    if (pattern.test(output)) {
      warnings.push(message);
    }
  }

  return {
    safe: warnings.length === 0,
    warnings,
  };
}

export default {
  validateConversationInput,
  validateStructuredData,
  sanitizeConversationMessage,
  validateAIOutput,
};
