import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

import type { ApiRequestConfig } from "./types";

const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Factory to create and configure an Axios instance with base URL,
 * timeout, and authorization/tenant interceptors.
 */
export function createApiClient(customConfig?: AxiosRequestConfig): AxiosInstance {
  const baseURL = customConfig?.baseURL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

  const instance = axios.create({
    baseURL,
    timeout: DEFAULT_TIMEOUT_MS,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    ...customConfig,
  });

  // Request Interceptor: Inject Auth Token & Tenant Headers
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig & ApiRequestConfig) => {
      // 1. In browser, automatically attach Supabase session token if not explicitly set
      if (typeof window !== "undefined" && !config.skipAuth) {
        try {
          const hasAuth =
            config.headers.get("Authorization") || config.headers.get("authorization");

          if (!hasAuth) {
            const supabase = createSupabaseBrowserClient();
            const { data } = await supabase.auth.getSession();
            const token = data?.session?.access_token;
            if (token) {
              config.headers.set("Authorization", `Bearer ${token}`);
            }
          }
        } catch {
          // Ignore token retrieval failure; let request proceed without auth if session absent
        }
      }

      // 2. Attach tenant headers if specified
      if (config.tenant?.organizationId) {
        config.headers.set("x-organization-id", config.tenant.organizationId);
      }
      if (config.tenant?.brandId) {
        config.headers.set("x-brand-id", config.tenant.brandId);
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response Interceptor: Format errors and handle common status codes
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError<{ message?: string; error?: string }>) => {
      const status = error.response?.status;
      const data = error.response?.data;
      const message =
        data?.message || data?.error || error.message || "An unexpected network error occurred.";

      // Enrich error object with user-friendly message
      const enhancedError = new Error(message) as Error & {
        status?: number;
        code?: string;
        details?: unknown;
        isAxiosError: boolean;
      };
      enhancedError.status = status;
      enhancedError.code = error.code;
      enhancedError.details = data;
      enhancedError.isAxiosError = true;

      return Promise.reject(enhancedError);
    },
  );

  return instance;
}

/**
 * Centralized singleton Axios instance for use throughout the application.
 */
export const apiClient = createApiClient();

/**
 * Convenience helper methods that unwrap response data directly.
 */
export const http = {
  get: <T = unknown>(url: string, config?: ApiRequestConfig): Promise<T> =>
    apiClient.get<T, AxiosResponse<T>>(url, config).then((res) => res.data),

  post: <T = unknown>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T> =>
    apiClient.post<T, AxiosResponse<T>>(url, data, config).then((res) => res.data),

  put: <T = unknown>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T> =>
    apiClient.put<T, AxiosResponse<T>>(url, data, config).then((res) => res.data),

  patch: <T = unknown>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T> =>
    apiClient.patch<T, AxiosResponse<T>>(url, data, config).then((res) => res.data),

  delete: <T = unknown>(url: string, config?: ApiRequestConfig): Promise<T> =>
    apiClient.delete<T, AxiosResponse<T>>(url, config).then((res) => res.data),
};
