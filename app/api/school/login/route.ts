import {randomBytes,createHash} from "node:crypto";
import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {configured,json} from "@/lib/school-server";
export async function GET(request:Request){
 if(!configured())return json({error:"Cloud learning is not configured / 云端学习尚未配置"},503);
 const verifier=randomBytes(32).toString("base64url");
 (await cookies()).set("school-verifier",verifier,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:600});
 const url=new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/authorize`);
 url.searchParams.set("provider","github");url.searchParams.set("redirect_to",new URL("/auth/callback",process.env.SITE_URL||request.url).href);
 url.searchParams.set("code_challenge",createHash("sha256").update(verifier).digest("base64url"));url.searchParams.set("code_challenge_method","s256");
 return NextResponse.redirect(url);
}
