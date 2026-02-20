import Redis from 'ioredis';
import getRedisConfig from './redis-config.js';
import { createContextLogger } from './logger.js';

const logger = createContextLogger('redis-client');

let singleton: Redis | null = null;

/**
 * Create (if needed) and return a shared Redis client instance.
 * This implements a singleton pattern so the app re-uses one connection.
 */
export function createRedisClient(): Redis {
  if (singleton) return singleton;

  const cfg = getRedisConfig() as any;
  singleton = new Redis(cfg);

  singleton.on('error', (err) => {
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

export function getRedisClient(): Redis {
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

export default getRedisClient;
