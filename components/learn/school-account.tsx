"use client";
import {useEffect,useState} from "react";
import {useLanguage} from "@/components/site/language-provider";
export function SchoolAccount(){
 const {locale}=useLanguage();const zh=locale==="zh";
 const [session,setSession]=useState<{configured:boolean;user:null|{id:string;name:string}}>();const [error,setError]=useState(false);
 useEffect(()=>{fetch("/api/school/session").then(r=>r.json()).then(setSession).catch(()=>setError(true));if(new URLSearchParams(location.search).has("auth"))setError(true);},[]);
 return <section className="my-8 rounded-2xl border border-line bg-panel p-5"><div className="flex flex-wrap items-center justify-between gap-4"><p>{session?.user ? `GitHub · ${session.user.name}` : zh?"登录以同步进度、提交项目和使用课程导师。":"Sign in to sync progress, submit projects and use the tutor."}</p>{session?.user ? <button onClick={async()=>{try{const r=await fetch("/api/school/session",{method:"DELETE"});if(!r.ok)throw Error();location.reload();}catch{setError(true);}}}>{zh?"退出登录":"Sign out"}</button> : session?.configured ? <a href="/api/school/login" className="rounded-full bg-ink px-5 py-2 text-paper">{zh?"使用 GitHub 登录":"Sign in with GitHub"}</a>:<span className="text-sm text-muted">{zh?"云端学习暂未开放":"Cloud learning not available"}</span>}</div>{error&&<p role="alert">{zh?"登录或连接未完成，请重试。":"Sign-in or connection incomplete. Please retry."}</p>}</section>;
}
