import "server-only";
import {
  analyticsWindow,
  normalizeGroup,
  normalizeSeries,
  type AnalyticsRange,
  type AnalyticsSnapshot,
  type AnalyticsErrorCode,
} from "./analytics-data";

export class AnalyticsError extends Error {
  constructor(
    public code: AnalyticsErrorCode,
    public status: number,
  ) {
    super(code);
  }
}
export function analyticsConfigured() {
  return (
    process.env.ANALYTICS_ENABLED === "true" &&
    Boolean(process.env.CLOUDFLARE_ANALYTICS_API_TOKEN) &&
    /^[a-f\d]{32}$/i.test(process.env.CLOUDFLARE_ANALYTICS_ZONE_ID ?? "")
  );
}
export function analyticsQuery(
  zone: string,
  range: AnalyticsRange,
  now = new Date(),
) {
  if (!/^[a-f\d]{32}$/i.test(zone))
    throw new AnalyticsError("not_configured", 503);
  const window = analyticsWindow(range, now);
  const filter = `date_geq: ${JSON.stringify(window.from)}, date_leq: ${JSON.stringify(window.to)}`;
  const metrics =
    "sum { requests pageViews bytes cachedRequests } uniq { uniques }";
  const countryDays = Math.min(range, 30);
  const countryFrom = new Date(
    Date.parse(window.to + "T00:00:00Z") - (countryDays - 1) * 86400000,
  ).toISOString().slice(0, 10);
  const countryToExclusive = new Date(
    Date.parse(window.to + "T00:00:00Z") + 86400000,
  ).toISOString();
  return `query { viewer { zones(filter: { zoneTag: ${JSON.stringify(zone)} }) {
    totals: httpRequests1dGroups(limit: 1, filter: { ${filter} }) { ${metrics} }
    daily: httpRequests1dGroups(limit: 366, orderBy: [date_ASC], filter: { ${filter} }) { dimensions { date } ${metrics} }
    hourly: httpRequests1hGroups(limit: 73, orderBy: [datetime_ASC], filter: { datetime_geq: ${JSON.stringify(window.hourlyFrom)}, datetime_lt: ${JSON.stringify(window.asOf)} }) { dimensions { datetime } ${metrics} }
    countries: httpRequestsAdaptiveGroups(limit: 10, orderBy: [sum_visits_DESC], filter: { datetime_geq: ${JSON.stringify(countryFrom + "T00:00:00Z")}, datetime_lt: ${JSON.stringify(countryToExclusive)}, requestSource: "eyeball" }) { count sum { visits } dimensions { clientCountryName } }
  } } }`;
}
export async function readAnalytics(
  range: AnalyticsRange,
): Promise<AnalyticsSnapshot> {
  if (!analyticsConfigured()) throw new AnalyticsError("not_configured", 503);
  const now = new Date();
  let response: Response;
  try {
    response = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_ANALYTICS_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: analyticsQuery(
          process.env.CLOUDFLARE_ANALYTICS_ZONE_ID!,
          range,
          now,
        ),
      }),
      signal: AbortSignal.timeout(12000),
      cache: "force-cache",
      next: { revalidate: 300 },
    });
  } catch {
    throw new AnalyticsError("upstream_unavailable", 502);
  }
  if (!response.ok) {
    throw new AnalyticsError(
      response.status === 401 || response.status === 403
        ? "permission_denied"
        : "upstream_unavailable",
      502,
    );
  }
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new AnalyticsError("invalid_response", 502);
  }
  if (payload.errors?.length) {
    // Provider text never leaves the server (could include private configuration).
    const messages = payload.errors
      .map((e: { message?: string }) => e.message ?? "")
      .join(" ");
    const permissionDenied =
      /does not have permission|not authorized|unauthorized|authentication|access .* zone|access to zone/i.test(
        messages,
      );
    const restricted =
      /limit|older|range|retention|not allowed|does not have access|cannot request/i.test(
        messages,
      );
    throw new AnalyticsError(
      permissionDenied
        ? "permission_denied"
        : restricted
          ? "range_unavailable"
          : "upstream_unavailable",
      502,
    );
  }
  try {
    const zones = payload.data?.viewer?.zones;
    if (!Array.isArray(zones) || zones.length !== 1)
      throw new Error("Missing zone");
    const zone = zones[0];
    if (!Array.isArray(zone.totals) || zone.totals.length !== 1)
      throw new Error("Missing totals");
    const window = analyticsWindow(range, now);
    const total = normalizeGroup(zone.totals[0], "");
    const totals = {
      requests: total.requests,
      visitors: total.visitors,
      pageViews: total.pageViews,
      bytes: total.bytes,
      cachedRequests: total.cachedRequests,
    };
    const countryGroups = Array.isArray(zone.countries) ? zone.countries : [];
    if (countryGroups.length > 10)
      throw new Error("Too many country aggregates");
    const countries = countryGroups.map((group: {
      count?: unknown;
      sum?: { visits?: unknown };
      dimensions?: { clientCountryName?: unknown };
    }) => {
      const code = group.dimensions?.clientCountryName;
      const visits = group.sum?.visits;
      const requests = group.count;
      if (typeof code !== "string" || !/^[A-Z0-9]{2,3}$/.test(code)
        || typeof visits !== "number" || !Number.isFinite(visits) || visits < 0
        || typeof requests !== "number" || !Number.isFinite(requests) || requests < 0)
        throw new Error("Invalid country aggregate");
      return { countryCode: code, visits, requests };
    });
    const countryDays = Math.min(range, 30);
    const countryFrom = new Date(
      Date.parse(window.to + "T00:00:00Z") - (countryDays - 1) * 86400000,
    ).toISOString().slice(0, 10);
    const date = response.headers.get("date");
    return {
      mode: "live",
      range,
      from: window.from,
      to: window.to,
      countryFrom,
      countryTo: window.to,
      countries,
      updatedAt:
        date && Number.isFinite(Date.parse(date))
          ? new Date(date).toISOString()
          : window.asOf,
      totals,
      daily: normalizeSeries(zone.daily, "daily"),
      hourly: normalizeSeries(zone.hourly, "hourly"),
    };
  } catch {
    throw new AnalyticsError("invalid_response", 502);
  }
}
