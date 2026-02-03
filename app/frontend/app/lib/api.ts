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
  return fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers: { ...apiHeaders(!skipAuth), ...(fetchOptions.headers as object) },
  });
}

export { API_URL };
