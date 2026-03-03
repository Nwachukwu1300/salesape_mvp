import axios from "axios";
import { getAccessToken } from "./supabase";

// In development we proxy `/api` and other requests through Vite, so
// prefer a blank base URL unless the env var explicitly points somewhere else.
const envApiBase = (((import.meta.env as any).VITE_API_URL || "") as string).trim();
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

export const API_BASE = (isLocalhost ? "" : envApiBase).replace(/\/+$/g, "");

const client = axios.create({ baseURL: API_BASE });

// Attach JWT from memory to Authorization header
client.interceptors.request.use((config) => {
  try {
    const token = getAccessToken();
    config.headers = config.headers || {};
    if (token) {
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
      console.log("[API] Token attached:", token.substring(0, 20) + "...");
    } else {
      console.log("[API] No token available");
    }
  } catch (e) {
    console.error("[API] Error getting token:", e);
  }
  return config;
});

client.interceptors.response.use(
  (r) => r,
  (err) => {
    // Propagate server error body where possible
    return Promise.reject(err.response?.data || err);
  },
);

export async function getBusinesses() {
  const resp = await client.get("/businesses");
  return resp.data;
}

export async function createBusiness(data: any) {
  const resp = await client.post("/businesses", data);
  return resp.data;
}

export async function generateWebsiteConfig(businessId: string) {
  // Prefer the richer engine flow: image enrichment + template-aware config generation
  try {
    await client.post(`/businesses/${businessId}/enrich-images`, {});
  } catch {
    // Non-fatal: generation can continue with defaults/fallbacks
  }
  const resp = await client.post(`/businesses/${businessId}/generate-config`, {});
  return resp.data?.config ?? resp.data;
}

export async function getWebsiteQuestions() {
  const resp = await client.get("/websites/questions");
  return resp.data;
}

export async function submitQuestionnaireAnswers(
  businessId: string,
  answers: any,
) {
  const resp = await client.post("/websites/questionnaire", {
    businessId,
    answers,
  });
  return resp.data;
}

export async function sendWebsiteChatMessage(
  businessId: string,
  message: string,
  conversationHistory?: any[],
) {
  const resp = await client.post("/websites/chat", {
    businessId,
    message,
    conversationHistory,
  });
  return resp.data;
}

export async function saveBusinessUnderstanding(
  businessId: string,
  businessUnderstanding: any,
) {
  const resp = await client.post("/businesses/save-business-understanding", {
    businessId,
    businessUnderstanding,
  });
  return resp.data;
}

// ============================================================================
// CONVERSATION ONBOARDING API
// ============================================================================

export async function startConversation() {
  const resp = await client.post("/conversation/start", {});
  return resp.data;
}

export async function sendConversationMessage(
  sessionId: string,
  message: string,
) {
  const resp = await client.post("/conversation/message", {
    sessionId,
    message,
  });
  return resp.data;
}

export async function getConversationSession(sessionId: string) {
  const resp = await client.get(`/conversation/session/${sessionId}`);
  return resp.data;
}

export async function completeConversation(
  sessionId: string,
  businessId: string,
) {
  const resp = await client.post(
    `/conversation/session/${sessionId}/complete`,
    {
      businessId,
    },
  );
  return resp.data;
}

// ============================================================================
// CONTENT STUDIO API
// ============================================================================

export interface BusinessContentInput {
  id: string;
  businessId: string;
  type: "text" | "video" | "audio" | "blog_url";
  title?: string;
  content?: string;
  url?: string;
  storagePath?: string;
  status: "processing" | "ready" | "failed";
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface RepurposedContentItem {
  id: string;
  businessId: string;
  contentInputId: string;
  platform: string;
  content: string;
  caption?: string;
  hashtags?: string[];
  assetUrl?: string;
  assetPath?: string;
  score?: number;
  scoreBreakdown?: Record<string, unknown>;
  trendHooks?: string[];
  performance?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  status: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getBusinessContentInputs(businessId: string) {
  const resp = await client.get(`/businesses/${businessId}/content-inputs`);
  return (resp.data?.contentInputs || []) as BusinessContentInput[];
}

export async function createBusinessContentInput(
  businessId: string,
  payload: {
    type: "text" | "video" | "audio" | "blog_url";
    title?: string;
    content?: string;
    url?: string;
    metadata?: Record<string, unknown>;
  },
) {
  const resp = await client.post(`/businesses/${businessId}/content-inputs`, payload);
  return resp.data?.contentInput as BusinessContentInput;
}

export async function uploadBusinessContentInput(
  businessId: string,
  payload: {
    type: "video" | "audio";
    title?: string;
    fileName: string;
    mimeType: string;
    dataBase64: string;
    metadata?: Record<string, unknown>;
  },
) {
  const resp = await client.post(`/businesses/${businessId}/content-inputs/upload`, payload);
  return resp.data?.contentInput as BusinessContentInput;
}

export async function repurposeBusinessContent(
  businessId: string,
  contentId: string,
  platforms: string[],
) {
  const resp = await client.post(
    `/businesses/${businessId}/content-inputs/${contentId}/repurpose`,
    { platforms },
  );
  return resp.data as {
    message: string;
    jobId?: string;
    status?: string;
    contentInputId?: string;
    platforms?: string[];
  };
}

export async function getBusinessRepurposedContent(businessId: string) {
  const resp = await client.get(`/businesses/${businessId}/repurposed-content`);
  return (resp.data?.repurposedContent || []) as RepurposedContentItem[];
}

export async function scheduleRepurposedContent(
  businessId: string,
  repurposedContentId: string,
  scheduledFor: string,
) {
  const resp = await client.post(`/businesses/${businessId}/schedule`, {
    repurposedContentId,
    scheduledFor,
  });
  return resp.data;
}

export async function getUpcomingSchedule(businessId: string) {
  const resp = await client.get(`/businesses/${businessId}/schedule/upcoming`);
  return resp.data?.data || [];
}

export async function cancelScheduledPost(
  businessId: string,
  scheduledPostId: string,
) {
  const resp = await client.delete(
    `/businesses/${businessId}/schedule/${scheduledPostId}`,
  );
  return resp.data;
}

export async function updateScheduledPost(
  businessId: string,
  scheduledPostId: string,
  payload: { scheduledFor?: string; status?: string },
) {
  const resp = await client.put(
    `/businesses/${businessId}/schedule/${scheduledPostId}`,
    payload,
  );
  return resp.data;
}

export interface ContentProjectItem {
  id: string;
  inputType: string;
  status: string;
  reelsRequested?: number;
  reelsGenerated?: number;
  createdAt: string;
  updatedAt?: string;
}

export async function createContentProject(
  businessId: string,
  payload: {
    inputType: "video" | "blog" | "text" | "voice";
    inputUrl?: string;
    inputText?: string;
    reelsRequested?: number;
    style?: string;
    autoPublish?: boolean;
    growthMode?: "CONSERVATIVE" | "BALANCED" | "AGGRESSIVE";
  },
) {
  const resp = await client.post(`/businesses/${businessId}/content-projects`, payload);
  return resp.data?.project as ContentProjectItem;
}

export async function getContentProjects(businessId: string) {
  const resp = await client.get(`/businesses/${businessId}/content-projects`);
  return (resp.data?.projects || []) as ContentProjectItem[];
}

export async function deleteContentProject(
  businessId: string,
  projectId: string,
) {
  const resp = await client.delete(
    `/businesses/${businessId}/content-projects/${projectId}`,
  );
  return resp.data;
}

export async function deleteBusinessContentInput(
  businessId: string,
  contentId: string,
) {
  const resp = await client.delete(
    `/businesses/${businessId}/content-inputs/${contentId}`,
  );
  return resp.data;
}
