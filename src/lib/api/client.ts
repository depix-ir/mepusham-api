import { BASE_URL, getApiBaseUrl } from "./config";

export interface ApiErrorPayload {
  message: string;
  type?: string;
  code?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  public status: number;
  public payload?: ApiErrorPayload | string;

  constructor(message: string, status: number, payload?: ApiErrorPayload | string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  /** Timeout in milliseconds before aborting the request */
  timeout?: number;
}

/**
 * Retrieves stored authentication token from localStorage if available in runtime environment.
 */
function getAuthToken(): string | null {
  try {
    const storage = typeof localStorage !== "undefined" ? localStorage : (typeof globalThis !== "undefined" ? globalThis.localStorage : undefined);
    if (!storage) return null;
    const adminSessionRaw = storage.getItem("mepusham_admin_session_v1");
    if (adminSessionRaw) {
      const parsed = JSON.parse(adminSessionRaw);
      if (parsed?.expiresAt && new Date(parsed.expiresAt) < new Date()) {
        storage.removeItem("mepusham_admin_session_v1");
      } else if (parsed?.token) {
        return parsed.token;
      }
    }
    const customerSessionRaw = storage.getItem("mepusham_auth_session_v1");
    if (customerSessionRaw) {
      const parsed = JSON.parse(customerSessionRaw);
      if (parsed?.expiresAt && new Date(parsed.expiresAt) < new Date()) {
        storage.removeItem("mepusham_auth_session_v1");
      } else if (parsed?.token) {
        return parsed.token;
      }
    }
  } catch (e) {
    console.error("Error reading auth token from storage", e);
  }
  return null;
}

/**
 * Executes an HTTP request against the central API with full type safety, error handling,
 * header injection, FormData boundary preservation, 204 response handling, and timeout support.
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, body, headers: customHeaders, timeout, signal: customSignal, ...customOptions } = options;

  let queryString = "";
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const str = searchParams.toString();
    if (str) queryString = `?${str}`;
  }

  const baseUrl = getApiBaseUrl();
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${normalizedEndpoint}${queryString}`;

  const headers: Record<string, string> = {
    ...((customHeaders as Record<string, string>) || {}),
  };

  const token = getAuthToken();
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let requestBody: BodyInit | undefined;
  if (body !== undefined) {
    if (body instanceof FormData) {
      requestBody = body;
      // Do NOT set Content-Type header so fetch / browser sets multipart boundary automatically
      delete headers["Content-Type"];
    } else if (typeof body === "string") {
      requestBody = body;
    } else {
      if (!headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }
      requestBody = JSON.stringify(body);
    }
  }

  // Setup timeout & cancellation signal
  let abortController: AbortController | undefined;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let signal = customSignal;

  if (timeout && timeout > 0) {
    abortController = new AbortController();
    if (customSignal) {
      customSignal.addEventListener("abort", () => abortController?.abort());
    }
    signal = abortController.signal;
    timeoutId = setTimeout(() => {
      abortController?.abort(new Error(`Request timeout after ${timeout}ms`));
    }, timeout);
  }

  try {
    const response = await fetch(url, {
      ...customOptions,
      headers,
      body: requestBody,
      signal,
    });

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Handle 204 No Content or empty response body
    if (response.status === 204) {
      return {} as T;
    }

    if (!response.ok) {
      let errorPayload: ApiErrorPayload | string | undefined;
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        try {
          const jsonError = await response.json();
          errorPayload = jsonError;
          if (jsonError && typeof jsonError === "object" && "message" in jsonError && typeof jsonError.message === "string") {
            errorMessage = jsonError.message;
          }
        } catch {
          // Fallback if json parsing fails
        }
      } else {
        try {
          const textError = await response.text();
          if (textError) {
            errorPayload = textError;
            errorMessage = textError.slice(0, 200);
          }
        } catch {
          // Fallback
        }
      }

      throw new ApiError(errorMessage, response.status, errorPayload);
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return (await response.json()) as T;
    }

    const text = await response.text();
    if (!text) {
      return {} as T;
    }
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(`Request aborted or timed out after ${timeout || 0}ms`, 408);
    }
    const message = error instanceof Error ? error.message : "Network error occurred";
    throw new ApiError(message, 0);
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
