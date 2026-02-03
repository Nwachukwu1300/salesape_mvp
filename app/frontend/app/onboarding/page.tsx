'use client';

import * as React from "react";
import { useState, useEffect, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken } from "../lib/api";
import ConversationalOnboarding from "@/components/ConversationalOnboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ColorPicker } from "@/components/ui/color-picker";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from 'sonner';

interface OnboardingData {
  url?: string;
  businessName?: string;
  description?: string;
  scrapedTitle?: string;
  scrapedDescription?: string;
  scrapedEmail?: string;
  scrapedPhone?: string;
  selectedTemplateId?: string;
  businessId?: string;
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    logoUrl?: string;
  };
}

export default function OnboardingPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [recommendedTemplateId, setRecommendedTemplateId] = useState<string>('');
  const [formData, setFormData] = useState<OnboardingData>({
    url: '',
    businessName: '',
    description: '',
    scrapedTitle: '',
    scrapedDescription: '',
    scrapedEmail: '',
    scrapedPhone: '',
    branding: {},
  });
  const [scrapeStatus, setScrapeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [aiStatus, setAiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [useConversational, setUseConversational] = useState(false);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    // Check if user is authenticated
    if (!getToken()) {
      router.push('/');
      return;
    }
  }, [router]);

  const handlePreview = async () => {
    if (!formData.url) return;

    setScrapeStatus('loading');
    try {
      const res = await fetch(`${API_URL}/scrape-website`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.url }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to scrape');
      return res.json();
    } catch {
      setScrapeStatus('error');
      toast.error('Failed to scrape website');
    }
  };

  const fetchTemplates = async (businessId: string) => {
    try {
      const res = await apiFetch(`/businesses/${businessId}/template`);
      if (!res.ok) throw new Error('Failed to fetch templates');
      const data = await res.json();
      setTemplates(data.templates || []);
      setRecommendedTemplateId(data.recommended?.id || '');
      setFormData((prev) => ({ ...prev, selectedTemplateId: data.recommended?.id || '' }));
    } catch {
      setTemplates([]);
      setRecommendedTemplateId('');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await apiFetch('/businesses', {
        method: 'POST',
        body: JSON.stringify({
          url: formData.url,
          name: formData.businessName || 'My Business',
          description: formData.description || '',
          branding: formData.branding,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create website (${response.status})`);
      }

      const business = await response.json();
      setStatus('success');
      toast.success('Business created');
      setFormData((prev) => ({ ...prev, businessId: business.id }));
      await fetchTemplates(business.id);
    } catch (error) {
      setStatus('error');
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  const handleConversationComplete = async (data: any) => {
    // User completed the conversation, now submit their business
    const businessUrl = data.websiteUrl || data.instagramUrl || 'https://example.com';
    const description = `${data.businessType}. Services: ${data.services?.join(', ')}. Target audience: ${data.targetAudience}`;
    
    setFormData(prev => ({
      ...prev,
      url: businessUrl,
      businessName: data.businessName,
      description,
    }));

    // Auto-submit
    await new Promise(resolve => setTimeout(resolve, 1000));
    handleSubmit({ preventDefault: () => {} } as any);
  };

  const handleTemplateSelect = (id: string) => {
    setFormData((prev) => ({ ...prev, selectedTemplateId: id }));
  };

  const handleFinalize = () => {
    if (formData.businessId && formData.selectedTemplateId) {
      router.push(`/${formData.businessId}/website?template=${formData.selectedTemplateId}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-linear-to-br from-zinc-50 to-zinc-100 font-sans dark:from-black dark:to-zinc-900 py-12 px-4">
      <main className="flex w-full justify-center">
        <div className="w-full max-w-2xl">
      {/* Show conversational onboarding if user selected it */}
      {useConversational ? (
        <>
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
          <ConversationalOnboarding onComplete={handleConversationComplete} />
        </>
      ) : (
        <>
          <div className="absolute top-4 right-4 flex gap-2">
            <a href="/audit" className="text-sm text-blue-600 dark:text-blue-400 hover:underline px-3 py-2">
              Free Audit
            </a>
            <ThemeToggle />
          </div>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Build Your Website
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              Turn your Instagram or website into a working online business in minutes
            </p>
          </div>

          <div className="mb-6 flex gap-3 justify-center">
            <Button
              type="button"
              onClick={() => setUseConversational(true)}
              className="px-6"
            >
              💬 Chat with Assistant
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-8 space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                Your Instagram Profile or Website URL *
              </label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  id="url"
                  placeholder="https://instagram.com/yourprofile or https://yourwebsite.com"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                Business Name *
              </label>
              <Input
                type="text"
                id="name"
                placeholder="Your Business Name"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Describe your business, services, and what makes you unique"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            {errorMessage && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={status === 'loading' || !formData.url || !formData.businessName}
            >
              {status === 'loading' ? 'Creating Website...' : 'Create My Website'}
            </Button>
          </form>
        </>
      )}
        </div>
      </main>
    </div>
  );
}
