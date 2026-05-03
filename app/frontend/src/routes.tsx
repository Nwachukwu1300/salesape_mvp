import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";
import type { ComponentType } from "react";
import type { RouteObject } from "react-router-dom";
import { Loader } from "lucide-react";

import { AuthScreen } from "./screens/AuthScreen";

import { ProtectedLayout } from "./layouts/ProtectedLayout";
import { AppShell } from "./components/AppShell";
import { usePageTitle } from "./hooks/usePageTitle";

const lazyNamed = <TProps extends object>(
  loader: () => Promise<Record<string, ComponentType<TProps>>>,
  exportName: string,
) =>
  lazy(async () => {
    const module = await loader();
    return { default: module[exportName] };
  });

const Dashboard = lazyNamed(() => import("./screens/Dashboard"), "Dashboard");
const RecapScreen = lazyNamed(() => import("./screens/RecapScreen"), "RecapScreen");
const SEOAudit = lazyNamed(() => import("./screens/SEOAudit"), "SEOAudit");
const Analytics = lazyNamed(() => import("./screens/Analytics"), "Analytics");
const PublicAudit = lazyNamed(() => import("./screens/PublicAudit"), "PublicAudit");
const PaymentSuccess = lazyNamed(() => import("./screens/PaymentSuccess"), "PaymentSuccess");
const ManageBookings = lazyNamed(() => import("./screens/manage-bookings"), "ManageBookings");
const Settings = lazyNamed(() => import("./screens/Settings"), "Settings");
const CreateWebsite = lazyNamed(() => import("./screens/create-website"), "CreateWebsite");
const ConversationUI = lazyNamed(() => import("./screens/ConversationUI"), "ConversationUI");
const ConversationQuestion = lazyNamed(
  () => import("./screens/ConversationQuestion"),
  "ConversationQuestion",
);
const GeneratingWebsite = lazyNamed(() => import("./screens/GeneratingWebsite"), "GeneratingWebsite");
const WebsitePreview = lazyNamed(() => import("./screens/WebsitePreview"), "WebsitePreview");
const ContentStudio = lazyNamed(() => import("./screens/ContentStudio"), "ContentStudio");
const LiveWebsite = lazyNamed(() => import("./screens/LiveWebsite"), "LiveWebsite");
const DashboardMetrics = lazyNamed(() => import("./components/Dashboard"), "Dashboard");
const TeamManagement = lazyNamed(() => import("./components/TeamManagement"), "TeamManagement");

/**
 * Loading fallback component for lazy-loaded routes
 */
const LoadingFallback = () => (
  <div className="p-6 flex items-center justify-center">
    <Loader className="w-8 h-8 animate-spin" />
  </div>
);

const lazyRoute = (Component: ComponentType) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

const lazyRouteWithProps = <TProps extends object>(
  Component: ComponentType<TProps>,
  props: TProps,
) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component {...props} />
  </Suspense>
);

/**
 * Root layout component that runs page title hook
 */
const RootLayout = () => {
  usePageTitle();
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
};

const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // Public Routes
      { index: true, element: <AuthScreen /> },
      { path: "login", element: <AuthScreen /> },
      { path: "audit", element: lazyRoute(PublicAudit) },
      { path: "live/:id", element: lazyRoute(LiveWebsite) },

      // Protected Routes
      {
        element: <ProtectedLayout />,
        children: [
          { path: "dashboard", element: lazyRoute(Dashboard) },
          {
            path: "dashboard/metrics",
            element: lazyRouteWithProps(DashboardMetrics, { businessId: "" }),
          },
          {
            path: "team/management",
            element: lazyRouteWithProps(TeamManagement, { businessId: "" }),
          },
          { path: "content-studio", element: lazyRoute(ContentStudio) },
          { path: "analytics", element: lazyRoute(Analytics) },
          { path: "settings", element: lazyRoute(Settings) },
          { path: "create-website", element: lazyRoute(CreateWebsite) },
          { path: "onboarding", element: lazyRoute(ConversationUI) },
          { path: "conversation/:sessionId/question", element: lazyRoute(ConversationQuestion) },
          { path: "recap", element: lazyRoute(RecapScreen) },
          { path: "seo-audit", element: lazyRoute(SEOAudit) },
          { path: "manage-bookings", element: lazyRoute(ManageBookings) },
          { path: "website-preview/:id", element: lazyRoute(WebsitePreview) },
          { path: "generating/:id", element: lazyRoute(GeneratingWebsite) },
          { path: "payment-success", element: lazyRoute(PaymentSuccess) },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
