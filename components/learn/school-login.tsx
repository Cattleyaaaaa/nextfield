"use client";

import { useEffect, useState } from "react";
import { Github, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/site/language-provider";
import { TransitionLink } from "@/components/site/transition-link";
import { getSchoolSession, type SchoolSession } from "@/lib/school-client";

export function SchoolLogin() {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const [session, setSession] = useState<SchoolSession>();
  const [error, setError] = useState(false);

  useEffect(() => {
    void getSchoolSession().then(setSession).catch(() => setError(true));
    if (new URLSearchParams(location.search).has("auth")) setError(true);
  }, []);

  return <main className="mx-auto max-w-site px-5 py-20 sm:px-8 lg:px-12">
    <TransitionLink href="/learn" className="text-sm text-accent">← FIELD SCHOOL</TransitionLink>
    <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_24rem] lg:items-center">
      <div><p className="font-mono text-xs tracking-widest text-accent">LEARN / ACCOUNT</p><h1 className="mt-6 max-w-3xl font-display text-[clamp(3.5rem,8vw,7rem)] leading-[0.9] tracking-tight">{zh ? "课程、考试、学习记录。" : "Lessons, exams, learning records."}</h1><p className="mt-8 max-w-xl text-lg leading-8 text-muted">{zh ? "课程可直接阅读。使用 GitHub 登录后，完成课程的进度会同步到你的账户，并可参加结课考试。" : "Lessons are open to everyone. Sign in with GitHub to sync course progress and take a final exam for each path."}</p></div>
      <section className="rounded-[2rem] border border-line bg-panel p-7 sm:p-9"><Github className="size-8 text-accent" aria-hidden="true"/><h2 className="mt-8 font-display text-3xl">{session?.user ? (zh ? "你已登录" : "You're signed in") : (zh ? "使用 GitHub 继续" : "Continue with GitHub")}</h2><p className="mt-4 text-sm leading-7 text-muted">{session?.user ? `GitHub · ${session.user.name}` : zh ? "本站只提供 GitHub 登录，不需要另设密码。" : "GitHub is the only sign-in option; no separate password is needed."}</p>
        {session?.user ? <TransitionLink href="/learn/dashboard" className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm text-paper">{zh ? "进入学习工作台" : "Open workspace"}<ArrowRight className="size-4"/></TransitionLink> : session?.configured ? <a href="/api/school/login" className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm text-paper"><Github className="size-4"/>{zh ? "使用 GitHub 登录" : "Sign in with GitHub"}</a> : <button type="button" disabled className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm text-paper opacity-50"><Github className="size-4"/>{zh ? "使用 GitHub 登录" : "Sign in with GitHub"}</button>}
        {session?.configured === false && <p role="status" className="mt-4 text-sm leading-6 text-muted">{zh ? "站点尚未连接 Supabase，登录与正式考试暂不可用；课程和本地代码练习可以继续使用。" : "The site is not connected to Supabase yet. Sign-in and graded exams are unavailable; lessons and local code practice still work."}</p>}
        {error && <p role="alert" className="mt-4 text-sm text-red-600">{zh ? "登录或会话检查失败，请稍后重试。" : "Sign-in or session check failed. Please retry."}</p>}
      </section>
    </div>
  </main>;
}
