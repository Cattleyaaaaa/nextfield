const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const env = {};
const modules = new Map();
let fetchImplementation = async () => {
  throw new Error("Unexpected upstream call");
};
function load(file) {
  file = path.resolve(file);
  if (modules.has(file)) return modules.get(file);
  const module = { exports: {} };
  modules.set(file, module.exports);
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  vm.runInNewContext(
    code,
    {
      module,
      exports: module.exports,
      URL,
      Response,
      AbortSignal,
      process: { env },
      fetch: (...args) => fetchImplementation(...args),
      require: (name) =>
        name === "server-only"
          ? {}
          : load(
              (name.startsWith("@/")
                ? path.resolve(name.slice(2))
                : path.resolve(path.dirname(file), name)) + ".ts",
            ),
    },
    { filename: file },
  );
  return module.exports;
}
const data = load("lib/analytics-data.ts");
const server = load("lib/analytics-server.ts");
const route = load("app/api/analytics/route.ts");
async function main() {
  for (const value of ["07", "7.0", "-1", "400", "0", "7;query", ""])
    assert.equal(data.parseAnalyticsRange(value), null);
  assert.equal(data.parseAnalyticsRange(null), 7);
  for (const days of [7, 14, 30, 365]) {
    assert.equal(data.parseAnalyticsRange(String(days)), days);
    const demo = data.demoAnalytics(days, new Date("2026-09-26T11:14:00Z"));
    assert.equal(demo.mode, "demo");
    assert.equal(demo.daily.length, days);
    assert.equal(demo.hourly.length, 60);
    assert.ok(
      demo.totals.visitors < demo.daily.reduce((n, p) => n + p.visitors, 0),
    );
    assert.equal(
      JSON.stringify(demo),
      JSON.stringify(
        data.demoAnalytics(days, new Date("2026-09-26T11:14:00Z")),
      ),
    );
    for (const p of [...demo.daily, ...demo.hourly])
      assert.ok(data.cacheHitRate(p) >= 0 && data.cacheHitRate(p) <= 100);
  }
  assert.equal(
    data.analyticsWindow(7, new Date("2026-01-01T00:04:00Z")).from,
    "2025-12-26",
  );
  assert.equal(data.cacheHitRate({ requests: 0, cachedRequests: 0 }), null);
  assert.equal(data.cacheHitRate({ requests: 100, cachedRequests: 25 }), 25);
  assert.throws(() => server.analyticsQuery('" } query', 7));
  const query = server.analyticsQuery(
    "a".repeat(32),
    7,
    new Date("2026-09-26T11:14:00Z"),
  );
  assert.ok(
    query.includes("httpRequests1dGroups") &&
      query.includes("httpRequests1hGroups"),
  );
  assert.ok(
    !query.split("totals:")[1].split("daily:")[0].includes("dimensions"),
  );
  assert.ok(query.includes('"2026-09-26T11:10:00.000Z"'));
  assert.equal(server.analyticsConfigured(), false);
  const invalid = await route.GET(
    new Request("http://localhost/api/analytics?days=999"),
  );
  assert.equal(invalid.status, 400);
  const missing = await route.GET(
    new Request("http://localhost/api/analytics?days=7"),
  );
  assert.equal(missing.status, 503);
  assert.equal((await missing.json()).error, "not_configured");
  assert.equal(missing.headers.get("cache-control"), "no-store");
  env.ANALYTICS_ENABLED = "true";
  env.CLOUDFLARE_ANALYTICS_ZONE_ID = "a".repeat(32);
  env.CLOUDFLARE_ANALYTICS_API_TOKEN = "test-secret-do-not-expose";
  const window = data.analyticsWindow(7);
  const raw = (time, requests, cachedRequests, uniques, kind = "daily") => ({
    dimensions: kind === "daily" ? { date: time } : { datetime: time },
    sum: {
      requests,
      cachedRequests,
      pageViews: requests / 2,
      bytes: requests * 1000,
    },
    uniq: { uniques },
    clientIP: "private-not-to-expose",
  });
  const daily = [raw(window.to, 300, 30, 14), raw(window.from, 100, 90, 14)];
  const totals = {
    sum: { requests: 400, cachedRequests: 120, pageViews: 200, bytes: 400000 },
    uniq: { uniques: 20 },
  };
  const payload = {
    data: {
      viewer: {
        zones: [
          {
            zoneTag: env.CLOUDFLARE_ANALYTICS_ZONE_ID,
            totals: [totals],
            daily,
            hourly: [raw(window.hourlyFrom, 100, 20, 7, "hourly")],
          },
        ],
      },
    },
    errors: null,
  };
  fetchImplementation = async (url, options) => {
    assert.equal(url, "https://api.cloudflare.com/client/v4/graphql");
    assert.equal(
      options.headers.Authorization,
      "Bearer " + env.CLOUDFLARE_ANALYTICS_API_TOKEN,
    );
    assert.equal(options.next.revalidate, 300);
    return Response.json(payload, {
      headers: { date: new Date().toUTCString() },
    });
  };
  const liveResponse = await route.GET(
    new Request("http://localhost/api/analytics?days=7"),
  );
  assert.equal(liveResponse.status, 200);
  const live = await liveResponse.json();
  assert.equal(live.mode, "live");
  assert.equal(live.totals.visitors, 20); // Not 14 + 14.
  assert.equal(data.cacheHitRate(live.totals), 30); // Not average of 90% and 10%.
  assert.equal(live.daily[0].time.slice(0, 10), window.from);
  const serialized = JSON.stringify(live);
  assert.ok(!serialized.includes(env.CLOUDFLARE_ANALYTICS_API_TOKEN));
  assert.ok(!serialized.includes(env.CLOUDFLARE_ANALYTICS_ZONE_ID));
  assert.ok(!serialized.includes("private-not-to-expose"));
  assert.ok(liveResponse.headers.get("cache-control").includes("s-maxage=300"));
  fetchImplementation = async () =>
    Response.json({
      errors: [
        { message: "range limit " + env.CLOUDFLARE_ANALYTICS_API_TOKEN },
      ],
    });
  const restricted = await route.GET(
    new Request("http://localhost/api/analytics?days=365"),
  );
  assert.equal((await restricted.json()).error, "range_unavailable");
  assert.equal(restricted.headers.get("cache-control"), "no-store");
  fetchImplementation = async () => {
    throw new Error("private configuration");
  };
  const outage = await route.GET(new Request("http://localhost/api/analytics"));
  assert.equal((await outage.json()).error, "upstream_unavailable");
  fetchImplementation = async () =>
    Response.json({
      ...payload,
      errors: [{ message: "secret arbitrary provider error" }],
    });
  const error = await route.GET(new Request("http://localhost/api/analytics"));
  assert.equal((await error.json()).error, "upstream_unavailable");
  fetchImplementation = async () =>
    Response.json({ data: { viewer: { zones: [] } } });
  assert.equal(
    (
      await (
        await route.GET(new Request("http://localhost/api/analytics"))
      ).json()
    ).error,
    "invalid_response",
  );
  assert.throws(() =>
    data.normalizeSeries([raw("not-a-date", 1, 0, 1)], "daily"),
  );
  assert.throws(() => data.normalizeSeries([daily[0], daily[0]], "daily"));
  assert.throws(() =>
    data.normalizeGroup(
      { sum: { ...totals.sum, requests: -1 }, uniq: { uniques: 1 } },
      "",
    ),
  );
  assert.throws(() =>
    data.normalizeGroup(
      { sum: { ...totals.sum, requests: "100" }, uniq: { uniques: 1 } },
      "",
    ),
  );
  assert.throws(() =>
    data.normalizeGroup(
      { sum: { ...totals.sum, cachedRequests: 401 }, uniq: { uniques: 1 } },
      "",
    ),
  );
  assert.throws(() =>
    data.normalizeGroup({ sum: { requests: 0 }, uniq: { uniques: 0 } }, ""),
  );
  assert.equal(data.normalizeSeries([], "daily").length, 0);
  console.log(
    "PASS: ranges, UTC windows, explicit demo data, period uniques, weighted cache rate, live normalization, public-field allowlist, upstream failures, and secret isolation. Real Cloudflare integration and browser interaction require separate QA.",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
