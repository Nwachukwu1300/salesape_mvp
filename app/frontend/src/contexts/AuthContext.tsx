import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

function parseJwt(token: string | null) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(payload).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    const token = localStorage.getItem('supabase.auth.token');
    if (token) {
      inactivityTimerRef.current = setTimeout(() => {
        console.log('Inactivity timeout - auto signing out');
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('supabase.refresh.token');
        setUser(null);
        alert('You have been signed out due to inactivity.');
      }, INACTIVITY_TIMEOUT);
    }
  };

  useEffect(() => {
    console.log('=== AuthProvider useEffect initializing ===');
    const token = localStorage.getItem('supabase.auth.token');
    console.log('Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NOT FOUND');
    if (token) {
      const payload = parseJwt(token);
      console.log('Parsed JWT payload:', payload);
      if (payload && payload.sub) {
        setUser({ id: payload.sub, email: payload.email });
        console.log('User set from token:', payload.sub);
      } else {
        console.log('Invalid token payload');
      }
    }

    // Set up activity listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => {
      resetInactivityTimer();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Initial timer
    resetInactivityTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/g, '');
      console.log('=== SignIn START ===');
      console.log('Email:', email);
      console.log('API_BASE:', API_BASE);
      
      const endpoint = `${API_BASE}/auth/login`;
      console.log('Calling endpoint:', endpoint);
      
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Response status:', resp.status);
      console.log('Response headers:', Object.fromEntries(resp.headers.entries()));
      
      const body = await resp.json();
      console.log('Response body keys:', Object.keys(body));
      console.log('Response body has token:', !!body.token);
      console.log('Response body has user:', !!body.user);
      console.log('Full response:', { token: body.token ? 'EXISTS' : 'MISSING', user: body.user, error: body.error });
      
      if (!resp.ok) {
        const errMsg = body.error || body.details || 'Sign in failed';
        console.error('SignIn failed with error:', errMsg);
        throw new Error(errMsg);
      }
      
      if (!body.token) {
        console.error('Response missing token field');
        throw new Error('No token in response');
      }
      
      console.log('About to save token to localStorage');
      localStorage.setItem('supabase.auth.token', body.token);
      
      // Verify token was saved
      const savedToken = localStorage.getItem('supabase.auth.token');
      console.log('Token save verification:', {
        saved: !!savedToken,
        length: savedToken?.length,
        starts: savedToken?.substring(0, 20)
      });
      
      if (!savedToken) {
        console.error('CRITICAL: Token was not saved to localStorage!');
        throw new Error('Failed to save token to localStorage');
      }
      
      // Parse and set user
      if (body.user) {
        setUser({ 
          id: body.user.id, 
          email: body.user.email, 
          full_name: body.user.name 
        });
        console.log('User set successfully:', { id: body.user.id, email: body.user.email });
      }
      
      resetInactivityTimer();
      console.log('=== SignIn SUCCESS ===');
    } catch (err: any) {
      console.error('=== SignIn FAILED ===');
      console.error('Error:', err);
      console.error('Error message:', err?.message);
      console.error('Error stack:', err?.stack);
      alert(`Sign in failed: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    try {
      const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/g, '');
      console.log('=== SignUp START ===');
      console.log('Email:', email);
      console.log('API_BASE:', API_BASE);
      
      const endpoint = `${API_BASE}/auth/register`;
      console.log('Calling endpoint:', endpoint);
      
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: fullName }),
      });
      
      console.log('Response status:', resp.status);
      const body = await resp.json();
      console.log('Response has token:', !!body.token);
      
      if (!resp.ok) {
        const errMsg = body.error || body.details || 'Sign up failed';
        console.error('SignUp failed:', errMsg);
        throw new Error(errMsg);
      }
      
      if (body.token) {
        console.log('Saving token to localStorage');
        localStorage.setItem('supabase.auth.token', body.token);
        
        // Verify
        const saved = localStorage.getItem('supabase.auth.token');
        console.log('Token saved:', !!saved);
        
        setUser({ id: body.user.id, email: body.user.email, full_name: body.user.name });
        resetInactivityTimer();
        console.log('=== SignUp SUCCESS ===');
      } else {
        throw new Error('No token in response');
      }
    } catch (err: any) {
      console.error('=== SignUp FAILED ===', err);
      alert(`Sign up failed: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('supabase.auth.token');
      
      // Call logout on backend if token exists
      if (token) {
        const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/g, '');
        try {
          await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (err) {
          console.error('Error calling logout endpoint:', err);
          // Continue with local cleanup even if backend fails
        }
      }
      
      // Clear all auth data from localStorage
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase.refresh.token');
      localStorage.removeItem('user');
      
      // Clear state
      setUser(null);
      
      // Clear inactivity timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      
      console.log('=== SignOut SUCCESS ===');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/g, '');
    window.location.href = `${API_BASE}/auth/google`;
  };

  const signInWithApple = async () => {
    const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/g, '');
    window.location.href = `${API_BASE}/auth/apple`;
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/g, '');
      await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getToken = () => localStorage.getItem('supabase.auth.token');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        signInWithApple,
        resetPassword,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
