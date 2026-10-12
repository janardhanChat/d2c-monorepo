import { describe, expect, it, vi } from "vitest";

import { createPostizHttp, PostizError } from "./http";

const ok = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("createPostizHttp", () => {
  it("sends the API key and query params", async () => {
    const fetchMock = vi.fn(async () => ok([{ id: "i1" }]));
    const http = createPostizHttp({
      baseUrl: "http://postiz/api/public/v1/",
      apiKey: "k",
      fetch: fetchMock,
    });

    await http.request("GET", "/integrations", { query: { group: "g1", skip: undefined } });

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("http://postiz/api/public/v1/integrations?group=g1");
    expect((init.headers as Record<string, string>).Authorization).toBe("k");
  });

  it("retries 429 then succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(ok({}, 429))
      .mockResolvedValueOnce(ok({ url: "https://instagram.com/oauth" }));
    vi.useFakeTimers();
    const http = createPostizHttp({ baseUrl: "http://p", apiKey: "k", fetch: fetchMock });
    const pending = http.request<{ url: string }>("GET", "/social/instagram");
    await vi.runAllTimersAsync();
    await expect(pending).resolves.toEqual({ url: "https://instagram.com/oauth" });
    vi.useRealTimers();
  });

  it("throws PostizError on 4xx without retrying", async () => {
    const fetchMock = vi.fn(async () => ok({ message: "bad" }, 400));
    const http = createPostizHttp({ baseUrl: "http://p", apiKey: "k", fetch: fetchMock });
    await expect(http.request("POST", "/posts", { body: {} })).rejects.toBeInstanceOf(PostizError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
