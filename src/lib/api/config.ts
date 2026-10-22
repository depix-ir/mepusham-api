/**
 * Centralized API Configuration
 *
 * Reads NEXT_PUBLIC_API_BASE_URL from environment variables.
 * Note on Next.js build-time vs runtime configuration:
 * - Client-side code: `NEXT_PUBLIC_` variables are replaced at build time by Next.js compiler.
 * - Server-side code (Server Components / SSR): `process.env.NEXT_PUBLIC_API_BASE_URL` can be read at runtime.
 */

const DEFAULT_BASE_URL = "http://localhost:9000";

/**
 * Returns the normalized base URL for API requests.
 * Trims any trailing slashes to ensure consistent path concatenation.
 */
export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const rawUrl = envUrl && envUrl.trim() !== "" ? envUrl : DEFAULT_BASE_URL;
  return rawUrl.replace(/\/+$/, "");
}

/**
 * Indicates whether NEXT_PUBLIC_API_BASE_URL was explicitly configured in environment.
 */
export const IS_API_BASE_URL_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_API_BASE_URL && process.env.NEXT_PUBLIC_API_BASE_URL.trim() !== ""
);

/**
 * Global constant for default base URL (backwards compatible with existing references).
 */
export const BASE_URL = getApiBaseUrl();
