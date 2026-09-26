export const ANALYTICS_RANGES = [7, 14, 30, 365] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];
export type AnalyticsPoint = {
  time: string;
  requests: number;
  visitors: number;
  pageViews: number;
  bytes: number;
  cachedRequests: number;
};
export type AnalyticsSnapshot = {
  mode: "live" | "demo";
  range: AnalyticsRange;
  from: string;
  to: string;
  updatedAt: string;
  totals: Omit<AnalyticsPoint, "time">;
  daily: AnalyticsPoint[];
  hourly: AnalyticsPoint[];
};
export type AnalyticsErrorCode =
  | "not_configured"
  | "permission_denied"
  | "upstream_unavailable"
  | "range_unavailable"
  | "invalid_response";

export function parseAnalyticsRange(
  value: string | null,
): AnalyticsRange | null {
  if (value === null) return 7;
  return ANALYTICS_RANGES.find((range) => String(range) === value) ?? null;
}
export function cacheHitRate(
  point: Pick<AnalyticsPoint, "requests" | "cachedRequests">,
): number | null {
  return point.requests > 0
    ? (point.cachedRequests / point.requests) * 100
    : null;
}
export function analyticsWindow(range: AnalyticsRange, now = new Date()) {
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const from = new Date(today.getTime() - (range - 1) * 86400000)
    .toISOString()
    .slice(0, 10);
  const to = today.toISOString().slice(0, 10);
  return {
    from,
    to,
    hourlyFrom: new Date(today.getTime() - 2 * 86400000).toISOString(),
    // Stable five-minute buckets make identical public requests share the fetch cache.
    asOf: new Date(Math.floor(now.getTime() / 300000) * 300000).toISOString(),
  };
}

// Explicit, deterministic preview data. Never used as a fallback by the live endpoint.
export function demoAnalytics(
  range: AnalyticsRange,
  now = new Date(),
): AnalyticsSnapshot {
  const window = analyticsWindow(range, now);
  const point = (
    time: string,
    index: number,
    scale: number,
  ): AnalyticsPoint => {
    const wave =
      Math.abs(Math.sin(index * 1.37)) + (index % 11 === 0 ? 1.9 : 0.15);
    const requests = Math.round((180 + wave * 600) * scale);
    return {
      time,
      requests,
      visitors: Math.round(requests * 0.08),
      pageViews: Math.round(requests * 0.14),
      bytes: requests * (18000 + (index % 7) * 900),
      cachedRequests: Math.round(
        requests * (0.28 + Math.abs(Math.sin(index * 0.31)) * 0.37),
      ),
    };
  };
  const daily = Array.from({ length: range }, (_, index) =>
    point(
      new Date(
        Date.parse(`${window.from}T00:00:00Z`) + index * 86400000,
      ).toISOString(),
      index,
      6,
    ),
  );
  const count = Math.ceil(
    (Date.parse(window.asOf) - Date.parse(window.hourlyFrom)) / 3600000,
  );
  const hourly = Array.from({ length: count }, (_, index) =>
    point(
      new Date(Date.parse(window.hourlyFrom) + index * 3600000).toISOString(),
      index,
      0.65,
    ),
  );
  const totals = daily.reduce(
    (sum, p) => ({
      requests: sum.requests + p.requests,
      visitors: sum.visitors + p.visitors,
      pageViews: sum.pageViews + p.pageViews,
      bytes: sum.bytes + p.bytes,
      cachedRequests: sum.cachedRequests + p.cachedRequests,
    }),
    { requests: 0, visitors: 0, pageViews: 0, bytes: 0, cachedRequests: 0 },
  );
  // Illustrative period uniqueness, not the sum of daily uniques.
  totals.visitors = Math.round(totals.visitors * 0.58);
  return {
    mode: "demo",
    range,
    from: window.from,
    to: window.to,
    updatedAt: window.asOf,
    totals,
    daily,
    hourly,
  };
}

type RawGroup = {
  dimensions?: { date?: string; datetime?: string };
  sum?: Record<string, unknown>;
  uniq?: { uniques?: unknown };
};
function number(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0)
    throw new Error("Invalid analytics metric");
  return value;
}
export function normalizeGroup(group: RawGroup, time: string): AnalyticsPoint {
  if (!group || !group.sum || !group.uniq)
    throw new Error("Missing analytics metrics");
  const requests = number(group.sum.requests);
  const cachedRequests = number(group.sum.cachedRequests);
  if (cachedRequests > requests) throw new Error("Invalid cache count");
  return {
    time,
    requests,
    cachedRequests,
    visitors: number(group.uniq.uniques),
    pageViews: number(group.sum.pageViews),
    bytes: number(group.sum.bytes),
  };
}
export function normalizeSeries(
  value: unknown,
  kind: "daily" | "hourly",
): AnalyticsPoint[] {
  if (!Array.isArray(value) || value.length > (kind === "daily" ? 366 : 73))
    throw new Error("Invalid series");
  const seen = new Set<string>();
  return value
    .map((raw: RawGroup) => {
      const time =
        kind === "daily"
          ? `${raw?.dimensions?.date}T00:00:00Z`
          : raw?.dimensions?.datetime;
      if (!time || !Number.isFinite(Date.parse(time)) || seen.has(time))
        throw new Error("Invalid time bucket");
      seen.add(time);
      return normalizeGroup(raw, new Date(time).toISOString());
    })
    .sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
}
