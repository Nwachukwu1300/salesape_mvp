'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LeadData {
  name: string;
  email: string;
  company?: string;
  message?: string;
}

export default function LeadForm() {
  const [formData, setFormData] = useState<LeadData>({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => setStatus('idle'), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to submit lead (${response.status})`);
      }

      setStatus('success');
      setFormData({ name: '', email: '', company: '', message: '' });
      toast.success("Lead submitted — we'll follow up soon.");
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');
      toast.error(error instanceof Error ? error.message : 'Failed to submit lead');
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">
        Submit Your Information
      </h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
        Share your details and we'll get back to you soon.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Name *
          </label>
          <Input
            type="text"
            id="name"
            placeholder="John Doe"
            required
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Email *
          </label>
          <Input
            type="email"
            id="email"
            placeholder="john@example.com"
            required
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Company (optional)
          </label>
          <Input
            type="text"
            id="company"
            placeholder="Acme Inc"
            value={formData.company}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, company: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Message (optional)
          </label>
          <Textarea
            id="message"
            placeholder="Tell us more about your inquiry..."
            rows={3}
            value={formData.message}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, message: e.target.value })}
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={status === 'loading'}>
          {status === 'loading' ? 'Submitting...' : 'Submit Lead'}
        </Button>

        {status === 'success' && (
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-sm">
            ✓ Success! Your information has been submitted.
          </div>
        )}

        {status === 'error' && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm">
            {errorMessage}
          </div>
        )}
      </form>
    </div>
  );
}
