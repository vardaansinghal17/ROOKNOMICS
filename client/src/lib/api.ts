export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function tryParseJson(raw: string) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function toErrorMessage(status: number, data: any, raw: string) {
  if (typeof data?.message === 'string' && data.message.trim()) return data.message;
  if (typeof data?.error === 'string' && data.error.trim()) return data.error;

  const text = raw.trim();
  if (text && !text.startsWith('<')) return text;

  return `Request failed (${status})`;
}

export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const raw = await res.text();
  const data = tryParseJson(raw);

  if (!res.ok) {
    throw new Error(toErrorMessage(res.status, data, raw));
  }

  return (data ?? (raw as T)) as T;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

export interface GoogleAuthPayload {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
}

export const authApi = {
  register: (payload: { name: string; email: string; password: string }) =>
    apiRequest<{ message: string; email: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  verifyOtp: (payload: { email: string; otp: string }) =>
    apiRequest<{ token?: string; user: AuthUser; message: string }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  resendOtp: (payload: { email: string }) =>
    apiRequest<{ message: string }>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    apiRequest<{ token?: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () =>
    apiRequest<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),

  googleAuth: (payload: GoogleAuthPayload) =>
    apiRequest<{ token: string; user: AuthUser }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () =>
    apiRequest<{ user: AuthUser }>('/auth/me'),
};
