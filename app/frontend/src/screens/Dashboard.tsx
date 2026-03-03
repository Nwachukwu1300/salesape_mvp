import { toast } from "sonner";
import { useNavigate } from "react-router";
import { getAccessToken } from "../lib/supabase";
import { API_BASE } from "../lib/api";
import { Button } from "../components/Button";
import { Card, CardHeader, CardContent } from "../components/Card";
import { StatCard } from "../components/StatCard";
import { Badge } from "../components/Badge";
import { PricingModal } from "../components/PricingModal";
import { UpgradePrompt } from "../components/UpgradePrompt";
import { CalendarIntegrationModal } from "../components/CalendarIntegrationModal";
import { useSubscription } from "../contexts/SubscriptionContext";
import { useAuth } from "../contexts/AuthContext";
import { PRICING_PLANS } from "../lib/stripe";
import { useState } from "react";
import React from "react";
import {
  Plus,
  Search,
  Calendar,
  Globe,
  Users,
  TrendingUp,
  Eye,
  ExternalLink,
  Trash2,
  Crown,
  Zap,
} from "lucide-react";

type SeoRankingItem = {
  businessId: string;
  businessName: string;
  rank: number;
  score: number;
  latestSeoScore: number | null;
  avgSeoScore: number | null;
  auditsCount: number;
  lastAuditAt: string | null;
  isPublished: boolean;
};

export function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const {
    currentPlan,
    canCreateWebsite,
    canRunSEOAudit,
    usage,
    seoAuditsRemaining,
    refreshUsage,
  } = useSubscription();
  const [showPricing, setShowPricing] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [websites, setWebsites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [seoRankings, setSeoRankings] = useState<SeoRankingItem[]>([]);
  const apiBase =
    API_BASE ||
    (typeof window !== "undefined"
      ? `http://${window.location.hostname}:3001`
      : "http://localhost:3001");

  // Fetch user's websites from backend
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = getAccessToken();
        if (!token) {
          setWebsites([]);
          setDashboardStats(null);
          setSeoRankings([]);
          return;
        }

        // Fetch businesses list
        const businessesResponse = await fetch(
          `${apiBase}/businesses`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (businessesResponse.ok) {
          const data = await businessesResponse.json();
          // Map business records to website format for display
          const websitesList = (Array.isArray(data) ? data : []).map(
            (business: any) => ({
              id: business.id,
              name: business.name,
              url: business.slug
                ? `${business.slug}.salesape.ai`
                : `website-${business.id.substring(0, 8)}.salesape.ai`,
              status: business.isPublished ? "Live" : "Draft",
              leads: business.leads?.length || 0,
              bookings: business.bookings?.length || 0,
              lastUpdated: new Date(
                business.updatedAt || business.createdAt,
              ).toLocaleDateString(),
            }),
          );
          setWebsites(websitesList);
          const localRankings = (Array.isArray(data) ? data : [])
            .map((business: any) => ({
              businessId: business.id,
              businessName: business.name,
              rank: 0,
              score:
                typeof business.seoScore === "number"
                  ? business.seoScore
                  : 0,
              latestSeoScore:
                typeof business.seoScore === "number"
                  ? business.seoScore
                  : null,
              avgSeoScore:
                typeof business.seoScore === "number"
                  ? business.seoScore
                  : null,
              auditsCount: 0,
              lastAuditAt: null,
              isPublished: !!business.isPublished,
            }))
            .sort((a: SeoRankingItem, b: SeoRankingItem) => b.score - a.score)
            .map((item: SeoRankingItem, index: number) => ({
              ...item,
              rank: index + 1,
            }));
          setSeoRankings(localRankings);
        }

        // Fetch dashboard stats
        try {
          const statsResponse = await fetch(
            `${apiBase}/dashboard/stats`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (statsResponse.ok) {
            const stats = await statsResponse.json();
            setDashboardStats(stats.summary || stats);
          }
        } catch (statsError) {
          console.warn(
            "Failed to fetch dashboard stats, using local calculations:",
            statsError,
          );
          // Stats will be calculated from websites array as fallback
        }

        // Fetch per-website SEO rankings
        try {
          const rankingsResponse = await fetch(
            `${apiBase}/dashboard/seo-rankings`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (rankingsResponse.ok) {
            const body = await rankingsResponse.json();
            setSeoRankings(
              Array.isArray(body?.rankings) ? body.rankings : [],
            );
          }
        } catch (rankingsError) {
          console.warn("Failed to fetch SEO rankings, using local fallback:", rankingsError);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setWebsites([]);
        setDashboardStats(null);
        setSeoRankings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiBase]);

  const handleCreateWebsite = () => {
    if (!canCreateWebsite) {
      setShowPricing(true);
      return;
    }
    navigate("/create-website");
  };

  const handleDeleteWebsite = async (
    websiteId: string,
    websiteName: string,
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${websiteName}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(websiteId);
      const token = getAccessToken();

      const response = await fetch(
        `${apiBase}/businesses/${websiteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setWebsites(websites.filter((w) => w.id !== websiteId));
        toast.info(`Website "${websiteName}" deleted successfully`);
        try {
          if (refreshUsage) await refreshUsage();
        } catch (err) {
          console.warn("Failed to refresh usage after delete", err);
        }
      } else {
        const errorData = await response.json();
        toast.info(`Error: ${errorData.error || "Failed to delete website"}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.info("Error deleting website. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const getSeoScoreColor = (score: number) => {
    if (score >= 90) return "#16a34a";
    if (score >= 70) return "#d97706";
    return "#dc2626";
  };

  const getSeoScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score > 0) return "Needs work";
    return "No audit yet";
  };

  const seoByBusinessId = React.useMemo(() => {
    return new Map(seoRankings.map((item) => [item.businessId, item]));
  }, [seoRankings]);

  return (
    <div className="min-h-full w-full bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 lg:p-6">
      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        highlightPlan="pro"
      />

      {/* Main Content */}
      <main className="w-full px-0 py-6 sm:py-8">
        {/* Welcome Section with Action Bar */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's what's happening with your websites today
            </p>
          </div>
          <div className="flex items-center gap-2">
            {currentPlan !== "free" && (
              <Badge
                variant="warning"
                style={{
                  backgroundColor: "#f724de",
                  color: "white",
                  border: "none",
                }}
              >
                <Crown className="w-3 h-3" />
                {PRICING_PLANS[currentPlan].name}
              </Badge>
            )}
          </div>
        </div>

        {/* Upgrade Prompt for Free Users */}
        {currentPlan === "free" && !canCreateWebsite && (
          <div className="mb-8">
            <UpgradePrompt
              feature="website"
              onUpgrade={() => setShowPricing(true)}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleCreateWebsite}
          >
            <Plus className="w-5 h-5" />
            Create New Website
            {!canCreateWebsite && <Crown className="w-4 h-4 ml-2" />}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => {
              if (currentPlan === "free" && !canRunSEOAudit) {
                setShowPricing(true);
              } else {
                navigate("/seo-audit");
              }
            }}
            disabled={currentPlan === "free" && !canRunSEOAudit}
          >
            <Search className="w-5 h-5" />
            Run SEO Audit
            <span className="text-xs font-semibold">
              {currentPlan === "free" ? `(${seoAuditsRemaining}/2)` : ""}
            </span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate("/manage-bookings")}
          >
            <Calendar className="w-5 h-5" />
            Manage Bookings
          </Button>
        </div>

        {/* Stats Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Active Websites"
              value={
                dashboardStats?.liveWebsites ??
                websites.filter((w) => w.status === "Live").length
              }
              icon={Globe}
              trend={{
                value: `${dashboardStats?.totalWebsites ?? websites.length} total`,
                positive:
                  (dashboardStats?.totalWebsites ?? websites.length) > 0,
              }}
            />
            <StatCard
              title="Total Leads"
              value={
                dashboardStats?.totalLeads ??
                websites.reduce((sum, w) => sum + w.leads, 0)
              }
              icon={Users}
              trend={{
                value: dashboardStats?.totalLeads
                  ? "+0 this week"
                  : "Start with a website",
                positive: true,
              }}
            />
            <StatCard
              title="Conversion Rate"
              value={
                dashboardStats?.conversionRate
                  ? `${(dashboardStats.conversionRate * 100).toFixed(1)}%`
                  : "0%"
              }
              icon={TrendingUp}
              trend={{
                value: "Leads to Bookings",
                positive: (dashboardStats?.conversionRate ?? 0) > 0,
              }}
            />
            <StatCard
              title="Avg SEO Score"
              value={
                dashboardStats?.avgSeoScore
                  ? Math.round(dashboardStats.avgSeoScore)
                  : "N/A"
              }
              icon={Search}
              trend={{
                value: "Domain Authority",
                positive: (dashboardStats?.avgSeoScore ?? 0) > 50,
              }}
            />
          </div>
        )}

        {/* Websites List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Your Websites
              </h2>
              {websites.filter((w) => w.status === "Live").length > 0 && (
                <Badge variant="info">
                  {websites.filter((w) => w.status === "Live").length} Live
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {websites.map((website) => (
                <div
                  key={website.id}
                  className="rounded-xl border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => navigate(`/website-preview/${website.id}`)}
                >
                  {(() => {
                    const seo = seoByBusinessId.get(website.id);
                    const seoScore = Math.max(
                      0,
                      Math.min(100, seo?.score ?? 0),
                    );
                    return (
                      <>
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                              {website.name}
                            </h3>
                            <a
                              href={`https://${website.url}`}
                              className="mt-0.5 flex items-center gap-1 break-all text-xs"
                              style={{ color: "#f724de" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {website.url}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {seo?.rank ? (
                              <Badge variant="info">#{seo.rank}</Badge>
                            ) : null}
                            {website.status === "Live" && (
                              <Badge variant="success">Live</Badge>
                            )}
                          </div>
                        </div>

                        <div className="mb-3 flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0">
                            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                              <circle
                                cx="50"
                                cy="50"
                                r="42"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="10"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="42"
                                fill="none"
                                stroke={getSeoScoreColor(seoScore)}
                                strokeWidth="10"
                                strokeDasharray={`${(seoScore / 100) * 263.9} 263.9`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[11px] font-bold text-gray-900 dark:text-white">
                                {seoScore}
                              </span>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1 text-[11px] text-gray-600 dark:text-gray-300">
                            <p className="truncate">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                SEO:
                              </span>{" "}
                              {getSeoScoreLabel(seoScore)}
                            </p>
                            <p className="truncate">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                Latest:
                              </span>{" "}
                              {seo?.latestSeoScore ?? "N/A"} ·{" "}
                              <span className="font-semibold text-gray-900 dark:text-white">
                                Avg:
                              </span>{" "}
                              {seo?.avgSeoScore ?? "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="mb-3 grid grid-cols-3 gap-2 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {website.leads} leads
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {website.bookings} books
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Zap className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400 truncate">
                              {website.lastUpdated}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 flex-1 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/website-preview/${website.id}`);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteWebsite(website.id, website.name);
                            }}
                            disabled={deletingId === website.id}
                            className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-md border border-red-600 px-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {deletingId === website.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Empty State for No Websites */}
        {websites.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "#f4f0e5" }}
              >
                <Globe className="w-8 h-8" style={{ color: "#f724de" }} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No websites yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Create your first AI-powered website in just 2 minutes. We'll
                handle everything from design to lead capture.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate("/create-website")}
              >
                <Plus className="w-5 h-5" />
                Create Your First Website
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Connect Calendar Button */}
        <div className="fixed bottom-4 right-3 z-30 sm:bottom-6 sm:right-6">
          <Button
            variant="primary"
            onClick={() => setShowCalendarModal(true)}
            className="rounded-full shadow-lg hover:shadow-xl"
          >
            <Calendar className="w-5 h-5" />
            <span className="hidden sm:inline">Connect Calendar</span>
          </Button>
        </div>

        {/* Pricing Modal */}
        <PricingModal
          isOpen={showPricing}
          onClose={() => setShowPricing(false)}
          plans={PRICING_PLANS}
        />

        {/* Calendar Integration Modal */}
        <CalendarIntegrationModal
          isOpen={showCalendarModal}
          onClose={() => setShowCalendarModal(false)}
        />
      </main>
    </div>
  );
}
