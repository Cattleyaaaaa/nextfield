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
    <TransitionLink href="/" className="text-sm text-accent">← NEXTFIELD</TransitionLink>
    <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_24rem] lg:items-center">
      <div><p className="font-mono text-xs tracking-widest text-accent">NEXTFIELD / ACCOUNT</p><h1 className="mt-6 max-w-3xl font-display text-[clamp(3.5rem,8vw,7rem)] leading-[0.9] tracking-tight">{zh ? "登录后，继续探索。" : "Sign in. Keep exploring."}</h1><p className="mt-8 max-w-xl text-lg leading-8 text-muted">{zh ? "课程可以直接阅读。使用 GitHub 登录后，你可以同步学习进度、参加结课考试，也可以在留言板留下想法。留言时可选择匿名展示。" : "You can read lessons without signing in. Use GitHub to sync progress, take final exams, and leave a note in the guestbook. You can choose to post anonymously."}</p></div>
      <section className="rounded-[2rem] border border-line bg-panel p-7 sm:p-9"><Github className="size-8 text-accent" aria-hidden="true"/><h2 className="mt-8 font-display text-3xl">{session?.user ? (zh ? "你已登录" : "You're signed in") : (zh ? "使用 GitHub 继续" : "Continue with GitHub")}</h2><p className="mt-4 text-sm leading-7 text-muted">{session?.user ? `GitHub · ${session.user.name}` : zh ? "使用现有 GitHub 账号即可参与学习和留言，无需为本站设置新密码。" : "Use your GitHub account to learn and leave messages. No separate password is needed."}</p>
        {session?.user ? <div className="mt-8 flex flex-wrap items-center gap-4"><TransitionLink href="/learn/dashboard" className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm text-paper">{zh ? "进入学习工作台" : "Open learning workspace"}<ArrowRight className="size-4"/></TransitionLink><TransitionLink href="/messages" className="inline-flex items-center gap-1 text-sm text-accent hover:underline">{zh ? "前往留言板" : "Open guestbook"}<ArrowRight className="size-4"/></TransitionLink></div> : session?.configured ? <a href="/api/school/login" className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm text-paper"><Github className="size-4"/>{zh ? "使用 GitHub 登录" : "Sign in with GitHub"}</a> : <button type="button" disabled className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm text-paper opacity-50"><Github className="size-4"/>{zh ? "使用 GitHub 登录" : "Sign in with GitHub"}</button>}
        {session?.configured === false && <p role="status" className="mt-4 text-sm leading-6 text-muted">{zh ? "站点尚未连接 Supabase，登录、进度同步、考试和留言暂不可用；课程仍可阅读。" : "Supabase is not connected yet, so sign-in, progress sync, exams, and messages are unavailable. Lessons remain open."}</p>}
        {error && <p role="alert" className="mt-4 text-sm text-red-600">{zh ? "登录或会话检查失败，请稍后重试。" : "Sign-in or session check failed. Please retry."}</p>}
      </section>
    </div>
  </main>;
}
