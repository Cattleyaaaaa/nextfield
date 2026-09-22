import {authenticate,failure,guardOrigin,json,readBody,SchoolError,supabase} from "@/lib/school-server";
import {LEARNING_TRACKS,lessonKey} from "@/lib/learn-data";
export const maxDuration=60;
export async function POST(request:Request){
 try{
 guardOrigin(request);const {user}=await authenticate();
 if(process.env.FIELD_AI_ENABLED!=="true"||!process.env.OPENAI_API_KEY||!process.env.OPENAI_MODEL)throw new SchoolError(503,"AI is not enabled / AI 服务尚未开启");
 const b=await readBody(request);
 if(typeof b.prompt!=="string"||!b.prompt.trim()||b.prompt.length>3000||!["playground","tutor"].includes(b.mode))throw new SchoolError(400,"Invalid prompt / 提问内容无效");
 const item=LEARNING_TRACKS.flatMap(t=>t.lessons.map(l=>({key:lessonKey(t.slug,l.slug),track:t.slug,lesson:l}))).find(l=>l.key===b.lesson);
 if(!item)throw new SchoolError(400,"Choose a lesson / 请选择课程");
 const allowed=await supabase("/rest/v1/rpc/school_reserve_ai",undefined,{method:"POST",body:JSON.stringify({p_user:user.id})},true);
 if(allowed!==true)throw new SchoolError(429,"Daily limit reached / 今日额度已用完");
 const started=Date.now();const locale=b.locale==="en"?"en":"zh";
 const context=[item.lesson.title[locale],...item.lesson.concept.map(c=>c[locale])].join("\n");
 const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",signal:AbortSignal.timeout(45000),headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.OPENAI_MODEL,store:false,max_output_tokens:1000,instructions:`Reply in ${locale==="zh"?"Chinese":"English"}. You are a course learning assistant, not the website owner's digital twin. Never claim to execute code or access accounts. ${b.mode==="tutor"?"Use the provided lesson as your source. Give hints before solutions; clearly label anything beyond the lesson.":"Explain the prompt's behavior and limitations."}\nLesson context:\n${context}`,input:b.prompt})});
 if(!response.ok)throw new SchoolError(502,"Model request failed / 模型请求失败");
 const data=await response.json();const output=(data.output||[]).flatMap((o:{content?:{type:string;text?:string}[]})=>o.content||[]).filter((c:{type:string})=>c.type==="output_text").map((c:{text:string})=>c.text).join("\n");
 if(!output)throw new SchoolError(502,"No text returned / 模型未返回文本");
 return json({text:output,latency:Date.now()-started,tokens:data.usage?.total_tokens,source:`/learn/${item.track}/${item.lesson.slug}`});
 }catch(e){return failure(e);}
}
