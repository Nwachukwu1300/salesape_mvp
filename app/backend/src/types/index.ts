/**
 * SalesAPE Core Type Definitions
 * ==============================
 * This file defines all TypeScript interfaces for the SalesAPE platform,
 * ensuring type safety and consistency across backend and frontend.
 */

// ============================================================================
// BUSINESS UNDERSTANDING SCHEMA
// ============================================================================

/**
 * BusinessUnderstanding
 * Represents the complete understanding of a user's business, compiled from:
 * - Scraped website data
 * - Instagram profile data
 * - Conversational AI responses
 * 
 * This is deterministic JSON used to seed website generation.
 */
export interface BusinessUnderstanding {
  businessName: string;
  industry: string;
  services: string[];
  location: string;
  brandTone: "formal" | "friendly" | "luxury" | "casual";
  brandColors: string[];
  logoUrl?: string;
  contactPreferences: {
    email: boolean;
    phone: boolean;
    booking: boolean;
  };
  seoInsights?: SeoAuditResult;
}

// ============================================================================
// SEO AUDIT SCHEMA
// ============================================================================

/**
 * SeoAuditResult
 * Comprehensive audit results for a website including performance, SEO, 
 * accessibility, and best practices scores plus actionable recommendations.
 */
export interface SeoAuditResult {
  url: string;
  scores: {
    performance: number; // 0-100
    seo: number; // 0-100
    accessibility: number; // 0-100
    bestPractices: number; // 0-100
  };
  issues: {
    critical: string[];
    warnings: string[];
    opportunities: string[];
  };
  recommendations: string[];
  createdAt: Date;
}

// ============================================================================
// WEBSITE GENERATION SCHEMA
// ============================================================================

/**
 * WebsiteGenerationConfig
 * Complete configuration object used by the frontend renderer to build websites.
 * This is generated from BusinessUnderstanding and formatted for rendering.
 */
export interface WebsiteGenerationConfig {
  slug: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    font: string;
  };
  sections: ("hero" | "services" | "about" | "testimonials" | "contact" | "booking")[];
  content: {
    heroHeadline: string;
    heroSubtext: string;
    services: Array<{
      title: string;
      description: string;
    }>;
    about: string;
  };
  leadForm: {
    fields: ("name" | "email" | "phone" | "message")[];
  };
  booking: {
    provider: "google" | "calendly";
    calendarId: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

// ============================================================================
// CALENDAR BOOKING SCHEMA
// ============================================================================

/**
 * CalendarBooking
 * Represents a booking made through the platform's calendar integration.
 * Supports both Google Calendar and Calendly.
 */
export interface CalendarBooking {
  id: string;
  businessId: string;
  leadId?: string;
  provider: "google" | "calendly";
  startTime: Date;
  endTime: Date;
  createdAt: Date;
}

// ============================================================================
// LEAD SCHEMA
// ============================================================================

/**
 * LeadData
 * Represents a lead captured through the website's lead form or calendar booking.
 */
export interface LeadData {
  id: string;
  businessId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  status: "new" | "contacted" | "converted" | "declined";
  source?: "web" | "instagram" | "direct" | "calendar";
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// CONVERSATION STATE
// ============================================================================

/**
 * ConversationMessage
 * Message in the onboarding conversation flow between user and AI.
 */
export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/**
 * OnboardingConversationState
 * State tracking for the conversational AI onboarding experience.
 */
export interface OnboardingConversationState {
  sessionId: string;
  businessId?: string;
  userId: string;
  messages: ConversationMessage[];
  extractedData: Partial<BusinessUnderstanding>;
  stage: "initial" | "gathering" | "clarification" | "confirmation" | "complete";
  websiteUrlProvided?: string;
  instagramUrlProvided?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SCRAPED DATA SCHEMA
// ============================================================================

/**
 * ScrapedWebsiteData
 * Data extracted from a website via scraping.
 */
export interface ScrapedWebsiteData {
  url: string;
  title: string;
  description: string;
  headings: string[];
  services: string[];
  contactEmail?: string;
  contactPhone?: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
  imageUrls: string[];
  metaKeywords?: string[];
}

/**
 * ScrapedInstagramData
 * Data extracted from an Instagram profile.
 */
export interface ScrapedInstagramData {
  profileUrl: string;
  username: string;
  displayName: string;
  bio: string;
  followerCount: number;
  postCount: number;
  profileImageUrl: string;
  recentPostCaptions: string[];
  brandVoice: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    website?: string;
  };
}

// ============================================================================
// API REQUEST/RESPONSE SCHEMAS
// ============================================================================

/**
 * CreateWebsiteRequest
 * Request body for creating a new website.
 */
export interface CreateWebsiteRequest {
  businessUnderstanding: BusinessUnderstanding;
  template?: string;
}

/**
 * SeoAuditRequest
 * Request body for running an SEO audit.
 */
export interface SeoAuditRequest {
  url: string;
}

/**
 * SubmitLeadRequest
 * Request body for submitting a lead from the website.
 */
export interface SubmitLeadRequest {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  source?: string;
}

/**
 * CreateBookingRequest
 * Request body for creating a booking.
 */
export interface CreateBookingRequest {
  leadId?: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
}

/**
 * ConversationMessageRequest
 * Request body for sending a message in the onboarding conversation.
 */
export interface ConversationMessageRequest {
  message: string;
  websiteUrl?: string;
  instagramUrl?: string;
}

// ============================================================================
// AUTHENTICATION SCHEMA
// ============================================================================

/**
 * AuthRequest
 * Request body for user registration/login.
 */
export interface AuthRequestBody {
  email: string;
  password: string;
  name?: string;
}

/**
 * AuthResponse
 * Response after successful authentication.
 */
export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  name: string;
}

// ============================================================================
// PAGINATION & FILTERING
// ============================================================================

/**
 * PaginationParams
 * Standard pagination parameters for list endpoints.
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ============================================================================
// ERROR RESPONSE
// ============================================================================

/**
 * ErrorResponse
 * Standard error response format.
 */
export interface ErrorResponse {
  error: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// ============================================================================
// SUCCESS RESPONSE WRAPPER
// ============================================================================

/**
 * SuccessResponse<T>
 * Standard success response format for API endpoints.
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}
