import {authenticate,failure,guardOrigin,json,readBody,SchoolError,supabase} from "@/lib/school-server";
import {LEARNING_TRACKS,lessonKey} from "@/lib/learn-data";
export const dynamic="force-dynamic";
const keys=LEARNING_TRACKS.flatMap(t=>t.lessons.map(l=>lessonKey(t.slug,l.slug)));
export async function GET(){
 try{const {user,token}=await authenticate();const query=`?user_id=eq.${user.id}&select=*`;
 const [progress,submissions,profiles,attestations]=await Promise.all(["school_progress","school_submissions","school_profiles","school_attestations"].map(t=>supabase("/rest/v1/"+t+query,token)));
 return json({userId:user.id,progress:progress.map((r:{lesson_key:string})=>r.lesson_key),submissions,profile:profiles[0]||null,attestations});
 }catch(e){return failure(e);}
}
export async function POST(request:Request){
 try{
 guardOrigin(request);const {user,token}=await authenticate();const b=await readBody(request);
 let table="",body:unknown;
 if(b.kind==="progress"){
  if(!Array.isArray(b.keys)||b.keys.length>12||b.keys.some((k:unknown)=>typeof k!=="string"||!keys.includes(k)))throw new SchoolError(400,"Invalid lessons / 课程无效");
  table="school_progress";body=[...new Set(b.keys)].map(k=>({user_id:user.id,lesson_key:k}));
 }else if(b.kind==="submission"){
  if(!LEARNING_TRACKS.some(t=>t.slug===b.track)||typeof b.repository!=="string"||!/^https:\/\/github.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/.test(b.repository)||typeof b.reflection!=="string"||b.reflection.trim().length<50||b.reflection.length>6000)throw new SchoolError(400,"Use a GitHub repository and a 50–6000 character reflection / 请填写 GitHub 仓库与 50–6000 字复盘");
  table="school_submissions?on_conflict=user_id,track";body={user_id:user.id,track:b.track,repository:b.repository,reflection:b.reflection};
 }else if(b.kind==="profile"){
  if(typeof b.name!=="string"||!b.name.trim()||b.name.length>60||typeof b.bio!=="string"||b.bio.length>300||typeof b.isPublic!=="boolean")throw new SchoolError(400,"Invalid profile / 档案内容无效");
  table="school_profiles";body={user_id:user.id,display_name:b.name.trim(),bio:b.bio,is_public:b.isPublic};
 }else if(b.kind==="checkpoint"){
  const lesson=LEARNING_TRACKS.flatMap(t=>t.lessons.map(l=>({key:lessonKey(t.slug,l.slug),lesson:l}))).find(l=>l.key===b.key);
  if(!lesson||!Number.isInteger(b.answer)||!lesson.lesson.challenge.options[b.answer]?.correct)throw new SchoolError(400,"Checkpoint not passed / 检查题尚未通过");
  const result=await supabase("/rest/v1/school_attestations?on_conflict=user_id,lesson_key,version",undefined,{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=representation"},body:JSON.stringify({user_id:user.id,lesson_key:b.key,version:"checkpoint-v1"})},true);
  return json(result);
 }else throw new SchoolError(400,"Unknown action");
 await supabase("/rest/v1/"+table,token,{method:"POST",headers:{Prefer:"resolution=merge-duplicates"},body:JSON.stringify(body)});
 return json({ok:true});
 }catch(e){return failure(e);}
}
