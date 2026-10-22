import { BASE_URL } from "./config";

export interface ApiErrorPayload {
  message: string;
  type?: string;
  code?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  public status: number;
  public payload?: ApiErrorPayload;

  constructor(message: string, status: number, payload?: ApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const adminSessionRaw = localStorage.getItem("mepusham_admin_session_v1");
    if (adminSessionRaw) {
      const parsed = JSON.parse(adminSessionRaw);
      if (parsed?.token) return parsed.token;
    }
    const customerSessionRaw = localStorage.getItem("mepusham_auth_session_v1");
    if (customerSessionRaw) {
      const parsed = JSON.parse(customerSessionRaw);
      if (parsed?.token) return parsed.token;
    }
  } catch (e) {
    console.error("Error reading auth token from localStorage", e);
  }
  return null;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, body, headers: customHeaders, ...customOptions } = options;

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

  const url = `${BASE_URL.replace(/\/$/, "")}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}${queryString}`;

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
      // Do not set Content-Type header so browser / fetch sets boundary automatically
      delete headers["Content-Type"];
    } else {
      if (!headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }
      requestBody = JSON.stringify(body);
    }
  }

  const response = await fetch(url, {
    ...customOptions,
    headers,
    body: requestBody,
  });

  if (!response.ok) {
    let errorPayload: ApiErrorPayload | undefined;
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      errorPayload = await response.json();
      if (errorPayload && errorPayload.message) {
        errorMessage = errorPayload.message;
      }
    } catch {
      // Response was not JSON
    }
    throw new ApiError(errorMessage, response.status, errorPayload);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
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
