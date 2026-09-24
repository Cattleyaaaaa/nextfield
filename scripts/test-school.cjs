const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const source = fs.readFileSync("lib/school-exercises.ts", "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const moduleContext = { exports: {} };
vm.runInNewContext(compiled, moduleContext);
const { SCHOOL_EXERCISES, exerciseDocument } = moduleContext.exports;
function execute(code, exercise) {
  let output;
  const html = exerciseDocument(code, exercise.fn, exercise.tests, "test-nonce");
  assert.ok(html.includes("connect-src 'none'"));
  assert.ok(html.includes("worker-src blob:"));
  const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
  let workerSource;
  const context = {
    Blob: class { constructor(parts) { workerSource = parts.join(""); } },
    URL: { createObjectURL: () => "blob:test", revokeObjectURL() {} },
    Worker: class {
      constructor() {
        this.result = undefined;
        const self = { postMessage: result => { this.result = result; } };
        try { vm.runInNewContext(workerSource, { self }, { timeout: 100 }); }
        catch { this.result = { error: "Timeout" }; }
      }
      set onmessage(handler) { handler({ data: this.result }); }
      terminate() {}
    },
    setTimeout: () => 1, clearTimeout() {},
    parent: { postMessage(message) { output = message; } }
  };
  vm.runInNewContext(script, context);
  assert.equal(output.nonce, "test-nonce");
  return output.result;
}
const solutions = [
  'function requiresApproval(a){return !["read","search"].includes(a)}',
  'function validateTitle(v){return typeof v==="string" && v.trim().length>0 && v.trim().length<=80}',
  'function transition(s,e){return ({"idle:start":"loading","loading:resolve":"success","loading:reject":"error","error:retry":"loading"})[s+":"+e]||s}',
  'function filterChunks(chunks,version){return chunks.filter(c=>c.version===version).map(c=>c.id)}',
  'function classifyStatus(s){return s>=200&&s<=299?"success":s===401?"login":s===403?"forbidden":s>=500&&s<=599?"retry":"error"}',
  'function releaseReady(m){return typeof m.citationRate==="number"&&m.citationRate>=.95&&typeof m.p95LatencyMs==="number"&&m.p95LatencyMs<=2000&&typeof m.dailyCost==="number"&&m.dailyCost<=100&&m.blockedActions===0}'
];
SCHOOL_EXERCISES.forEach((exercise, i) => {
  assert.ok(execute(solutions[i], exercise).every(r => r.pass));
  assert.ok(execute(exercise.starter, exercise).some(r => !r.pass));
});
assert.ok(execute("function {", SCHOOL_EXERCISES[0]).error);
assert.ok(execute("while(true){}", SCHOOL_EXERCISES[0]).error);
const escaped = exerciseDocument('const x = "</script><img src=x>";', "x", [], "n");
assert.equal((escaped.match(/<\/script>/g) || []).length, 1);
console.log(`PASS: ${SCHOOL_EXERCISES.length} solutions, failing starters, syntax error, timeout, script escaping and CSP. Browser isolation requires separate browser QA.`);
