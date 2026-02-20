import { createContextLogger } from './logger.js';
import { createRedisClient, closeRedisClient, getRedisClient } from './redis-client.js';

const logger = createContextLogger('redis-health');

export async function ensureRedisReady(opts?: { timeoutMs?: number; retries?: number }) {
  const timeoutMs = opts?.timeoutMs ?? 5000;
  const retries = opts?.retries ?? 5;
  let lastErr: any = null;

  // Create or reuse the shared client
  createRedisClient();

  for (let attempt = 1; attempt <= retries; attempt++) {
    const client = getRedisClient();
    try {
      const pingPromise = client.ping();
      const res = await Promise.race([
        pingPromise,
        new Promise((_, rej) => setTimeout(() => rej(new Error('ping timeout')), timeoutMs)),
      ]);
      logger.info('Redis ping successful', { res });
      return true;
    } catch (err) {
      lastErr = err;
      logger.warn('Redis ping failed', { attempt, message: err instanceof Error ? err.message : String(err) });
      // On failure, try to restart the client for next attempt
      try {
        await closeRedisClient();
      } catch (_) {}
      // exponential backoff between attempts
      const waitMs = Math.min(500 * Math.pow(2, attempt - 1), 5000);
      await new Promise((r) => setTimeout(r, waitMs));
      // recreate client for next loop
      createRedisClient();
    }
  }

  logger.error('Redis did not become ready', { error: lastErr instanceof Error ? lastErr.message : String(lastErr) });
  throw lastErr || new Error('Redis health check failed');
}

export default ensureRedisReady;
