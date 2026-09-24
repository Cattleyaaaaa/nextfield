"use client";
import {useEffect,useState} from "react";
import {useLanguage} from "@/components/site/language-provider";
import {Github} from "lucide-react";
import {getSchoolSession, type SchoolSession} from "@/lib/school-client";
import {TransitionLink} from "@/components/site/transition-link";
export function SchoolAccount(){
 const {locale}=useLanguage();const zh=locale==="zh";
 const [session,setSession]=useState<SchoolSession>();const [error,setError]=useState(false);
 useEffect(()=>{getSchoolSession().then(setSession).catch(()=>setError(true));if(new URLSearchParams(location.search).has("auth"))setError(true);},[]);
 return <section className="my-8 rounded-2xl border border-line bg-panel p-5"><div className="flex flex-wrap items-center justify-between gap-4"><p>{session?.user ? `GitHub · ${session.user.name}` : zh?"登录以同步进度、参加考试并保存学习记录。":"Sign in to sync progress, take exams and save learning records."}</p>{session?.user ? <button type="button" className="rounded-full border border-line px-5 py-2 text-sm hover:border-accent" onClick={async()=>{try{const r=await fetch("/api/school/session",{method:"DELETE"});if(!r.ok)throw Error();location.reload();}catch{setError(true);}}}>{zh?"退出登录":"Sign out"}</button> : <TransitionLink href="/learn/login" className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-sm text-paper"><Github className="size-4" aria-hidden="true"/>{zh?"使用 GitHub 登录":"Sign in with GitHub"}</TransitionLink>}</div>{session?.configured===false&&<p role="status" className="mt-3 text-xs text-muted">{zh?"云端登录尚未配置；点此可查看当前状态。":"Cloud sign-in is not configured; open this entry for its status."}</p>}{error&&<p role="alert" className="mt-3 text-sm text-red-600">{zh?"登录或连接未完成，请重试。":"Sign-in or connection incomplete. Please retry."}</p>}</section>;
}
