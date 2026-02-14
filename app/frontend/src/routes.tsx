import React from "react";
import { createBrowserRouter, RouteObject } from "react-router";
import { AuthScreen } from "./screens/AuthScreen";
import { Dashboard } from "./screens/Dashboard";
import { CreateWebsite } from "./screens/create-website";
import { RecapScreen } from "./screens/RecapScreen";
import { SEOAudit } from "./screens/SEOAudit";
import { PublicAudit } from "./screens/PublicAudit";
import { WebsitePreview } from "./screens/WebsitePreview";
import { PaymentSuccess } from "./screens/PaymentSuccess";
import { ManageBookings } from "./screens/manage-bookings";
import { ConversationUI } from "./screens/ConversationUI";
import { GeneratingWebsite } from "./screens/GeneratingWebsite";

const routes: RouteObject[] = [
  { path: "/", element: <AuthScreen /> },
  { path: "/audit", element: <PublicAudit /> },
  { path: "/onboarding", element: <ConversationUI /> },
  { path: "/recap", element: <RecapScreen /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/create-website", element: <CreateWebsite /> },
  { path: "/manage-bookings", element: <ManageBookings /> },
  { path: "/seo-audit", element: <SEOAudit /> },
  { path: "/website-preview/:id", element: <WebsitePreview /> },
  { path: "/generating/:id", element: <GeneratingWebsite /> },
  { path: "/payment-success", element: <PaymentSuccess /> },
];

export const router = createBrowserRouter(routes);


