import type { Metadata } from "next";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
export const metadata: Metadata = {
  title: "Analytics · 访问统计",
  description:
    "NEXTFIELD 公开流量看板：请求、独立访问、页面浏览、缓存与带宽趋势。",
};
export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
