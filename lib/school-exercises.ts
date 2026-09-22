export const SCHOOL_EXERCISES = [
  {id:"approval",title:{zh:"Agent 工具审批",en:"Agent tool approval"},description:{zh:"实现 requiresApproval(action)：只有 read 和 search 不需要审批；任何其他值（包括缺失值）都需要审批。",en:"Implement requiresApproval(action): only read and search avoid approval. Every other value, including missing input, requires approval."},starter:"function requiresApproval(action) {\n  return false;\n}",fn:"requiresApproval",tests:[{args:["read"],expected:false},{args:["search"],expected:false},{args:["delete"],expected:true},{args:["send"],expected:true},{args:[],expected:true}]},
  {id:"validation",title:{zh:"全栈输入校验",en:"Full-stack input validation"},description:{zh:"实现 validateTitle(value)：只有去除两端空格后长度为 1–80 的字符串返回 true；其余返回 false。",en:"Implement validateTitle(value): return true only for strings with a trimmed length of 1–80; otherwise false."},starter:"function validateTitle(value) {\n  return true;\n}",fn:"validateTitle",tests:[{args:["Ship"],expected:true},{args:["  "],expected:false},{args:[null],expected:false},{args:[42],expected:false},{args:["a".repeat(81)],expected:false},{args:[" a "],expected:true}]},
  {id:"state",title:{zh:"异步任务状态机",en:"Async task state machine"},description:{zh:"实现 transition(state, event)：idle + start → loading；loading + resolve → success；loading + reject → error；error + retry → loading。其余组合保持原状态。",en:"Implement transition(state, event): idle + start → loading; loading + resolve → success; loading + reject → error; error + retry → loading. Other combinations keep their current state."},starter:"function transition(state, event) {\n  return state;\n}",fn:"transition",tests:[{args:["idle","start"],expected:"loading"},{args:["loading","resolve"],expected:"success"},{args:["loading","reject"],expected:"error"},{args:["error","retry"],expected:"loading"},{args:["success","start"],expected:"success"}]},
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
