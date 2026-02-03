'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from './components/AuthForm';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getToken } from './lib/api';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (getToken()) {
      setIsAuthenticated(true);
      router.push('/onboarding');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-linear-to-br from-zinc-50 to-zinc-100 font-sans dark:from-black dark:to-zinc-900 py-12 px-4">
      <main className="flex w-full justify-center">
        <div className="w-full max-w-2xl">
          <div className="absolute top-4 right-4 flex gap-2">
            <a href="/audit" className="text-sm text-blue-600 dark:text-blue-400 hover:underline px-3 py-2">
              Free Audit
            </a>
            <ThemeToggle />
          </div>

          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              SALESAPE.ai
            </h1>
            <p className="text-2xl text-zinc-600 dark:text-zinc-400 mb-4">
              Turn your Instagram or website into a working online business in minutes
            </p>
            <p className="text-lg text-zinc-500 dark:text-zinc-500">
              Sign up or log in to get started
            </p>
          </div>

          <AuthForm onSuccess={() => {
            setIsAuthenticated(true);
            router.push('/onboarding');
          }} />
        </div>
      </main>
    </div>
  );
}
