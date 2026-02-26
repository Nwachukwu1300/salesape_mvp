/**
 * Content Calendar
 * Calendar view for scheduling content
 */

import React, { useState, useEffect } from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { Loading } from "./Loading";

interface ScheduledPost {
  id: string;
  scheduledFor: string;
  status: string;
  repurposedContent: {
    platform: string;
    content: string;
  };
}

interface CalendarData {
  [date: string]: ScheduledPost[];
}

export const ContentCalendar: React.FC<{ businessId: string }> = ({
  businessId,
}) => {
  const [month, setMonth] = useState(new Date());
  const [calendar, setCalendar] = useState<CalendarData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCalendar();
  }, [month, businessId]);

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const monthStr = month.toISOString().split("T")[0];
      const response = await fetch(
        `/api/businesses/${businessId}/schedule/calendar?month=${monthStr}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch calendar");

      const result = await response.json();
      setCalendar(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setMonth(new Date(month.getFullYear(), month.getMonth() - 1));
  };

  const nextMonth = () => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + 1));
  };

  const daysInMonth = getDaysInMonth(month);
  const firstDay = getFirstDayOfMonth(month);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  if (loading)
    return <Loading isLoading={true} message="Loading calendar..." />;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  const monthName = month.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={previousMonth}>← Previous</Button>
          <h2 className="text-2xl font-bold">{monthName}</h2>
          <Button onClick={nextMonth}>Next →</Button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center font-semibold text-sm">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const dateStr = day
              ? new Date(month.getFullYear(), month.getMonth(), day)
                  .toISOString()
                  .split("T")[0]
              : null;
            const posts = dateStr ? calendar[dateStr] || [] : [];

            return (
              <div
                key={index}
                className={`min-h-24 p-2 border rounded ${
                  day
                    ? "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    : "bg-gray-100 dark:bg-gray-900"
                }`}
              >
                {day && (
                  <>
                    <p className="font-semibold text-blue-600">{day}</p>
                    <div className="mt-1 space-y-1">
                      {posts.slice(0, 2).map((post) => (
                        <div
                          key={post.id}
                          className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-2 py-1 rounded truncate"
                          title={post.repurposedContent.content}
                        >
                          {post.repurposedContent.platform}
                        </div>
                      ))}
                      {posts.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{posts.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <ScheduleStats businessId={businessId} />
    </div>
  );
};

const ScheduleStats: React.FC<{ businessId: string }> = ({ businessId }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `/api/businesses/${businessId}/schedule/stats`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
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

  if (loading) return null;
  if (!stats) return null;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Scheduling Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatItem label="Total" value={stats.total} />
        <StatItem label="Pending" value={stats.pending} />
        <StatItem label="Published" value={stats.published} />
        <StatItem label="Failed" value={stats.failed} />
        <StatItem label="Cancelled" value={stats.cancelled} />
      </div>
    </Card>
  );
};

const StatItem: React.FC<{ label: string; value: number }> = ({
  label,
  value,
}) => (
  <div className="text-center">
    <p className="text-2xl font-bold text-blue-600">{value}</p>
    <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
  </div>
);
