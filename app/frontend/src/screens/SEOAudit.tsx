import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardHeader, CardContent } from '../components/Card';
import { ProgressCircle } from '../components/ProgressCircle';
import { Badge } from '../components/Badge';
import { ThemeToggle } from '../components/ThemeToggle';
import { PricingModal } from '../components/PricingModal';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import { PRICING_PLANS } from '../lib/stripe';
import { 
  ArrowLeft, 
  Search, 
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Zap,
  Shield,
  Eye,
  Crown
} from 'lucide-react';

const API_BASE = ((import.meta.env as any).VITE_API_URL || 'http://localhost:3001').replace(/\/+$/g, '');

export function SEOAudit() {
  const navigate = useNavigate();
  const { canRunSEOAudit, currentPlan, usage, refreshUsage } = useSubscription();
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [auditResults, setAuditResults] = useState<any>(null);
  const [error, setError] = useState('');

  const auditsRemaining = currentPlan === 'free' 
    ? PRICING_PLANS.free.limits.seoAudits - usage.seoAudits 
    : Infinity;

  const handleRunAudit = async () => {
    if (!canRunSEOAudit) {
      setShowPricing(true);
      return;
    }
    
    if (!url) {
      alert('Please enter a URL');
      return;
    }

    // Normalize URL: add https:// if no protocol is specified
    let normalizedUrl = url.trim();
    if (normalizedUrl && !normalizedUrl.match(/^https?:\/\//)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    setIsAuditing(true);
    setError('');
    
    console.log('=== Starting SEO Audit ===');
    console.log('Normalized URL:', normalizedUrl);
    console.log('API_BASE:', API_BASE);
    console.log('localStorage keys:', Object.keys(localStorage));
    
    try {
      const token = localStorage.getItem('supabase.auth.token');
      console.log('=== SEO Audit Token Check ===');
      console.log('Token from localStorage:', token ? `${token.substring(0, 30)}...` : 'NOT FOUND');
      console.log('Token exists:', !!token);
      console.log('Token type:', typeof token);
      console.log('Token length:', token ? token.length : 0);
      console.log('All localStorage keys:', Object.keys(localStorage));
      
      if (!token || token.trim() === '') {
        const msg = 'No authentication token found. Please log in and try again.';
        console.error('=== SEO Audit Authentication Failed ===', msg);
        console.log('Current auth state - Check browser DevTools > Application > localStorage');
        setError(msg);
        setIsAuditing(false);
        alert(msg);
        return;
      }

      const requestBody = { url: normalizedUrl };
      console.log('Request body:', requestBody);
      console.log('Sending request to:', `${API_BASE}/seo-audit`);
      console.log('Authorization header:', `Bearer ${token.substring(0, 20)}...`);

      const response = await fetch(`${API_BASE}/seo-audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers));
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        const errorMsg = data.error || `HTTP ${response.status}`;
        console.error('API Error:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('Setting audit results:', data.audit);
      setAuditResults(data.audit);
      setShowResults(true);
      
      // Refresh usage to show updated audit count
      if (refreshUsage) {
        console.log('Refreshing usage');
        await refreshUsage();
      }
    } catch (err: any) {
      console.error('Audit error details:', {
        message: err.message,
        stack: err.stack,
        err: err
      });
      const errorMessage = err.message || 'Failed to run SEO audit';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsAuditing(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRunAudit();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PricingModal 
        isOpen={showPricing} 
        onClose={() => setShowPricing(false)}
        highlightPlan="pro"
      />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo size="sm" className="md:hidden" />
            <Logo size="md" className="hidden md:block" />
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Free SEO Audit
            </h1>
            {currentPlan === 'free' && (
              <Badge variant="warning">
                {auditsRemaining} remaining
              </Badge>
            )}
            {currentPlan !== 'free' && (
              <Badge 
                variant="success"
                style={{ backgroundColor: '#f724de', color: 'white', border: 'none' }}
              >
                <Crown className="w-3 h-3" />
                Unlimited
              </Badge>
            )}
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get actionable insights to improve your website's search ranking and performance
          </p>
        </div>

        {/* Upgrade Prompt for Free Users */}
        {currentPlan === 'free' && !canRunSEOAudit && (
          <div className="mb-8">
            <UpgradePrompt 
              feature="seoAudit" 
              onUpgrade={() => setShowPricing(true)}
            />
          </div>
        )}

        {/* URL Input Form */}
        {!showResults && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    label="Website URL"
                    type="text"
                    placeholder="google.com or https://yourbusiness.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isAuditing}
                >
                  {isAuditing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Run SEO Audit
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {showResults && (
          <div className="space-y-6">
            {/* Score Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Results</h2>
                    <p className="text-gray-600 dark:text-gray-400">for {url}</p>
                  </div>
                  <Button variant="outline" onClick={() => setShowResults(false)}>
                    <Search className="w-4 h-4" />
                    New Audit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <ProgressCircle value={auditResults?.performance || 0} label="Performance" />
                  <ProgressCircle value={auditResults?.seoScore || 0} label="SEO" />
                  <ProgressCircle value={auditResults?.accessibility || 0} label="Accessibility" />
                  <ProgressCircle value={auditResults?.bestPractices || 0} label="Best Practices" />
                </div>
              </CardContent>
            </Card>

            {/* Issues Found */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold text-gray-900">Issues Found</h3>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {(() => {
                    const issuesData = auditResults?.issues || {};
                    const allIssues: Array<{text: string; severity: string}> = [];
                    
                    // Convert from backend format {critical: [strings], warnings: [strings], opportunities: [strings]}
                    if (Array.isArray(issuesData.critical)) {
                      issuesData.critical.forEach((issue: string) => {
                        allIssues.push({text: issue, severity: 'high'});
                      });
                    }
                    if (Array.isArray(issuesData.warnings)) {
                      issuesData.warnings.forEach((issue: string) => {
                        allIssues.push({text: issue, severity: 'medium'});
                      });
                    }
                    if (Array.isArray(issuesData.opportunities)) {
                      issuesData.opportunities.forEach((issue: string) => {
                        allIssues.push({text: issue, severity: 'low'});
                      });
                    }
                    
                    // If no issues, show a message
                    if (allIssues.length === 0) {
                      return <p className="p-6 text-gray-600 dark:text-gray-400">No issues found!</p>;
                    }
                    
                    return allIssues.map((issue, index) => (
                      <div key={index} className="p-6 flex items-start gap-4">
                        <div
                          className={`p-2 rounded-lg shrink-0 ${
                            issue.severity === 'high'
                              ? 'bg-red-100 dark:bg-red-900/20'
                              : issue.severity === 'medium'
                              ? 'bg-amber-100 dark:bg-amber-900/20'
                              : 'bg-blue-100 dark:bg-blue-900/20'
                          }`}
                        >
                          {issue.severity === 'high' && (
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          )}
                          {issue.severity === 'medium' && (
                            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          )}
                          {issue.severity === 'low' && (
                            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {issue.severity === 'high' && '🔴 '}
                              {issue.severity === 'medium' && '🟡 '}
                              {issue.severity === 'low' && '🔵 '}
                              {issue.text}
                            </h4>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold text-gray-900">Recommendations</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(auditResults?.recommendations || []).map((rec, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                      <p className="text-gray-700 dark:text-gray-300">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="border-2" style={{ backgroundColor: '#f4f0e5', borderColor: '#f724de' }}>
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#f724de' }}>
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Want us to fix these issues?
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                  Let SalesAPE.ai create an optimized website for you with perfect SEO, accessibility, and performance - all automatically handled.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/create-website')}
                >
                  Create Optimized Website
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}