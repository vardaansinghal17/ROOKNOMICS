// src/lib/api.ts

const BASE_URL = import.meta.env.VITE_API_URL||'http://localhost:3000/api';

// ── Core request helper ───────────────────────────────────
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    credentials: 'include', // send cookies if any
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

// ── Shared user type ──────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// ── All auth API calls in one place ──────────────────────
export const authApi = {

  // Step 1 of signup — sends OTP, does NOT create account yet
  register: (payload: { name: string; email: string; password: string }) =>
    apiRequest<{ message: string; email: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Step 2 of signup — verifies OTP then creates the real account
  verifyOtp: (payload: { email: string; otp: string }) =>
    apiRequest<{ user: AuthUser; message: string }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Resend a fresh OTP to same email, resets the 10-min timer
  resendOtp: (payload: { email: string }) =>
    apiRequest<{ message: string }>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Normal login — returns JWT immediately
  login: (payload: { email: string; password: string }) =>
    apiRequest<{ user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

     logout: () =>
    apiRequest<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),
  // Protected — get current user from JWT
  getMe: () =>
    apiRequest<{ user: AuthUser }>('/auth/me'),
};


export const googleAuth = async (data: {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
}) => {
  const res = await fetch(`${BASE_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
};