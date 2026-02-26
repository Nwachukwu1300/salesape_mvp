/**
 * Redis Configuration Module
 * 
 * Centralizes Redis connection configuration with support for:
 * - Connection string (REDIS_URL) - preferred method
 * - Host/port/password - fallback method
 * - Exponential backoff and reconnection
 * - Connection pooling
 * 
 * Environment Variables:
 * - REDIS_URL: Full Redis connection string (e.g., redis://:password@host:6379)
 * - REDIS_HOST: Redis hostname (default: localhost)
 * - REDIS_PORT: Redis port (default: 6379)
 * - REDIS_PASSWORD: Redis password (optional)
 * - REDIS_DB: Redis database number (default: 0)
 * - REDIS_CONNECT_TIMEOUT: Connection timeout in ms (default: 5000)
 * - REDIS_MAX_RETRIES: Max connection retries (default: 5)
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  retryStrategy?: (times: number) => number;
  connectTimeout?: number;
  maxRetriesPerRequest?: number | null;
  enableReadyCheck?: boolean;
  enableOfflineQueue?: boolean;
  // BullMQ specific
  maxStalledCount?: number;
  stalledInterval?: number;
}

/**
 * Parse Redis connection string
 * Format: redis://[:password]@host:port[/db]
 */
function parseRedisUrl(url: string): Partial<RedisConfig> {
  try {
    const redisUrl = new URL(url);
    const password = redisUrl.password ? redisUrl.password : undefined;
    const host = redisUrl.hostname;
    const port = parseInt(redisUrl.port) || 6379;
    const db = redisUrl.pathname.slice(1) ? parseInt(redisUrl.pathname.slice(1)) : 0;

    const config: any = { host, port, db };
    if (password) config.password = password;
    return config;
  } catch (error) {
    console.error('[Redis Config] Failed to parse REDIS_URL:', error);
    return {};
  }
}

/**
 * Get Redis configuration from environment
 * Prioritizes REDIS_URL over individual host/port configuration
 */
export function getRedisConfig(): RedisConfig {
  const redisUrl = process.env.REDIS_URL;

  let config: RedisConfig;

  if (redisUrl) {
    // Use connection string if provided
    console.log('[Redis Config] Using REDIS_URL from environment');
    const parsed = parseRedisUrl(redisUrl);
    const cfgObj: any = {
      host: parsed.host || 'localhost',
      port: parsed.port || 6379,
      db: parsed.db || 0,
    };
    if (parsed.password) cfgObj.password = parsed.password;
    config = cfgObj;
  } else {
    // Fall back to host/port configuration
    const cfgObj: any = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: parseInt(process.env.REDIS_DB || '0'),
    };
    if (process.env.REDIS_PASSWORD) cfgObj.password = process.env.REDIS_PASSWORD;
    config = cfgObj;

    if (process.env.REDIS_HOST || process.env.REDIS_PORT) {
      console.log(`[Redis Config] Using host/port configuration: ${config.host}:${config.port}`);
    }
  }

  // Connection retry strategy with exponential backoff
  // Attempt to reconnect with increasing delays: 100ms, 200ms, 400ms, 800ms, 1600ms, etc.
  // Max retry time: 30 seconds
  config.retryStrategy = (times: number) => {
    const delay = Math.min(Math.pow(2, times) * 100, 30000);
    console.log(`[Redis Config] Retry attempt ${times + 1}, delay: ${delay}ms`);
    return delay;
  };

  // BullMQ and IORedis connection options
  config.connectTimeout = parseInt(process.env.REDIS_CONNECT_TIMEOUT || '5000');
  config.maxRetriesPerRequest = null; // Critical for BullMQ - disable auto-retry
  config.enableReadyCheck = true; // Wait for Redis to be ready before processing
  config.enableOfflineQueue = false; // Don't queue commands when disconnected

  // BullMQ stall detection (job marked as failed if took too long)
  config.maxStalledCount = 2;
  config.stalledInterval = 30000; // Check every 30 seconds

  return config;
}

/**
 * Validate Redis configuration
 * Returns any warnings or errors
 */
export function validateRedisConfig(): { valid: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];

  const redisUrl = process.env.REDIS_URL;
  const redisHost = process.env.REDIS_HOST;

  if (!redisUrl && !redisHost) {
    warnings.push('No Redis configuration found. Defaulting to localhost:6379');
  }

  const config = getRedisConfig();

  // Warn if using default localhost (probably not production-ready)
  if (config.host === 'localhost' && process.env.NODE_ENV === 'production') {
    errors.push('Redis localhost configuration in production. Set REDIS_URL or REDIS_HOST to remote server.');
  }

  // Warn if no password in production
  if (!config.password && process.env.NODE_ENV === 'production') {
    warnings.push('Redis password not configured in production. Consider adding REDIS_PASSWORD or authentication in REDIS_URL.');
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Get Redis configuration info for logging/debugging
 */
export function getRedisInfo() {
  const config = getRedisConfig();
  return {
    host: config.host,
    port: config.port,
    passwordSet: !!config.password,
    db: config.db,
    connectTimeout: config.connectTimeout,
    usingConnectionString: !!process.env.REDIS_URL,
  };
}

/**
 * Log Redis configuration on startup
 */
export function logRedisConfig() {
  const config = getRedisConfig();
  const validation = validateRedisConfig();

  console.log('[Redis Config] Initialized:', {
    host: config.host,
    port: config.port,
    db: config.db,
    passwordSet: !!config.password,
    connectTimeout: config.connectTimeout,
  });

  if (validation.errors.length > 0) {
    console.error('[Redis Config] Errors:', validation.errors);
  }

  if (validation.warnings.length > 0) {
    console.warn('[Redis Config] Warnings:', validation.warnings);
  }
}

export default getRedisConfig;
