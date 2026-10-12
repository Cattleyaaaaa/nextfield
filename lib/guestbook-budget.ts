import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { SchoolError } from "@/lib/school-server";

export type GuestbookAction = "message" | "reply" | "reaction" | "delete";

type Limiter = {
  idFromName(name: string): unknown;
  get(id: unknown): { fetch(request: Request): Promise<Response> };
};

const WINDOW_MS = 10 * 60 * 1000;
const LIMITS: Record<GuestbookAction, { user: number; ip: number }> = {
  message: { user: 4, ip: 20 },
  reply: { user: 12, ip: 60 },
  reaction: { user: 60, ip: 300 },
  delete: { user: 12, ip: 60 },
};
const localTimes = new Map<string, number[]>();

async function digest(secret: CryptoKey, value: string) {
  const signature = await crypto.subtle.sign("HMAC", secret, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function reserveLocally(userId: string, ip: string, action: GuestbookAction) {
  const now = Date.now();
  const userKey = `user:${userId}:${action}`;
  const ipKey = `ip:${ip}:${action}`;
  const userTimes = (localTimes.get(userKey) || []).filter((time) => time > now - WINDOW_MS);
  const ipTimes = (localTimes.get(ipKey) || []).filter((time) => time > now - WINDOW_MS);
  const userRetry = userTimes.length >= LIMITS[action].user ? userTimes[0] + WINDOW_MS - now : 0;
  const ipRetry = ipTimes.length >= LIMITS[action].ip ? ipTimes[0] + WINDOW_MS - now : 0;
  if (userRetry || ipRetry) return { allowed: false, retryAfter: Math.max(1, Math.ceil(Math.max(userRetry, ipRetry) / 1000)) };
  localTimes.set(userKey, [...userTimes, now]);
  localTimes.set(ipKey, [...ipTimes, now]);
  return { allowed: true, retryAfter: 0 };
}

export async function assertGuestbookRateLimit(request: Request, userId: string, action: GuestbookAction) {
  let limiter: Limiter | undefined;
  try {
    limiter = (getCloudflareContext().env as unknown as { FIELD_AGENT_LIMITER?: Limiter }).FIELD_AGENT_LIMITER;
  } catch {
    // Next.js development does not have Cloudflare bindings.
  }

  let result: { allowed: boolean; retryAfter?: number };
  if (limiter) {
    const ip = request.headers.get("CF-Connecting-IP");
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!ip || !secret) throw new SchoolError(503, "留言防护暂不可用，请稍后重试");
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const [user, visitorIp] = await Promise.all([digest(key, `user:${userId}`), digest(key, `ip:${ip}`)]);
    const response = await limiter.get(limiter.idFromName("guestbook-mutations")).fetch(
      new Request("https://budget.internal/guestbook/reserve", {
        method: "POST",
        body: JSON.stringify({ user, ip: visitorIp, action }),
      }),
    );
    if (!response.ok) throw new SchoolError(503, "留言防护暂不可用，请稍后重试");
    result = await response.json() as { allowed: boolean; retryAfter?: number };
    if (typeof result.allowed !== "boolean") throw new SchoolError(503, "留言防护暂不可用，请稍后重试");
  } else {
    if (process.env.NODE_ENV !== "development") throw new SchoolError(503, "留言防护尚未配置");
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || new URL(request.url).hostname;
    result = reserveLocally(userId, ip, action);
  }

  if (!result.allowed) throw new SchoolError(429, "操作过于频繁，请稍后再试", result.retryAfter ?? 60);
}
