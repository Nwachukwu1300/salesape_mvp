// Lightweight Supabase auth using REST API with secure token handling
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// In-memory token storage (cleared on tab close)
let memoryAccessToken: string | null = null;

export interface AuthSession {
  access_token: string;
  refresh_token?: string;
  user?: {
    id: string;
    email: string;
    user_metadata?: Record<string, any>;
  };
}

/**
 * Get access token from memory
 * Returns null if not logged in
 */
function getAccessToken(): string | null {
  return memoryAccessToken;
}

/**
 * Set access token in memory only (not persisted to localStorage)
 */
function setAccessToken(token: string | null) {
  memoryAccessToken = token;
}

/**
 * Get refresh token from HTTP-only cookie (handled by backend)
 * Browser cannot directly read HTTP-only cookies for security
 */
function getRefreshToken(): string | null {
  // In a production setup with HTTP-only cookies, the backend handles refresh
  // Frontend never directly accesses refresh token
  // For now, we can optionally store in memory if needed for in-app operations
  try {
    return sessionStorage.getItem('supabase.refresh.token') || null;
  } catch {
    return null;
  }
}

/**
 * Set refresh token in sessionStorage (cleared on tab close)
 */
function setRefreshToken(token: string | null) {
  if (token) {
    try {
      sessionStorage.setItem('supabase.refresh.token', token);
    } catch {
      console.warn('Failed to store refresh token in sessionStorage');
    }
  } else {
    try {
      sessionStorage.removeItem('supabase.refresh.token');
    } catch {}
  }
}

/**
 * Clear all tokens
 */
function clearTokens() {
  memoryAccessToken = null;
  setRefreshToken(null);
}

export const supabase = {
  auth: {
    async signUp(email: string, password: string) {
      console.log('Supabase SignUp:', email);
      const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      console.log('SignUp response:', data);
      
      // Check for errors
      if (!response.ok) {
        const errorMsg = data.msg || data.error_description || data.message || data.error || 'Sign up failed';
        console.error('SignUp error:', errorMsg);
        return { data: null, error: { message: errorMsg } };
      }
      
      // After successful signup, get access token by calling token endpoint
      if (data.id) {
        console.log('User created, now getting tokens...');
        try {
          const tokenResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({ email, password }),
          });
          const tokenData = await tokenResponse.json();
          console.log('Token response status:', tokenResponse.status, 'hasToken:', !!tokenData.access_token);
          
          if (tokenResponse.ok && tokenData.access_token) {
            // Store tokens securely
            setAccessToken(tokenData.access_token);
            setRefreshToken(tokenData.refresh_token || '');
            
            // Notify backend to set HTTP-only refresh cookie
            if (tokenData.refresh_token) {
              await fetch(`${window.location.origin}/api/auth/set-refresh-cookie`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: tokenData.refresh_token }),
              }).catch(err => console.error('Failed to set refresh cookie:', err));
            }
            
            console.log('SignUp successful, token stored in memory');
          } else {
            console.warn('Token endpoint did not return access token');
          }
        } catch (err) {
          console.error('Failed to get token after signup:', err);
        }
      }
      
      return { data: data, error: null };
    },

    async signIn(email: string, password: string) {
      console.log('Supabase SignIn:', email);
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      console.log('SignIn response status:', response.status, 'hasToken:', !!data.access_token);
      
      // Check for errors
      if (!response.ok) {
        const errorMsg = data.msg || data.error_description || data.message || data.error || 'Sign in failed';
        console.error('SignIn error:', errorMsg, 'Status:', response.status);
        return { data: null, error: { message: errorMsg } };
      }
      
      if (data.access_token) {
        // Store tokens securely
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token || '');
        
        // Notify backend to set HTTP-only refresh cookie
        if (data.refresh_token) {
          await fetch(`${window.location.origin}/api/auth/set-refresh-cookie`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: data.refresh_token }),
          }).catch(err => console.error('Failed to set refresh cookie:', err));
        }
        
        console.log('SignIn successful, token stored in memory');
        return { data: { session: data, user: data.user }, error: null };
      } else {
        const errorMsg = 'No access token in response';
        console.error('SignIn error:', errorMsg);
        return { data: null, error: { message: errorMsg } };
      }
    },

    async signOut() {
      const token = getAccessToken();
      if (token) {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': SUPABASE_ANON_KEY,
          },
        }).catch(() => {});
      }
      // Clear all tokens
      clearTokens();
      
      // Notify backend to clear refresh cookie
      await fetch(`${window.location.origin}/api/auth/clear-refresh-cookie`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch(err => console.error('Failed to clear refresh cookie:', err));
    },

    async getSession() {
      const token = getAccessToken();
      return { data: { session: token ? { access_token: token } : null } };
    },

    onAuthStateChange(callback: (event: string, session: any) => void) {
      // Simple implementation
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
  },
};

export type Database = any;

// Export token management functions for direct use if needed
export { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken, clearTokens };

