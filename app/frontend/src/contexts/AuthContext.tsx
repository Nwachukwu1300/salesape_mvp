import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { supabase, getAccessToken, setAccessToken } from '../lib/supabase';

// Dynamic API URL: uses the same host as the frontend but on port 3001
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return `http://${hostname}:3001`;
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

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
  const [loading, setLoading] = useState(true);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    const token = getAccessToken();
    if (token) {
      inactivityTimerRef.current = setTimeout(() => {
        console.log('Inactivity timeout - auto signing out');
        signOut();
      }, INACTIVITY_TIMEOUT);
    }
  };

  useEffect(() => {
    console.log('=== AuthProvider useEffect initializing ===');
    setLoading(true);
    
    // Try to load session from memory/storage
    const loadSession = async () => {
      try {
        // Get current session from memory
        const token = getAccessToken();
        console.log('Token from memory:', token ? `${token.substring(0, 20)}...` : 'NOT FOUND');
        
        if (token) {
          const payload = parseJwt(token);
          console.log('Parsed JWT payload:', payload);
          if (payload && payload.sub) {
            setUser({ id: payload.sub, email: payload.email });
            console.log('User set from token:', payload.sub);
            resetInactivityTimer();
          } else {
            console.log('Invalid token payload');
            setAccessToken(null);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error loading session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadSession();

    // Set up activity listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => {
      resetInactivityTimer();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

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
      console.log('=== Supabase SignIn START ===');
      const result = await supabase.auth.signIn(email, password);
      console.log('SignIn result:', { hasError: !!result.error, hasData: !!result.data });
      
      if (result.error) {
        console.error('SignIn error:', result.error);
        throw new Error(result.error.message || 'Sign in failed');
      }

      // Check that token was saved in memory
      const token = getAccessToken();
      console.log('Token in memory after signIn:', !!token);
      
      if (!token) {
        throw new Error('No authentication token received. Please try again.');
      }
      
      // Parse token to get user info
      const payload = parseJwt(token);
      if (payload && payload.sub) {
        setUser({ 
          id: payload.sub, 
          email: payload.email,
          full_name: payload.full_name
        });
        console.log('User set from token:', payload.email);
      } else {
        throw new Error('Invalid token payload');
      }

      resetInactivityTimer();
      console.log('=== Supabase SignIn SUCCESS ===');
    } catch (err: any) {
      console.error('=== SignIn FAILED ===', err.message);
      setUser(null);
      setAccessToken(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    try {
      console.log('=== Supabase SignUp START ===');
      const result = await supabase.auth.signUp(email, password);
      
      if (result.error) {
        console.error('SignUp error:', result.error);
        throw new Error(result.error.message || 'Sign up failed');
      }
      
      // Check that token was saved in memory
      const token = getAccessToken();
      console.log('Token saved:', !!token);
      
      if (!token) {
        throw new Error('No authentication token received after signup. Please try again.');
      }
      
      if (result.data?.id) {
        setUser({ 
          id: result.data.id, 
          email: result.data.email, 
          full_name: fullName 
        });
        console.log('User set:', result.data.email);
      }
      
      resetInactivityTimer();
      console.log('=== Supabase SignUp SUCCESS ===');
    } catch (err: any) {
      console.error('=== SignUp FAILED ===', err.message);
      setUser(null);
      setAccessToken(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('=== SignOut START ===');
      
      // Call backend to clear refresh cookie
      try {
        await fetch(`${getApiUrl()}/api/auth/clear-refresh-cookie`, { method: 'POST' });
      } catch (err) {
        console.warn('Failed to clear refresh cookie:', err);
      }
      
      // Clear auth context state
      setAccessToken(null);
      setUser(null);
      
      // Clear inactivity timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      
      // Clear Supabase session
      await supabase.auth.signOut();
      
      console.log('=== SignOut SUCCESS ===');
    } catch (error) {
      console.error('SignOut error:', error);
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
      const API_BASE = getApiUrl().replace(/\/+$/g, '');
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

  const getToken = (): string | null => {
    return getAccessToken() || null;
  };

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
