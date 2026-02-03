'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { apiFetch } from '@/app/lib/api';

export default function SocialContentPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.businessId as string;
  const [loading, setLoading] = useState(false);
  const [captions, setCaptions] = useState<string[]>([]);
  const [selectedCaption, setSelectedCaption] = useState<number | null>(null);

  const generateContent = async () => {
    if (!businessId) return;

    setLoading(true);
    try {
      const res = await apiFetch(
        `/businesses/${businessId}/generate-social-content`,
        { method: 'POST' }
      );

      if (res.ok) {
        const data = await res.json();
        setCaptions(data.captions || []);
        toast.success('Content generated!');
      } else {
        throw new Error('Failed to generate content');
      }
    } catch (err) {
      toast.error('Failed to generate social content');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Social Content Generator
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Generate Instagram captions and hashtags to promote your business
        </p>
      </div>

      {captions.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center">
          <Button
            onClick={generateContent}
            disabled={loading}
            className="px-8"
          >
            {loading ? 'Generating...' : 'Generate Content Ideas'}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {captions.map((caption, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition"
              onClick={() => setSelectedCaption(selectedCaption === idx ? null : idx)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                    Idea {idx + 1}
                  </div>
                  <p className="text-zinc-900 dark:text-zinc-50 whitespace-pre-wrap text-sm">
                    {caption}
                  </p>
                </div>
              </div>
              {selectedCaption === idx && (
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(caption);
                    }}
                  >
                    Copy Caption
                  </Button>
                </div>
              )}
            </div>
          ))}

          <Button
            variant="ghost"
            onClick={() => {
              setCaptions([]);
              setSelectedCaption(null);
            }}
            className="w-full"
          >
            Generate More Ideas
          </Button>
        </div>
      )}
    </div>
  );
}
