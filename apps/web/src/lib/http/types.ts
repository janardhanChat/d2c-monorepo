import type { AxiosRequestConfig, AxiosResponse } from "axios";

export interface TenantIds {
  organizationId: string;
  brandId?: string;
}

export interface ApiRequestConfig extends AxiosRequestConfig {
  /** If true, the request interceptor will not automatically attach the Supabase Bearer token */
  skipAuth?: boolean;
  /** Multi-tenant headers (x-organization-id, x-brand-id) */
  tenant?: TenantIds;
}

export interface ApiErrorPayload {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

export interface NormalizedApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: AxiosResponse["headers"];
}
