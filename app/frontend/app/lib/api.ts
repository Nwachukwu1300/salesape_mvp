const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'salesape_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

export function apiHeaders(includeAuth = true): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiFetch(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options;
  // Normalize headers: support plain objects, Headers instances, or undefined
  const baseHeaders = apiHeaders(!skipAuth);
  let extraHeaders: Record<string, string> = {};
  try {
    if (fetchOptions.headers instanceof Headers) {
      fetchOptions.headers.forEach((value, key) => {
        extraHeaders[key] = value;
      });
    } else if (fetchOptions.headers && typeof fetchOptions.headers === 'object') {
      // Cast to Record<string,string> safely
      extraHeaders = Object.fromEntries(Object.entries(fetchOptions.headers as Record<string, any>).map(([k, v]) => [k, String(v)]));
    }
  } catch (e) {
    // ignore header normalization errors
    console.warn('apiFetch: failed to normalize headers', e);
  }

  const headers = { ...baseHeaders, ...extraHeaders } as HeadersInit;

  try {
    return await fetch(`${API_URL}${path}`, {
      ...fetchOptions,
      headers,
    });
  } catch (err) {
    console.error('apiFetch network error:', err);
    throw err;
  }
}

export { API_URL };
