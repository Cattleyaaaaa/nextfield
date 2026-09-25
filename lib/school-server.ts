import "server-only";
import { cookies } from "next/headers";
export const configured = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export class SchoolError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function supabase(path: string, token?: string, init: RequestInit = {}, admin = false) {
 const key = admin ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if (!configured() || !key) throw new SchoolError(503, "Cloud learning is not configured / 云端学习尚未配置");
 const r = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}${path}`, { ...init, cache:"no-store", signal:AbortSignal.timeout(15000), headers:{apikey:key,Authorization:`Bearer ${token || key}`,"Content-Type":"application/json",...init.headers}});
 if (!r.ok) {
  const authFailure = path.startsWith("/auth/v1/token") && [400, 401, 403].includes(r.status);
  throw new SchoolError(authFailure ? 401 : [401, 403].includes(r.status) ? r.status : 502, "Cloud request failed / 云端请求失败");
 }
 const body = await r.text(); return body ? JSON.parse(body) : null;
}
export async function saveSession(s: {access_token:string;refresh_token:string}) {
 const cookieStore = await cookies();
 const o = {httpOnly:true,secure:process.env.NODE_ENV === "production",sameSite:"lax" as const,path:"/",maxAge:2592000};
 cookieStore.set("school-access",s.access_token,o); cookieStore.set("school-refresh",s.refresh_token,o);
}
export async function authenticate() {
 const cookieStore = await cookies();
 let token = cookieStore.get("school-access")?.value; const refresh = cookieStore.get("school-refresh")?.value;
 if (!token) throw new SchoolError(401,"Please sign in / 请先登录");
 try {return {user:await supabase("/auth/v1/user",token),token};}
 catch(e) {
  if (!(e instanceof SchoolError) || ![401, 403].includes(e.status) || !refresh) throw e;
  let s: {access_token:string;refresh_token:string};
  try { s = await supabase("/auth/v1/token?grant_type=refresh_token",undefined,{method:"POST",body:JSON.stringify({refresh_token:refresh})}); }
  catch (refreshError) {
   if (refreshError instanceof SchoolError && refreshError.status === 401) {
    cookieStore.delete("school-access");cookieStore.delete("school-refresh");
   }
   throw refreshError;
  }
  await saveSession(s); token=s.access_token;
  return {user:await supabase("/auth/v1/user",token),token:token!};
 }
}
export function guardOrigin(r: Request) {if(r.headers.get("origin") !== new URL(r.url).origin) throw new SchoolError(403,"Invalid request origin");}
export async function readBody(r:Request) {
 const reader=r.body?.getReader();if(!reader)throw new SchoolError(400,"Missing body");
 const chunks:Uint8Array[]=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>36000){await reader.cancel();throw new SchoolError(413,"Request too large / 内容过长");}chunks.push(value);}
 try{const body=JSON.parse(Buffer.concat(chunks).toString("utf8"));if(!body||typeof body!=="object"||Array.isArray(body))throw Error();return body;}catch{throw new SchoolError(400,"Invalid JSON / 请求格式无效");}
}
export const json=(v:unknown,status=200)=>Response.json(v,{status,headers:{"Cache-Control":"private, no-store"}});
export const failure=(e:unknown)=>json({error:e instanceof SchoolError ? e.message : "Service unavailable / 服务暂不可用"},e instanceof SchoolError ? e.status : 503);
