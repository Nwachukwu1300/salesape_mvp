import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

/**
 * Rate limiting configuration for API protection
 * Prevents abuse and DDoS attacks
 */

/**
 * Global rate limiter - applies to all routes
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 200 : 1000, // Higher limit in dev
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => {
    if (process.env.NODE_ENV === 'production') {
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.replace(/^Bearer\s+/i, '').substring(0, 24);
      }
    }
    return ipKeyGenerator(req as any);
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    if (req.path === '/health') return true;
    // Skip rate limiting for content deletes in dev to avoid UI blocking
    if (process.env.NODE_ENV !== 'production') {
      if (
        req.method === 'DELETE' &&
        req.path.startsWith('/businesses/') &&
        (req.path.includes('/content-inputs/') || req.path.includes('/content-projects/'))
      ) {
        return true;
      }
    }
    return false;
  },
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs (increased for development)
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Moderate rate limiter for API endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per windowMs
  message: 'Too many API requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for email/SMS endpoints
 */
export const notificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many notification requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Public endpoints rate limiter (more lenient)
 */
export const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Public SEO Audit rate limiter - 1 per week per IP address
 */
export const publicSeoAuditLimiter = rateLimit({
  windowMs:
    process.env.NODE_ENV === 'production'
      ? 7 * 24 * 60 * 60 * 1000
      : 60 * 1000, // Dev: 1 minute window for testing
  max: process.env.NODE_ENV === 'production' ? 1 : 20, // Dev: allow repeat test runs
  message: 'You can run one free SEO audit per week. Please try again next week.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Don't skip any requests - all requests count toward the limit
    return false;
  },
});

/**
 * Conversation rate limiter - protect onboarding flow from abuse
 * Limit to 35 messages per hour per user
 */
export const conversationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 35 : 500, // Keep strict in prod, relaxed in dev
  message: 'Too many conversation messages. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by user ID from JWT token, fallback to express-rate-limit's
    // ipKeyGenerator which correctly handles IPv6 addresses.
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        return authHeader.replace(/^Bearer\s+/i, '').substring(0, 20);
      } catch (e) {
        return ipKeyGenerator(req as any);
      }
    }
    return ipKeyGenerator(req as any);
  },
});
