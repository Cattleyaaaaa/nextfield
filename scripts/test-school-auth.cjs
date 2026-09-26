// Local OAuth contract test. It never calls GitHub or a real Supabase project.
const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const { spawn } = require("node:child_process");
const { createHash } = require("node:crypto");

async function listen(server) {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return server.address().port;
}

async function main() {
  let refreshes = 0;
  let progressReady = false;
  const attempts = [];
  const mock = createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    res.setHeader("Content-Type", "application/json");
    if (url.pathname === "/auth/v1/token" && url.searchParams.get("grant_type") === "pkce") {
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      const body = JSON.parse(Buffer.concat(chunks).toString());
      assert.equal(body.auth_code, "mock-code");
      assert.ok(body.code_verifier);
      res.end(JSON.stringify({ access_token: "expired-token", refresh_token: "refresh-one" }));
    } else if (url.pathname === "/auth/v1/token" && url.searchParams.get("grant_type") === "refresh_token") {
      refreshes++;
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      assert.equal(JSON.parse(Buffer.concat(chunks).toString()).refresh_token, "refresh-one");
      res.end(JSON.stringify({ access_token: "fresh-token", refresh_token: "refresh-two" }));
    } else if (url.pathname === "/auth/v1/user") {
      if (req.headers.authorization === "Bearer expired-token") {
        res.writeHead(403); res.end(JSON.stringify({ error: "expired" }));
      } else if (req.headers.authorization === "Bearer fresh-token") {
        res.end(JSON.stringify({ id: "00000000-0000-4000-8000-000000000001", user_metadata: { user_name: "test-github-user" } }));
      } else { res.writeHead(401); res.end("{}"); }
    } else if (url.pathname === "/rest/v1/school_progress") {
      const lessons = ["what-is-agent", "llm-basics", "agent-vs-chat", "prompt-contracts", "tool-schemas", "state-and-memory", "agent-loop", "rag-pipeline", "tools-and-confirmation", "multi-agent", "evaluation-and-recovery", "agent-production"];
      res.end(JSON.stringify(progressReady ? lessons.map(slug => ({ lesson_key: `agent/${slug}` })) : []));
    } else if (url.pathname === "/rest/v1/school_exam_attempts") {
      res.end(JSON.stringify(attempts));
    } else if (url.pathname === "/rest/v1/rpc/school_record_exam") {
      assert.equal(req.headers.apikey, "test-service");
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      const body = JSON.parse(Buffer.concat(chunks).toString());
      assert.equal(body.p_track, "agent");
      const attempt = { id: `00000000-0000-4000-8000-00000000000${attempts.length + 2}`, score: body.p_score, total: 6, passed: body.p_score >= 5, attempted_at: new Date().toISOString() };
      attempts.unshift(attempt);
      res.end(JSON.stringify(attempt.id));
    } else if (url.pathname === "/auth/v1/logout") { res.writeHead(204); res.end(); }
    else { res.writeHead(404); res.end("{}"); }
  });
  const mockPort = await listen(mock);
  const sitePort = 3352;
  const site = `http://localhost:${sitePort}`;
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "-p", String(sitePort)], {
    env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${mockPort}`, NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon", SUPABASE_SERVICE_ROLE_KEY: "test-service", SITE_URL: site },
    stdio: ["ignore", "pipe", "pipe"]
  });
  let output = "";
  child.stdout.on("data", data => { output += data.toString(); });
  child.stderr.on("data", data => { output += data.toString(); });
  const jar = new Map();
  const call = async (path, options = {}) => {
    const response = await fetch(site + path, { ...options, redirect: "manual", headers: { cookie: [...jar].map(([key, value]) => `${key}=${value}`).join("; "), ...options.headers } });
    for (const cookie of response.headers.getSetCookie()) {
      const [key, value] = cookie.split(";", 1)[0].split("=");
      if (value) jar.set(key, value); else jar.delete(key);
    }
    return response;
  };
  try {
    let ready = false;
    for (let i = 0; i < 70; i++) {
      if (child.exitCode !== null) throw new Error(output);
      try { const response = await fetch(site + "/api/school/session"); if (response.ok) { ready = true; break; } } catch {}
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    assert.ok(ready, output);
    assert.deepEqual(await (await call("/api/school/session")).json(), { configured: true, user: null });
    const login = await call("/api/school/login");
    assert.equal(login.status, 307);
    const redirect = new URL(login.headers.get("location"));
    assert.equal(redirect.searchParams.get("provider"), "github");
    assert.equal(redirect.searchParams.get("redirect_to"), `${site}/auth/callback`);
    assert.equal(redirect.searchParams.get("code_challenge_method"), "s256");
    assert.equal(redirect.searchParams.get("code_challenge"), createHash("sha256").update(jar.get("school-verifier")).digest("base64url"));
    const callback = await call("/auth/callback?code=mock-code");
    assert.equal(callback.status, 307);
    assert.equal(callback.headers.get("location"), `${site}/learn/dashboard`);
    assert.ok(!jar.has("school-verifier"));
    assert.ok(jar.has("school-access"));
    const session = await call("/api/school/session");
    assert.equal((await session.json()).user.name, "test-github-user");
    assert.equal(refreshes, 1);
    assert.equal(jar.get("school-access"), "fresh-token");
    const lockedExam = await call("/api/school/exam?track=agent");
    const lockedBody = await lockedExam.json();
    assert.equal(lockedBody.eligible, false);
    assert.equal(lockedBody.missing.length, 12);
    assert.equal(lockedBody.questions.length, 0);
    const earlySubmit = await call("/api/school/exam", { method: "POST", headers: { origin: site, "Content-Type": "application/json" }, body: JSON.stringify({ track: "agent", answers: [0, 0, 0, 0, 0, 0] }) });
    assert.equal(earlySubmit.status, 403);
    progressReady = true;
    const exam = await (await call("/api/school/exam?track=agent")).json();
    assert.equal(exam.eligible, true);
    assert.equal(exam.questions.length, 6);
    assert.ok(exam.questions.every(question => !Object.hasOwn(question, "answer") && !Object.hasOwn(question, "explanation")));
    const correctOptionById = {
      a1: "说明证据不足，并停止或请人补充资料",
      a2: "先按版本元数据过滤，再判断相关性",
      a3: "不可以，它只能重排已有候选",
      a4: "收件人、最终内容和发送后果",
      a5: "为该动作使用稳定的幂等标识",
      a6: "用固定问题集比较答案、引用和拒答"
    };
    const correct = exam.questions.map(question => question.options.findIndex(option => option.zh === correctOptionById[question.id]));
    assert.ok(correct.every(index => index >= 0));
    const wrong = correct.map((answer, index) => index < 2 ? (answer + 1) % 4 : answer);
    const submitExam = async answers => call("/api/school/exam", { method: "POST", headers: { origin: site, "Content-Type": "application/json" }, body: JSON.stringify({ track: "agent", answers }) });
    const failed = await (await submitExam(wrong)).json();
    assert.equal(failed.score, 4); assert.equal(failed.passed, false);
    const passed = await (await submitExam(correct)).json();
    assert.equal(passed.score, 6); assert.equal(passed.passed, true);
    assert.equal((await (await call("/api/school/exam?track=agent")).json()).attempts.length, 2);
    const crossOrigin = await call("/api/school/session", { method: "DELETE", headers: { origin: "https://other.example" } });
    assert.equal(crossOrigin.status, 403);
    const logout = await call("/api/school/session", { method: "DELETE", headers: { origin: site } });
    assert.equal(logout.status, 200);
    assert.ok(!jar.has("school-access"));
    assert.equal((await (await call("/api/school/session")).json()).user, null);
    console.log("PASS: GitHub redirect/PKCE, callback, refresh, exam gating/scoring/records, origin check and logout.");
  } finally {
    child.kill();
    await new Promise(resolve => mock.close(resolve));
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
