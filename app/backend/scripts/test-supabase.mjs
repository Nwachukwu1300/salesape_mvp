import dotenv from 'dotenv';
import { supabaseServer, isSupabaseConfigured, getSupabaseInfo } from '../src/lib/supabase.server.js';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function run() {
  console.log('[test-supabase] isSupabaseConfigured:', isSupabaseConfigured());
  console.log('[test-supabase] supabaseServer present:', !!supabaseServer);
  try {
    if (!isSupabaseConfigured()) {
      console.error('[test-supabase] Supabase not configured');
      process.exit(2);
    }

    if (!supabaseServer) {
      console.error('[test-supabase] supabaseServer is null');
      process.exit(3);
    }

    console.log('[test-supabase] calling storage.listBuckets()');
    const res = await supabaseServer.storage.listBuckets();
    console.log('[test-supabase] result:', JSON.stringify(res, null, 2));
    if (res.error) {
      console.error('[test-supabase] storage.listBuckets error:', res.error);
      process.exit(1);
    }
    console.log('[test-supabase] success — buckets count:', (res.data || []).length);
  } catch (err) {
    console.error('[test-supabase] caught error:', err instanceof Error ? err.message : String(err));
    console.error(err);
    process.exit(1);
  }
}

run();
