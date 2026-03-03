import { useState } from "react";
import { useNavigate } from "react-router";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { Card, CardContent, CardHeader } from "../components/Card";
import { ProgressCircle } from "../components/ProgressCircle";
import { Badge } from "../components/Badge";
import { ThemeToggle } from "../components/ThemeToggle";
import { API_BASE } from "../lib/api";
import { toast } from "sonner";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Gauge,
  Globe,
  LineChart,
  MonitorSmartphone,
  Search,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";

type Severity = "critical" | "warning" | "info";
type Impact = "high" | "medium" | "low";

interface AuditResult {
  id: string;
  url: string;
  overallScore: number;
  seoScore: number;
  performanceScore: number;
  mobileScore: number;
  issues: string[];
  recommendations: string[];
}

function inferSeverity(text: string, idx: number): Severity {
  const t = text.toLowerCase();
  if (t.includes("missing") || t.includes("broken") || t.includes("error") || t.includes("failed")) return "critical";
  if (t.includes("slow") || t.includes("improve") || t.includes("warning") || t.includes("optimiz")) return "warning";
  return idx === 0 ? "critical" : idx < 3 ? "warning" : "info";
}

function severityToImpact(severity: Severity): Impact {
  if (severity === "critical") return "high";
  if (severity === "warning") return "medium";
  return "low";
}

export function PublicAudit() {
  const navigate = useNavigate();
  const apiBase =
    API_BASE ||
    (typeof window !== "undefined"
      ? `http://${window.location.hostname}:3001`
      : "http://localhost:3001");
  const [formData, setFormData] = useState({ fullName: "", email: "", company: "", websiteUrl: "" });
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");

  const normalizeWebsiteUrl = (raw: string): string | null => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
      const parsed = new URL(normalized);
      if (!parsed.hostname || !parsed.hostname.includes(".")) return null;
      return normalized;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.fullName.trim()) return setError("Please enter your full name.");
    if (!formData.email.trim()) return setError("Please enter your email address.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) return setError("Please enter a valid email address.");
    if (!formData.company.trim()) return setError("Please enter your company name.");
    const normalizedWebsite = normalizeWebsiteUrl(formData.websiteUrl);
    if (!normalizedWebsite) {
      return setError("Enter a valid website (example: firstbank.com or https://firstbank.com).");
    }

    setIsAuditing(true);
    try {
      const response = await fetch(`${apiBase}/seo-audit-public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website: normalizedWebsite, email: formData.email.trim() }),
      });
      if (!response.ok) {
        if (response.status === 429) setError("You can run one free audit per week. Please try again next week.");
        else {
          const body = await response.json().catch(() => ({}));
          setError(body?.error || "Failed to run audit.");
        }
        return;
      }
      const result = (await response.json()) as AuditResult;
      setAuditResult(result);
      toast.success("Audit completed successfully.");
      setTimeout(() => document.getElementById("audit-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run audit. Please try again.");
    } finally {
      setIsAuditing(false);
    }
  };

  const overallScore = auditResult?.overallScore ?? 0;
  const scoreColor = overallScore >= 90 ? "#10b981" : overallScore >= 70 ? "#f59e0b" : "#ef4444";
  const scoreLabel = overallScore >= 90 ? "Excellent" : overallScore >= 70 ? "Good" : overallScore >= 50 ? "Needs Work" : "Poor";

  const technicalIssues = (auditResult?.issues || []).map((issue, index) => ({ severity: inferSeverity(issue, index), title: issue }));
  const mobileIssues = (auditResult?.issues || []).slice(0, 4).map((issue, i) => ({ title: issue, impact: severityToImpact(inferSeverity(issue, i)) }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/85 dark:bg-gray-800/85 border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" onClick={() => navigate("/")}>Sign In</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {!auditResult && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-3 border border-fuchsia-200 dark:border-fuchsia-900" style={{ backgroundColor: "#f4f0e5" }}>
                <Sparkles className="w-4 h-4" style={{ color: "#f724de" }} />
                <span className="text-sm font-medium text-gray-900">Free Website Audit</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">Discover How Your Website <span style={{ color: "#f724de" }}>Actually Performs</span></h1>
              <p className="text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">Get technical SEO, performance, and mobile diagnostics with real backend data.</p>
            </div>

            <Card className="shadow-xl">
              <CardContent className="p-4 md:p-5">
                <form onSubmit={handleSubmit} noValidate className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <input
                      className="h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                    <input
                      type="email"
                      className="h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                    <input
                      className="h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm"
                      placeholder="Company Name"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      inputMode="url"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      className="h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm"
                      placeholder="https://yourwebsite.com"
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                      required
                    />
                    <Button type="submit" variant="primary" className="h-10 w-full" disabled={isAuditing}>
                      {isAuditing ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Analyzing...</> : <><Search className="w-4 h-4" />Run Audit</>}
                    </Button>
                  </div>
                  {isAuditing && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Audit in progress (can take up to ~2 min). Live PageSpeed data is being fetched.
                    </p>
                  )}
                  {error && <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 p-2 text-sm text-red-700 dark:text-red-300 flex items-start gap-2"><AlertCircle className="w-4 h-4 mt-0.5" />{error}</div>}
                </form>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-fuchsia-200/70 dark:border-fuchsia-900/50 bg-white/80 dark:bg-gray-900/70 p-4 text-center">
                <Activity className="w-5 h-5 mx-auto text-fuchsia-600 mb-2" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Technical SEO Scan</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Metadata, structure and crawl issues.</p>
              </div>
              <div className="rounded-lg border border-fuchsia-200/70 dark:border-fuchsia-900/50 bg-white/80 dark:bg-gray-900/70 p-4 text-center">
                <LineChart className="w-5 h-5 mx-auto text-cyan-600 mb-2" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Performance Overview</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Core speed and quality scores.</p>
              </div>
              <div className="rounded-lg border border-fuchsia-200/70 dark:border-fuchsia-900/50 bg-white/80 dark:bg-gray-900/70 p-4 text-center">
                <MonitorSmartphone className="w-5 h-5 mx-auto text-amber-600 mb-2" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Mobile UX Snapshot</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Phone usability blockers.</p>
              </div>
            </div>
          </div>
        )}

        {auditResult && (
          <div id="audit-results" className="space-y-6">
            <Card className="border-2" style={{ backgroundColor: "#f4f0e5", borderColor: "#f724de" }}>
              <CardContent className="py-10">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">Audit Complete for {formData.company}</h2>
                  <p className="text-gray-700 break-all">{auditResult.url}</p>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-36 h-36 rounded-full border-[10px] border-gray-200 relative flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full" style={{ boxShadow: `inset 0 0 0 10px ${scoreColor}` }} />
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900">{overallScore}</div>
                      <div className="text-xs text-gray-600">/100</div>
                    </div>
                  </div>
                  <Badge variant="info" style={{ backgroundColor: scoreColor, color: "white", border: "none" }}>{scoreLabel} Overall Performance</Badge>
                </div>
                <div className="grid md:grid-cols-3 gap-5 mt-8">
                  <ProgressCircle value={auditResult.seoScore} label="Technical SEO" />
                  <ProgressCircle value={auditResult.performanceScore} label="Performance" />
                  <ProgressCircle value={auditResult.mobileScore} label="Mobile Experience" />
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader><h3 className="font-bold text-lg flex items-center gap-2"><Globe className="w-5 h-5 text-fuchsia-500" />SEO Issues</h3></CardHeader>
                <CardContent className="space-y-3">
                  {technicalIssues.slice(0, 6).map((issue, index) => (
                    <div key={index} className="text-sm flex gap-2">
                      {issue.severity === "critical" ? <XCircle className="w-4 h-4 text-red-500 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />}
                      <span>{issue.title}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><h3 className="font-bold text-lg flex items-center gap-2"><Gauge className="w-5 h-5 text-fuchsia-500" />Performance</h3></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Performance Score</span><span className="font-semibold">{auditResult.performanceScore}/100</span></div>
                  <div className="flex justify-between"><span>SEO Score</span><span className="font-semibold">{auditResult.seoScore}/100</span></div>
                  <div className="flex justify-between"><span>Mobile Score</span><span className="font-semibold">{auditResult.mobileScore}/100</span></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><h3 className="font-bold text-lg flex items-center gap-2"><Smartphone className="w-5 h-5 text-fuchsia-500" />Mobile Issues</h3></CardHeader>
                <CardContent className="space-y-3">
                  {mobileIssues.map((issue, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-semibold capitalize">{issue.impact}: </span>{issue.title}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {auditResult.recommendations?.length > 0 && (
              <Card>
                <CardHeader><h3 className="font-bold text-lg flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-600" />Priority Recommendations</h3></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {auditResult.recommendations.slice(0, 8).map((r, i) => <div key={i} className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5" /><span>{r}</span></div>)}
                </CardContent>
              </Card>
            )}

            <Card className="border-2" style={{ backgroundColor: "#f4f0e5", borderColor: "#f724de" }}>
              <CardContent className="py-10 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "#f724de" }}>
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">Ready to Fix These Issues?</h3>
                <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">Let SalesAPE build an optimized website with stronger SEO, faster load speed and better mobile UX.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Button variant="primary" size="lg" onClick={() => navigate("/create-website")}><Zap className="w-5 h-5" />Create My Optimized Website<ArrowRight className="w-5 h-5" /></Button>
                  <Button variant="outline" size="lg" onClick={() => navigate("/")}>Sign Up Free</Button>
                </div>
                <div className="mt-6 text-sm text-gray-600 flex justify-center gap-6">
                  <span className="flex items-center gap-2"><Star className="w-4 h-4 text-fuchsia-500" />No credit card required</span>
                  <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-fuchsia-500" />Faster launch</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© 2026 SalesAPE.ai. All rights reserved.</p>
          <p className="mt-2">Powered by SalesAPE.ai</p>
        </div>
      </footer>
    </div>
  );
}
