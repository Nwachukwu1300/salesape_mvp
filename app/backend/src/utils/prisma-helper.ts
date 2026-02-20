/**
 * Prisma Helper Utilities
 * Utilities for working with Prisma, especially with exactOptionalPropertyTypes
 */

/**
 * Filter out undefined values from an object, converting remaining undefined to null
 * Useful for Prisma operations with exactOptionalPropertyTypes: true
 * Removes undefined values but converts any remaining nullish to null
 */
export function filterUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      // Keep any falsy values including null, 0, false, empty string, etc.
      result[key] = value === null ? null : value;
    }
    // Skip undefined entirely
  }
  return result as Partial<T>;
}

/**
 * Filter an object to only include defined values
 * This variant returns only the key-value pairs where value is defined
 */
export function cleanData<T extends Record<string, any>>(data: T): Partial<T> {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}
