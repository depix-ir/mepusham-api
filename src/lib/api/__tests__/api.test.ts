import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import { apiClient, ApiError } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { getApiBaseUrl } from "../config";

// Polyfill localStorage in test environment if undefined
if (typeof globalThis.localStorage === "undefined") {
  const memoryStore = new Map<string, string>();
  const mockLocalStorage: Storage = {
    getItem: (key: string) => memoryStore.get(key) ?? null,
    setItem: (key: string, val: string) => memoryStore.set(key, val),
    removeItem: (key: string) => memoryStore.delete(key),
    clear: () => memoryStore.clear(),
    key: (i: number) => Array.from(memoryStore.keys())[i] ?? null,
    get length() {
      return memoryStore.size;
    },
  };
  globalThis.localStorage = mockLocalStorage;
}

describe("API Central Infrastructure Tests", () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL;

  beforeEach(() => {
    // Reset process.env and localStorage before each test
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:9000";
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv;
  });

  /* -------------------------------------------------------------------------- */
  /* 1. Configuration & Endpoint Tests                                          */
  /* -------------------------------------------------------------------------- */
  describe("Config & Endpoint Registry", () => {
    test("getApiBaseUrl trims trailing slashes cleanly", () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "http://api.example.com///";
      expect(getApiBaseUrl()).toBe("http://api.example.com");
    });

    test("getApiBaseUrl falls back to default localhost URL if unset", () => {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      expect(getApiBaseUrl()).toBe("http://localhost:9000");
    });

    test("API_ENDPOINTS correctly exposes OpenAPI routes with static paths", () => {
      expect(API_ENDPOINTS.storeBrands).toBe("/store/brands");
      expect(API_ENDPOINTS.adminBrands).toBe("/admin/brands");
      expect(API_ENDPOINTS.storeCategories).toBe("/store/categories");
      expect(API_ENDPOINTS.adminSettings).toBe("/admin/settings");
      expect(API_ENDPOINTS.adminSettingsAddresses).toBe("/admin/settings/addresses");
      expect(API_ENDPOINTS.authPhoneSendOtp).toBe("/auth/phone/send-otp");
      expect(API_ENDPOINTS.authPhoneVerify).toBe("/auth/phone/verify");
    });

    test("API_ENDPOINTS dynamic helpers encode URI components safely", () => {
      const specialId = "brand 123/test&flag";
      expect(API_ENDPOINTS.storeBrand(specialId)).toBe(
        `/store/brands/${encodeURIComponent(specialId)}`
      );
      expect(API_ENDPOINTS.adminBrand(specialId)).toBe(
        `/admin/brands/${encodeURIComponent(specialId)}`
      );
      expect(API_ENDPOINTS.adminCategory(specialId)).toBe(
        `/admin/categories/${encodeURIComponent(specialId)}`
      );
      expect(API_ENDPOINTS.adminSettingsAddress(specialId)).toBe(
        `/admin/settings/addresses/${encodeURIComponent(specialId)}`
      );
      expect(API_ENDPOINTS.storeProductSizeGuide(specialId)).toBe(
        `/store/products/${encodeURIComponent(specialId)}/size-guide`
      );
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 2. API Client Query Parameter & URL Building Tests                          */
  /* -------------------------------------------------------------------------- */
  describe("API Client Query Params & URL Construction", () => {
    test("appends formatted query parameters skipping undefined and null", async () => {
      let requestedUrl = "";
      global.fetch = mock(async (url: string | URL | Request) => {
        requestedUrl = String(url);
        return new Response(JSON.stringify({ brands: [], count: 0, offset: 0, limit: 10 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }) as unknown as typeof fetch;

      await apiClient.get(API_ENDPOINTS.storeBrands, {
        params: {
          limit: 10,
          offset: 0,
          q: "shoes",
          emptyFilter: undefined,
          nullFilter: null,
        },
      });

      expect(requestedUrl).toBe(
        "http://localhost:9000/store/brands?limit=10&offset=0&q=shoes"
      );
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 3. Authorization Header Injection Tests                                     */
  /* -------------------------------------------------------------------------- */
  describe("API Client Header & Auth Injection", () => {
    test("automatically injects Authorization Bearer token from admin session", async () => {
      localStorage.setItem(
        "mepusham_admin_session_v1",
        JSON.stringify({ token: "test-admin-jwt-123" })
      );

      let capturedHeaders: HeadersInit | undefined;
      global.fetch = mock(async (_url: string | URL | Request, init?: RequestInit) => {
        capturedHeaders = init?.headers;
        return new Response(JSON.stringify({ settings: {} }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }) as unknown as typeof fetch;

      await apiClient.get(API_ENDPOINTS.adminSettings);

      const headersObj = capturedHeaders as Record<string, string>;
      expect(headersObj["Authorization"]).toBe("Bearer test-admin-jwt-123");
    });

    test("preserves custom headers while injecting auth token", async () => {
      let capturedHeaders: HeadersInit | undefined;
      global.fetch = mock(async (_url: string | URL | Request, init?: RequestInit) => {
        capturedHeaders = init?.headers;
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }) as unknown as typeof fetch;

      await apiClient.get(API_ENDPOINTS.storeBrands, {
        headers: { "X-Custom-Header": "CustomValue" },
      });

      const headersObj = capturedHeaders as Record<string, string>;
      expect(headersObj["X-Custom-Header"]).toBe("CustomValue");
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 4. Body & FormData Boundary Preservation Tests                              */
  /* -------------------------------------------------------------------------- */
  describe("API Client Body & FormData Handling", () => {
    test("omits Content-Type header when sending FormData body to let browser set boundary", async () => {
      let capturedHeaders: Record<string, string> | undefined;
      let capturedBody: unknown;

      global.fetch = mock(async (_url: string | URL | Request, init?: RequestInit) => {
        capturedHeaders = init?.headers as Record<string, string>;
        capturedBody = init?.body;
        return new Response(JSON.stringify({ media: { id: "media-1", url: "http://img.png" } }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      }) as unknown as typeof fetch;

      const formData = new FormData();
      formData.append("file", new Blob(["fake-image-data"]), "test.png");

      await apiClient.post(API_ENDPOINTS.adminMediaUpload, formData);

      expect(capturedHeaders?.["Content-Type"]).toBeUndefined();
      expect(capturedBody).toBe(formData);
    });

    test("sets Content-Type to application/json for standard JS object bodies", async () => {
      let capturedHeaders: Record<string, string> | undefined;
      let capturedBody: unknown;

      global.fetch = mock(async (_url: string | URL | Request, init?: RequestInit) => {
        capturedHeaders = init?.headers as Record<string, string>;
        capturedBody = init?.body;
        return new Response(
          JSON.stringify({ brand: { id: "b1", name: "Nike", slug: "nike", is_active: true } }),
          {
            status: 201,
            headers: { "Content-Type": "application/json" },
          }
        );
      }) as unknown as typeof fetch;

      const payload = { name: "Nike", slug: "nike" };
      await apiClient.post(API_ENDPOINTS.adminBrands, payload);

      expect(capturedHeaders?.["Content-Type"]).toBe("application/json");
      expect(capturedBody).toBe(JSON.stringify(payload));
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 5. 204 No Content & Empty Body Response Tests                              */
  /* -------------------------------------------------------------------------- */
  describe("204 No Content & Empty Body Responses", () => {
    test("handles HTTP 204 No Content response without throwing JSON parse error", async () => {
      global.fetch = mock(async () => {
        return new Response(null, { status: 204 });
      }) as unknown as typeof fetch;

      const result = await apiClient.delete(API_ENDPOINTS.adminBrand("b1"));
      expect(result).toEqual({});
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 6. HTTP Error & Non-JSON Error Response Handling Tests                       */
  /* -------------------------------------------------------------------------- */
  describe("HTTP Errors & Non-JSON Responses", () => {
    test("throws ApiError with status and JSON error payload on 400 Bad Request", async () => {
      const errorJson = {
        message: "Brand slug already exists",
        type: "duplicate_error",
        code: "DUPLICATE_SLUG",
      };

      global.fetch = mock(async () => {
        return new Response(JSON.stringify(errorJson), {
          status: 400,
          statusText: "Bad Request",
          headers: { "Content-Type": "application/json" },
        });
      }) as unknown as typeof fetch;

      try {
        await apiClient.post(API_ENDPOINTS.adminBrands, { name: "Test", slug: "test" });
        expect(true).toBe(false); // Should not reach here
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;
        expect(apiError.status).toBe(400);
        expect(apiError.message).toBe("Brand slug already exists");
        expect(apiError.payload).toEqual(errorJson);
      }
    });

    test("handles non-JSON text error response gracefully on 500 Internal Error", async () => {
      global.fetch = mock(async () => {
        return new Response("Internal Server Error HTML or Text", {
          status: 500,
          statusText: "Internal Server Error",
          headers: { "Content-Type": "text/html" },
        });
      }) as unknown as typeof fetch;

      try {
        await apiClient.get(API_ENDPOINTS.storeBrands);
        expect(true).toBe(false); // Should not reach
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;
        expect(apiError.status).toBe(500);
        expect(apiError.payload).toBe("Internal Server Error HTML or Text");
      }
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 7. Timeout & Abort Signal Tests                                            */
  /* -------------------------------------------------------------------------- */
  describe("Timeout & Cancellation", () => {
    test("aborts request when timeout is exceeded", async () => {
      global.fetch = mock(async (_url: string | URL | Request, init?: RequestInit) => {
        return new Promise((_, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const err = new Error("The operation was aborted");
            err.name = "AbortError";
            reject(err);
          });
        });
      }) as unknown as typeof fetch;

      try {
        await apiClient.get(API_ENDPOINTS.storeBrands, { timeout: 10 });
        expect(true).toBe(false);
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;
        expect(apiError.status).toBe(408);
        expect(apiError.message).toContain("aborted or timed out");
      }
    });
  });
});
