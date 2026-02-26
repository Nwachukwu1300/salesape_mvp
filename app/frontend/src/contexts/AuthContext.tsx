// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { supabase, getAccessToken, setAccessToken } from "../lib/supabase";

// Types
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
  signInWithGoogle: () => void;
  signInWithApple: () => void;
  resetPassword: (email: string) => Promise<void>;
  getToken: () => string | null;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 min

// JWT Parser
function parseJwt(token: string | null) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset inactivity timer
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

    const token = getAccessToken();
    if (token) {
      inactivityTimerRef.current = setTimeout(() => {
        console.log("Inactivity timeout - signing out");
        signOut();
      }, INACTIVITY_TIMEOUT);
    }
  };

  // Load session on mount
  useEffect(() => {
    setLoading(true);

    const loadSession = async () => {
      const token = getAccessToken();
      if (token) {
        const payload = parseJwt(token);
        if (payload?.sub && payload.email) {
          setUser({ id: payload.sub, email: payload.email, full_name: payload.full_name });
          resetInactivityTimer();
        } else {
          setAccessToken(null);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    loadSession();

    // Activity listeners for inactivity
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];
    const handleActivity = () => resetInactivityTimer();
    events.forEach((e) => document.addEventListener(e, handleActivity));

    return () => {
      events.forEach((e) => document.removeEventListener(e, handleActivity));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, []);

  // ----- Auth Functions -----
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signIn(email, password);
      if (error) throw new Error(error.message);

      const token = getAccessToken();
      if (!token) throw new Error("No token received after sign-in");

      const payload = parseJwt(token);
      if (!payload?.sub) throw new Error("Invalid token payload");

      setUser({ id: payload.sub, email: payload.email, full_name: payload.full_name });
      resetInactivityTimer();
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp(email, password);
      if (error) throw new Error(error.message);

      const token = getAccessToken();
      if (!token) throw new Error("No token received after sign-up");

      const payload = parseJwt(token);
      setUser({ id: payload?.sub!, email: payload?.email!, full_name: fullName });
      resetInactivityTimer();
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setAccessToken(null);
      setUser(null);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      await supabase.auth.signOut();
    } catch (error) {
      console.error("SignOut error:", error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const signInWithApple = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/apple`;
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } finally {
      setLoading(false);
    }
  };

  const getToken = () => getAccessToken() || null;

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
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}