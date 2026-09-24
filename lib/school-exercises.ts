export const SCHOOL_EXERCISES = [
  {id:"approval",title:{zh:"Agent 工具审批",en:"Agent tool approval"},description:{zh:"实现 requiresApproval(action)：只有 read 和 search 不需要审批；任何其他值（包括缺失值）都需要审批。",en:"Implement requiresApproval(action): only read and search avoid approval. Every other value, including missing input, requires approval."},starter:"function requiresApproval(action) {\n  return false;\n}",fn:"requiresApproval",tests:[{args:["read"],expected:false},{args:["search"],expected:false},{args:["delete"],expected:true},{args:["send"],expected:true},{args:[],expected:true}]},
  {id:"validation",title:{zh:"全栈输入校验",en:"Full-stack input validation"},description:{zh:"实现 validateTitle(value)：只有去除两端空格后长度为 1–80 的字符串返回 true；其余返回 false。",en:"Implement validateTitle(value): return true only for strings with a trimmed length of 1–80; otherwise false."},starter:"function validateTitle(value) {\n  return true;\n}",fn:"validateTitle",tests:[{args:["Ship"],expected:true},{args:["  "],expected:false},{args:[null],expected:false},{args:[42],expected:false},{args:["a".repeat(81)],expected:false},{args:[" a "],expected:true}]},
  {id:"state",title:{zh:"异步任务状态机",en:"Async task state machine"},description:{zh:"实现 transition(state, event)：idle + start → loading；loading + resolve → success；loading + reject → error；error + retry → loading。其余组合保持原状态。",en:"Implement transition(state, event): idle + start → loading; loading + resolve → success; loading + reject → error; error + retry → loading. Other combinations keep their current state."},starter:"function transition(state, event) {\n  return state;\n}",fn:"transition",tests:[{args:["idle","start"],expected:"loading"},{args:["loading","resolve"],expected:"success"},{args:["loading","reject"],expected:"error"},{args:["error","retry"],expected:"loading"},{args:["success","start"],expected:"success"}]},
  {id:"rag-version",title:{zh:"RAG 版本过滤",en:"RAG version filtering"},description:{zh:"实现 filterChunks(chunks, version)：按原顺序返回版本完全匹配的片段 ID。不要让旧版证据混入新版答案。",en:"Implement filterChunks(chunks, version): return matching chunk IDs in input order. Do not mix old evidence into a new-version answer."},starter:"function filterChunks(chunks, version) {\n  return [];\n}",fn:"filterChunks",tests:[{args:[[{id:"a",version:"v1"},{id:"b",version:"v2"},{id:"c",version:"v2"}],"v2"],expected:["b","c"]},{args:[[{id:"old",version:"v1"}],"v2"],expected:[]},{args:[[],"v2"],expected:[]}]},
  {id:"api-errors",title:{zh:"API 错误语义",en:"API error semantics"},description:{zh:"实现 classifyStatus(status)：200–299 返回 success；401 返回 login；403 返回 forbidden；500–599 返回 retry；其他返回 error。",en:"Implement classifyStatus(status): 200–299 → success; 401 → login; 403 → forbidden; 500–599 → retry; everything else → error."},starter:"function classifyStatus(status) {\n  return 'success';\n}",fn:"classifyStatus",tests:[{args:[201],expected:"success"},{args:[204],expected:"success"},{args:[401],expected:"login"},{args:[403],expected:"forbidden"},{args:[503],expected:"retry"},{args:[400],expected:"error"},{args:[302],expected:"error"}]},
  {id:"release-gate",title:{zh:"上线质量门槛",en:"Release quality gate"},description:{zh:"实现 releaseReady(m)：只有 citationRate ≥ 0.95、p95LatencyMs ≤ 2000、dailyCost ≤ 100 且 blockedActions 为 0 时返回 true；缺少指标返回 false。",en:"Implement releaseReady(m): return true only when citationRate ≥ 0.95, p95LatencyMs ≤ 2000, dailyCost ≤ 100, and blockedActions is 0. Missing metrics must return false."},starter:"function releaseReady(m) {\n  return true;\n}",fn:"releaseReady",tests:[{args:[{citationRate:0.96,p95LatencyMs:1800,dailyCost:80,blockedActions:0}],expected:true},{args:[{citationRate:0.94,p95LatencyMs:1800,dailyCost:80,blockedActions:0}],expected:false},{args:[{citationRate:0.96,p95LatencyMs:2200,dailyCost:80,blockedActions:0}],expected:false},{args:[{citationRate:0.96,p95LatencyMs:1800,dailyCost:101,blockedActions:0}],expected:false},{args:[{citationRate:0.96,p95LatencyMs:1800,dailyCost:80,blockedActions:1}],expected:false},{args:[{}],expected:false}]},
];

// Opaque-origin iframe + worker: no same-origin privileges, networking or DOM access.
// Tests are learning feedback, not a trusted grading or certification mechanism.
export function exerciseDocument(code:string,fn:string,tests:{args:unknown[];expected:unknown}[],nonce:string){
 const worker = `const report = self.postMessage.bind(self);
 try {
 const run = new Function(${JSON.stringify(code+"\nreturn "+fn+";")})();
 const tests = ${JSON.stringify(tests)};
 report(tests.map(t=>{try{const actual=run(...t.args);return {pass:JSON.stringify(actual)===JSON.stringify(t.expected),actual:String(actual).slice(0,200)};}catch{return {pass:false,actual:"Runtime error"};}}));
 } catch {report({error:"Syntax or runtime error"});}`;
 const script = `const nonce=${JSON.stringify(nonce)};
 const send=result=>parent.postMessage({type:"school-exercise",nonce,result},"*");
 try{
 const url=URL.createObjectURL(new Blob([${JSON.stringify(worker)}],{type:"text/javascript"}));
 const worker=new Worker(url);
 const timer=setTimeout(()=>{worker.terminate();URL.revokeObjectURL(url);send({error:"Execution exceeded 1500 ms"});},1500);
 worker.onmessage=e=>{clearTimeout(timer);worker.terminate();URL.revokeObjectURL(url);send(e.data);};
 worker.onerror=()=>{clearTimeout(timer);worker.terminate();URL.revokeObjectURL(url);send({error:"Execution failed"});};
 }catch{send({error:"Sandbox unavailable in this browser"});}`;
 return `<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none'; img-src 'none'; form-action 'none'; base-uri 'none'"><script>${script.replace(/<\/script/gi,"<\\/script")}<\/script>`;
}
