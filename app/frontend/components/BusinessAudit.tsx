'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface AuditResult {
  audit: {
    seoScore: number;
    brandScore: number;
    leadCaptureScore: number;
    overallScore: number;
    recommendations: string[];
  };
  intelligence: {
    businessName?: string;
    services?: string[];
    heroHeadline?: string;
  };
  message: string;
}

export default function BusinessAudit() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url && !instagramUrl && !description) {
      toast.error('Please provide a URL, Instagram profile, or business description');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/free-audit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: url || undefined,
            instagramUrl: instagramUrl || undefined,
            description: description || undefined,
          }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Audit failed');
      }

      const data = await res.json();
      setResult(data);
      toast.success('Audit complete!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Audit failed');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const ScoreBar = ({ score }: { score: number }) => (
    <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full transition-all ${
          score >= 80
            ? 'bg-green-600'
            : score >= 60
            ? 'bg-amber-600'
            : 'bg-red-600'
        }`}
        style={{ width: `${score}%` }}
      />
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Free Business Audit
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">
          Get a quick analysis of your online presence and discover how to improve your lead generation
        </p>
      </div>

      {!result ? (
        <form onSubmit={handleAudit} className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-8 space-y-6 mb-8">
          <div>
            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              Your Website URL
            </label>
            <Input
              type="url"
              placeholder="https://yourwebsite.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="text-center text-zinc-500 dark:text-zinc-400">OR</div>

          <div>
            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              Instagram Profile URL
            </label>
            <Input
              type="url"
              placeholder="https://instagram.com/yourprofile"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="text-center text-zinc-500 dark:text-zinc-400">OR</div>

          <div>
            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              Describe Your Business
            </label>
            <Textarea
              placeholder="Tell us about your business, what you do, and what makes you unique..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-32"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Analyzing...' : 'Get Free Audit'}
          </Button>
        </form>
      ) : (
        <div className="space-y-8">
          {/* Overall Score */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-8 text-center">
            <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {result.audit.overallScore}
            </div>
            <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Overall Score
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              {result.message}
            </p>
          </div>

          {/* Scores Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">SEO Score</h3>
                <div className={`text-2xl font-bold ${getScoreColor(result.audit.seoScore)}`}>
                  {result.audit.seoScore}
                </div>
              </div>
              <ScoreBar score={result.audit.seoScore} />
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Brand Score</h3>
                <div className={`text-2xl font-bold ${getScoreColor(result.audit.brandScore)}`}>
                  {result.audit.brandScore}
                </div>
              </div>
              <ScoreBar score={result.audit.brandScore} />
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Lead Capture</h3>
                <div className={`text-2xl font-bold ${getScoreColor(result.audit.leadCaptureScore)}`}>
                  {result.audit.leadCaptureScore}
                </div>
              </div>
              <ScoreBar score={result.audit.leadCaptureScore} />
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Recommendations
            </h2>
            <ul className="space-y-3">
              {result.audit.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3">
                  <div className="text-blue-600 dark:text-blue-400 flex-shrink-0">✓</div>
                  <div className="text-zinc-700 dark:text-zinc-300">{rec}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Ready to grow your business?
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Sign up now and get your custom website, lead capture system, and AI-powered sales tools.
            </p>
            <Button onClick={() => router.push('/')} className="px-8">Get Started Free</Button>
          </div>

          <Button
            variant="ghost"
            onClick={() => setResult(null)}
            className="w-full"
          >
            Run Another Audit
          </Button>
        </div>
      )}
    </div>
  );
}
