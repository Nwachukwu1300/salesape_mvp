'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface OnboardingData {
  url: string;
  businessName?: string;
  description?: string;
}

export default function BusinessOnboarding() {
  const [formData, setFormData] = useState<OnboardingData>({
    url: '',
    businessName: '',
    description: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch(`${API_URL}/businesses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: formData.url,
          name: formData.businessName || 'My Business',
          description: formData.description || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create website (${response.status})`);
      }

      const business = await response.json();
      setStatus('success');
      
      // Redirect to the generated website
      setTimeout(() => {
        router.push(`/${business.id}/website`);
      }, 1500);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          SalesAPE MVP
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400">
          Turn your Instagram or website into a working online business in minutes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-8 space-y-6">
        <div>
          <label htmlFor="url" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            Your Instagram Profile or Website URL *
          </label>
          <input
            type="url"
            id="url"
            placeholder="https://instagram.com/yourprofile or https://yourwebsite.com"
            required
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
            We'll analyze your profile to extract business information
          </p>
        </div>

        <div>
          <label htmlFor="businessName" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            Business Name (optional)
          </label>
          <input
            type="text"
            id="businessName"
            placeholder="My Awesome Business"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            Business Description (optional)
          </label>
          <textarea
            id="description"
            placeholder="Tell us what you do, what services you offer, or anything else about your business..."
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
        >
          {status === 'loading' ? 'Creating your website...' : '🚀 Create My Website'}
        </button>

        {status === 'success' && (
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-sm text-center">
            ✓ Website created! Redirecting...
          </div>
        )}

        {status === 'error' && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm">
            <p className="font-semibold mb-1">Error</p>
            {errorMessage}
          </div>
        )}
      </form>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-3xl mb-2">📱</div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Connect Your Profile</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Share your Instagram or website URL</p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">✨</div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">We Generate Your Site</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Automatic website creation with your branding</p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">📧</div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Start Getting Leads</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Lead capture and email notifications</p>
        </div>
      </div>
    </div>
  );
}
