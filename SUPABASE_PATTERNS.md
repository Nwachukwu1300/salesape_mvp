# Supabase Integration Patterns

## Overview

This document describes the standardized patterns for using Supabase across the SalesAPE application, including both frontend and backend implementations.

---

## Frontend Authentication (Client-side)

**Location:** `app/frontend/src/lib/supabase.ts`

### Architecture

The frontend uses **memory-only storage for access tokens** and **HTTP-only cookies for refresh tokens** (managed by backend).

```typescript
// Secure token storage
import { getAccessToken, setAccessToken, clearTokens } from './lib/supabase';

// Sign in
const result = await supabase.auth.signIn(email, password);
// - Access token stored in memory (cleared on tab close)
// - Refresh token sent to backend `/api/auth/set-refresh-cookie` for HTTP-only cookie

// Get current session
const token = getAccessToken();
// Returns null if not logged in

// Logout
await supabase.auth.signOut();
// - Clears all tokens from memory
// - Notifies backend to clear refresh cookie
```

### Security Properties

✅ **XSS Protection:**
- Access token in memory only (not persisted)
- Cannot be stolen via `localStorage` access
- Automatically cleared on tab close

✅ **CSRF Protection:**
- Refresh token in HTTP-only cookie with SameSite=Lax
- Frontend cannot directly access refresh token
- Backend validates all refresh operations

✅ **Token Expiry:**
- Access tokens short-lived (typically 1 hour)
- Automatic refresh via `/api/auth/refresh-token` endpoint
- Implements exponential backoff on repeated failures

---

## Backend Supabase Access

### Database Access (if needed)

**Location:** `app/backend/src/lib/supabase.server.ts`

```typescript
import { supabaseServer } from './lib/supabase.server';
import { isSupabaseConfigured } from './lib/supabase.server';

// Check if configured
if (!isSupabaseConfigured()) {
  console.warn('Supabase not configured');
  return;
}

// Use client for server-side operations
const { data, error } = await supabaseServer
  .from('your_table')
  .select('*')
  .eq('id', userId);
```

### File Storage (Recommended)

**Location:** `app/backend/src/services/storage.service.ts`

```typescript
import { storageService } from './storage.service';

// Upload file to websites bucket
const { path, publicUrl } = await storageService.uploadFile(
  'WEBSITES',
  `business-${businessId}/site.html`,
  htmlContent,
  { contentType: 'text/html' }
);

// Download file
const buffer = await storageService.downloadFile('WEBSITES', path);

// Get public URL
const url = storageService.getPublicUrl('VIDEOS', 'reel-123.mp4');

// Delete file
await storageService.deleteFile('AUDIO', 'voice-transcript.txt');

// List files in folder
const files = await storageService.listFiles('ASSETS', 'business-123/');
```

#### Available Buckets

| Bucket Name | Key | Purpose |
|---|---|---|
| `websites` | `WEBSITES` | HTML/CSS for generated websites |
| `videos` | `VIDEOS` | Raw video files for reel generation |
| `audio` | `AUDIO` | Audio files, voice transcripts, music |
| `generated-assets` | `ASSETS` | AI-generated images, processed videos, final reels |

#### Upload Options

```typescript
interface UploadOptions {
  contentType?: string;        // MIME type (auto-detected if omitted)
  cacheControl?: string;       // Cache header (default: 3600s)
  upsert?: boolean;           // Overwrite existing file
  metadata?: Record<string, any>; // Custom metadata
}
```

---

## Backend Authentication Endpoints

### Set Refresh Cookie

**Endpoint:** `POST /api/auth/set-refresh-cookie`

Called by frontend after sign-in to securely store refresh token in HTTP-only cookie.

```typescript
// Frontend usage
await fetch(`${window.location.origin}/api/auth/set-refresh-cookie`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});
```

### Clear Refresh Cookie

**Endpoint:** `POST /api/auth/clear-refresh-cookie`

Called on logout to clear the HTTP-only refresh token.

```typescript
await fetch(`${window.location.origin}/api/auth/clear-refresh-cookie`, {
  method: 'POST'
});
```

### Refresh Access Token

**Endpoint:** `POST /api/auth/refresh-token`

Called when access token expires. Backend uses refresh token (from HTTP-only cookie) to obtain new access token from Supabase.

```typescript
// Frontend implementation (recommended)
async function refreshAccessToken() {
  const response = await fetch(`${window.location.origin}/api/auth/refresh-token`, {
    method: 'POST',
    credentials: 'include' // Send HTTP-only cookies
  });
  
  if (!response.ok) {
    // Redirect to login if refresh fails
    window.location.href = '/login';
    return null;
  }
  
  const { accessToken } = await response.json();
  return accessToken;
}
```

### Auth Status

**Endpoint:** `GET /api/auth/status`

Check if user is logged in without requiring auth token.

```typescript
const response = await fetch(`${window.location.origin}/api/auth/status`);
const { loggedIn } = await response.json();
```

---

## Environment Configuration

### Frontend (.env)

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (.env.local / .env)

```bash
# Supabase API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Storage Buckets (override defaults if needed)
SUPABASE_BUCKET_WEBSITES=websites
SUPABASE_BUCKET_VIDEOS=videos
SUPABASE_BUCKET_AUDIO=audio
SUPABASE_BUCKET_ASSETS=generated-assets
```

**Note:** Service role key should never be exposed to frontend. Only anon key is used clientside.

---

## Storage Integration Examples

### Website Generation

```typescript
import { storageService } from './services/storage.service';

async function saveGeneratedWebsite(businessId: string, html: string) {
  const { path, publicUrl } = await storageService.uploadFile(
    'WEBSITES',
    `business-${businessId}/index.html`,
    html,
    { contentType: 'text/html', cacheControl: '86400' }
  );
  
  // Save publicUrl to database
  await prisma.business.update({
    where: { id: businessId },
    data: { websiteUrl: publicUrl }
  });
}
```

### Reel Video Storage

```typescript
async function storeGeneratedReel(reelId: string, videoBuffer: Buffer) {
  const { path, publicUrl } = await storageService.uploadFile(
    'ASSETS',
    `reels/${reelId}.mp4`,
    videoBuffer,
    { contentType: 'video/mp4' }
  );
  
  // Return URL for frontend playback or social posting
  return { storagePath: path, publicUrl };
}
```

### Audio/Voice Storage

```typescript
async function storeVoiceTranscript(businessId: string, audioBuffer: Buffer) {
  const { path, publicUrl } = await storageService.uploadFile(
    'AUDIO',
    `business-${businessId}/transcript-${Date.now()}.wav`,
    audioBuffer,
    { contentType: 'audio/wav' }
  );
  
  return path; // Store path in database for later retrieval
}
```

---

## Error Handling

### Storage Service Errors

```typescript
try {
  await storageService.uploadFile('WEBSITES', path, data);
} catch (error) {
  if (error.message.includes('404')) {
    console.error('Bucket not found - ensure bucket exists in Supabase');
  } else if (error.message.includes('403')) {
    console.error('Permission denied - check bucket policies');
  } else {
    console.error('Upload failed:', error.message);
  }
}
```

### Authentication Errors

```typescript
if (error === 'No refresh token found') {
  // User session expired or not logged in
  window.location.href = '/login';
}
```

---

## Best Practices

### 1. Use Storage Service for All File Operations

❌ **Don't:** Call Supabase directly from multiple places
```typescript
const { data, error } = await supabaseServer.storage.from('bucket').upload(...);
```

✅ **Do:** Use centralized storage service
```typescript
const { path, publicUrl } = await storageService.uploadFile('ASSETS', ..., data);
```

### 2. Handle Token Expiry Gracefully

❌ **Don't:** Assume access token never expires
```typescript
const token = getAccessToken();
// Assume token is always valid
```

✅ **Do:** Implement token refresh with retry logic
```typescript
async function apiCallWithTokenRefresh() {
  let token = getAccessToken();
  
  try {
    return await apiCall(token);
  } catch (error) {
    if (error.status === 401) {
      token = await refreshAccessToken();
      if (token) return await apiCall(token);
    }
    throw error;
  }
}
```

### 3. Never Expose Service Key to Frontend

❌ **Don't:**
```typescript
// .env
VITE_SUPABASE_SERVICE_KEY=secret-key  // ❌ WRONG - exposed to browser
```

✅ **Do:**
```typescript
// .env (backend only)
SUPABASE_SERVICE_KEY=secret-key  // ✅ Safe - never sent to frontend
```

### 4. Use Appropriate Bucket for Content Type

```typescript
// Website HTML → WEBSITES bucket
await storageService.uploadFile('WEBSITES', 'site.html', ...);

// Generated reel → ASSETS bucket
await storageService.uploadFile('ASSETS', 'reel.mp4', ...);

// Voice input → AUDIO bucket
await storageService.uploadFile('AUDIO', 'voice.wav', ...);
```

### 5. Clean Up Old Files

```typescript
// Delete old assets after regeneration
await storageService.deleteFile('ASSETS', oldPath);

// List and delete expired files
const oldFiles = await storageService.listFiles('AUDIO', 'expired/');
for (const file of oldFiles) {
  await storageService.deleteFile('AUDIO', `expired/${file.name}`);
}
```

---

## Debugging

### Check Configuration

```typescript
import { getSupabaseInfo } from './lib/supabase.server';

const info = getSupabaseInfo();
console.log('Supabase Config:', info);
// Output: {
//   configured: true,
//   url: 'set',
//   serviceKey: 'set'
// }
```

### Storage Service Config

```typescript
import { storageService } from './services/storage.service';

const config = storageService.getBucketConfig();
console.log('Storage Buckets:', config);
```

### Verify Token Storage (Frontend)

```typescript
// Check if token is in memory (not localStorage)
console.log('Access Token:', getAccessToken() ? '[TOKEN_PRESENT]' : 'NOT_SET');
console.log('localStorage has token?', localStorage.getItem('supabase.auth.token')); // Should be null

// Check if refresh token is in HTTP-only cookie (cannot access from JS)
// But verify via /api/auth/status endpoint
const { loggedIn } = await (await fetch('/api/auth/status')).json();
console.log('Logged In:', loggedIn);
```

---

## Migration Guide

If migrating from old patterns:

### Old (localStorage - insecure)
```typescript
localStorage.setItem('supabase.auth.token', token);
const token = localStorage.getItem('supabase.auth.token');
```

### New (memory + HTTP-only cookie)
```typescript
setAccessToken(token);
const token = getAccessToken();

// Refresh token handles automatically by backend
```

---

## Support & Troubleshooting

### Supabase Not Configured
- Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set in `.env`
- Verify keys in Supabase dashboard (Project Settings → API)

### Bucket Not Found
- Create buckets in Supabase dashboard (Storage menu)
- Edit bucket settings if needed (public/private, CORS, etc.)

### Upload Failures
- Check bucket policies allow service role uploads
- Verify file path doesn't exceed length limits
- Ensure content-type is appropriate

### Token Refresh Fails
- Check `/api/auth/refresh-token` endpoint is registered in backend
- Verify `cookie-parser` middleware is enabled
- Ensure HTTPS in production (cookies require Secure flag)

---

**Last Updated:** February 19, 2026
**Maintainer:** SalesAPE Team
