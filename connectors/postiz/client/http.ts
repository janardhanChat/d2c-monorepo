/**
 * Low-level HTTP client for the Postiz Public API.
 *
 * Base URL
 *   self-hosted: https://<postiz-host>/api/public/v1
 *   cloud:       https://api.postiz.com/public/v1
 *
 * One API key belongs to one Postiz workspace. We run ONE workspace for the whole
 * platform and map each of our brands to a Postiz "customer" group, so the caller
 * (integrations-api) is responsible for tenant isolation.
 */
export interface PostizClientOptions {
  baseUrl: string;
  apiKey: string;
  /** Retries for 429/5xx with exponential backoff. */
  maxRetries?: number;
  timeoutMs?: number;
  fetch?: typeof fetch;
}

export class PostizError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "PostizError";
  }
}

export interface PostizHttp {
  request<T>(
    method: string,
    path: string,
    init?: { query?: Record<string, string | undefined>; body?: unknown },
  ): Promise<T>;
  upload<T>(path: string, form: FormData): Promise<T>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function createPostizHttp(opts: PostizClientOptions): PostizHttp {
  const doFetch = opts.fetch ?? fetch;
  const base = opts.baseUrl.replace(/\/$/, "");
  const maxRetries = opts.maxRetries ?? 3;
  const timeoutMs = opts.timeoutMs ?? 30_000;

  async function send<T>(
    method: string,
    url: string,
    body: RequestInit["body"],
    json: boolean,
  ): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      const res = await doFetch(url, {
        method,
        headers: {
          Authorization: opts.apiKey,
          ...(json ? { "Content-Type": "application/json" } : {}),
        },
        body,
        signal: AbortSignal.timeout(timeoutMs),
      });

      const retryable = res.status === 429 || res.status >= 500;
      if (retryable && attempt < maxRetries) {
        await sleep(2 ** attempt * 500);
        continue;
      }

      const text = await res.text();
      const data: unknown = text ? safeJson(text) : undefined;
      if (!res.ok) {
        throw new PostizError(
          res.status,
          `Postiz ${method} ${url} failed with ${res.status}`,
          data,
        );
      }
      return data as T;
    }
  }

  return {
    request(method, path, init) {
      const url = new URL(base + path);
      for (const [k, v] of Object.entries(init?.query ?? {})) {
        if (v !== undefined) url.searchParams.set(k, v);
      }
      const body = init?.body === undefined ? undefined : JSON.stringify(init.body);
      return send(method, url.toString(), body, body !== undefined);
    },
    upload(path, form) {
      return send("POST", base + path, form, false);
    },
  };
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
