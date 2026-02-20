import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardHeader, CardContent } from '../components/Card';
import { ProgressCircle } from '../components/ProgressCircle';
import {
  ArrowRight,
  Search,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Zap,
  Shield,
  Eye,
} from 'lucide-react';

const API_BASE = ((import.meta.env as any).VITE_API_URL || 'http://localhost:3001').replace(/\/+$/g, '');

interface AuditResult {
  id: string;
  url: string;
  overallScore: number;
  seoScore: number;
  performanceScore: number;
  mobileScore: number;
  issues: string[];
  recommendations: string[];
  createdAt: string;
}

export function PublicAudit() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResults, setAuditResults] = useState<AuditResult | null>(null);
  const [error, setError] = useState('');
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  // Check if first visit using localStorage (client-side)
  useEffect(() => {
    const hasVisitedPublicAudit = localStorage.getItem('visited-public-audit');
    if (!hasVisitedPublicAudit) {
      setIsFirstVisit(true);
      localStorage.setItem('visited-public-audit', 'true');
    }
  }, []);

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!website.trim()) {
      setError('Please enter a website URL');
      return;
    }

    setIsAuditing(true);
    setError('');
    
    try {
      const normalizedUrl = website.trim().match(/^https?:\/\//) 
        ? website.trim() 
        : `https://${website.trim()}`;

      const response = await fetch(`${API_BASE}/seo-audit-public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          website: normalizedUrl,
          email: email.trim(),
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          setError('You can run one free audit per week. Please try again next week.');
        } else {
          try {
            const errorData = await response.json();
            setError(errorData.error || 'Failed to run audit');
          } catch {
            setError(`Error: ${response.statusText}`);
          }
        }
        setIsAuditing(false);
        return;
      }

      const data: AuditResult = await response.json();
      setAuditResults(data);
    } catch (err) {
      console.error('Audit error:', err);
      setError('Failed to run audit. Please try again.');
    } finally {
      setIsAuditing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Logo />
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="sm"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!auditResults ? (
          <>
            {/* Hero Section */}
            <section className="mb-8 sm:mb-16 text-center px-4 sm:px-0">
              <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 leading-tight ${isFirstVisit ? 'animate-bounce' : ''}`}>
                Free SEO Audit
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
                Get instant insights into your website's SEO, performance, and mobile readiness. No credit card needed.
              </p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500">
                Free audit per week
              </p>
            </section>

            {/* Audit Form */}
            <div className={`max-w-2xl mx-auto mb-8 sm:mb-16 px-4 sm:px-0 ${isFirstVisit ? 'animate-bounce' : ''}`} style={isFirstVisit ? { animationDelay: '0.1s' } : {}}>
              <Card className="border-2 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Search className="w-6 h-6 text-blue-600" />
                    Analyze Your Website
                  </h2>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRunAudit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Your Name
                      </label>
                      <Input
                        type="text"
                        placeholder="John Smith"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isAuditing}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Your Email
                      </label>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isAuditing}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Website URL
                      </label>
                      <Input
                        type="text"
                        placeholder="example.com or https://example.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        disabled={isAuditing}
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isAuditing}
                      className="w-full"
                    >
                      {isAuditing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Running Audit...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Run Free Audit
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Benefits Section */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto px-4 sm:px-0">
              <Card className={`text-center h-full ${isFirstVisit ? 'animate-bounce' : ''}`} style={isFirstVisit ? { animationDelay: '0.2s' } : {}}>
                <CardContent className="pt-4 sm:pt-6 flex flex-col h-full">
                  <Eye className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-3 sm:mb-4 text-blue-600 flex-shrink-0" />
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm sm:text-base">Performance Analysis</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex-grow">
                    Get detailed insights into your website's loading speed and performance metrics.
                  </p>
                </CardContent>
              </Card>

              <Card className={`text-center h-full ${isFirstVisit ? 'animate-bounce' : ''}`} style={isFirstVisit ? { animationDelay: '0.3s' } : {}}>
                <CardContent className="pt-4 sm:pt-6 flex flex-col h-full">
                  <TrendingUp className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-3 sm:mb-4 text-green-600 flex-shrink-0" />
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm sm:text-base">SEO Optimization</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex-grow">
                    Discover SEO opportunities and recommendations to improve your search rankings.
                  </p>
                </CardContent>
              </Card>

              <Card className={`text-center h-full ${isFirstVisit ? 'animate-bounce' : ''}`} style={isFirstVisit ? { animationDelay: '0.4s' } : {}}>
                <CardContent className="pt-4 sm:pt-6 flex flex-col h-full">
                  <Shield className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-3 sm:mb-4 text-purple-600 flex-shrink-0" />
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm sm:text-base">Mobile Readiness</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex-grow">
                    Ensure your site is optimized for mobile devices and provides great UX.
                  </p>
                </CardContent>
              </Card>
            </section>
          </>
        ) : (
          <>
            {/* Results Header */}
            <div className="mb-8">
              <Button
                onClick={() => {
                  setAuditResults(null);
                  setWebsite('');
                  setEmail('');
                  setError('');
                }}
                variant="outline"
                size="sm"
              >
                ← Run Another Audit
              </Button>
            </div>

            {/* Results */}
            <section className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  Audit Results for <code className="text-blue-600 break-all">{auditResults.url}</code>
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Analysis completed on {new Date(auditResults.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Overall Score Card */}
              <Card className="border-2 border-blue-200 dark:border-blue-900 mb-8 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950 dark:to-slate-900">
                <CardContent className="pt-6 sm:pt-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
                    <div className="text-center flex-shrink-0">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 sm:mb-3">
                        Overall Score
                      </p>
                      <div className="flex justify-center mb-2 px-2">
                        <ProgressCircle 
                          value={auditResults.overallScore} 
                          size={120}
                        />
                      </div>
                    </div>
                    <div className="flex-1 space-y-4 w-full md:w-auto px-2 sm:px-0">
                      <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                        Your website is performing
                        <span className={`ml-2 ${getScoreColor(auditResults.overallScore)} font-bold`}>
                          {auditResults.overallScore >= 80 ? 'Excellent' : auditResults.overallScore >= 60 ? 'Good' : 'Needs Improvement'}
                        </span>
                      </p>
                      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                        {auditResults.overallScore >= 80
                          ? 'Your website is well-optimized! Keep maintaining these high standards.'
                          : auditResults.overallScore >= 60
                          ? 'Your website is performing well, but there\'s room for improvement.'
                          : 'Your website needs some attention. Focus on the recommendations below.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Scores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                <Card>
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="text-center">
                      <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 sm:mb-3">
                        SEO Score
                      </p>
                      <div className="flex justify-center px-2">
                        <ProgressCircle 
                          value={auditResults.seoScore} 
                          size={100}
                        />
                      </div>
                      <p className={`mt-2 text-xs sm:text-sm font-semibold ${getScoreColor(auditResults.seoScore)}`}>
                        {auditResults.seoScore}/100
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="text-center">
                      <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 sm:mb-3">
                        Performance
                      </p>
                      <div className="flex justify-center px-2">
                        <ProgressCircle 
                          value={auditResults.performanceScore} 
                          size={100}
                        />
                      </div>
                      <p className={`mt-2 text-xs sm:text-sm font-semibold ${getScoreColor(auditResults.performanceScore)}`}>
                        {auditResults.performanceScore}/100
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="sm:col-span-2 lg:col-span-1">
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="text-center">
                      <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 sm:mb-3">
                        Mobile Score
                      </p>
                      <div className="flex justify-center px-2">
                        <ProgressCircle 
                          value={auditResults.mobileScore} 
                          size={100}
                        />
                      </div>
                      <p className={`mt-2 text-xs sm:text-sm font-semibold ${getScoreColor(auditResults.mobileScore)}`}>
                        {auditResults.mobileScore}/100
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Issues */}
              {auditResults.issues && auditResults.issues.length > 0 && (
                <Card className="mb-8 border-red-200 dark:border-red-900">
                  <CardHeader>
                    <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Issues Found ({auditResults.issues.length})
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {auditResults.issues.map((issue, idx) => (
                        <li key={idx} className="flex gap-3">
                          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {auditResults.recommendations && auditResults.recommendations.length > 0 && (
                <Card className="mb-8 border-green-200 dark:border-green-900">
                  <CardHeader>
                    <h3 className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Recommendations ({auditResults.recommendations.length})
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {auditResults.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex gap-3">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* CTA to Sign Up */}
              <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
                <CardContent className="pt-8 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Create My Better Website
                  </h3>
                  <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                    Sign up for SalesAPE to implement these recommendations automatically and generate a high-converting website powered by AI.
                  </p>
                  <Button
                    onClick={() => navigate('/')}
                    className="bg-white text-blue-600 hover:bg-slate-50 font-semibold"
                  >
                    <div className="flex items-center gap-2">
                      Get Started Free
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>© 2026 SalesAPE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
