import React from "react";
import { createBrowserRouter, RouteObject, Outlet } from "react-router-dom";
import { AuthScreen } from "./screens/AuthScreen";
import { Dashboard } from "./screens/Dashboard";
import { RecapScreen } from "./screens/RecapScreen";
import { SEOAudit } from "./screens/SEOAudit";
import { Analytics } from "./screens/Analytics";
import { PublicAudit } from "./screens/PublicAudit";
import { PaymentSuccess } from "./screens/PaymentSuccess";
import { ManageBookings } from "./screens/manage-bookings";
import { Loader } from "lucide-react";

const CreateWebsite = React.lazy(() => import("./screens/create-website").then(m => ({ default: m.CreateWebsite })));
const ConversationUI = React.lazy(() => import("./screens/ConversationUI").then(m => ({ default: m.ConversationUI })));
const ConversationQuestion = React.lazy(() => import("./screens/ConversationQuestion").then(m => ({ default: m.ConversationQuestion })));
const GeneratingWebsite = React.lazy(() => import("./screens/GeneratingWebsite").then(m => ({ default: m.GeneratingWebsite })));
const WebsitePreview = React.lazy(() => import("./screens/WebsitePreview").then(m => ({ default: m.WebsitePreview })));

const ContentStudio = React.lazy(() => import("./screens/ContentStudio").then((m) => ({ default: m.ContentStudio })));
import { Settings } from "./screens/Settings";
import { AppShell } from "./components/AppShell";
import { usePageTitle } from "./hooks/usePageTitle";
// Phase 4 Components
import { Dashboard as DashboardMetrics } from "./components/Dashboard";
import { ContentCalendar } from "./components/ContentCalendar";
import { ApprovalQueue } from "./components/ApprovalQueue";
import { TeamManagement } from "./components/TeamManagement";

// Root layout component that runs page title hook
const RootLayout = () => {
  usePageTitle();
  return <Outlet />;
};

// Layout wrapper for authenticated pages
import { ProtectedLayout } from "./layouts/ProtectedLayout";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // Public Routes
      { index: true, element: <AuthScreen /> },
      { path: "login", element: <AuthScreen /> },
      { path: "audit", element: <PublicAudit /> },

      // 🔒 Protected Routes
      {
        element: <ProtectedLayout />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "dashboard/metrics", element: <DashboardMetrics businessId="" /> },
          { path: "schedule", element: <ContentCalendar businessId="" /> },
          { path: "approvals", element: <ApprovalQueue businessId="" /> },
          { path: "team/management", element: <TeamManagement businessId="" /> },
          { path: "content-studio", element: (<React.Suspense fallback={<div />}> <ContentStudio /> </React.Suspense>) },
          { path: "analytics", element: <Analytics /> },
          { path: "settings", element: <Settings /> },
          { path: "create-website", element: (<React.Suspense fallback={<div className="p-6 flex items-center justify-center"><Loader className="w-8 h-8 animate-spin"/></div>}> <CreateWebsite /> </React.Suspense>) },
          { path: "onboarding", element: (<React.Suspense fallback={<div className="p-6 flex items-center justify-center"><Loader className="w-8 h-8 animate-spin"/></div>}> <ConversationUI /> </React.Suspense>) },
          { path: "conversation/:sessionId/question", element: (<React.Suspense fallback={<div className="p-6 flex items-center justify-center"><Loader className="w-8 h-8 animate-spin"/></div>}> <ConversationQuestion /> </React.Suspense>) },
          { path: "recap", element: <RecapScreen /> },
          { path: "seo-audit", element: <SEOAudit /> },
          { path: "manage-bookings", element: <ManageBookings /> },
          { path: "website-preview/:id", element: (<React.Suspense fallback={<div className="p-6 flex items-center justify-center"><Loader className="w-8 h-8 animate-spin"/></div>}> <WebsitePreview /> </React.Suspense>) },
          { path: "generating/:id", element: (<React.Suspense fallback={<div className="p-6 flex items-center justify-center"><Loader className="w-8 h-8 animate-spin"/></div>}> <GeneratingWebsite /> </React.Suspense>) },
          { path: "payment-success", element: <PaymentSuccess /> },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);