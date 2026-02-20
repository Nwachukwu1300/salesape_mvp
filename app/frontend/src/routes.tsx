import React from "react";
import { createBrowserRouter, RouteObject, Outlet } from "react-router";
import { AuthScreen } from "./screens/AuthScreen";
import { Dashboard } from "./screens/Dashboard";
import { CreateWebsite } from "./screens/create-website";
import { RecapScreen } from "./screens/RecapScreen";
import { SEOAudit } from "./screens/SEOAudit";
import { Analytics } from "./screens/Analytics";
import { PublicAudit } from "./screens/PublicAudit";
import { WebsitePreview } from "./screens/WebsitePreview";
import { PaymentSuccess } from "./screens/PaymentSuccess";
import { ManageBookings } from "./screens/manage-bookings";
import { ConversationUI } from "./screens/ConversationUI";
import { ConversationQuestion } from "./screens/ConversationQuestion";
import { GeneratingWebsite } from "./screens/GeneratingWebsite";
import { ContentStudio } from "./screens/ContentStudio";
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
const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => (
  <AppShell>{children}</AppShell>
);

const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "", element: <AuthScreen /> },
      { path: "/login", element: <AuthScreen /> },
      { path: "/audit", element: <PublicAudit /> },
      { path: "/onboarding", element: <AuthenticatedLayout><ConversationUI /></AuthenticatedLayout> },
      { path: "/conversation/:sessionId/question", element: <AuthenticatedLayout><ConversationQuestion /></AuthenticatedLayout> },
      { path: "/recap", element: <AuthenticatedLayout><RecapScreen /></AuthenticatedLayout> },
      { path: "/dashboard", element: <AuthenticatedLayout><Dashboard /></AuthenticatedLayout> },
      { path: "/dashboard/metrics", element: <AuthenticatedLayout><DashboardMetrics businessId="" /></AuthenticatedLayout> },
      { path: "/schedule", element: <AuthenticatedLayout><ContentCalendar businessId="" /></AuthenticatedLayout> },
      { path: "/approvals", element: <AuthenticatedLayout><ApprovalQueue businessId="" /></AuthenticatedLayout> },
      { path: "/team/management", element: <AuthenticatedLayout><TeamManagement businessId="" /></AuthenticatedLayout> },
      { path: "/content-studio", element: <AuthenticatedLayout><ContentStudio /></AuthenticatedLayout> },
      { path: "/analytics", element: <AuthenticatedLayout><Analytics /></AuthenticatedLayout> },
      { path: "/settings", element: <AuthenticatedLayout><Settings /></AuthenticatedLayout> },
      { path: "/create-website", element: <AuthenticatedLayout><CreateWebsite /></AuthenticatedLayout> },
      { path: "/manage-bookings", element: <AuthenticatedLayout><ManageBookings /></AuthenticatedLayout> },
      { path: "/seo-audit", element: <AuthenticatedLayout><SEOAudit /></AuthenticatedLayout> },
      { path: "/website-preview/:id", element: <AuthenticatedLayout><WebsitePreview /></AuthenticatedLayout> },
      { path: "/generating/:id", element: <AuthenticatedLayout><GeneratingWebsite /></AuthenticatedLayout> },
      { path: "/payment-success", element: <AuthenticatedLayout><PaymentSuccess /></AuthenticatedLayout> },
    ],
  },
];

export const router = createBrowserRouter(routes);


