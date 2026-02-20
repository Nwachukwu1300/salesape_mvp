import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { TrendingUp, Eye, Users, CheckCircle, ExternalLink, BookOpen, Award } from 'lucide-react';
import { SidebarNav } from '../components/SidebarNav';

interface AnalyticsMetric {
  value: number | string;
  trend?: number;
  unit?: string;
}

interface AnalyticsData {
  engagementRate: AnalyticsMetric;
  completionRate: AnalyticsMetric;
  viewVelocity: AnalyticsMetric;
  ctr: AnalyticsMetric;
  conversionSignals: AnalyticsMetric;
  aiCitationFrequency: AnalyticsMetric;
  seoImpactTrend: AnalyticsMetric;
  aeoImpactTrend: AnalyticsMetric;
}

export function Analytics() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SidebarNav currentPath="/analytics" />
      <div className="pl-4 md:pl-0 pt-16 md:pt-0">
        <AnalyticsContent />
      </div>
    </div>
  );
}

function AnalyticsContent() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
  const [websites, setWebsites] = useState<any[]>([]);

  useEffect(() => {
    fetchWebsites();
  }, []);

  useEffect(() => {
    if (selectedWebsite) {
      fetchAnalytics(selectedWebsite);
    }
  }, [selectedWebsite]);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('supabase.auth.token');
      if (!token) return;

      const response = await fetch('http://localhost:3001/businesses', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setWebsites(Array.isArray(data) ? data : []);
        if (data.length > 0) {
          setSelectedWebsite(data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch websites:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (websiteId: string) => {
    try {
      const token = localStorage.getItem('supabase.auth.token');
      const response = await fetch(`http://localhost:3001/businesses/${websiteId}/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        // Set default empty analytics
        setAnalytics({
          engagementRate: { value: '0%', trend: 0 },
          completionRate: { value: '0%', trend: 0 },
          viewVelocity: { value: '0', unit: 'views/day', trend: 0 },
          ctr: { value: '0%', trend: 0 },
          conversionSignals: { value: '0', trend: 0 },
          aiCitationFrequency: { value: '0%', trend: 0 },
          seoImpactTrend: { value: 'Neutral', trend: 0 },
          aeoImpactTrend: { value: 'Neutral', trend: 0 },
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Set default empty analytics on error
      setAnalytics({
        engagementRate: { value: '0%', trend: 0 },
        completionRate: { value: '0%', trend: 0 },
        viewVelocity: { value: '0', unit: 'views/day', trend: 0 },
        ctr: { value: '0%', trend: 0 },
        conversionSignals: { value: '0', trend: 0 },
        aiCitationFrequency: { value: '0%', trend: 0 },
        seoImpactTrend: { value: 'Neutral', trend: 0 },
        aeoImpactTrend: { value: 'Neutral', trend: 0 },
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-500 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Track performance metrics across your websites
          </p>

          {/* Website Selector */}
          {websites.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {websites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => setSelectedWebsite(site.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedWebsite === site.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {site.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Analytics Grid */}
        {analytics && (
          <>
            {/* Main Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Engagement Rate */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Engagement Rate
                    </h3>
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics.engagementRate.value}
                    </p>
                    {analytics.engagementRate.trend !== undefined && (
                      <Badge
                        variant={
                          analytics.engagementRate.trend > 0
                            ? 'success'
                            : analytics.engagementRate.trend < 0
                            ? 'error'
                            : 'default'
                        }
                      >
                        {analytics.engagementRate.trend > 0 ? '+' : ''}
                        {analytics.engagementRate.trend}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Compared to last period
                  </p>
                </CardContent>
              </Card>

              {/* Completion Rate */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Completion Rate
                    </h3>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics.completionRate.value}
                    </p>
                    {analytics.completionRate.trend !== undefined && (
                      <Badge
                        variant={
                          analytics.completionRate.trend > 0
                            ? 'success'
                            : analytics.completionRate.trend < 0
                            ? 'error'
                            : 'default'
                        }
                      >
                        {analytics.completionRate.trend > 0 ? '+' : ''}
                        {analytics.completionRate.trend}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    User session completion
                  </p>
                </CardContent>
              </Card>

              {/* View Velocity */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      View Velocity
                    </h3>
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics.viewVelocity.value}
                    </p>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {analytics.viewVelocity.unit}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Page views per day
                  </p>
                </CardContent>
              </Card>

              {/* CTR */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Click-Through Rate
                    </h3>
                    <ExternalLink className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics.ctr.value}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    CTA click rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Conversion Signals */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Conversion Signals
                    </h3>
                    <Award className="w-5 h-5 text-indigo-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {analytics.conversionSignals.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Active conversion events
                  </p>
                </CardContent>
              </Card>

              {/* AI Citation Frequency */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      AI Citation Frequency
                    </h3>
                    <BookOpen className="w-5 h-5 text-fuchsia-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {analytics.aiCitationFrequency.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Content attribution rate
                  </p>
                </CardContent>
              </Card>

              {/* SEO Impact Trend */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      SEO Impact Trend
                    </h3>
                    <TrendingUp className="w-5 h-5 text-teal-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {analytics.seoImpactTrend.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Search ranking direction
                  </p>
                </CardContent>
              </Card>

              {/* AEO Impact Trend */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      AEO Impact Trend
                    </h3>
                    <TrendingUp className="w-5 h-5 text-rose-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {analytics.aeoImpactTrend.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    AI Extract impact
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Disclaimer */}
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50">
              <CardContent className="pt-6">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>Note:</strong> Ranking metrics do not guarantee virality. Analytics are pulled from stored snapshots and updated periodically. Use these insights to inform your content strategy, but remember that organic growth depends on many factors beyond metrics.
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Empty State */}
        {websites.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create a website to start tracking analytics
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
