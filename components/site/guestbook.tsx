"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, EyeOff, Github, Heart, MessageCircle, MessageSquare, Send, Trash2, UserRound } from "lucide-react";
import { TransitionLink } from "@/components/site/transition-link";
import { TiltSurface } from "@/components/motion/tilt-surface";
import { VisitorTrace } from "@/components/site/visitor-trace";
import { useLanguage } from "@/components/site/language-provider";
import { getSchoolSession, type SchoolSession } from "@/lib/school-client";

type Reply = { id: string; message_id: string; author_name: string; is_anonymous: boolean; content: string; created_at: string; canDelete: boolean };
type Message = { id: string; author_name: string; is_anonymous: boolean; content: string; created_at: string; likeCount: number; likedByMe: boolean; canDelete: boolean; replies: Reply[] };

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
  const [updatingMessageId, setUpdatingMessageId] = useState<string | null>(null);
  const [repliesEnabled, setRepliesEnabled] = useState(false);
  const [replyDraftFor, setReplyDraftFor] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyAnonymous, setReplyAnonymous] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/guestbook", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || (zh ? "暂时无法读取留言" : "Could not load messages"));
      setMessages(data.messages || []);
      setRepliesEnabled(data.repliesEnabled === true);
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

  async function toggleLike(message: Message) {
    if (!session?.user || updatingMessageId) return;
    setUpdatingMessageId(message.id);
    setError("");
    try {
      const response = await fetch("/api/guestbook", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: message.id, action: message.likedByMe ? "unlike" : "like" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || (zh ? "点赞操作失败" : "Could not update like"));
      await loadMessages();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (zh ? "点赞操作失败" : "Could not update like"));
    } finally {
      setUpdatingMessageId(null);
    }
  }

  async function deleteMessage(message: Message) {
    if (!message.canDelete || updatingMessageId) return;
    const confirmed = window.confirm(zh ? "确定删除这条留言吗？此操作无法撤销。" : "Delete this message? This cannot be undone.");
    if (!confirmed) return;
    setUpdatingMessageId(message.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/guestbook", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: message.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || (zh ? "删除留言失败" : "Could not delete message"));
      setNotice(zh ? "留言已删除。" : "Message deleted.");
      await loadMessages();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (zh ? "删除留言失败" : "Could not delete message"));
    } finally {
      setUpdatingMessageId(null);
    }
  }

  function openReplyComposer(messageId: string) {
    setReplyDraftFor((current) => current === messageId ? null : messageId);
    setReplyContent("");
    setReplyAnonymous(false);
  }

  async function submitReply(event: FormEvent<HTMLFormElement>, messageId: string) {
    event.preventDefault();
    if (!session?.user || !repliesEnabled || !replyContent.trim() || sendingReply) return;
    setSendingReply(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/guestbook/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, content: replyContent, isAnonymous: replyAnonymous }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || (zh ? "评论未能发送" : "Could not post comment"));
      setReplyContent("");
      setReplyDraftFor(null);
      setNotice(zh ? "评论已发布。" : "Comment posted.");
      await loadMessages();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (zh ? "评论未能发送" : "Could not post comment"));
    } finally {
      setSendingReply(false);
    }
  }

  async function deleteReply(reply: Reply) {
    if (!reply.canDelete || deletingReplyId) return;
    const confirmed = window.confirm(zh ? "确定删除这条评论吗？此操作无法撤销。" : "Delete this comment? This cannot be undone.");
    if (!confirmed) return;
    setDeletingReplyId(reply.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/guestbook/replies", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reply.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || (zh ? "删除评论失败" : "Could not delete comment"));
      setNotice(zh ? "评论已删除。" : "Comment deleted.");
      await loadMessages();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (zh ? "删除评论失败" : "Could not delete comment"));
    } finally {
      setDeletingReplyId(null);
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
                {messages.map((message, index) => <li key={message.id} className="guestbook-entry" style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}>
                  <TiltSurface maxTilt={4} lift={4} perspective={1000} className="rounded-2xl border border-line bg-paper/70 p-4 transition-colors hover:border-accent/40 sm:p-5">
                    <article>
                      <div className="flex items-start gap-3.5">
                        <span data-tilt-depth="26" className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-accent/5 text-accent shadow-sm">{message.is_anonymous ? <EyeOff className="size-4" /> : <UserRound className="size-4" />}</span>
                        <div className="min-w-0 flex-1">
                          <div data-tilt-depth="10" className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                            <p className="text-sm font-medium">{message.is_anonymous ? (zh ? "匿名访客" : "Anonymous") : message.author_name}</p>
                            <time className="font-mono text-[10px] text-muted" dateTime={message.created_at}>{new Intl.DateTimeFormat(zh ? "zh-CN" : "en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(message.created_at))}</time>
                          </div>
                          <p data-tilt-depth="18" className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-ink/80">{message.content}</p>
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <span data-tilt-depth="8" className="font-mono text-[9px] tracking-wider text-muted/70">{zh ? "留言" : "NOTE"} / {String(messages.length - index).padStart(3, "0")}</span>
                            <div className="flex items-center gap-2">
                              {session?.user ? (
                                <button type="button" onClick={() => void toggleLike(message)} disabled={updatingMessageId === message.id} aria-pressed={message.likedByMe} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition disabled:opacity-50 ${message.likedByMe ? "border-rose-400/50 bg-rose-500/10 text-rose-600" : "border-line text-muted hover:border-rose-400/50 hover:text-rose-600"}`} aria-label={message.likedByMe ? (zh ? "取消点赞" : "Unlike") : (zh ? "点赞留言" : "Like message")}>
                                  <Heart className={`size-3.5 ${message.likedByMe ? "fill-current" : ""}`} />{message.likeCount}
                                </button>
                              ) : (
                                <TransitionLink href="/learn/login" className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-muted transition hover:border-rose-400/50 hover:text-rose-600" aria-label={zh ? "登录后点赞" : "Sign in to like"}>
                                  <Heart className="size-3.5" />{message.likeCount}
                                </TransitionLink>
                              )}
                              {message.canDelete && <button type="button" onClick={() => void deleteMessage(message)} disabled={updatingMessageId === message.id} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-muted transition hover:border-red-500/40 hover:text-red-600 disabled:opacity-50" aria-label={zh ? "删除留言" : "Delete message"}><Trash2 className="size-3.5" />{zh ? "删除" : "Delete"}</button>}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 border-t border-line/70 pt-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-muted"><MessageSquare className="size-3.5" />{zh ? "评论" : "Comments"} · {message.replies.length}</p>
                          {repliesEnabled && (session?.user ? (
                            <button type="button" onClick={() => openReplyComposer(message.id)} aria-expanded={replyDraftFor === message.id} className="rounded-full border border-line px-3 py-1.5 text-xs text-accent transition hover:border-accent">
                              {replyDraftFor === message.id ? (zh ? "收起" : "Close") : (zh ? "写评论" : "Add a comment")}
                            </button>
                          ) : (
                            <TransitionLink href="/learn/login" className="rounded-full border border-line px-3 py-1.5 text-xs text-accent transition hover:border-accent">{zh ? "登录后评论" : "Sign in to comment"}</TransitionLink>
                          ))}
                        </div>
                        {repliesEnabled ? (
                          <>
                            {message.replies.length > 0 && <ol className="mt-3 space-y-2">
                              {message.replies.map((reply) => <li key={reply.id} className="rounded-xl border border-line/70 bg-panel/60 px-3.5 py-3 sm:px-4">
                                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                                  <span className="text-xs font-medium">{reply.is_anonymous ? (zh ? "匿名访客" : "Anonymous") : reply.author_name}</span>
                                  <time className="font-mono text-[10px] text-muted" dateTime={reply.created_at}>{new Intl.DateTimeFormat(zh ? "zh-CN" : "en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(reply.created_at))}</time>
                                </div>
                                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-ink/80">{reply.content}</p>
                                {reply.canDelete && <button type="button" onClick={() => void deleteReply(reply)} disabled={deletingReplyId === reply.id} className="mt-2 inline-flex items-center gap-1 text-xs text-muted transition hover:text-red-600 disabled:opacity-50" aria-label={zh ? "删除评论" : "Delete comment"}><Trash2 className="size-3" />{zh ? "删除评论" : "Delete comment"}</button>}
                              </li>)}
                            </ol>}
                            {replyDraftFor === message.id && <form onSubmit={(event) => void submitReply(event, message.id)} className="mt-3 rounded-xl border border-accent/30 bg-accent/5 p-3">
                              <label htmlFor={`reply-${message.id}`} className="sr-only">{zh ? "评论内容" : "Comment"}</label>
                              <textarea id={`reply-${message.id}`} value={replyContent} onChange={(event) => setReplyContent(event.target.value)} maxLength={500} rows={3} placeholder={zh ? "回复这条留言…" : "Reply to this message…"} className="w-full resize-y rounded-lg border border-line bg-paper px-3 py-2 text-sm leading-6 outline-none placeholder:text-muted/70 focus:border-accent" />
                              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                                <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-muted"><input type="checkbox" checked={replyAnonymous} onChange={(event) => setReplyAnonymous(event.target.checked)} className="size-4 accent-[var(--accent)]" />{zh ? "匿名评论" : "Comment anonymously"}</label>
                                <div className="flex items-center gap-3"><span className="font-mono text-[10px] text-muted">{replyContent.length}/500</span><button type="submit" disabled={sendingReply || !replyContent.trim()} className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-xs text-paper transition hover:bg-accent disabled:opacity-50"><Send className="size-3" />{sendingReply ? (zh ? "发送中…" : "Posting…") : (zh ? "发布评论" : "Post comment")}</button></div>
                              </div>
                            </form>}
                          </>
                        ) : <p className="mt-2 text-xs text-muted">{zh ? "评论暂不可用。" : "Comments are temporarily unavailable."}</p>}
                      </div>
                    </article>
                  </TiltSurface>
                </li>)}
              </ol>
            )}
          </section>
        </div>
        <VisitorTrace />
      </section>
    </main>
  );
}
