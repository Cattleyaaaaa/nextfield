import {cookies} from "next/headers";
import {authenticate,configured,failure,guardOrigin,json,SchoolError,supabase} from "@/lib/school-server";
export const dynamic="force-dynamic";
export async function GET(){
 if(!configured())return json({configured:false,user:null});
 try{const {user}=await authenticate();return json({configured:true,user:{id:user.id,name:user.user_metadata?.user_name||"Learner"}});}
 catch(e){return e instanceof SchoolError && e.status===401 ? json({configured:true,user:null}) : failure(e);}
}
export async function DELETE(request:Request){
 try{guardOrigin(request);const token=cookies().get("school-access")?.value;
 if(token){try{await supabase("/auth/v1/logout?scope=local",token,{method:"POST"});}catch{/* Clear local credentials even if the provider is unavailable. */}}
 cookies().delete("school-access");cookies().delete("school-refresh");return json({ok:true});
 }catch(e){return failure(e);}
}
