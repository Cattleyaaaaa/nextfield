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
let localLast = 0;
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
        localLast = 0;
    }
    const resetAt = Date.parse(day + "T00:00:00Z") + 16 * 60 * 60 * 1000;
    if (localCount >= 5)
        return { allowed: false, remaining: 0, resetAt, retryAfter: Math.ceil((resetAt - now) / 1000) };
    if (now - localLast < 5000)
        return { allowed: false, remaining: 5 - localCount, resetAt, retryAfter: 5 };
    localCount += 1;
    localLast = now;
    return { allowed: true, remaining: 5 - localCount, resetAt };
}
