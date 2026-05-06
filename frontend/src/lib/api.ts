// Common reusable API utility for making requests to the backend

// Use absolute URL in development, relative in production
const API_BASE = import.meta.env.DEV ? "http://localhost:5000/api" : "/api";

export async function apiRequest<T = any>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "API request failed");
  return data;
}
