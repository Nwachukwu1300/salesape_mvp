import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

export function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth() as any; // Access to internal state (optional)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // Store token
      localStorage.setItem('supabase.auth.token', token);
      // Decode JWT to extract user info
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const user = { id: payload.sub, email: payload.email };
          // Navigate to dashboard
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/auth', { replace: true });
        }
      } catch (err) {
        navigate('/auth', { replace: true });
      }
    } else {
      navigate('/auth', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Signing you in...</p>
    </div>
  );
}

export default AuthCallback;
