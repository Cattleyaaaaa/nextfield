const USER_LIMIT = 15;
const SITE_LIMIT = 300;

export async function handleFieldAgentLimit(ctx, request) {
    if (request.method !== 'POST') return new Response(null, {status:405});
    const body = await request.json();
    if (typeof body.visitor !== 'string' || !/^[a-f0-9]{64}$/.test(body.visitor)) return new Response(null,{status:400});
    const now = Date.now();
    const shifted = new Date(now + 8*60*60*1000);
    const day = shifted.toISOString().slice(0,10);
    const resetAt = Date.parse(day+'T00:00:00Z') + 24*60*60*1000 - 8*60*60*1000;
    const result = await ctx.storage.transaction(async txn => {
      let state = await txn.get('budget');
      if (!state || state.day !== day) state = {day,total:0,visitors:{}};
      const visitor = state.visitors[body.visitor] || {count:0,last:0};
      if (state.total >= SITE_LIMIT || visitor.count >= USER_LIMIT) return {allowed:false,retryAfter:Math.ceil((resetAt-now)/1000),remaining:Math.max(0,USER_LIMIT-visitor.count),resetAt};
      if (now-visitor.last < 5000) return {allowed:false,retryAfter:5,remaining:USER_LIMIT-visitor.count,resetAt};
      visitor.count += 1;
      visitor.last = now;
      state.visitors[body.visitor] = visitor;
      state.total += 1;
      await txn.put('budget',state);
      return {allowed:true,remaining:USER_LIMIT-visitor.count,resetAt};
    });
    return Response.json(result,{headers:{'Cache-Control':'no-store'}});
}
