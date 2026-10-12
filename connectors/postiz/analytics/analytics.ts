import type { PostizHttp } from "../client/http";

export interface PostizMetric {
  label: string;
  data: Array<{ total: string; date: string }>;
  percentageChange: number;
}

/** GET /analytics/post/{postId}?date=<days> */
export function getPostAnalytics(http: PostizHttp, postId: string, days = 7) {
  return http.request<PostizMetric[]>("GET", `/analytics/post/${postId}`, {
    query: { date: String(days) },
  });
}

/** GET /analytics/{integrationId}?date=<days>  (channel-level: followers, impressions, ...) */
export function getChannelAnalytics(http: PostizHttp, integrationId: string, days = 30) {
  return http.request<PostizMetric[]>("GET", `/analytics/${integrationId}`, {
    query: { date: String(days) },
  });
}
