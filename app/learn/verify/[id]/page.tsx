import {notFound} from "next/navigation";
import {publicProfile,uuid} from "@/lib/public-school";
import {supabase} from "@/lib/school-server";
import {PublicRecord} from "@/components/learn/public-record";
export const dynamic="force-dynamic";
export const metadata={title:"检查题记录验证 / FIELD SCHOOL",robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!uuid(id))notFound();
 const rows=await supabase(`/rest/v1/school_attestations?id=eq.${id}&select=id,user_id,lesson_key,issued_at,version`,undefined,{},true);
 if(!rows[0])notFound();const profile=await publicProfile(rows[0].user_id);if(!profile)notFound();
 return <PublicRecord name={profile.display_name} bio={profile.bio} records={[rows[0]]}/>;
}
