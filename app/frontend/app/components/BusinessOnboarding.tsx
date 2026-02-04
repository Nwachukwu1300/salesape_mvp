'use client';

import * as React from "react";
import { useState, useEffect, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken } from "../lib/api";
import AuthForm from "./AuthForm";
import ConversationalOnboarding from "@/components/ConversationalOnboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ColorPicker } from "@/components/ui/color-picker";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from 'sonner';

// Chat/Voice Input Component
function ChatVoiceInput({ onInput }: { onInput: (text: string) => void }) {
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      onInput(transcript);
      setListening(false);
    };
    recognitionRef.current.onend = () => setListening(false);
    recognitionRef.current.onerror = () => setListening(false);
  }, [onInput]);

  const handleVoice = () => {
    if (recognitionRef.current) {
      setListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      onInput(input.trim());
      setInput("");
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
        Or Describe Your Business (Chat or Voice)
      </label>
      <div className="flex gap-2 items-center">
        <Input
          type="text"
          className="flex-1"
          placeholder="Tell us about your business..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button size="sm" variant="ghost" asChild={false} onClick={handleVoice} disabled={listening} className="btn-ghost-hover">
          <span>{listening ? 'Listening...' : '🎤'}</span>
        </Button>
        <Button size="sm" variant="default" onClick={handleSend}>
          Send
        </Button>
      </div>
    </div>
  );
}

// Template Selection Component
function TemplateSelector({ templates, selected, onSelect }: { templates: any[], selected: string, onSelect: (id: string) => void }) {
  if (!templates.length) return null;
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
        Select Website Template
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(t => (
          <div 
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`p-4 border rounded cursor-pointer transition-all enter-up hover-raise ${
              selected === t.id
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-zinc-300 dark:border-zinc-700 hover:border-blue-400'
            }`}
          >
            <h4 className="font-semibold">{t.name}</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Branding Customization Component
function BrandingOptions({ branding, onChange }: { branding: any, onChange: (key: string, value: any) => void }) {
  return (
          <div className="mb-6 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded enter-up">
      <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
        Customize Branding
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-2">Primary Color</label>
          <div className="flex gap-2 items-center">
            <ColorPicker
              value={branding?.primaryColor || '#3B82F6'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('primaryColor', e.target.value)}
              className="w-12 h-10 rounded"
            />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{branding?.primaryColor || '#3B82F6'}</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-2">Secondary Color</label>
          <div className="flex gap-2">
            <ColorPicker
              value={branding?.secondaryColor || '#10B981'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('secondaryColor', e.target.value)}
              className="w-12 h-10 rounded"
            />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{branding?.secondaryColor || '#10B981'}</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-2">Font Family</label>
          <Select
            value={branding?.fontFamily || 'sans-serif'}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('fontFamily', e.target.value)}
            className="w-full rounded px-3 py-2"
          >
            <option value="sans-serif">Sans Serif</option>
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
          </Select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-2">Logo URL</label>
          <Input
            type="url"
            placeholder="https://example.com/logo.png"
            value={branding?.logoUrl || ''}
            onChange={e => onChange('logoUrl', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

type OnboardingData = {
  url: string;
  businessName?: string;
  description?: string;
  scrapedTitle?: string;
  scrapedDescription?: string;
  scrapedEmail?: string;
  scrapedPhone?: string;
  aiType?: string;
  aiServices?: string;
  aiBranding?: string;
  aiContact?: string;
  businessId?: string;
  selectedTemplateId?: string;
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    logoUrl?: string;
  };
};

export default function BusinessOnboarding() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [recommendedTemplateId, setRecommendedTemplateId] = useState<string>('');
  const [templatesLoading, setTemplatesLoading] = useState<boolean>(false);
  const [templatesError, setTemplatesError] = useState<string>('');
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [useConversational, setUseConversational] = useState(false);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    setIsAuthenticated(!!getToken());
  }, []);

  // Scrape website info when URL changes
  useEffect(() => {
    const isWebsite = formData.url && /^https?:\/\//.test(formData.url) && !formData.url.includes('instagram.com');
    if (isWebsite) {
      setScrapeStatus('loading');
      fetch(`${API_URL}/scrape-website`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.url }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error((await res.json()).error || 'Failed to scrape');
          return res.json();
        })
        .then((data) => {
          setFormData((prev) => ({
            ...prev,
            scrapedTitle: data.title || '',
            scrapedDescription: data.description || '',
            scrapedEmail: data.email || '',
            scrapedPhone: data.phone || '',
          }));
          setScrapeStatus('success');
          // Automatically analyze with AI
          setAiStatus('loading');
          return fetch(`${API_URL}/analyze-business`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              description: formData.description || data.description || '',
              scraped: {
                title: data.title,
                description: data.description,
                email: data.email,
                phone: data.phone,
              },
            }),
          });
        })
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to analyze');
          return res.json();
        })
        .then((ai) => {
          setFormData((prev) => ({
            ...prev,
            aiType: ai.business_type || ai.type || '',
            aiServices: ai.services || '',
            aiBranding: ai.branding_cues || ai.branding || '',
            aiContact: ai.contact_info || ai.contact || '',
          }));
          setAiStatus('success');
        })
        .catch(() => {
          setScrapeStatus('error');
          setAiStatus('error');
        });
    }
  }, [formData.url, API_URL]);

  const handlePreview = async () => {
    setScrapeStatus('loading');
    try {
      const res = await fetch(`${API_URL}/scrape-website`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.url }),
      });
      if (!res.ok) throw new Error('Failed to scrape');
      const data = await res.json();
      setFormData((prev) => ({
        ...prev,
        scrapedTitle: data.title || '',
        scrapedDescription: data.description || '',
        scrapedEmail: data.email || '',
        scrapedPhone: data.phone || '',
      }));
      setScrapeStatus('success');
      toast.success('Preview loaded');
    } catch {
      setScrapeStatus('error');
      toast.error('Failed to scrape website');
    }
  };

  const fetchTemplates = async (businessId: string) => {
    setTemplatesLoading(true);
    setTemplatesError('');
    try {
      const res = await apiFetch(`/businesses/${businessId}/template`);
      if (!res.ok) {
        const text = await res.text().catch(() => 'Failed to fetch templates');
        throw new Error(text || `Failed to fetch templates (${res.status})`);
      }
      const raw = await res.text();
      console.log('Raw templates response text:', raw);
      let data: any = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch (parseErr) {
        console.warn('Failed to parse templates JSON, falling back to empty object', parseErr);
        data = {};
      }
      console.log('Templates response:', data);
      setTemplates(data.templates || []);
      setRecommendedTemplateId(data.recommended?.id || '');
      setFormData((prev) => ({ ...prev, selectedTemplateId: data.recommended?.id || '' }));
      return true;
    } catch (err: any) {
      console.error('Failed to fetch templates:', err);
      setTemplates([]);
      setRecommendedTemplateId('');
      setTemplatesError(err?.message || 'Failed to fetch templates');
      setErrorMessage(err?.message || 'Failed to fetch templates');
      return false;
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!getToken()) {
      setErrorMessage('Please log in or create an account to continue.');
      return;
    }
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
      setFormData((prev) => ({ ...prev, businessId: business.id }));
      toast.success('Business created! Loading templates...');
      console.log('Business created:', business);
      
      // Fetch templates and wait for them to load before showing success state
      console.log('Fetching templates for businessId:', business.id);
      const templatesLoaded = await fetchTemplates(business.id);
      console.log('Templates loaded:', templatesLoaded);
      
      if (templatesLoaded) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage('Failed to load templates. Please try again.');
      }
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

  const handleBrandingChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      branding: { ...prev.branding, [key]: value },
    }));
  };

  const handleFinalize = async () => {
    if (formData.businessId && formData.selectedTemplateId) {
      setStatus('loading');
      try {
        // Publish the website to generate a shareable URL
        const publishRes = await apiFetch(`/businesses/${formData.businessId}/publish`, {
          method: 'POST',
          body: JSON.stringify({ templateId: formData.selectedTemplateId }),
        });
        
        if (!publishRes.ok) {
          throw new Error('Failed to publish website');
        }
        
        const publishedData = await publishRes.json();
        toast.success('Website published successfully!');
        setStatus('success');
        
        // Navigate to the website preview page
        setTimeout(() => {
          router.push(`/${formData.businessId}/website?template=${formData.selectedTemplateId}`);
        }, 1000);
      } catch (error) {
        setStatus('error');
        toast.error(error instanceof Error ? error.message : 'Failed to publish website');
        setErrorMessage(error instanceof Error ? error.message : 'Failed to publish website');
      }
    }
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Show conversational onboarding if user selected it */}
      {useConversational && isAuthenticated ? (
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
              SALESAPE.ai
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              Turn your Instagram or website into a working online business in minutes
            </p>
          </div>

          {!isAuthenticated && (
            <AuthForm onSuccess={() => setIsAuthenticated(true)} />
          )}

          {isAuthenticated && !formData.businessId && (
            <div className="mb-6 flex gap-3 justify-center">
              <Button
                type="button"
                onClick={() => setUseConversational(true)}
                className="px-6"
              >
                💬 Chat with Assistant
              </Button>
            </div>
          )}

          {/* Show form if business not created yet, or show templates if business was created */}
          {!formData.businessId || status !== 'success' ? (
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
            <Button
              type="button"
              onClick={handlePreview}
              className="px-4 py-3"
              variant="ghost"
              disabled={!formData.url || scrapeStatus === 'loading'}
            >
              {scrapeStatus === 'loading' ? 'Scraping...' : 'Preview'}
            </Button>
          </div>
        </div>

        <div>
          <label htmlFor="businessName" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            Business Name (optional)
          </label>
          <Input
            type="text"
            id="businessName"
            placeholder="My Awesome Business"
            value={formData.businessName || formData.scrapedTitle || ''}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            Business Description (optional)
          </label>
          <Textarea
            id="description"
            placeholder="Tell us what you do, what services you offer..."
            rows={4}
            value={formData.description || formData.scrapedDescription || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <ChatVoiceInput onInput={(text) => setFormData(prev => ({ ...prev, description: text }))} />

        {(formData.scrapedEmail || formData.scrapedPhone) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="scrapedEmail" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Contact Email</label>
              <Input
                type="email"
                id="scrapedEmail"
                value={formData.scrapedEmail || ''}
                onChange={(e) => setFormData({ ...formData, scrapedEmail: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="scrapedPhone" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Contact Phone</label>
              <Input
                type="tel"
                id="scrapedPhone"
                value={formData.scrapedPhone || ''}
                onChange={(e) => setFormData({ ...formData, scrapedPhone: e.target.value })}
              />
            </div>
          </div>
        )}

        {aiStatus === 'success' && (formData.aiType || formData.aiServices) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Business Insights (AI)</h4>
            {formData.aiType && <div className="text-sm"><strong>Type:</strong> {formData.aiType}</div>}
            {formData.aiServices && <div className="text-sm"><strong>Services:</strong> {formData.aiServices}</div>}
          </div>
        )}

        <BrandingOptions branding={formData.branding} onChange={handleBrandingChange} />

        {status !== 'success' && (
          <Button type="submit" className="w-full" size="lg" disabled={status === 'loading'}>
            {status === 'loading' ? 'Creating...' : 'Next'}
          </Button>
        )}

        {status === 'loading' && formData.businessId && (
          <div className="text-center py-6">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">Loading templates...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}

        {errorMessage && (
          <div className="text-red-600 dark:text-red-400 text-sm">{errorMessage}</div>
        )}
      </form>
            ) : (
              // Template Selection Screen
              <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-8 space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">✓ Website Created Successfully!</h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-2">{formData.businessName || 'Your Business'}</p>
                  <p className="text-sm text-green-700 dark:text-green-300">Choose a template below to customize and launch your website</p>
                </div>
                
                {templates.length > 0 ? (
                  <>
                    {templatesError && (
                      <div className="text-red-600 dark:text-red-400 mb-4">
                        {templatesError}
                      </div>
                    )}
                    <TemplateSelector 
                      templates={templates} 
                      selected={formData.selectedTemplateId || recommendedTemplateId} 
                      onSelect={handleTemplateSelect}
                    />
                    <Button 
                      variant="default" 
                      size="lg" 
                      className="w-full" 
                      onClick={handleFinalize}
                      disabled={status === 'loading'}
                    >
                      {status === 'loading' ? 'Publishing Website...' : '🚀 Launch Website'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="lg" 
                      className="w-full" 
                      onClick={() => {
                        setFormData(prev => ({ ...prev, businessId: undefined }));
                        setStatus('idle');
                        setTemplates([]);
                      }}
                    >
                      ← Back to Edit
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-zinc-600 dark:text-zinc-400 mb-4">Loading templates...</p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                )}
              </div>
            )}
        </>
      )}
    </div>
  );
}
