"use client";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  BarChart3,
  Clock3,
  Database,
  Eye,
  RefreshCw,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/components/site/language-provider";
import { BlurText } from "@/components/react-bits/blur-text";
import {
  ANALYTICS_RANGES,
  cacheHitRate,
  demoAnalytics,
  type AnalyticsRange,
  type AnalyticsSnapshot,
  type AnalyticsErrorCode,
} from "@/lib/analytics-data";
import { TrafficChart, formatMetric } from "./traffic-chart";

const metrics = [
  {
    key: "requests",
    zh: "总请求数",
    en: "Total requests",
    color: "#3785b5",
    icon: Activity,
  },
  {
    key: "visitors",
    zh: "独立访问",
    en: "Unique visits",
    color: "#159b76",
    icon: Users,
  },
  {
    key: "pageViews",
    zh: "页面浏览",
    en: "Page views",
    color: "#c48b22",
    icon: Eye,
  },
  {
    key: "cache",
    zh: "缓存命中率",
    en: "Cache hit rate",
    color: "#9571cd",
    icon: Zap,
  },
  {
    key: "bytes",
    zh: "传输带宽",
    en: "Data transfer",
    color: "#d66b59",
    icon: Database,
  },
] as const;
const messages: Record<AnalyticsErrorCode, { zh: string; en: string }> = {
  not_configured: {
    zh: "真实统计尚未配置。需要在服务端设置 Cloudflare 只读令牌、Zone ID，并启用统计开关。",
    en: "Live analytics is not configured. Set the server-only Cloudflare read token, zone ID, and analytics switch.",
  },
  permission_denied: {
    zh: "Cloudflare 拒绝了统计请求。请检查令牌是否包含“区域 → 分析 → 读取”权限，以及 Zone 资源是否选中了当前站点。",
    en: "Cloudflare denied the analytics request. Check that the token includes Zone → Analytics → Read and is scoped to this site.",
  },
  upstream_unavailable: {
    zh: "暂时无法读取 Cloudflare。请稍后重试；管理员可检查令牌权限与服务状态。",
    en: "Cloudflare could not be reached. Retry later; the administrator can check token permissions and service status.",
  },
  range_unavailable: {
    zh: "当前时间范围或数据集不可用，可能受 Cloudflare 套餐、保留期限或令牌权限限制。请尝试较短范围。",
    en: "This range or dataset is unavailable, possibly due to Cloudflare plan, retention, or token permissions. Try a shorter range.",
  },
  invalid_response: {
    zh: "统计源未返回完整有效的数据，暂不展示数值。请稍后重试。",
    en: "The source did not return complete, valid data. Metrics are withheld; please retry later.",
  },
};
function DataTable({
  data,
  locale,
}: {
  data: AnalyticsSnapshot;
  locale: "zh" | "en";
}) {
  const zh = locale === "zh";
  return (
    <details className="mt-8 rounded-2xl border border-line bg-panel/60 p-5">
      <summary className="cursor-pointer text-sm font-medium">
        {zh ? "查看每日数据表" : "View daily data table"} · {data.daily.length}{" "}
        {zh ? "个时间点" : "buckets"}
      </summary>
      <div className="mt-5 max-h-96 overflow-auto">
        <table className="w-full min-w-[650px] text-left text-xs">
          <caption className="sr-only">
            {data.mode === "demo"
              ? zh
                ? "示例每日统计"
                : "Demo daily statistics"
              : zh
                ? "真实每日统计"
                : "Live daily statistics"}
          </caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="p-3">
                {zh ? "日期（UTC）" : "Date (UTC)"}
              </th>
              {metrics.map((m) => (
                <th scope="col" className="p-3" key={m.key}>
                  {m.key === "visitors"
                    ? zh
                      ? "日独立访问"
                      : "Daily uniques"
                    : zh
                      ? m.zh
                      : m.en}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.daily.map((p) => (
              <tr key={p.time} className="border-b border-line/50">
                <th scope="row" className="p-3 font-normal">
                  {p.time.slice(0, 10)}
                </th>
                {metrics.map((m) => (
                  <td key={m.key} className="p-3 font-mono">
                    {formatMetric(
                      m.key === "cache" ? cacheHitRate(p) : p[m.key],
                      m.key,
                      locale,
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
export function AnalyticsDashboard() {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const [range, setRange] = useState<AnalyticsRange>(7);
  const [mode, setMode] = useState<"live" | "demo">("live");
  const [data, setData] = useState<AnalyticsSnapshot | null>(null);
  const [error, setError] = useState<AnalyticsErrorCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError(null);
    setLoading(true);
    if (mode === "demo") {
      setData(demoAnalytics(range));
      setLoading(false);
      return () => controller.abort();
    }
    async function read() {
      try {
        const response = await fetch(`/api/analytics?days=${range}`, {
          signal: controller.signal,
        });
        const result = await response.json();
        if (controller.signal.aborted) return;
        if (!response.ok) {
          setError(
            Object.hasOwn(messages, result.error)
              ? result.error
              : "upstream_unavailable",
          );
          return;
        }
        if (
          result.mode !== "live" ||
          result.range !== range ||
          !result.totals ||
          !Array.isArray(result.daily) ||
          !Array.isArray(result.hourly)
        ) {
          setError("invalid_response");
          return;
        }
        setData(result);
      } catch {
        if (!controller.signal.aborted) setError("upstream_unavailable");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void read();
    return () => controller.abort();
  }, [range, mode, refresh]);
  function download() {
    if (!data) return;
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            {
              ...data,
              notice:
                data.mode === "demo"
                  ? "Illustrative data only; not NEXTFIELD traffic"
                  : "Cloudflare zone-level aggregate metrics; not verified human visitor counts",
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `NEXTFIELD-analytics-${data.mode}-${range}d.json`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const stateLabel = loading
    ? zh
      ? "读取中"
      : "Loading"
    : mode === "demo"
      ? zh
        ? "示例预览"
        : "Demo preview"
      : data
        ? zh
          ? "真实统计"
          : "Live analytics"
        : zh
          ? "暂未可用"
          : "Unavailable";
  const availableData =
    data?.range === range && data.mode === mode ? data : null;
  return (
    <div className="mx-auto max-w-site px-5 pb-28 pt-12 sm:px-8 sm:pt-16 lg:px-12">
      <header className="grid gap-8 border-b border-line pb-9 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.2em] text-accent">
            NEXTFIELD / OPEN ANALYTICS
          </p>
          <BlurText
            as="h1"
            text={zh ? "访问统计" : "Analytics"}
            className="mt-4 font-display text-[clamp(3rem,6vw,5rem)] leading-[1.08] tracking-[-.05em]"
          />
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
            {zh
              ? "把访问与传输变成可读的信号。公开展示汇总趋势，不展示访客个人明细。"
              : "Readable signals from visits and delivery. Public aggregate trends, without personal visitor records."}
          </p>
        </div>
        <div className="space-y-4">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label={zh ? "统计时间范围" : "Analytics time range"}
          >
            {ANALYTICS_RANGES.map((days) => (
              <button
                aria-pressed={range === days}
                key={days}
                type="button"
                onClick={() => setRange(days)}
                className={`rounded-full border px-5 py-2.5 text-sm transition-colors ${range === days ? "border-accent bg-accent text-paper" : "border-line bg-panel hover:border-accent"}`}
              >
                {days === 365
                  ? zh
                    ? "1 年"
                    : "1 year"
                  : `${days} ${zh ? "天" : "days"}`}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted lg:text-right">
            {zh
              ? "UTC 日历日 · 当日数据可能尚未完整"
              : "UTC calendar days · current day may be incomplete"}
          </p>
        </div>
      </header>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            role="status"
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${mode === "demo" ? "border-amber-500/40 text-amber-600" : "border-line text-accent"}`}
          >
            <span
              className={`size-1.5 rounded-full ${loading ? "bg-muted" : "bg-current"}`}
            />
            {stateLabel}
          </span>
          <span className="font-mono text-[10px] text-muted">
            {availableData
              ? `${availableData.from} — ${availableData.to}`
              : "Cloudflare · nextfield.top"}
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => setRefresh((n) => n + 1)}
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs hover:border-accent disabled:opacity-40"
          >
            <RefreshCw className="size-3.5" />
            {zh ? "刷新" : "Refresh"}
          </button>
          <button
            type="button"
            disabled={!availableData || loading}
            onClick={download}
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs hover:border-accent disabled:opacity-40"
          >
            <ArrowDownToLine className="size-3.5" />
            {zh ? "导出数据" : "Export data"}
          </button>
          <button
            type="button"
            onClick={() => setMode((m) => (m === "live" ? "demo" : "live"))}
            className="rounded-full border border-line px-4 py-2 text-xs hover:border-accent"
          >
            {mode === "demo"
              ? zh
                ? "返回真实统计"
                : "Return to live"
              : zh
                ? "查看示例布局"
                : "Preview demo layout"}
          </button>
        </div>
      </div>
      {mode === "demo" && (
        <aside
          role="note"
          className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm leading-7"
        >
          {zh
            ? "当前全部数值为示例数据，仅用于审核图表和交互，不代表 nextfield.top 的实际流量。"
            : "All values are illustrative demo data for layout and interaction review, not actual nextfield.top traffic."}
        </aside>
      )}
      {error && mode === "live" && (
        <aside
          role="alert"
          className="mt-6 rounded-2xl border border-line bg-panel p-6"
        >
          <h2 className="text-lg font-medium">
            {zh ? "暂时没有可展示的真实数据" : "Live data is not available"}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
            {messages[error][locale]}
          </p>
          <p className="mt-3 text-xs text-muted">
            {zh
              ? "不会自动用示例数据或零值替代。可点击「查看示例布局」审核界面。"
              : "No automatic demo or zero-value substitution. Use “Preview demo layout” to review the interface."}
          </p>
        </aside>
      )}
      <section
        aria-label={zh ? "关键指标" : "Key metrics"}
        aria-busy={loading}
        className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
      >
        {metrics.map((m) => {
          const Icon = m.icon;
          const value = availableData
            ? m.key === "cache"
              ? cacheHitRate(availableData.totals)
              : availableData.totals[m.key]
            : null;
          return (
            <article
              key={m.key}
              className="rounded-[1.5rem] border border-line bg-panel/80 p-5"
            >
              <div className="flex items-center justify-between gap-2 text-muted">
                <h2 className="text-xs">{zh ? m.zh : m.en}</h2>
                <Icon
                  className="size-4"
                  style={{ color: m.color }}
                  aria-hidden="true"
                />
              </div>
              <p
                className="mt-6 font-mono text-[clamp(1.4rem,2.2vw,2rem)] tracking-tight"
                style={{ color: m.color }}
              >
                {formatMetric(value, m.key, locale)}
              </p>
              <p className="mt-3 text-[10px] leading-5 text-muted">
                {m.key === "visitors"
                  ? zh
                    ? "周期去重 · 非每日值相加"
                    : "Period deduplicated · not daily sums"
                  : m.key === "cache"
                    ? zh
                      ? "缓存请求 / 总请求"
                      : "Cached / total requests"
                    : m.key === "pageViews"
                      ? zh
                        ? "Cloudflare 页面浏览口径"
                        : "Cloudflare page-view definition"
                      : m.key === "bytes"
                        ? zh
                          ? "响应字节 · 十进制单位"
                          : "Response bytes · decimal units"
                        : zh
                          ? "含页面、资源与自动请求"
                          : "Pages, assets, and automated traffic"}
              </p>
            </article>
          );
        })}
      </section>
      {availableData ? (
        <>
          <section className="mt-10">
            <div className="mb-5 flex items-center gap-2">
              <Clock3 className="size-4 text-accent" />
              <h2 className="font-display text-2xl">
                {zh ? "小时趋势" : "Hourly trends"}
              </h2>
              <span className="ml-auto text-xs text-muted">
                {zh ? "最近 3 个 UTC 日历日" : "Latest 3 UTC calendar days"}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {metrics
                .filter((m) => m.key !== "pageViews")
                .map((m) => (
                  <TrafficChart
                    key={`${range}-${mode}-hour-${m.key}`}
                    title={
                      m.key === "visitors"
                        ? zh
                          ? "每小时独立访问"
                          : "Hourly unique visits"
                        : zh
                          ? m.zh
                          : m.en
                    }
                    points={availableData.hourly}
                    metric={m.key}
                    color={m.color}
                    locale={locale}
                    hourly
                    demo={mode === "demo"}
                  />
                ))}
            </div>
          </section>
          <section className="mt-10">
            <div className="mb-5 flex items-center gap-2">
              <BarChart3 className="size-4 text-accent" />
              <h2 className="font-display text-2xl">
                {zh ? "每日趋势" : "Daily trends"}
              </h2>
              <span className="ml-auto text-xs text-muted">
                {range} {zh ? "天" : "days"}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {metrics
                .filter((m) => m.key !== "cache")
                .map((m) => (
                  <TrafficChart
                    key={`${range}-${mode}-day-${m.key}`}
                    title={
                      m.key === "visitors"
                        ? zh
                          ? "每日独立访问"
                          : "Daily unique visits"
                        : zh
                          ? m.zh
                          : m.en
                    }
                    points={availableData.daily}
                    metric={m.key}
                    color={m.color}
                    locale={locale}
                    hourly={false}
                    demo={mode === "demo"}
                  />
                ))}
            </div>
          </section>
          <DataTable data={availableData} locale={locale} />
        </>
      ) : (
        <section
          aria-label={zh ? "趋势数据状态" : "Trend data status"}
          className="mt-10 grid gap-4 md:grid-cols-2"
        >
          {[0, 1].map((i) => (
            <div
              key={i}
              className="flex min-h-56 items-center justify-center rounded-3xl border border-dashed border-line bg-panel/40 text-sm text-muted"
            >
              {loading
                ? zh
                  ? "正在读取趋势…"
                  : "Loading trends…"
                : zh
                  ? "连接统计源后显示趋势"
                  : "Trends appear after the source is connected"}
            </div>
          ))}
        </section>
      )}
      <footer className="mt-10 grid gap-6 rounded-3xl bg-ink p-7 text-paper sm:p-9 lg:grid-cols-[1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 text-liquid-foam">
            <ShieldCheck className="size-4" />
            <h2 className="text-sm font-medium">
              {zh ? "公开，但不追踪个人" : "Open, without personal tracking"}
            </h2>
          </div>
          <p className="mt-4 text-sm leading-7 text-paper/70">
            {zh
              ? "这里只读取 Cloudflare Zone 级汇总，不新增访客 Cookie 或追踪脚本，不展示 IP、令牌或访问明细。Zone 包含其代理主机的流量，独立访问不等于经过验证的真实人数，页面浏览也不等于客户端路由点击次数。"
              : "Only Cloudflare zone aggregates are read. No visitor cookies or tracking scripts are added; IPs, tokens, and individual records are not exposed. Zone traffic includes its proxied hosts; unique visits are not verified people, and page views are not client-side route clicks."}
          </p>
        </div>
        <div>
          <h2 className="text-sm font-medium text-liquid-foam">
            {zh ? "统计口径与更新" : "Definitions and freshness"}
          </h2>
          <p className="mt-4 text-sm leading-7 text-paper/70">
            {zh
              ? "缓存命中率按请求量加权，零请求时显示「—」。独立访问按所选周期查询去重，不能相加每日或每小时值。接口缓存约 5 分钟，源数据可能延迟；1 年等范围是否可查取决于套餐。"
              : "Cache hit rate is request-weighted and shown as “—” with no requests. Period uniques are queried separately and cannot be summed across daily or hourly buckets. Responses are cached for about five minutes; source reporting can lag, and ranges such as one year depend on the plan."}
          </p>
          <p className="mt-4 font-mono text-[10px] text-paper/50">
            {availableData
              ? `${zh ? "源响应时间" : "Source response time"}: ${availableData.updatedAt} · ${mode === "demo" ? "DEMO" : "Cloudflare GraphQL"}`
              : zh
                ? "统计源尚未连接或暂不可用"
                : "Source not connected or temporarily unavailable"}
          </p>
        </div>
      </footer>
    </div>
  );
}
