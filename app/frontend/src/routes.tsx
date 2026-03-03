import { lazy, Suspense } from "react";
import { createBrowserRouter, RouteObject, Outlet } from "react-router-dom";
import { Loader } from "lucide-react";

// Screen imports - static
import { AuthScreen } from "./screens/AuthScreen";
import { Dashboard } from "./screens/Dashboard";
import { RecapScreen } from "./screens/RecapScreen";
import { SEOAudit } from "./screens/SEOAudit";
import { Analytics } from "./screens/Analytics";
import { PublicAudit } from "./screens/PublicAudit";
import { PaymentSuccess } from "./screens/PaymentSuccess";
import { ManageBookings } from "./screens/manage-bookings";
import { Settings } from "./screens/Settings";

// Screen imports - lazy loaded
const CreateWebsite = lazy(() =>
  import("./screens/create-website").then((m) => ({
    default: m.CreateWebsite,
  }))
);
const ConversationUI = lazy(() =>
  import("./screens/ConversationUI").then((m) => ({
    default: m.ConversationUI,
  }))
);
const ConversationQuestion = lazy(() =>
  import("./screens/ConversationQuestion").then((m) => ({
    default: m.ConversationQuestion,
  }))
);
const GeneratingWebsite = lazy(() =>
  import("./screens/GeneratingWebsite").then((m) => ({
    default: m.GeneratingWebsite,
  }))
);
const WebsitePreview = lazy(() =>
  import("./screens/WebsitePreview").then((m) => ({
    default: m.WebsitePreview,
  }))
);
const ContentStudio = lazy(() =>
  import("./screens/ContentStudio").then((m) => ({
    default: m.ContentStudio,
  }))
);
const LiveWebsite = lazy(() =>
  import("./screens/LiveWebsite").then((m) => ({
    default: m.LiveWebsite,
  }))
);

// Component imports
import { Dashboard as DashboardMetrics } from "./components/Dashboard";
import { TeamManagement } from "./components/TeamManagement";
import { ProtectedLayout } from "./layouts/ProtectedLayout";
import { AppShell } from "./components/AppShell";

// Hook imports
import { usePageTitle } from "./hooks/usePageTitle";

/**
 * Loading fallback component for lazy-loaded routes
 */
const LoadingFallback = () => (
  <div className="p-6 flex items-center justify-center">
    <Loader className="w-8 h-8 animate-spin" />
  </div>
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
      { path: "audit", element: <PublicAudit /> },
      {
        path: "live/:id",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <LiveWebsite />
          </Suspense>
        ),
      },

      // Protected Routes
      {
        element: <ProtectedLayout />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          {
            path: "dashboard/metrics",
            element: <DashboardMetrics businessId="" />,
          },
          {
            path: "team/management",
            element: <TeamManagement businessId="" />,
          },
          {
            path: "content-studio",
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ContentStudio />
              </Suspense>
            ),
          },
          { path: "analytics", element: <Analytics /> },
          { path: "settings", element: <Settings /> },
          {
            path: "create-website",
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <CreateWebsite />
              </Suspense>
            ),
          },
          {
            path: "onboarding",
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ConversationUI />
              </Suspense>
            ),
          },
          {
            path: "conversation/:sessionId/question",
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ConversationQuestion />
              </Suspense>
            ),
          },
          { path: "recap", element: <RecapScreen /> },
          { path: "seo-audit", element: <SEOAudit /> },
          { path: "manage-bookings", element: <ManageBookings /> },
          {
            path: "website-preview/:id",
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <WebsitePreview />
              </Suspense>
            ),
          },
          {
            path: "generating/:id",
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <GeneratingWebsite />
              </Suspense>
            ),
          },
          { path: "payment-success", element: <PaymentSuccess /> },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
