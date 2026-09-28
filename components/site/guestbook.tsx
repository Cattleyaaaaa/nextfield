"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, EyeOff, Github, MessageCircle, Send, UserRound } from "lucide-react";
import { TransitionLink } from "@/components/site/transition-link";
import { TiltSurface } from "@/components/motion/tilt-surface";
import { VisitorTrace } from "@/components/site/visitor-trace";
import { useLanguage } from "@/components/site/language-provider";
import { getSchoolSession, type SchoolSession } from "@/lib/school-client";

type Message = { id: string; author_name: string; is_anonymous: boolean; content: string; created_at: string };

export function Guestbook() {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const [session, setSession] = useState<SchoolSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/guestbook", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || (zh ? "暂时无法读取留言" : "Could not load messages"));
      setMessages(data.messages || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (zh ? "暂时无法读取留言" : "Could not load messages"));
    } finally {
      setLoading(false);
    }
  }, [zh]);

  useEffect(() => {
    let active = true;
    getSchoolSession().then((value) => { if (active) setSession(value); }).catch(() => {
      if (active) setSession({ configured: false, user: null });
    });
    void loadMessages();
    return () => { active = false; };
  }, [loadMessages]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/guestbook", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, isAnonymous: anonymous }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || (zh ? "留言未能发送" : "Message could not be sent"));
      setContent("");
      setNotice(zh ? "留言已发布。" : "Your message is published.");
      await loadMessages();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (zh ? "留言未能发送" : "Message could not be sent"));
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-site px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
      <section className="mx-auto max-w-6xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">NEXTFIELD / {zh ? "留言板" : "GUESTBOOK"}</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
          <div>
            <h1 className="font-display text-5xl tracking-tight sm:text-7xl">{zh ? "留言板" : "Guestbook"}</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted">{zh ? "欢迎留下你的想法、问题，或只是打个招呼。" : "Leave a thought, a question, or simply say hello."}</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted"><MessageCircle className="size-3.5" /> {messages.length} {zh ? "条留言" : "messages"}</span>
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(280px,0.78fr)_minmax(0,1.22fr)] lg:gap-12">
          <aside className="lg:sticky lg:top-24">
            <TiltSurface maxTilt={3.5} lift={4} perspective={1100} className="overflow-hidden rounded-2xl border border-line bg-paper/75 shadow-[0_18px_50px_-40px_rgba(9,38,43,0.4)]">
              <div className="relative border-b border-line bg-accent/5 px-5 py-4 sm:px-6" data-tilt-depth="16">
                <span aria-hidden="true" className="pointer-events-none absolute -right-8 -top-12 size-32 rounded-full border border-accent/15" />
                <span aria-hidden="true" className="pointer-events-none absolute -right-1 -top-5 size-16 rounded-full border border-accent/20" />
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">01 / {zh ? "写下留言" : "LEAVE A NOTE"}</p>
                <h2 className="mt-2 text-lg font-medium" data-tilt-depth="22">{zh ? "说点什么吧" : "Say something"}</h2>
              </div>
              <div className="p-5 sm:p-6" data-tilt-depth="8">
                {session?.user ? (
                  <form onSubmit={submit}>
                    <p className="mb-3 text-xs text-muted">{zh ? `当前账号：${session.user.name}` : `Signed in as ${session.user.name}`}</p>
                    <label htmlFor="guestbook-message" className="sr-only">{zh ? "留言内容" : "Message"}</label>
                    <textarea id="guestbook-message" value={content} onChange={(event) => setContent(event.target.value)} maxLength={500} rows={7} placeholder={zh ? "写点什么…（最多 500 字）" : "Write something… (500 characters max)"} className="w-full resize-y rounded-xl border border-line bg-paper px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-muted/70 focus:border-accent" />
                    <div className="mt-3 rounded-xl border border-line px-3.5 py-3">
                      <label className="flex cursor-pointer items-start gap-3">
                        <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} className="mt-0.5 size-4 accent-[var(--accent)]" />
                        <span>
                          <span className="flex items-center gap-2 text-xs font-medium"><EyeOff className="size-3.5 text-accent" />{zh ? "匿名留言" : "Post anonymously"}</span>
                          <span className="mt-1 block text-[11px] leading-5 text-muted">{zh ? "公开页面不会显示你的昵称或账号 ID；登录仍用于限制滥用。" : "Your name and account ID won’t be shown publicly. Sign-in is still used to prevent abuse."}</span>
                        </span>
                      </label>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="font-mono text-[10px] text-muted">{content.length}/500</span>
                      <button type="submit" disabled={sending || !content.trim()} className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-xs font-medium text-paper transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"><Send className="size-3.5" />{sending ? (zh ? "发送中…" : "Sending…") : (zh ? "发布留言" : "Post message")}</button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <p className="text-sm leading-6 text-muted">{zh ? "登录后可以留言，也可以选择匿名发布。所有访客都能阅读留言。" : "Sign in to post, with an option to remain anonymous. Everyone can read messages."}</p>
                    <TransitionLink href="/learn/login" className="mt-5 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-xs transition hover:border-accent hover:text-accent"><Github className="size-3.5" />{zh ? "GitHub 登录" : "Sign in with GitHub"}<ArrowUpRight className="size-3" /></TransitionLink>
                  </div>
                )}
              </div>
            </TiltSurface>
            <p className="mt-3 px-1 text-[11px] leading-5 text-muted">{zh ? "请保持友善，不要发布密码、联系方式等敏感内容。" : "Be kind, and don’t post passwords or other sensitive information."}</p>
          </aside>

          <section aria-labelledby="guestbook-feed-title">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">02 / {zh ? "留言墙" : "THE WALL"}</p>
                <h2 id="guestbook-feed-title" className="mt-1 text-lg font-medium">{zh ? "最近留言" : "Recent notes"}</h2>
              </div>
              <span className="font-mono text-[10px] text-muted">{zh ? "最新在前" : "NEWEST FIRST"}</span>
            </div>
            {notice && <p role="status" className="mt-4 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent">{notice}</p>}
            {error && <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
            {loading ? <p className="py-12 text-sm text-muted">{zh ? "正在读取…" : "Loading…"}</p> : messages.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-line px-6 py-16 text-center"><MessageCircle className="mx-auto size-6 text-accent/60" /><p className="mt-4 text-sm text-muted">{zh ? "这里还很安静，来写下第一条留言吧。" : "It’s quiet here. Leave the first note."}</p></div>
            ) : (
              <ol className="mt-4 space-y-3">
                {messages.map((message, index) => <li key={message.id} className="guestbook-entry" style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}><TiltSurface maxTilt={4} lift={4} perspective={1000} className="rounded-2xl border border-line bg-paper/70 p-4 transition-colors hover:border-accent/40 sm:p-5"><article><div className="flex items-start gap-3.5"><span data-tilt-depth="26" className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-accent/5 text-accent shadow-sm">{message.is_anonymous ? <EyeOff className="size-4" /> : <UserRound className="size-4" />}</span><div className="min-w-0 flex-1"><div data-tilt-depth="10" className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1"><p className="text-sm font-medium">{message.is_anonymous ? (zh ? "匿名访客" : "Anonymous") : message.author_name}</p><time className="font-mono text-[10px] text-muted" dateTime={message.created_at}>{new Intl.DateTimeFormat(zh ? "zh-CN" : "en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(message.created_at))}</time></div><p data-tilt-depth="18" className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-ink/80">{message.content}</p><span data-tilt-depth="8" className="mt-3 block font-mono text-[9px] tracking-wider text-muted/70">{zh ? "留言" : "NOTE"} / {String(messages.length - index).padStart(3, "0")}</span></div></div></article></TiltSurface></li>)}
              </ol>
            )}
          </section>
        </div>
        <VisitorTrace />
      </section>
    </main>
  );
}
