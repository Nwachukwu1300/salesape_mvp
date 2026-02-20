/**
 * Supabase Server-Side Client
 * 
 * Initializes and exports Supabase client with service credentials.
 * Use this for authenticated operations (storage, database, etc.)
 * 
 * Environment Variables Required:
 * - SUPABASE_URL: Supabase project URL
 * - SUPABASE_SERVICE_KEY: Service role key (used server-side only)
 * 
 * Usage:
 *   import { supabaseServer } from './lib/supabase.server';
 *   await supabaseServer.storage.from('websites').upload('file.html', data);
 */

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Validate environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL) {
  console.warn('[Supabase] WARNING: SUPABASE_URL not set. Supabase features will be unavailable.');
}
if (!SUPABASE_SERVICE_KEY) {
  console.warn('[Supabase] WARNING: SUPABASE_SERVICE_KEY not set. Storage operations will fail.');
}

/**
 * Supabase server client
 * Initialized only if both URL and SERVICE_KEY are available
 */
export let supabaseServer: SupabaseClient | null = null;

// Initialize Supabase server client only if credentials are provided
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  try {
    supabaseServer = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY,
      {
        auth: {
          // Disable automatic refresh for server-side operations
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
    console.log('[Supabase] Server client initialized successfully');
  } catch (err) {
    console.error('[Supabase] Error initializing server client:', err instanceof Error ? err.message : String(err));
    supabaseServer = null;
  }
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_SERVICE_KEY);
}

/**
 * Get Supabase config info for logging/debugging
 */
export function getSupabaseInfo() {
  return {
    configured: isSupabaseConfigured(),
    url: SUPABASE_URL ? 'set' : 'missing',
    serviceKey: SUPABASE_SERVICE_KEY ? 'set' : 'missing',
  };
}

export default supabaseServer;
