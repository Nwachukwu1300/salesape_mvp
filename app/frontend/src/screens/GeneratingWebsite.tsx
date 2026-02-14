import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GenerationStatus, GenerationStep } from '../types/website-config';

interface StatusResponse {
  status: GenerationStatus;
  step: GenerationStep;
  message: string;
  websiteConfig: any | null;
  templateId: string | null;
  imageAssets: any | null;
}

const STEP_INFO: Record<string, { label: string; progress: number; icon: string }> = {
  queued: { label: 'Preparing', progress: 5, icon: '⏳' },
  scraping: { label: 'Analyzing your website', progress: 20, icon: '🔍' },
  analyzing: { label: 'Understanding your business', progress: 40, icon: '🧠' },
  selecting_template: { label: 'Selecting the perfect template', progress: 60, icon: '🎨' },
  generating_config: { label: 'Generating website content', progress: 80, icon: '✍️' },
  enriching_images: { label: 'Optimizing images', progress: 90, icon: '🖼️' },
  completed: { label: 'Complete!', progress: 100, icon: '✅' },
  failed: { label: 'Generation failed', progress: 0, icon: '❌' },
};

export const GeneratingWebsite: React.FC = () => {
  const { id: businessId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const token = getToken();

  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [step, setStep] = useState<string>('queued');
  const [message, setMessage] = useState<string>('Starting website generation...');
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchStatus = useCallback(async () => {
    if (!businessId || !token) return;

    try {
      const response = await fetch(`${API_URL}/businesses/${businessId}/website-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }

      const data: StatusResponse = await response.json();

      setStatus(data.status);
      setStep(data.step || data.status);
      setMessage(data.message);

      const stepInfo = STEP_INFO[data.step || data.status] || STEP_INFO.queued;
      setProgress(stepInfo.progress);

      // Handle completion
      if (data.status === 'completed') {
        // Small delay before redirect for user to see completion
        setTimeout(() => {
          navigate(`/website-preview/${businessId}`);
        }, 1500);
      }

      // Handle failure
      if (data.status === 'failed') {
        setError(data.message || 'Website generation failed. Please try again.');
      }

      setPollCount((prev) => prev + 1);
    } catch (err) {
      console.error('Status fetch error:', err);
      // Don't set error on transient fetch failures, just continue polling
      if (pollCount > 30) {
        setError('Connection lost. Please refresh the page.');
      }
    }
  }, [businessId, token, pollCount, navigate, API_URL]);

  // Start generation on mount
  useEffect(() => {
    const startGeneration = async () => {
      if (!businessId || !token) return;

      try {
        const response = await fetch(`${API_URL}/businesses/${businessId}/generate-website`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 409) {
            // Already generating, just poll
            setStatus('processing');
          } else {
            throw new Error(data.error || 'Failed to start generation');
          }
        } else {
          setStatus(data.status || 'queued');
          if (data.status === 'completed') {
            // Sync fallback completed immediately
            navigate(`/website-preview/${businessId}`);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to start website generation');
      }
    };

    startGeneration();
  }, [businessId, token, navigate, API_URL]);

  // Poll for status updates
  useEffect(() => {
    if (status === 'completed' || status === 'failed' || status === 'idle') {
      return;
    }

    const interval = setInterval(fetchStatus, 2000);

    return () => clearInterval(interval);
  }, [status, fetchStatus]);

  const handleRetry = () => {
    setError(null);
    setStatus('idle');
    setPollCount(0);
    setProgress(0);
    // Will trigger the startGeneration effect
    window.location.reload();
  };

  const stepInfo = STEP_INFO[step] || STEP_INFO.queued;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-4xl">{stepInfo.icon}</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {status === 'completed' ? 'Website Ready!' : 'Creating Your Website'}
            </h1>
            <p className="text-white/70 text-sm">
              {status === 'completed'
                ? 'Redirecting to your website...'
                : 'This usually takes less than a minute'}
            </p>
          </div>

          {/* Progress Bar */}
          {!error && (
            <div className="mb-8">
              <div className="flex justify-between text-sm text-white/70 mb-2">
                <span>{stepInfo.label}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Status Message */}
          {!error && (
            <div className="text-center">
              <p className="text-white/80">{message}</p>

              {/* Animated dots */}
              {status !== 'completed' && (
                <div className="flex justify-center gap-1 mt-4">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center">
              <div className="bg-red-500/20 rounded-xl p-4 mb-6">
                <p className="text-red-300">{error}</p>
              </div>
              <button
                onClick={handleRetry}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 mt-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          )}

          {/* Steps Indicator */}
          {!error && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="grid grid-cols-6 gap-2">
                {Object.entries(STEP_INFO)
                  .filter(([key]) => !['completed', 'failed'].includes(key))
                  .map(([key, info], idx) => {
                    const isActive = key === step;
                    const isPast = info.progress < stepInfo.progress;

                    return (
                      <div
                        key={key}
                        className={`h-1 rounded-full transition-all ${
                          isActive
                            ? 'bg-purple-400'
                            : isPast
                            ? 'bg-purple-600'
                            : 'bg-white/10'
                        }`}
                      />
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <p className="text-center text-white/40 text-xs mt-6">
          Your website is being generated with AI. Please don't close this page.
        </p>
      </div>
    </div>
  );
};

export default GeneratingWebsite;
