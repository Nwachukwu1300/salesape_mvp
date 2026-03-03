/**
 * Approval Queue
 * Content approval workflow interface
 */

import React, { useState, useEffect } from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { Loading } from "./Loading";
import { getAccessToken } from "../lib/supabase";

interface ApprovalContent {
  id: string;
  platform: string;
  content: string;
  caption?: string;
  status: string;
  createdAt: string;
}

export const ApprovalQueue: React.FC<{ businessId: string }> = ({
  businessId,
}) => {
  const [resolvedBusinessId, setResolvedBusinessId] = useState<string>(businessId);
  const [queue, setQueue] = useState<ApprovalContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const resolveBusinessId = async () => {
      if (businessId) {
        setResolvedBusinessId(businessId);
        return;
      }

      const token = getAccessToken();
      if (!token) throw new Error("Missing auth token");
      const response = await fetch(`/businesses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to resolve business");
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
    fetchQueue();
  }, [resolvedBusinessId]);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const token = getAccessToken();
      if (!token) throw new Error("Missing auth token");
      const response = await fetch(
        `/businesses/${resolvedBusinessId}/approval-queue`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch approval queue");

      const result = await response.json();
      setQueue(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Missing auth token");
      const response = await fetch(
        `/businesses/${resolvedBusinessId}/repurposed-content/${id}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment }),
        },
      );

      if (!response.ok) throw new Error("Failed to approve content");

      setQueue(queue.filter((item) => item.id !== id));
      setSelectedId(null);
      setComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve");
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Missing auth token");
      const response = await fetch(
        `/businesses/${resolvedBusinessId}/repurposed-content/${id}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        },
      );

      if (!response.ok) throw new Error("Failed to reject content");

      setQueue(queue.filter((item) => item.id !== id));
      setSelectedId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject");
    }
  };

  if (loading)
    return <Loading isLoading={true} message="Loading approval queue..." />;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Approval Queue</h2>
        <Button variant="ghost" disabled>
          {queue.length} pending
        </Button>
      </div>

      {queue.length === 0 ? (
        <Card className="p-6 text-center text-gray-600 dark:text-gray-400">
          <p>No content pending approval</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {queue.map((item) => (
            <ApprovalCard
              key={item.id}
              item={item}
              selected={selectedId === item.id}
              onSelect={() =>
                setSelectedId(selectedId === item.id ? null : item.id)
              }
              onApprove={() => handleApprove(item.id)}
              onReject={() => handleReject(item.id, "Does not meet standards")}
              comment={comment}
              onCommentChange={setComment}
            />
          ))}
        </div>
      )}

      <ApprovalStats businessId={resolvedBusinessId} />
    </div>
  );
};

const ApprovalCard: React.FC<{
  item: ApprovalContent;
  selected: boolean;
  onSelect: () => void;
  onApprove: () => void;
  onReject: () => void;
  comment: string;
  onCommentChange: (comment: string) => void;
}> = ({
  item,
  selected,
  onSelect,
  onApprove,
  onReject,
  comment,
  onCommentChange,
}) => (
  <div
    className="cursor-pointer"
    onClick={onSelect}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        onSelect();
      }
    }}
  >
    <Card
      className={`p-6 transition ${selected ? "border-2 border-blue-500" : ""}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold capitalize text-blue-600">
              {item.platform}
            </span>
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 px-2 py-1 rounded">
              {item.status}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {new Date(item.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
        <p className="text-sm">{item.content.substring(0, 150)}...</p>
      </div>

      {selected && (
        <div className="mt-4 space-y-4 border-t pt-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Comment (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="Add comment for the creator..."
              rows={3}
            />
          </div>

          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              onClick={onApprove}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              ✓ Approve
            </Button>
            <Button
              onClick={onReject}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              ✗ Reject
            </Button>
          </div>
        </div>
      )}
    </Card>
  </div>
);

const ApprovalStats: React.FC<{ businessId: string }> = ({ businessId }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = getAccessToken();
        if (!token || !businessId) return;
        const response = await fetch(
          `/businesses/${businessId}/approval-stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const result = await response.json();
        setStats(result.data);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [businessId]);

  if (loading || !stats) return null;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Approval Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatItem label="Total" value={stats.total} />
        <StatItem label="Draft" value={stats.draft} />
        <StatItem label="Approved" value={stats.approved} />
        <StatItem label="Published" value={stats.published} />
        <StatItem
          label="Approval Rate"
          value={`${stats.approvalRate.toFixed(1)}%`}
        />
      </div>
    </Card>
  );
};

const StatItem: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <div className="text-center">
    <p className="text-2xl font-bold text-blue-600">
      {typeof value === "number" ? value : value}
    </p>
    <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
  </div>
);
