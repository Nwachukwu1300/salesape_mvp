import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment like the app does
dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('[test-supabase-direct] SUPABASE_URL or SUPABASE_SERVICE_KEY missing');
  process.exit(2);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function run() {
  try {
    console.log('[test-supabase-direct] calling storage.listBuckets()');
    const res = await supabase.storage.listBuckets();
    console.log('[test-supabase-direct] result:', JSON.stringify(res, null, 2));
    if (res.error) {
      console.error('[test-supabase-direct] error:', res.error);
      process.exit(1);
    }
    console.log('[test-supabase-direct] success — buckets:', (res.data || []).map(b=>b.name));
  } catch (err) {
    console.error('[test-supabase-direct] caught error:', err instanceof Error ? err.message : String(err));
    console.error(err);
    process.exit(1);
  }
}

run();
