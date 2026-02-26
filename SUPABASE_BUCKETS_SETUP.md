# Supabase Storage Buckets Setup Guide

**Date:** February 22, 2026  
**Purpose:** Create storage buckets for SalesAPE MVP  
**Status:** ⏳ READY TO EXECUTE

---

## Overview

The SalesAPE application requires 4 storage buckets in Supabase to function properly:

| Bucket | Purpose | Max Size | Retention |
|--------|---------|----------|-----------|
| `websites` | Generated website HTML/CSS assets | 100MB | No limit |
| `videos` | Raw video files for reel generation | 500MB | 30 days |
| `audio` | Audio files & voice transcripts | 100MB | 30 days |
| `generated-assets` | AI-generated images, processed videos, reels | 500MB | 30 days |

---

## Step 1: Access Supabase Dashboard

1. Go to [supabase.com](https://supabase.com)
2. Log in with your project credentials
3. Select your SalesAPE project
4. Navigate to **Storage** in the left sidebar

---

## Step 2: Create Buckets

### Bucket 1: `websites`

**Purpose:** Static website HTML, CSS, and configuration files

**Instructions:**
1. Click **"New bucket"**
2. Enter name: `websites`
3. Set **Access Level:** `Private` (files accessed via signed URLs)
4. Click **Create bucket**

**Sentry Policies (Optional - for public access):**
```
-- Allow public read of websites
ALTER ROLE authenticated USING (bucket_id = 'websites');
GRANT SELECT ON storage.objects TO authenticated WHEN (bucket_id = 'websites');
```

---

### Bucket 2: `videos`

**Purpose:** Raw and processed video files for content repurposing

**Instructions:**
1. Click **"New bucket"**
2. Enter name: `videos`
3. Set **Access Level:** `Private`
4. Click **Create bucket**

**Retention Policy (Optional - auto-delete after 30 days):**
- Backend cleanup job reads file `created_at` and deletes old files
- See `src/workers/storage-cleanup.worker.ts` for implementation

---

### Bucket 3: `audio`

**Purpose:** Audio files, voice transcripts, and background music

**Instructions:**
1. Click **"New bucket"**
2. Enter name: `audio`
3. Set **Access Level:** `Private`
4. Click **Create bucket**

---

### Bucket 4: `generated-assets`

**Purpose:** AI-generated images, processed videos, repurposed content

**Instructions:**
1. Click **"New bucket"**
2. Enter name: `generated-assets`
3. Set **Access Level:** `Private` (or `Public` if you want public access to generated assets)
4. Click **Create bucket**

---

## Step 3: Set Bucket Retention Policies (Optional)

Supabase doesn't have native retention policies, but you can implement automatic cleanup:

**Option A: Backend Cleanup Job** (Recommended)

Add to `src/workers/storage-cleanup.worker.ts`:

```typescript
import { supabaseServer } from '../lib/supabase.server.js';
import { createContextLogger } from '../utils/logger.js';

const logger = createContextLogger('storage-cleanup');

async function cleanupOldFiles() {
  const client = supabaseServer;
  const RETENTION_DAYS = 30;
  const cutoffDate = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

  // Clean videos bucket
  const { data: videoFiles } = await client
    .storage
    .from('videos')
    .list();

  for (const file of videoFiles || []) {
    const createdAt = new Date(file.created_at);
    if (createdAt < cutoffDate) {
      await client.storage.from('videos').remove([file.name]);
      logger.info('Deleted old video file', { name: file.name, createdAt });
    }
  }

  // Clean audio bucket
  const { data: audioFiles } = await client
    .storage
    .from('audio')
    .list();

  for (const file of audioFiles || []) {
    const createdAt = new Date(file.created_at);
    if (createdAt < cutoffDate) {
      await client.storage.from('audio').remove([file.name]);
      logger.info('Deleted old audio file', { name: file.name, createdAt });
    }
  }
}

export { cleanupOldFiles };
```

---

## Step 4: Configure RLS Policies (Row Level Security)

These are **optional** but recommended for security:

### Authenticated User Upload Policy

In Supabase Dashboard > Storage > Bucket > RLS Policies:

**For `websites` bucket:**

```sql
-- Allow authenticated users to upload their own files
CREATE POLICY "Auth users can upload websites"
ON storage.objects FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'websites')

-- Allow authenticated users to read their own files
CREATE POLICY "Auth users can read websites"
ON storage.objects FOR SELECT
USING (auth.role() = 'authenticated' AND bucket_id = 'websites')
```

**For `generated-assets` bucket:**

```sql
-- Allow authenticated users to upload
CREATE POLICY "Auth users can upload assets"
ON storage.objects FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'generated-assets')

-- Allow public read for public URLs
CREATE POLICY "Public users can read assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'generated-assets')
```

---

## Step 5: Configure Environment Variables

Add to `.env` (or `.env.local`):

```env
# Supabase Storage Configuration
SUPABASE_BUCKET_WEBSITES=websites
SUPABASE_BUCKET_VIDEOS=videos
SUPABASE_BUCKET_AUDIO=audio
SUPABASE_BUCKET_ASSETS=generated-assets

# OR use defaults (no env vars needed if using default names)
```

If not set, the application will use the default names:
- `SUPABASE_BUCKET_WEBSITES` → defaulted to `"websites"`
- `SUPABASE_BUCKET_VIDEOS` → defaulted to `"videos"`
- `SUPABASE_BUCKET_AUDIO` → defaulted to `"audio"`
- `SUPABASE_BUCKET_ASSETS` → defaulted to `"generated-assets"`

---

## Step 6: Test Bucket Access

### Via Backend

Run this test script:

```bash
cd app/backend
node scripts/test-storage.js
```

**Test script content** (`scripts/test-storage.js`):

```javascript
import { storageService } from '../src/services/storage.service.js';

async function testBuckets() {
  const buckets = ['WEBSITES', 'VIDEOS', 'AUDIO', 'ASSETS'];
  
  for (const bucket of buckets) {
    try {
      const testFile = `test-${Date.now()}.txt`;
      const { path, publicUrl } = await storageService.uploadFile(
        bucket,
        testFile,
        'Test content',
        { contentType: 'text/plain' }
      );
      console.log(`✅ ${bucket}: Upload successful - ${path}`);
      
      // Clean up
      await storageService.deleteFile(bucket, testFile);
    } catch (error) {
      console.error(`❌ ${bucket}: ${error.message}`);
    }
  }
}

testBuckets().catch(console.error);
```

### Via Frontend (Optional)

```typescript
import { supabase } from './lib/supabase';

async function testBucketAccess() {
  const testFile = await fetch('data:text/plain,test').then(r => r.blob());
  
  try {
    const { data, error } = await supabase.storage
      .from('websites')
      .upload(`test-${Date.now()}.txt`, testFile, { upsert: false });
    
    if (error) {
      console.error('Upload failed:', error.message);
    } else {
      console.log('✅ Bucket access working:', data);
    }
  } catch (err) {
    console.error('❌ Storage test failed:', err);
  }
}
```

---

## Step 7: Configure CORS (If Needed)

If frontend directly uploads to Supabase (not recommended):

In Supabase Dashboard > Project Settings > API:

**Add CORS headers:**

```
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, HEAD, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Verification Checklist

- [ ] 4 buckets created (`websites`, `videos`, `audio`, `generated-assets`)
- [ ] Environment variables configured (if using custom names)
- [ ] RLS policies set (optional but recommended)
- [ ] Test upload successful
- [ ] Backend storage service can access all buckets
- [ ] No 403 Forbidden errors when uploading

---

## Troubleshooting

### Error: `"Generated-assets" bucket not found`

**Fix:** Make sure bucket name is `generated-assets` (with hyphen), not `generatedassets` or `generated_assets`

### Error: `403 Forbidden - User does not have permission`

**Fix:** 
1. Check RLS policies are not blocking service role key
2. Ensure `SUPABASE_SERVICE_KEY` has admin access
3. Check bucket is not set to `Private` mode globally

### Error: `ENOENT - No such file or directory`

**Fix:** Bucket names are case-sensitive. Use exact lowercase names:
- `websites` ✅
- `videos` ✅
- `audio` ✅
- `generated-assets` ✅

---

## Next Steps

After buckets are created:

1. **Start workers:** See `WORKERS_IMPLEMENTATION_COMPLETE.md`
2. **Test content ingestion:** Upload a test URL to content-ingestion queue
3. **Monitor storage usage:** Check Supabase Dashboard > Storage > Usage
4. **Set up cleanup jobs:** Implement auto-deletion of old files (optional)

---

## Support

For issues:

1. Check Supabase logs: Dashboard > Logs > Storage
2. Verify API keys have correct permissions: Dashboard > Project Settings > API
3. Enable debug logging in storage service: `src/services/storage.service.ts` (set `DEBUG=true`)

