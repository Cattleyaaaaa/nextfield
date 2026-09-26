"use client";
import { useId, useState } from "react";
import { cacheHitRate, type AnalyticsPoint } from "@/lib/analytics-data";

export type ChartMetric =
  "requests" | "visitors" | "pageViews" | "bytes" | "cache";
export function formatMetric(
  value: number | null,
  metric: ChartMetric,
  locale: string,
) {
  if (value === null) return "—";
  if (metric === "cache") return `${value.toFixed(2)}%`;
  if (metric === "bytes") {
    const units = ["B", "KB", "MB", "GB", "TB"];
    const power =
      value > 0 ? Math.min(4, Math.floor(Math.log(value) / Math.log(1000))) : 0;
    return `${(value / 1000 ** power).toFixed(power ? 2 : 0)} ${units[power]}`;
  }
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US").format(
    value,
  );
}
function valueOf(point: AnalyticsPoint, metric: ChartMetric) {
  return metric === "cache" ? cacheHitRate(point) : point[metric];
}
export function TrafficChart({
  title,
  points,
  metric,
  color,
  locale,
  hourly,
  demo,
}: {
  title: string;
  points: AnalyticsPoint[];
  metric: ChartMetric;
  color: string;
  locale: "zh" | "en";
  hourly: boolean;
  demo: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const [active, setActive] = useState<number | null>(null);
  const zh = locale === "zh";
  const selected = points.length
    ? points[Math.min(active ?? points.length - 1, points.length - 1)]
    : undefined;
  const values = points.map((p) => valueOf(p, metric));
  const max =
    metric === "cache" ? 100 : Math.max(1, ...values.map((v) => v ?? 0)) * 1.12;
  const start = points.length ? Date.parse(points[0].time) : 0;
  const end =
    points.length > 1 ? Date.parse(points[points.length - 1].time) : start + 1;
  const x = (i: number) =>
    points.length === 1
      ? 310
      : 48 + ((Date.parse(points[i].time) - start) / (end - start)) * 536;
  const y = (v: number) => 180 - (v / max) * 156;
  const segments: { d: string; first: number; last: number }[] = [];
  let segment: { d: string; first: number; last: number } | undefined;
  points.forEach((p, i) => {
    const value = values[i];
    const gap =
      i > 0 &&
      Date.parse(p.time) - Date.parse(points[i - 1].time) >
        (hourly ? 3600000 : 86400000) * 1.5;
    if (value === null) {
      segment = undefined;
      return;
    }
    if (!segment || gap) {
      segment = { d: `M ${x(i)} ${y(value)}`, first: x(i), last: x(i) };
      segments.push(segment);
    } else {
      segment.d += ` L ${x(i)} ${y(value)}`;
      segment.last = x(i);
    }
  });
  const timeLabel = (time: string, full = false) =>
    new Intl.DateTimeFormat(zh ? "zh-CN" : "en-GB", {
      timeZone: "UTC",
      month: "2-digit",
      day: "2-digit",
      ...(hourly || full
        ? { hour: "2-digit", minute: "2-digit", hour12: false }
        : {}),
    }).format(new Date(time));
  const selectedIndex = selected ? points.indexOf(selected) : 0;
  return (
    <section className="min-w-0 rounded-[1.5rem] border border-line bg-panel/80 p-5 sm:p-7">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="mt-2 min-h-5 font-mono text-[10px] text-muted">
            {selected
              ? `${timeLabel(selected.time, true)} UTC`
              : zh
                ? "暂无可用时间点"
                : "No available time buckets"}
          </p>
        </div>
        <p className="font-mono text-lg sm:text-xl" style={{ color }}>
          {selected
            ? formatMetric(valueOf(selected, metric), metric, locale)
            : "—"}
        </p>
      </header>
      <div className="relative mt-4">
        {points.length ? (
          <svg
            className="block w-full overflow-visible"
            viewBox="0 0 600 220"
            role="img"
            aria-labelledby={`${id}-title ${id}-description`}
            onPointerMove={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              const target = ((event.clientX - rect.left) / rect.width) * 600;
              let nearest = 0;
              points.forEach((_, i) => {
                if (Math.abs(x(i) - target) < Math.abs(x(nearest) - target))
                  nearest = i;
              });
              setActive(nearest);
            }}
            onPointerLeave={() => setActive(null)}
          >
            <title id={`${id}-title`}>
              {title}
              {demo ? (zh ? "（示例数据）" : " (demo data)") : ""}
            </title>
            <desc id={`${id}-description`}>
              {zh
                ? "用下方滑块选择时间点，原始数据可在本页表格中查看。"
                : "Use the slider below to select a time. A data table is also available on this page."}
            </desc>
            <defs>
              <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity=".18" />
                <stop offset="100%" stopColor={color} stopOpacity=".015" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3].map((i) => {
              const v = (max * i) / 3;
              return (
                <g key={i}>
                  <line
                    x1="48"
                    x2="584"
                    y1={y(v)}
                    y2={y(v)}
                    stroke="currentColor"
                    className="text-line"
                    strokeDasharray="3 5"
                  />
                  <text
                    x="40"
                    y={y(v) + 4}
                    textAnchor="end"
                    className="fill-current text-muted"
                    fontSize="10"
                  >
                    {metric === "bytes"
                      ? new Intl.NumberFormat("en", {
                          notation: "compact",
                          maximumFractionDigits: 1,
                        }).format(v) + "B"
                      : metric === "cache"
                        ? `${Math.round(v)}%`
                        : new Intl.NumberFormat("en", {
                            notation: "compact",
                            maximumFractionDigits: 1,
                          }).format(v)}
                  </text>
                </g>
              );
            })}
            {segments.map((s, i) => (
              <g key={i}>
                <path
                  d={`${s.d} L ${s.last} 180 L ${s.first} 180 Z`}
                  fill={`url(#${id}-fill)`}
                />
                <path
                  d={s.d}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </g>
            ))}
            {selected && values[selectedIndex] !== null && (
              <g>
                <line
                  x1={x(selectedIndex)}
                  x2={x(selectedIndex)}
                  y1="24"
                  y2="180"
                  stroke={color}
                  strokeOpacity=".3"
                  strokeDasharray="4 4"
                />
                <circle
                  cx={x(selectedIndex)}
                  cy={y(values[selectedIndex]!)}
                  r="4.5"
                  fill={color}
                  stroke="rgb(var(--paper))"
                  strokeWidth="2"
                />
              </g>
            )}
            {[0, Math.floor((points.length - 1) / 2), points.length - 1]
              .filter((i, index, array) => array.indexOf(i) === index)
              .map((i, index) => (
                <text
                  key={i}
                  x={x(i)}
                  y="207"
                  textAnchor={
                    index === 0 ? "start" : index === 2 ? "end" : "middle"
                  }
                  className="fill-current text-muted"
                  fontSize="10"
                >
                  {timeLabel(points[i].time)}
                </text>
              ))}
            {demo && (
              <text
                x="316"
                y="109"
                textAnchor="middle"
                fontSize="20"
                className="fill-current text-muted"
                opacity=".18"
              >
                {zh ? "示例数据" : "DEMO DATA"}
              </text>
            )}
          </svg>
        ) : (
          <div className="flex aspect-[600/220] items-center justify-center rounded-xl border border-dashed border-line text-sm text-muted">
            {zh ? "暂未收到该序列数据" : "No series data available"}
          </div>
        )}
      </div>
      {points.length > 1 && (
        <label className="mt-2 flex items-center gap-3 text-[10px] text-muted">
          <span className="shrink-0">{zh ? "选择时间" : "Select time"}</span>
          <input
            type="range"
            min="0"
            max={points.length - 1}
            value={selectedIndex}
            aria-label={`${title} · ${zh ? "时间点" : "time bucket"}`}
            aria-valuetext={
              selected
                ? `${timeLabel(selected.time, true)} UTC: ${formatMetric(valueOf(selected, metric), metric, locale)}`
                : ""
            }
            onChange={(event) => setActive(Number(event.target.value))}
            className="h-1.5 min-w-0 flex-1 accent-accent"
          />
        </label>
      )}
    </section>
  );
}
