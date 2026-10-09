import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { FieldAgentModelError } from "@/lib/field-agent-model";
type Budget = {
    allowed: boolean;
    remaining: number;
    resetAt: number;
    retryAfter?: number;
};
type Limiter = {
    idFromName(name: string): unknown;
    get(id: unknown): {
        fetch(input: Request): Promise<Response>;
    };
};
let localCount = 0;
let localDay = "";
const localVisitors = new Map<string, { count: number; last: number }>();
export async function reserveFieldAgentBudget(request: Request, apiKey: string): Promise<Budget> {
    let limiter: Limiter | undefined;
    try {
        limiter = (getCloudflareContext().env as unknown as {
            FIELD_AGENT_LIMITER?: Limiter;
        }).FIELD_AGENT_LIMITER;
    }
    catch { /* next dev has no Cloudflare bindings. */ }
    if (limiter) {
        const ip = request.headers.get("CF-Connecting-IP");
        if (!ip)
            throw new FieldAgentModelError(503, "暂时无法确认提问额度，请稍后重试。");
        const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(apiKey), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
        const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(ip));
        const visitor = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
        const response = await limiter.get(limiter.idFromName("field-agent-daily-budget")).fetch(new Request("https://budget.internal/reserve", { method: "POST", body: JSON.stringify({ visitor }) }));
        if (!response.ok)
            throw new FieldAgentModelError(503, "提问额度服务暂不可用。");
        return response.json();
    }
    if (process.env.NODE_ENV !== "development")
        throw new FieldAgentModelError(503, "提问额度服务尚未配置。");
    const now = Date.now();
    const day = new Date(now + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
    if (day !== localDay) {
        localDay = day;
        localCount = 0;
        localVisitors.clear();
    }
    const resetAt = Date.parse(day + "T00:00:00Z") + 16 * 60 * 60 * 1000;
    const visitorId = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || new URL(request.url).hostname;
    const visitor = localVisitors.get(visitorId) ?? { count: 0, last: 0 };
    if (localCount >= 300 || visitor.count >= 15)
        return { allowed: false, remaining: Math.max(0, 15 - visitor.count), resetAt, retryAfter: Math.ceil((resetAt - now) / 1000) };
    if (now - visitor.last < 5000)
        return { allowed: false, remaining: 15 - visitor.count, resetAt, retryAfter: 5 };
    visitor.count += 1;
    visitor.last = now;
    localVisitors.set(visitorId, visitor);
    localCount += 1;
    return { allowed: true, remaining: 15 - visitor.count, resetAt };
}
