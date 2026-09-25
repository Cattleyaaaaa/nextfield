import {notFound} from "next/navigation";
import {publicProfile} from "@/lib/public-school";
import {supabase} from "@/lib/school-server";
import {PublicRecord} from "@/components/learn/public-record";
export const dynamic="force-dynamic";
export const metadata={title:"学习档案 / FIELD SCHOOL",robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const profile=await publicProfile(id);if(!profile)notFound();
 const records=await supabase(`/rest/v1/school_attestations?user_id=eq.${id}&select=id,lesson_key,issued_at,version&order=issued_at.desc`,undefined,{},true);
 return <PublicRecord name={profile.display_name} bio={profile.bio} records={records}/>;
}
