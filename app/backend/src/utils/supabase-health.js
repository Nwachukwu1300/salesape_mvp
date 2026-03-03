// Lightweight Supabase readiness helper
import { supabaseServer, isSupabaseConfigured, getSupabaseInfo } from '../lib/supabase.server.js';

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withTimeout(promise, timeoutMs) {
  let timer = null;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`supabase readiness timeout after ${timeoutMs}ms`)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function ensureSupabaseReady({ retries = 3, timeoutMs = 5000 } = {}) {
  if (!isSupabaseConfigured()) {
    throw new Error('[supabase-health] Supabase not configured (SUPABASE_URL or SERVICE_KEY missing)');
  }

  if (!supabaseServer) {
    throw new Error('[supabase-health] Supabase client not initialized');
  }

  let lastErr = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Try a lightweight storage API call to verify connectivity and permissions
      // supabase-js v2: storage.listBuckets
      const res = await withTimeout(supabaseServer.storage.listBuckets(), timeoutMs);

      if (res.error) {
        lastErr = res.error;
        throw res.error;
      }

      // Success
      return true;
    } catch (err) {
      lastErr = err;
      try {
        const msg = err && err.message ? err.message : String(err);
        console.warn(`[supabase-health] attempt ${attempt} failed: ${msg}`);
        if (err && err.code) console.warn('[supabase-health] error code:', err.code);
      } catch (e) {
        // ignore
      }
      const delay = Math.min(1000 * attempt, 3000);
      // eslint-disable-next-line no-await-in-loop
      await wait(delay);
    }
  }

  const info = getSupabaseInfo ? getSupabaseInfo() : { configured: true };
  const msg = `[supabase-health] Supabase did not become ready after ${retries} attempts. info=${JSON.stringify(info)}`;
  const e = new Error(msg);
  e.cause = lastErr;
  throw e;
}

export default ensureSupabaseReady;
