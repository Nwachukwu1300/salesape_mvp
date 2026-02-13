/**
 * Business Understanding Validation Schema
 * Validates that AI-generated BusinessUnderstanding matches strict structure
 */

import type { BusinessUnderstanding } from '../types/index.js';

/**
 * Validation rules for BusinessUnderstanding
 * Each field is required unless marked optional
 */
export const businessUnderstandingSchema = {
  name: { type: 'string', minLength: 1, maxLength: 200, required: true },
  category: { type: 'string', minLength: 1, maxLength: 100, required: true },
  location: { type: 'string', minLength: 1, maxLength: 200, required: true },
  services: { type: 'stringArray', minItems: 1, maxItems: 10, required: true },
  valueProposition: { type: 'string', minLength: 10, maxLength: 500, required: true },
  targetAudience: { type: 'string', minLength: 5, maxLength: 300, required: true },
  brandTone: { 
    type: 'enum', 
    values: ['professional', 'friendly', 'luxury', 'bold', 'casual'], 
    required: true 
  },
  brandColors: { type: 'stringArray', minItems: 1, maxItems: 5, required: true },
  trustSignals: { type: 'stringArray', minItems: 1, maxItems: 5, required: true },
  seoKeywords: { type: 'stringArray', minItems: 5, maxItems: 20, required: true },
  contactPreferences: { 
    type: 'object',
    properties: {
      email: { type: 'boolean', required: true },
      phone: { type: 'boolean', required: true },
      booking: { type: 'boolean', required: true },
    },
    required: true 
  },
  logoUrl: { type: 'string', required: false },
  imageAssets: { 
    type: 'object',
    properties: {
      hero: { type: 'string', required: false },
      gallery: { type: 'stringArray', required: false },
    },
    required: false 
  },
};

/**
 * Validate BusinessUnderstanding object against schema
 * Returns { valid: true } or { valid: false, errors: string[] }
 */
export function validateBusinessUnderstanding(
  data: any
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if data is an object
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Data must be an object'] };
  }

  // Validate name
  if (!data.name || typeof data.name !== 'string' || data.name.length === 0) {
    errors.push('name: required string, 1-200 characters');
  } else if (data.name.length > 200) {
    errors.push('name: must be 200 characters or less');
  }

  // Validate category
  if (!data.category || typeof data.category !== 'string' || data.category.length === 0) {
    errors.push('category: required string, 1-100 characters');
  } else if (data.category.length > 100) {
    errors.push('category: must be 100 characters or less');
  }

  // Validate location
  if (!data.location || typeof data.location !== 'string' || data.location.length === 0) {
    errors.push('location: required string, 1-200 characters');
  } else if (data.location.length > 200) {
    errors.push('location: must be 200 characters or less');
  }

  // Validate services array
  if (!Array.isArray(data.services) || data.services.length === 0) {
    errors.push('services: required array with at least 1 item');
  } else if (data.services.length > 10) {
    errors.push('services: maximum 10 items');
  } else if (!data.services.every((s: any) => typeof s === 'string' && s.length > 0)) {
    errors.push('services: all items must be non-empty strings');
  }

  // Validate valueProposition
  if (!data.valueProposition || typeof data.valueProposition !== 'string') {
    errors.push('valueProposition: required string, 10-500 characters');
  } else if (data.valueProposition.length < 10 || data.valueProposition.length > 500) {
    errors.push('valueProposition: must be 10-500 characters');
  }

  // Validate targetAudience
  if (!data.targetAudience || typeof data.targetAudience !== 'string') {
    errors.push('targetAudience: required string, 5-300 characters');
  } else if (data.targetAudience.length < 5 || data.targetAudience.length > 300) {
    errors.push('targetAudience: must be 5-300 characters');
  }

  // Validate brandTone
  const validBrandTones = ['professional', 'friendly', 'luxury', 'bold', 'casual'];
  if (!validBrandTones.includes(data.brandTone)) {
    errors.push(`brandTone: must be one of ${validBrandTones.join(', ')}`);
  }

  // Validate brandColors array
  if (!Array.isArray(data.brandColors) || data.brandColors.length === 0) {
    errors.push('brandColors: required array with at least 1 color');
  } else if (data.brandColors.length > 5) {
    errors.push('brandColors: maximum 5 colors');
  } else if (!data.brandColors.every((c: any) => typeof c === 'string' && /^#[0-9A-F]{6}$|^#[0-9A-F]{3}$/i.test(c))) {
    errors.push('brandColors: all colors must be valid hex codes (e.g., #FF0000)');
  }

  // Validate trustSignals array
  if (!Array.isArray(data.trustSignals) || data.trustSignals.length === 0) {
    errors.push('trustSignals: required array with at least 1 item');
  } else if (data.trustSignals.length > 5) {
    errors.push('trustSignals: maximum 5 items');
  } else if (!data.trustSignals.every((s: any) => typeof s === 'string' && s.length > 0)) {
    errors.push('trustSignals: all items must be non-empty strings');
  }

  // Validate seoKeywords array
  if (!Array.isArray(data.seoKeywords) || data.seoKeywords.length < 5) {
    errors.push('seoKeywords: required array with at least 5 keywords');
  } else if (data.seoKeywords.length > 20) {
    errors.push('seoKeywords: maximum 20 keywords');
  } else if (!data.seoKeywords.every((k: any) => typeof k === 'string' && k.length > 0)) {
    errors.push('seoKeywords: all items must be non-empty strings');
  }

  // Validate contactPreferences object
  if (!data.contactPreferences || typeof data.contactPreferences !== 'object') {
    errors.push('contactPreferences: required object with email, phone, booking boolean fields');
  } else {
    if (typeof data.contactPreferences.email !== 'boolean') {
      errors.push('contactPreferences.email: required boolean');
    }
    if (typeof data.contactPreferences.phone !== 'boolean') {
      errors.push('contactPreferences.phone: required boolean');
    }
    if (typeof data.contactPreferences.booking !== 'boolean') {
      errors.push('contactPreferences.booking: required boolean');
    }
  }

  // Validate logoUrl (optional)
  if (data.logoUrl !== undefined && (typeof data.logoUrl !== 'string' || data.logoUrl.length === 0)) {
    errors.push('logoUrl: must be a non-empty string if provided');
  }

  // Validate imageAssets (optional)
  if (data.imageAssets !== undefined) {
    if (typeof data.imageAssets !== 'object') {
      errors.push('imageAssets: must be an object if provided');
    } else {
      if (data.imageAssets.hero !== undefined && typeof data.imageAssets.hero !== 'string') {
        errors.push('imageAssets.hero: must be a string if provided');
      }
      if (data.imageAssets.gallery !== undefined) {
        if (!Array.isArray(data.imageAssets.gallery)) {
          errors.push('imageAssets.gallery: must be an array if provided');
        } else if (!data.imageAssets.gallery.every((img: any) => typeof img === 'string' && img.length > 0)) {
          errors.push('imageAssets.gallery: all items must be non-empty strings');
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Try to parse and validate JSON response from AI
 * Handles various AI response formats and extracts JSON if possible
 */
export function extractAndValidateJSON(
  response: string
): { valid: boolean; data?: object; error?: string } {
  try {
    // Try direct JSON parse first
    const parsed = JSON.parse(response);
    return { valid: true, data: parsed };
  } catch {
    // If direct parse fails, try to extract JSON from text
    // Look for patterns like ```json ... ``` or just { ... }
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        return { valid: true, data: parsed };
      } catch (e) {
        return { valid: false, error: `Invalid JSON in code block: ${String(e)}` };
      }
    }

    // Try to extract first { ... } block
    const objectMatch = response.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        const parsed = JSON.parse(objectMatch[0]);
        return { valid: true, data: parsed };
      } catch (e) {
        return { valid: false, error: `Could not parse JSON from response: ${String(e)}` };
      }
    }

    return { valid: false, error: 'No valid JSON found in response' };
  }
}

/**
 * Full validation pipeline: extract JSON and validate structure
 */
export function validateBusinessUnderstandingResponse(
  aiResponse: string
): { 
  valid: boolean; 
  data?: BusinessUnderstanding; 
  errors: string[];
} {
  // Extract JSON from response
  const extraction = extractAndValidateJSON(aiResponse);
  if (!extraction.valid) {
    return {
      valid: false,
      errors: [extraction.error || 'Failed to extract JSON from AI response'],
    };
  }

  // Validate structure
  const validation = validateBusinessUnderstanding(extraction.data);
  if (!validation.valid) {
    return {
      valid: false,
      errors: validation.errors,
    };
  }

  return {
    valid: true,
    data: extraction.data as BusinessUnderstanding,
    errors: [],
  };
}
