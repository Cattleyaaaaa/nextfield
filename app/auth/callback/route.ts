import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {saveSession,supabase} from "@/lib/school-server";
export async function GET(request:Request){
 const cookieStore=await cookies();
 const url=new URL(request.url),code=url.searchParams.get("code"),verifier=cookieStore.get("school-verifier")?.value;
 cookieStore.delete("school-verifier");
 try{if(!code||!verifier)throw Error();await saveSession(await supabase("/auth/v1/token?grant_type=pkce",undefined,{method:"POST",body:JSON.stringify({auth_code:code,code_verifier:verifier})}));return NextResponse.redirect(new URL("/learn/dashboard",url));}
 catch{return NextResponse.redirect(new URL("/learn/dashboard?auth=failed",url));}
}
