import { parseAnalyticsRange } from "@/lib/analytics-data";
import { AnalyticsError, readAnalytics } from "@/lib/analytics-server";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const range = parseAnalyticsRange(
    new URL(request.url).searchParams.get("days"),
  );
  if (!range)
    return Response.json(
      { error: "invalid_range" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  try {
    const data = await readAnalytics(range);
    return Response.json(data, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof AnalyticsError ? error.code : "upstream_unavailable",
      },
      {
        status: error instanceof AnalyticsError ? error.status : 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
