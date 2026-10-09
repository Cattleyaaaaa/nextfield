import app from "./.open-next/worker.js";

export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";
export { FieldAgentLimiter } from "./workers/field-agent-limiter.mjs";

/** Cloudflare static assets currently answer MP3 Range requests with a full 200 response. */
async function serveAudio(request, env) {
  const range = request.headers.get("Range");
  const asset = await env.ASSETS.fetch(new Request(request.url, { method: range ? "GET" : request.method }));
  if (!asset.ok) return asset;

  const headers = new Headers(asset.headers);
  headers.set("Accept-Ranges", "bytes");
  const ifRange = request.headers.get("If-Range");
  if (!range || (ifRange && ifRange !== headers.get("ETag") && ifRange !== headers.get("Last-Modified"))) {
    return new Response(request.method === "HEAD" ? null : asset.body, { status: asset.status, headers });
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (!match || (!match[1] && !match[2])) {
    return new Response(request.method === "HEAD" ? null : asset.body, { status: asset.status, headers });
  }

  const bytes = await asset.arrayBuffer();
  const size = bytes.byteLength;
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || end < start) {
    headers.set("Content-Range", `bytes */${size}`);
    headers.set("Content-Length", "0");
    return new Response(null, { status: 416, headers });
  }

  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(end - start + 1));
  const body = request.method === "HEAD" ? null : bytes.slice(start, end + 1);
  return new Response(body, { status: 206, headers });
}

export default {
  async fetch(request, env, ctx) {
    const path = new URL(request.url).pathname;
    if ((request.method === "GET" || request.method === "HEAD") && path.startsWith("/audio/") && path.endsWith(".mp3")) {
      return serveAudio(request, env);
    }
    return app.fetch(request, env, ctx);
  },
};
