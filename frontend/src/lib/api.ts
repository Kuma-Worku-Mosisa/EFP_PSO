/**
 * Frontend API utility for making requests to the backend.
 * Provides detailed error messages for debugging and professional error handling.
 */

// filepath: frontend/src/lib/api.ts

// 1. Point to your backend port 5000 explicitly
export const API_BASE = import.meta.env.DEV
  ? "http://localhost:5000/api"
  : "/api"; // Keep /api for production (where frontend/backend are served together)

// export const API_BASE = import.meta.env.DEV
//   ? "http://10.30.96.167:5000/api"
//   : "/api";

// export const API_BASE = import.meta.env.DEV
//   ? "http://10.30.96.193:5000/api"
//   : "/api";

const IS_DEV = import.meta.env.DEV;

export function resolveBackendAssetUrl(assetPath?: string | null): string {
  if (!assetPath) return "";
  if (/^(https?:|data:|blob:)/i.test(assetPath)) return assetPath;

  return assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
  code?: string;
  errors?: Record<string, any>;
  statusCode?: number;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number | null,
    public endpoint: string,
    message: string,
    public details?: Record<string, any>,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function safeReadResponse(res: Response): Promise<any> {
  const contentType = res.headers.get("content-type") || "";
  const rawBody = await res.text();

  if (!rawBody) {
    return null;
  }

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(rawBody);
    } catch (parseError) {
      throw parseError;
    }
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return { message: rawBody };
  }
}

function logDevError(
  endpoint: string,
  error: unknown,
  details?: Record<string, any>,
): void {
  if (!IS_DEV) return;

  console.group(`🔴 API Error: ${endpoint}`);
  console.error("Error:", error);

  if (details) {
    console.table(details);
  }
  console.groupEnd();
}

export async function apiRequest<T = any>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const { headers: requestHeaders, ...restOptions } = options || {};
    const url = `${API_BASE}${endpoint}`;
    const savedToken =
      localStorage.getItem("efp_token") || localStorage.getItem("token");
    const hasBody = typeof restOptions.body !== "undefined";
    const isFormData =
      typeof FormData !== "undefined" && restOptions.body instanceof FormData;

    const headers = new Headers(requestHeaders || {});
    if (hasBody && !isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (savedToken && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${savedToken}`);
    }

    const res = await fetch(url, {
      ...restOptions,
      signal: controller.signal,
      headers,
    });

    let data: ApiErrorResponse | null = null;

    try {
      data = await safeReadResponse(res);
    } catch (parseError) {
      const errMsg = `Failed to parse response JSON from ${endpoint}`;
      logDevError(endpoint, parseError, {
        statusCode: res.status,
        contentType: res.headers.get("content-type"),
      });
      throw new ApiError(
        res.status,
        endpoint,
        `${errMsg}. Server returned: ${res.statusText}`,
        { parseError: String(parseError) },
      );
    }

    if (!res.ok) {
      const message =
        data?.message || data?.error || `HTTP ${res.status}: ${res.statusText}`;
      const validationErrors = data?.errors
        ? `Validation Errors:\n${JSON.stringify(data.errors, null, 2)}`
        : "";
      const fullMessage = validationErrors
        ? `${message}\n${validationErrors}`
        : message;

      logDevError(endpoint, fullMessage, {
        statusCode: res.status,
        endpoint,
        response: data,
      });

      throw new ApiError(
        res.status,
        endpoint,
        fullMessage,
        data?.errors,
        data?.code,
      );
    }

    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError) {
      const isNetworkError =
        error.message.includes("Failed to fetch") ||
        error.message.includes("fetch failed");

      if (isNetworkError) {
        const message =
          "Service Unavailable: Please check your connection and try again.";

        logDevError(endpoint, error, {
          severity: "CRITICAL",
          statusCode: null,
          apiBase: API_BASE,
          endpoint,
          isNetworkError: true,
          environment: IS_DEV ? "DEVELOPMENT" : "PRODUCTION",
          originalError: String(error),
        });

        throw new ApiError(null, endpoint, message, {
          originalError: String(error),
        });
      }
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      const message = `Request timeout: API call to ${endpoint} took longer than 30 seconds.`;
      logDevError(endpoint, error, { timeout: "30s", endpoint });
      throw new ApiError(null, endpoint, message);
    }

    const message = error instanceof Error ? error.message : String(error);
    logDevError(endpoint, error);
    throw new ApiError(
      null,
      endpoint,
      `Unexpected error calling ${endpoint}: ${message}`,
      { originalError: message },
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
