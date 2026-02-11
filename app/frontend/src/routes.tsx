import React from "react";
import { createBrowserRouter, RouteObject } from "react-router";
import { AuthScreen } from "./screens/AuthScreen";
import { Dashboard } from "./screens/Dashboard";
import { CreateWebsite } from "./screens/create-website";
import { SEOAudit } from "./screens/SEOAudit";
import { WebsitePreview } from "./screens/WebsitePreview";
import { PaymentSuccess } from "./screens/PaymentSuccess";
import { ManageBookings } from "./screens/manage-bookings";

const routes: RouteObject[] = [
  { path: "/", element: <AuthScreen /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/create-website", element: <CreateWebsite /> },
  { path: "/manage-bookings", element: <ManageBookings /> },
  { path: "/seo-audit", element: <SEOAudit /> },
  { path: "/website-preview/:id", element: <WebsitePreview /> },
  { path: "/payment-success", element: <PaymentSuccess /> },
];

export const router = createBrowserRouter(routes);
