import axios from 'axios';

export const API_BASE = ((import.meta.env as any).VITE_API_URL || 'http://localhost:3001').replace(/\/+$/g, '');

const client = axios.create({ baseURL: API_BASE });

// Attach JWT from localStorage to Authorization header
client.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('supabase.auth.token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

client.interceptors.response.use(
  (r) => r,
  (err) => {
    // Propagate server error body where possible
    return Promise.reject(err.response?.data || err);
  }
);

export async function getBusinesses() {
  const resp = await client.get('/businesses');
  return resp.data;
}

export async function createBusiness(data: any) {
  const resp = await client.post('/businesses', data);
  return resp.data;
}

export async function generateWebsiteConfig(businessId: string) {
  const resp = await client.post('/generate-website-config', { businessId });
  return resp.data;
}

export async function getWebsiteQuestions() {
  const resp = await client.get('/websites/questions');
  return resp.data;
}

export async function submitQuestionnaireAnswers(businessId: string, answers: any) {
  const resp = await client.post('/websites/questionnaire', { businessId, answers });
  return resp.data;
}

export async function sendWebsiteChatMessage(businessId: string, message: string, conversationHistory?: any[]) {
  const resp = await client.post('/websites/chat', { businessId, message, conversationHistory });
  return resp.data;
}

export async function saveBusinessUnderstanding(businessId: string, businessUnderstanding: any) {
  const resp = await client.post('/businesses/save-business-understanding', {
    businessId,
    businessUnderstanding,
  });
  return resp.data;
}

// ============================================================================
// CONVERSATION ONBOARDING API
// ============================================================================

export async function startConversation() {
  const resp = await client.post('/conversation/start', {});
  return resp.data;
}

export async function sendConversationMessage(sessionId: string, message: string) {
  const resp = await client.post('/conversation/message', {
    sessionId,
    message,
  });
  return resp.data;
}

export async function getConversationSession(sessionId: string) {
  const resp = await client.get(`/conversation/session/${sessionId}`);
  return resp.data;
}

export async function completeConversation(sessionId: string, businessId: string) {
  const resp = await client.post(`/conversation/session/${sessionId}/complete`, {
    businessId,
  });
  return resp.data;
}

