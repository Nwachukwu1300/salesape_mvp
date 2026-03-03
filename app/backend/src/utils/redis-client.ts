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

  // Quick dev bypass: if workers/Redis should be skipped, return a noop in-memory stub
  if (process.env.REDIS_SKIP_WORKERS === 'true') {
    // Minimal stub implementing commonly used methods to avoid runtime errors
    const stub: any = {
      _isStub: true,
      on: (_ev: string, _cb: any) => {},
      once: (_ev: string, _cb: any) => {},
      quit: async () => {},
      disconnect: () => {},
      set: async (_k: string, _v: any, ..._args: any[]) => 'OK',
      get: async (_k: string) => null,
      del: async (_k: string) => 0,
      zadd: async (_k: string, ..._args: any[]) => 0,
      xadd: async (_k: string, ..._args: any[]) => '0-0',
      lpush: async (_k: string, ..._args: any[]) => 0,
      rpush: async (_k: string, ..._args: any[]) => 0,
      publish: async (_ch: string, _msg: string) => 0,
    };
    singleton = stub;
    // eslint-disable-next-line no-console
    console.log('[redis-client] REDIS_SKIP_WORKERS=true — using in-memory stub Redis client');
    return singleton;
  }

  const cfg = getRedisConfig() as any;

  // Support both CJS and ESM shapes of ioredis package
  const IORedis: any = (Redis as any)?.default ?? Redis;

  // Construct ioredis client
  // If using Redis Cloud / TLS endpoint, enable TLS options. Also merge
  // higher-level connection options provided by `getRedisConfig()`.
  const opts: any = { ...(cfg || {}) };

  const hostLooksLikeCloud = typeof opts.host === 'string' && opts.host.includes('.redis');

  // Respect explicit REDIS_TLS setting if provided; otherwise infer from URL or host
  let wantTls: boolean;
  if (typeof process.env.REDIS_TLS !== 'undefined') {
    wantTls = process.env.REDIS_TLS === 'true';
  } else if (process.env.REDIS_URL && String(process.env.REDIS_URL).startsWith('rediss://')) {
    wantTls = true;
  } else {
    wantTls = hostLooksLikeCloud;
  }

  if (wantTls) {
    opts.tls = opts.tls ?? {};
    // Ensure SNI (server name) is set so OpenSSL uses the correct hostname
    // for TLS negotiation. Some cloud Redis providers require SNI.
    if (!opts.tls.servername && opts.host) {
      opts.tls.servername = opts.host;
    }
  }

  // If TLS is explicitly not wanted, ensure no tls option is present
  if (!wantTls && opts.tls) {
    delete opts.tls;
  }

  // Log the options used to construct the ioredis client for debugging
  // Print to console so we can always see the values during startup
  // (logger may filter info level in some environments)
  // eslint-disable-next-line no-console
  console.log('[redis-client] constructing ioredis with options:', {
    host: opts.host,
    port: opts.port,
    passwordSet: !!opts.password,
    enableOfflineQueue: opts.enableOfflineQueue,
    enableReadyCheck: opts.enableReadyCheck,
    connectTimeout: opts.connectTimeout,
    tls: opts.tls ? true : false,
  });

  logger.info('Redis client options', {
    host: opts.host,
    port: opts.port,
    passwordSet: !!opts.password,
    enableOfflineQueue: opts.enableOfflineQueue,
    enableReadyCheck: opts.enableReadyCheck,
    connectTimeout: opts.connectTimeout,
    tls: opts.tls ? true : false,
  });

  singleton = new IORedis(opts as any);

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
