/**
 * usePageTitles Hook
 * Sets page title and meta tags for SEO
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface PageMetadata {
  title: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

// Page metadata mapping
const PAGE_METADATA: Record<string, PageMetadata> = {
  "/": {
    title: "SalesAPE - Transform Your Business Into A Website With AI",
    description:
      "Turn your business into a fully operational website with AI-powered lead capture and booking in minutes.",
    keywords: ["website builder", "AI", "lead capture", "small business"],
  },
  "/audit": {
    title: "Free SEO & AEO Audit - SalesAPE",
    description:
      "Get a comprehensive audit of your website's SEO and Answer Engine Optimization performance.",
    keywords: ["SEO audit", "AEO", "website audit", "free tool"],
  },
  "/dashboard": {
    title: "Dashboard - SalesAPE",
    description: "Manage your websites, leads, and bookings in one place.",
    keywords: ["dashboard", "leads", "booking", "websites"],
  },
  "/create-website": {
    title: "Create Website - SalesAPE",
    description:
      "Create a professional website for your business in minutes with AI.",
    keywords: ["create website", "AI website builder", "web design"],
  },
  "/seo-audit": {
    title: "SEO Audit - SalesAPE",
    description:
      "Complete SEO audit of your website with actionable recommendations.",
    keywords: ["SEO audit", "optimization", "recommendations"],
  },
  "/manage-bookings": {
    title: "Manage Bookings - SalesAPE",
    description: "Manage and organize all your client bookings in one place.",
    keywords: ["bookings", "calendar", "appointments", "scheduling"],
  },
  "/payment-success": {
    title: "Payment Successful - SalesAPE",
    description: "Your payment has been processed successfully.",
    keywords: ["payment", "success", "subscription"],
  },
};

export function usePageTitle() {
  const location = useLocation();

  useEffect(() => {
    // Get metadata for current page
    const metadata = PAGE_METADATA[location.pathname] || PAGE_METADATA["/"];

    // Update document title
    document.title = metadata.title;

    // Update meta tags
    updateMetaTag("description", metadata.description || "");
    updateMetaTag("keywords", metadata.keywords?.join(", ") || "");

    // Open Graph tags
    updateMetaTag("og:title", metadata.title, "property");
    updateMetaTag("og:description", metadata.description || "", "property");

    if (metadata.ogImage) {
      updateMetaTag("og:image", metadata.ogImage, "property");
    }

    // Twitter Card tags
    updateMetaTag("twitter:title", metadata.title, "name");
    updateMetaTag("twitter:description", metadata.description || "", "name");
  }, [location.pathname]);
}

// Helper function to update or create meta tags
function updateMetaTag(
  name: string,
  content: string,
  type: "name" | "property" = "name",
) {
  if (!content) return;

  let tag = document.querySelector(
    `meta[${type}="${name}"]`,
  ) as HTMLMetaElement;

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(type, name);
    document.head.appendChild(tag);
  }

  tag.content = content;
}

/**
 * Manual page title setter
 */
export function setPageTitle(title: string, description?: string) {
  document.title = title;
  if (description) {
    updateMetaTag("description", description);
  }
}
