/**
 * Security Hardening Documentation - SalesAPE MVP
 * ================================================
 * This file documents all security measures implemented for the acquisition layer
 * to prevent abuse, DDoS attacks, and malicious input.
 *
 * Date: February 13, 2026
 */

// ============================================================================
// RATE LIMITING STRATEGY
// ============================================================================

/**
 * 1. GLOBAL RATE LIMITER
 * - All routes: 100 requests per 15 minutes per IP
 * - Skips: /health endpoint
 * - Implementation: express-rate-limit middleware
 */

/**
 * 2. AUTHENTICATION ENDPOINTS RATE LIMITER (Strict)
 * - Routes: /auth/register, /auth/login
 * - Limit: 5 requests per 15 minutes per IP
 * - Skip Successful: Yes (successful auth doesn't count toward limit)
 * - Purpose: Prevent brute force attacks
 */

/**
 * 3. CONVERSATION ENDPOINTS RATE LIMITER
 * - Routes: /conversation/start, /conversation/message, /conversation/session/:sessionId, /conversation/session/:sessionId/complete
 * - Limit: 30 messages per hour per user (keyed by JWT token)
 * - Window: 1 hour
 * - Purpose: Prevent abuse of onboarding flow, excessive API calls
 * - Fallback: Uses IP address if token not available
 */

/**
 * 4. PUBLIC SEO AUDIT RATE LIMITER (Very Strict)
 * - Route: /seo-audit-public
 * - Limit: 1 request per IP address per 7 days
 * - Window: 7 days (604,800 seconds)
 * - Purpose: Prevent spam and abuse of free audit service
 * - Message: "You can run one free SEO audit per week. Please try again next week."
 */

/**
 * 5. PUBLIC GENERAL RATE LIMITER
 * - Route: /free-audit
 * - Limit: 20 requests per minute per IP
 * - Window: 1 minute
 * - Purpose: General public endpoint protection
 */

/**
 * 6. NOTIFICATION ENDPOINTS RATE LIMITER
 * - Limit: 10 requests per hour per IP
 * - Window: 1 hour
 * - Purpose: Prevent email/SMS bombing
 */

/**
 * 7. API ENDPOINTS RATE LIMITER
 * - Limit: 30 requests per minute per IP
 * - Window: 1 minute
 * - Purpose: General API rate limiting
 */

// ============================================================================
// REQUEST BODY SIZE LIMITS
// ============================================================================

/**
 * Content-Length Limits:
 * - JSON: 10MB max
 * - URL-encoded: 10MB max
 *
 * Implementation:
 * ```
 * app.use(express.json({ limit: '10mb' }));
 * app.use(express.urlencoded({ limit: '10mb', extended: true }));
 * ```
 *
 * Purpose: Prevent memory exhaustion from excessively large payloads
 */

// ============================================================================
// INPUT VALIDATION & SANITIZATION
// ============================================================================

/**
 * CONVERSATION ENDPOINTS VALIDATION
 *
 * /conversation/message:
 * - sessionId: Required, string, format validation (CUID pattern: [a-z0-9_\-]{15,40})
 * - message: Required, string, max 1000 characters, trimmed, non-empty
 *
 * /conversation/session/:sessionId:
 * - sessionId: Path param, format validation (CUID pattern)
 *
 * /conversation/session/:sessionId/complete:
 * - sessionId: Path param, format validation (CUID pattern)
 * - businessId: Required, string, format validation (CUID pattern)
 */

/**
 * PUBLIC SEO AUDIT ENDPOINT VALIDATION
 *
 * /seo-audit-public:
 * - website: Required, string, max 500 characters
 *   - URL format validation
 *   - Protocol normalization (adds https:// if missing)
 *   - Blocks private/local IP addresses:
 *     - localhost, 127.0.0.1, 0.0.0.0
 *     - 192.168.*, 10.*, 172.*
 *     - example.com, example.org
 *
 * - email: Required, string, max 254 characters
 *   - RFC 5322 simplified regex validation
 *   - Prevents double dots (..), leading/trailing dots
 *   - Additional abuse pattern detection
 */

/**
 * AUTHENTICATION ENDPOINTS VALIDATION
 *
 * /auth/register:
 * - Email: Validation middleware (express-validator)
 * - Password: Strength validation
 * - Name: Required, trimmed
 *
 * /auth/login:
 * - Email: Format validation
 * - Password: Required
 */

// ============================================================================
// ATTACK PREVENTION MECHANISMS
// ============================================================================

/**
 * 1. BRUTE FORCE PROTECTION
 * - Rate limiting on auth endpoints (5 per 15 min)
 * - Skip successful requests (only count failures)
 */

/**
 * 2. DDoS MITIGATION
 * - Global rate limiting (100 per 15 min)
 * - Conversation-specific rate limiting (30 per hour)
 * - IP-based tracking via express-rate-limit
 */

/**
 * 3. ABUSE PREVENTION
 * - Strict rate limits on audit endpoints (1 per week)
 * - Message length validation (max 1000 chars)
 * - Session ID format validation
 * - Business ID format validation
 */

/**
 * 4. INJECTION ATTACK PREVENTION
 * - Input format validation (CUID pattern for IDs)
 * - Email validation (RFC 5322)
 * - URL validation (new URL() constructor)
 * - No direct SQL queries (Prisma ORM used)
 * - Request body size limits (10MB max)
 */

/**
 * 5. PARAMETER TAMPERING PREVENTION
 * - Session ID validation ensures user ownership
 * - Business ID validation ensures user ownership
 * - JWT authentication on protected endpoints
 */

/**
 * 6. MEMORY EXHAUSTION PREVENTION
 * - Request body size limits (10MB max per request)
 * - Array length limits in validation (e.g., keywords max 20)
 * - Message length limits (max 1000 chars)
 */

/**
 * 7. LOCAL NETWORK SCANNING PREVENTION
 * - Private IP ranges blocked from audit endpoint
 * - localhost and internal addresses rejected
 * - Prevention of SSRF (Server-Side Request Forgery)
 */

// ============================================================================
// DEPLOYMENT SECURITY CHECKLIST
// ============================================================================

/**
 * ✅ Rate Limiting
 * - [x] Global rate limiter enabled
 * - [x] Auth-specific rate limiter (5 per 15 min)
 * - [x] Conversation rate limiter (30 per hour per user)
 * - [x] Public audit rate limiter (1 per week per IP)
 * - [x] Public general rate limiter (20 per min per IP)
 *
 * ✅ Request Size Limits
 * - [x] JSON body limit: 10MB
 * - [x] URL-encoded limit: 10MB
 *
 * ✅ Input Validation
 * - [x] Email validation (RFC 5322)
 * - [x] URL validation with protocol check
 * - [x] Session ID format validation (CUID)
 * - [x] Business ID format validation (CUID)
 * - [x] Message length validation (max 1000 chars)
 * - [x] Website URL length limit (max 500 chars)
 * - [x] Email length limit (max 254 chars)
 *
 * ✅ Attack Prevention
 * - [x] Brute force protection (auth endpoints)
 * - [x] DDoS mitigation (global + endpoint-specific limits)
 * - [x] Injection prevention (format validation)
 * - [x] SSRF prevention (private IP blocking)
 * - [x] Ownership validation (user ID checks)
 *
 * ✅ Monitoring
 * - [x] Rate limit info in response headers
 * - [x] Error logging for failed validations
 * - [x] Comprehensive error messages
 */

// ============================================================================
// PROTECTED ENDPOINTS SUMMARY
// ============================================================================

/**
 * PUBLIC ENDPOINTS (No Authentication Required, Rate Limited)
 * - POST /seo-audit-public (1/week/IP, strict validation)
 * - POST /free-audit (20/min/IP)
 * - GET /health (not rate limited)
 *
 * AUTHENTICATED ENDPOINTS (Rate Limited)
 * - POST /auth/register (5/15min/IP, auth rate limit)
 * - POST /auth/login (5/15min/IP, auth rate limit)
 * - POST /conversation/start (30/hour/user, conversation rate limit)
 * - POST /conversation/message (30/hour/user, conversation rate limit)
 * - GET /conversation/session/:sessionId (30/hour/user, conversation rate limit)
 * - POST /conversation/session/:sessionId/complete (30/hour/user, conversation rate limit)
 *
 * PRIVATE ENDPOINTS (Authenticated, Global Rate Limited)
 * - All other endpoints use global rate limiter (100/15min/IP)
 */

// ============================================================================
// EXAMPLE: Abuse Prevention in Action
// ============================================================================

/**
 * Scenario 1: User tries to spam conversation messages
 * - Limit: 30 messages per hour per user
 * - After 30 messages: HTTP 429 Too Many Requests
 * - Recovery: Wait 1 hour or create new conversation session
 *
 * Scenario 2: Attacker tries to spam free SEO audits
 * - Limit: 1 audit per IP address per week
 * - After 1st audit: IP blocked for 7 days
 * - Recovery: Use different IP or wait 7 days
 *
 * Scenario 3: Brute force login attempts
 * - Limit: 5 attempts per 15 minutes per IP
 * - After 5 failed attempts: HTTP 429 Too Many Requests
 * - Recovery: Wait 15 minutes
 *
 * Scenario 4: Injection attack attempt
 * - Example: sessionId with SQL injection: "; DROP TABLE--"
 * - Validation fails: Does not match CUID pattern
 * - Response: HTTP 400 Bad Request "Invalid session ID format"
 *
 * Scenario 5: SSRF attempt
 * - Try to audit internal server: http://192.168.1.1
 * - Validation rejects private IP ranges
 * - Response: HTTP 400 Bad Request "Invalid website URL"
 */

// ============================================================================
// VERSION HISTORY
// ============================================================================

/**
 * v1.0 (Feb 13, 2026)
 * - Initial security hardening implementation
 * - Rate limiting on all acquisition endpoints
 * - Request body size limits
 * - Enhanced input validation
 * - SSRF prevention
 * - Attack surface reduction
 */
