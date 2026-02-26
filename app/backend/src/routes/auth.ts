/**
 * Authentication Routes
 * 
 * Handles secure token operations using HTTP-only cookies.
 * Provides secure refresh token storage on the server side.
 */

import express from 'express';
import type { Request, Response } from 'express';
import { Router } from 'express';

const router = Router();

/**
 * Generate a secure HTTP-only cookie
 */
function setRefreshTokenCookie(res: Response, refreshToken: string) {
  res.cookie('supabase-refresh-token', refreshToken, {
    httpOnly: true, // Cannot be accessed by JavaScript (XSS protection)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/', // Available to all routes
  });
}

/**
 * Clear refresh token cookie
 */
function clearRefreshTokenCookie(res: Response) {
  res.clearCookie('supabase-refresh-token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * POST /api/auth/set-refresh-cookie
 * 
 * Receives refresh token from frontend and stores it in HTTP-only cookie.
 * Frontend cannot directly read HTTP-only cookies (security feature).
 * 
 * Body: { refreshToken: string }
 * Response: { success: boolean }
 */
router.post('/api/auth/set-refresh-cookie', (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken || typeof refreshToken !== 'string') {
      return res.status(400).json({ error: 'Invalid refresh token' });
    }

    setRefreshTokenCookie(res, refreshToken);
    
    return res.json({ success: true, message: 'Refresh token stored securely' });
  } catch (error: any) {
    console.error('[Auth] Error setting refresh cookie:', error);
    return res.status(500).json({ error: 'Failed to set refresh token' });
  }
});

/**
 * POST /api/auth/clear-refresh-cookie
 * 
 * Clears the HTTP-only refresh token cookie.
 * Called on logout.
 * 
 * Response: { success: boolean }
 */
router.post('/api/auth/clear-refresh-cookie', (req: Request, res: Response) => {
  try {
    clearRefreshTokenCookie(res);
    return res.json({ success: true, message: 'Refresh token cleared' });
  } catch (error: any) {
    console.error('[Auth] Error clearing refresh cookie:', error);
    return res.status(500).json({ error: 'Failed to clear refresh token' });
  }
});

/**
 * POST /api/auth/refresh-token
 * 
 * Refresh access token using refresh token from HTTP-only cookie.
 * Frontend calls this endpoint when access token expires.
 * Backend uses refresh token from cookie to get new access token from Supabase.
 * 
 * This is a secure pattern:
 * 1. Frontend access token stored in memory only (short-lived)
 * 2. Refresh token stored in HTTP-only cookie by backend
 * 3. Frontend requests new access token from this endpoint
 * 4. Backend uses refresh token (safe from XSS) to get new token from Supabase
 * 5. Returns new access token to frontend (memory storage)
 * 
 * Response: { accessToken: string; expiresIn: number }
 */
router.post('/api/auth/refresh-token', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies['supabase-refresh-token'];

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token found' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    // Exchange refresh token for new access token
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok || !data.access_token) {
      console.error('[Auth] Supabase refresh failed:', data.error);
      clearRefreshTokenCookie(res);
      return res.status(401).json({ error: 'Failed to refresh token' });
    }

    // Update refresh token cookie if a new one was issued
    if (data.refresh_token && data.refresh_token !== refreshToken) {
      setRefreshTokenCookie(res, data.refresh_token);
    }

    // Return new access token to frontend (will be stored in memory)
    return res.json({
      accessToken: data.access_token,
      expiresIn: data.expires_in || 3600,
      tokenType: 'Bearer',
    });
  } catch (error: any) {
    console.error('[Auth] Error refreshing token:', error.message);
    return res.status(500).json({ error: 'Token refresh failed' });
  }
});

/**
 * GET /api/auth/status
 * 
 * Check if user has a valid refresh token (is logged in).
 * Useful for app initialization.
 * 
 * Response: { loggedIn: boolean }
 */
router.get('/api/auth/status', (req: Request, res: Response) => {
  const hasRefreshToken = !!req.cookies['supabase-refresh-token'];
  return res.json({ loggedIn: hasRefreshToken });
});

export default router;
