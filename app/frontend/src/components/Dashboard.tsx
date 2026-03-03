/**
 * Analytics Dashboard
 * Main dashboard page for Phase 4
 */

import React, { useState, useEffect } from "react";
import { Card } from "./Card";
import { Loading } from "./Loading";
import { getAccessToken } from "../lib/supabase";

interface DashboardData {
  totalImpressions: number;
  totalEngagement: number;
  avgEngagementRate: number;
  totalReach: number;
  topPlatforms: Array<{
    platform: string;
    count: number;
    engagement: number;
  }>;
  topContent: Array<{
    id: string;
    platform: string;
    content: string;
    engagement: number;
  }>;
  recentActivity: Array<{
    platform: string;
    action: string;
    timestamp: string;
    metrics: any;
  }>;
}

export const Dashboard: React.FC<{ businessId: string }> = ({ businessId }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [resolvedBusinessId, setResolvedBusinessId] = useState<string>(businessId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveBusinessId = async () => {
      if (businessId) {
        setResolvedBusinessId(businessId);
        return;
      }

      const token = getAccessToken();
      if (!token) {
        setError("Missing auth token");
        setLoading(false);
        return;
      }

      const response = await fetch(`/businesses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Failed to resolve business");
      }
      const businesses = await response.json();
      const id = Array.isArray(businesses) ? businesses[0]?.id : undefined;
      if (!id) throw new Error("No business found for this account");
      setResolvedBusinessId(id);
    };

    resolveBusinessId().catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to resolve business");
      setLoading(false);
    });
  }, [businessId]);

  useEffect(() => {
    if (!resolvedBusinessId) return;
    fetchDashboard();
  }, [resolvedBusinessId]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = getAccessToken();
      if (!token) throw new Error("Missing auth token");
      const response = await fetch(`/businesses/${resolvedBusinessId}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch dashboard");

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <Loading isLoading={true} message="Loading dashboard metrics..." />;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricsCard title="Total Impressions" value={data.totalImpressions} />
        <MetricsCard title="Total Engagement" value={data.totalEngagement} />
        <MetricsCard
          title="Avg Engagement Rate"
          value={`${data.avgEngagementRate.toFixed(2)}%`}
        />
        <MetricsCard title="Total Reach" value={data.totalReach} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlatformComparison platforms={data.topPlatforms} />
        <TopPerformingContent content={data.topContent} />
      </div>

      <RecentActivity activity={data.recentActivity} />
    </div>
  );
};

const MetricsCard: React.FC<{ title: string; value: string | number }> = ({
  title,
  value,
}) => (
  <Card className="p-6">
    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
      {title}
    </h3>
    <p className="text-3xl font-bold mt-2">
      {typeof value === "number" ? value.toLocaleString() : value}
    </p>
  </Card>
);

const PlatformComparison: React.FC<{
  platforms: DashboardData["topPlatforms"];
}> = ({ platforms }) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Top Platforms</h3>
    <div className="space-y-4">
      {platforms.map((platform) => (
        <div
          key={platform.platform}
          className="flex items-center justify-between"
        >
          <div>
            <p className="font-medium capitalize">{platform.platform}</p>
            <p className="text-sm text-gray-500">{platform.count} posts</p>
          </div>
          <div className="text-right">
            <p className="font-bold">{platform.engagement}</p>
            <p className="text-sm text-gray-500">engagement</p>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

const TopPerformingContent: React.FC<{
  content: DashboardData["topContent"];
}> = ({ content }) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Top Content</h3>
    <div className="space-y-4">
      {content.map((item) => (
        <div key={item.id} className="border-l-4 border-blue-500 pl-4">
          <p className="font-medium text-sm">{item.content}</p>
          <p className="text-xs text-gray-500">{item.platform}</p>
          <p className="text-sm font-bold mt-1">
            {item.engagement} engagements
          </p>
        </div>
      ))}
    </div>
  </Card>
);

const RecentActivity: React.FC<{
  activity: DashboardData["recentActivity"];
}> = ({ activity }) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {activity.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between text-sm py-2 border-b last:border-b-0"
        >
          <div>
            <p className="font-medium capitalize">{item.platform}</p>
            <p className="text-gray-500 text-xs">
              {new Date(item.timestamp).toLocaleDateString()}
            </p>
          </div>
          <span className="text-gray-600">{item.action}</span>
        </div>
      ))}
    </div>
  </Card>
);
