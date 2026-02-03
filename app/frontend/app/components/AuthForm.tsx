"use client";

import { useState, FormEvent } from 'react';
import { setToken } from '../lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AuthForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body = mode === 'login' ? { email, password } : { email, password, name };
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setToken(data.token);
      toast.success(mode === 'login' ? 'Logged in' : 'Account created');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      toast.error(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
        {mode === 'login' ? 'Log in to create your website' : 'Create an account'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'register' && (
          <Input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required={mode === 'register'}
          />
        )}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={mode === 'register' ? 8 : 1}
        />
        {mode === 'register' && (
          <p className="text-xs text-zinc-500">Password must be at least 8 characters</p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Register'}
        </Button>
        <Button type="button" variant="ghost" className="w-full" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
          {mode === 'login' ? 'Create an account' : 'Already have an account? Log in'}
        </Button>
      </form>
    </div>
  );
}
