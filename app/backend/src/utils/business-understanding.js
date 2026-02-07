// Minimal runtime validator and deterministic serializer for BusinessUnderstanding
// Keep implementation small and dependency-free so it can run in dev and prod.

function isString(v) {
  return typeof v === 'string' && v.length >= 0;
}

function isBoolean(v) {
  return typeof v === 'boolean';
}

function isStringArray(arr) {
  return Array.isArray(arr) && arr.every((x) => typeof x === 'string');
}

function validateBusinessUnderstanding(obj) {
  if (!obj || typeof obj !== 'object') throw new Error('BusinessUnderstanding must be an object');
  const required = ['businessName', 'industry', 'services', 'location', 'brandTone', 'brandColors', 'contactPreferences'];
  for (const k of required) {
    if (!(k in obj)) throw new Error(`Missing required field: ${k}`);
  }
  if (!isString(obj.businessName)) throw new Error('businessName must be a string');
  if (!isString(obj.industry)) throw new Error('industry must be a string');
  if (!isStringArray(obj.services)) throw new Error('services must be string[]');
  if (!isString(obj.location)) throw new Error('location must be a string');
  const tones = ['formal','friendly','luxury','casual'];
  if (!tones.includes(obj.brandTone)) throw new Error('brandTone must be one of ' + tones.join(','));
  if (!isStringArray(obj.brandColors)) throw new Error('brandColors must be string[]');
  if (obj.logoUrl && !isString(obj.logoUrl)) throw new Error('logoUrl must be a string');
  if (typeof obj.contactPreferences !== 'object') throw new Error('contactPreferences required');
  if (!isBoolean(obj.contactPreferences.email) || !isBoolean(obj.contactPreferences.phone) || !isBoolean(obj.contactPreferences.booking)) {
    throw new Error('contactPreferences must contain boolean email, phone, booking');
  }
  // seoInsights optional - allow any
  return true;
}

// Deterministic stringify: sort object keys recursively for stable output
function deterministicStringifyBusiness(obj) {
  function sortKeys(value) {
    if (Array.isArray(value)) return value.map(sortKeys);
    if (value && typeof value === 'object') {
      const out = {};
      Object.keys(value).sort().forEach((k) => {
        out[k] = sortKeys(value[k]);
      });
      return out;
    }
    return value;
  }
  const canonical = sortKeys(obj);
  return JSON.stringify(canonical);
}

export { validateBusinessUnderstanding, deterministicStringifyBusiness };
