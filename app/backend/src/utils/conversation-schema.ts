import { z } from 'zod';

/**
 * Zod schema for validating BusinessUnderstanding extracted from conversation
 * This ensures all AI-generated data matches the required structure
 */
export const BusinessUnderstandingSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  category: z.string().min(1, 'Business category is required'),
  location: z.string().min(1, 'Business location is required'),
  services: z.array(z.string()).min(1, 'At least one service is required'),
  valueProposition: z.string().min(10, 'Value proposition must be at least 10 characters'),
  targetAudience: z.string().min(1, 'Target audience is required'),
  brandTone: z.enum(['professional', 'friendly', 'luxury', 'bold', 'casual']),
  brandColors: z.array(z.string()).min(1, 'At least one brand color is required'),
  trustSignals: z.array(z.string()).min(1, 'At least one trust signal is required'),
  seoKeywords: z.array(z.string()).min(5, 'At least 5 SEO keywords are required').max(20, 'Maximum 20 keywords'),
  contactPreferences: z.object({
    email: z.boolean(),
    phone: z.boolean(),
    booking: z.boolean(),
  }),
  logoUrl: z.string().optional(),
  imageAssets: z.object({
    hero: z.string().optional(),
    gallery: z.array(z.string()).optional(),
  }).optional(),
  seoInsights: z.any().optional(),
});

export type BusinessUnderstandingType = z.infer<typeof BusinessUnderstandingSchema>;

/**
 * Conversation message format
 */
export const ConversationMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.date(),
});

export type ConversationMessage = z.infer<typeof ConversationMessageSchema>;

/**
 * Conversation session format
 */
export const ConversationSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  messages: z.array(ConversationMessageSchema),
  extracted: BusinessUnderstandingSchema.optional(),
  status: z.enum(['active', 'completed', 'abandoned']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ConversationSessionType = z.infer<typeof ConversationSessionSchema>;

/**
 * Validate and parse AI response to ensure it matches BusinessUnderstanding schema
 */
export function validateAIResponse(data: unknown): {
  valid: boolean;
  data?: BusinessUnderstandingType;
  errors?: string[];
} {
  try {
    const parsed = BusinessUnderstandingSchema.parse(data);
    return { valid: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(
        (err: any) => `${err.path.join('.')}: ${err.message}`
      );
      return { valid: false, errors };
    }
    return { valid: false, errors: ['Unknown validation error'] };
  }
}

/**
 * Extract JSON from various AI response formats
 */
export function extractJSONFromResponse(response: string): unknown {
  // Try direct JSON parse
  try {
    return JSON.parse(response);
  } catch (e) {
    // Continue to other formats
  }

  // Try code block format: ```json { ... }```
  const codeBlockMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch (e) {
      // Continue
    }
  }

  // Try object literal format: { ... }
  const objectMatch = response.match(/(\{[\s\S]*\})/);
  if (objectMatch && objectMatch[1]) {
    try {
      return JSON.parse(objectMatch[1]);
    } catch (e) {
      // Continue
    }
  }

  // Return null if no valid JSON found
  return null;
}
