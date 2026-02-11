// Lightweight Supabase auth using REST API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export interface AuthSession {
  access_token: string;
  refresh_token?: string;
  user?: {
    id: string;
    email: string;
    user_metadata?: Record<string, any>;
  };
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
      
      if (data.session) {
        localStorage.setItem('supabase.auth.token', data.session.access_token);
        localStorage.setItem('supabase.refresh.token', data.session.refresh_token || '');
      }
      
      return { data: data.user, error: data.error };
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
      console.log('SignIn response:', { hasToken: !!data.access_token });
      
      if (data.access_token) {
        localStorage.setItem('supabase.auth.token', data.access_token);
        localStorage.setItem('supabase.refresh.token', data.refresh_token || '');
        console.log('Token saved to localStorage');
      }
      
      return { data: { session: data, user: data.user }, error: data.error };
    },

    async signOut() {
      const token = localStorage.getItem('supabase.auth.token');
      if (token) {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': SUPABASE_ANON_KEY,
          },
        }).catch(() => {});
      }
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase.refresh.token');
    },

    async getSession() {
      const token = localStorage.getItem('supabase.auth.token');
      return { data: { session: token ? { access_token: token } : null } };
    },

    onAuthStateChange(callback: (event: string, session: any) => void) {
      // Simple implementation
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
  },
};

export type Database = any;


