import Redis from 'ioredis';
import getRedisConfig from './redis-config.js';
import { createContextLogger } from './logger.js';

const logger = createContextLogger('redis-client');

// Use a loose type for the Redis client to avoid strict typing issues with ioredis imports
let singleton: any = null;

/**
 * Create (if needed) and return a shared Redis client instance.
 * This implements a singleton pattern so the app re-uses one connection.
 */
export function createRedisClient(): any {
  if (singleton) return singleton;

  const cfg = getRedisConfig() as any;

  // Support both CJS and ESM shapes of ioredis package
  const IORedis: any = (Redis as any)?.default ?? Redis;

  // Construct ioredis client
  singleton = new IORedis(cfg as any);

  singleton.on('error', (err: any) => {
    logger.error('Redis error', { message: err instanceof Error ? err.message : String(err) });
  });

  singleton.on('connect', () => {
    logger.info('Redis client connect');
  });

  singleton.on('ready', () => {
    logger.info('Redis client ready');
  });

  singleton.on('close', () => {
    logger.info('Redis client closed');
  });

  return singleton;
}

export function getRedisClient(): any {
  if (!singleton) return createRedisClient();
  return singleton;
}

export async function closeRedisClient(): Promise<void> {
  if (!singleton) return;
  try {
    await singleton.quit();
  } catch (err) {
    // ignore
  }
  singleton = null;
}

// Simple helper to upsert a vector into Redis using a namespaced key/index.
// This implementation assumes a hash for metadata and a ZSET or a vector index managed externally.
export async function upsertVector(id: string, record: any): Promise<void> {
  const client = getRedisClient();
  const key = `memory:${record.userId}:${id}`;
  // store JSON blob for now
  await client.set(key, JSON.stringify(record), 'EX', 60 * 60 * 24 * 30); // expire 30d

  // If a vector index (like RedisVector/Redisearch) is configured elsewhere, integration points would go here.
}

// Export a convenience named redisClient for tests and other modules
export const redisClient = getRedisClient();

export default getRedisClient;
