const WINDOW_MS = 10 * 60 * 1000;
const LIMITS = {
  message: { user: 4, ip: 20 },
  reply: { user: 12, ip: 60 },
  reaction: { user: 60, ip: 300 },
  delete: { user: 12, ip: 60 },
};
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;

export async function handleGuestbookLimit(ctx, request) {
  if (request.method !== "POST") return new Response(null, { status: 405 });
  const body = await request.json().catch(() => null);
  if (!body || !Object.hasOwn(LIMITS, body.action) || !DIGEST_PATTERN.test(body.user) || !DIGEST_PATTERN.test(body.ip)) {
    return new Response(null, { status: 400 });
  }

  const now = Date.now();
  const day = new Date(now + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const limits = LIMITS[body.action];
  const result = await ctx.storage.transaction(async (txn) => {
    let state = await txn.get("guestbook-budget");
    if (!state || state.day !== day) state = { day, users: {}, ips: {} };

    const userActions = state.users[body.user] || {};
    const ipActions = state.ips[body.ip] || {};
    const userTimes = (userActions[body.action] || []).filter((time) => time > now - WINDOW_MS);
    const ipTimes = (ipActions[body.action] || []).filter((time) => time > now - WINDOW_MS);
    const userRetry = userTimes.length >= limits.user ? userTimes[0] + WINDOW_MS - now : 0;
    const ipRetry = ipTimes.length >= limits.ip ? ipTimes[0] + WINDOW_MS - now : 0;
    if (userRetry || ipRetry) return { allowed: false, retryAfter: Math.max(1, Math.ceil(Math.max(userRetry, ipRetry) / 1000)) };

    userActions[body.action] = [...userTimes, now];
    ipActions[body.action] = [...ipTimes, now];
    state.users[body.user] = userActions;
    state.ips[body.ip] = ipActions;
    await txn.put("guestbook-budget", state);
    return { allowed: true };
  });
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
}
