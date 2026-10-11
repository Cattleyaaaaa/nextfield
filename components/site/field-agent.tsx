"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Bot, ChevronRight, FileText, Send, Sparkles, Trash2, X } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { usePageTransition } from "@/components/site/page-transition-provider";
import dynamic from "next/dynamic";
import { FieldAgentCore } from "./field-agent-core";
import { FieldAgentDiscovery } from "./field-agent-discovery";
const Particles = dynamic(() => import("@/components/visual/Particles"), { ssr: false });
const agentColors = ["#67e8f9", "#a78bfa", "#38bdf8"];
type Source = {
    id: number;
    title: string;
    href: string;
};
type Turn = {
    role: "user" | "assistant";
    content: string;
    sources?: Source[];
};
// Keep citation IDs in session history for server validation; hide them in the UI.
function answerText(content: string, streaming = false) {
    const text = content.replace(/\[\d+\]/g, "");
    // A citation may arrive across chunks; avoid flashing an unfinished "[2".
    return streaming ? text.replace(/\[\d*$/, "") : text;
}
export function useFieldAgentSession(active: boolean, locale: "zh" | "en") {
    const [turns, setTurns] = useState<Turn[]>([]);
    const [prompt, setPrompt] = useState("");
    const [busy, setBusy] = useState(false);
    const [streamedAnswer, setStreamedAnswer] = useState("");
    const [enabled, setEnabled] = useState<boolean | null>(null);
    const [remaining, setRemaining] = useState<number | null>(null);
    const [resetAt, setResetAt] = useState<number | null>(null);
    const [error, setError] = useState("");
    const controller = useRef<AbortController | null>(null);
    const locked = useRef(false);
    useEffect(() => () => controller.current?.abort(), []);
    useEffect(() => {
        if (!resetAt)
            return;
        const timeout = window.setTimeout(() => { setRemaining(null); setResetAt(null); }, Math.max(0, resetAt - Date.now()));
        return () => window.clearTimeout(timeout);
    }, [resetAt]);
    useEffect(() => {
        if (!active)
            return;
        const statusController = new AbortController();
        fetch("/api/field-agent", { cache: "no-store", signal: statusController.signal }).then(async (response) => {
            if (!response.ok)
                throw Error();
            const status = await response.json();
            setEnabled(Boolean(status.enabled));
        }).catch(() => { if (!statusController.signal.aborted) {
            setEnabled(false);
            setError(locale === "zh" ? "暂时无法连接，请稍后重新打开。" : "Could not connect. Please reopen later.");
        } });
        return () => statusController.abort();
    }, [active, locale]);
    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (locked.current || !prompt.trim() || !enabled || remaining === 0)
            return;
        const question = prompt.trim();
        locked.current = true;
        setBusy(true);
        setStreamedAnswer("");
        setError("");
        const requestController = new AbortController();
        controller.current = requestController;
        try {
            const response = await fetch("/api/field-agent", { method: "POST", headers: { "Content-Type": "application/json" }, signal: requestController.signal, body: JSON.stringify({ prompt: question, locale, history: turns.slice(-6).map(({ role, content }) => ({ role, content: content.slice(0, 4000) })) }) });
            const quota = (data: { remaining?: number; resetAt?: number }) => {
                if (typeof data.remaining === "number") setRemaining(data.remaining);
                if (typeof data.resetAt === "number") setResetAt(data.resetAt);
            };
            let answer: { text: string; sources?: Source[] } | null = null;
            if (!response.ok || !response.headers.get("content-type")?.includes("application/x-ndjson")) {
                const data = await response.json();
                quota(data);
                if (!response.ok) throw Error(data.error || "Field Agent 暂不可用。");
                answer = data;
            } else {
                const reader = response.body?.getReader();
                if (!reader) throw Error(locale === "zh" ? "无法读取回答，请重试。" : "Could not read the answer. Please retry.");
                const decoder = new TextDecoder();
                let buffer = "", text = "";
                try {
                    while (true) {
                        const { value, done } = await reader.read();
                        buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
                        if (done && buffer) buffer += "\n";
                        let newline: number;
                        while ((newline = buffer.indexOf("\n")) !== -1) {
                            const line = buffer.slice(0, newline).trim();
                            buffer = buffer.slice(newline + 1);
                            if (!line) continue;
                            const data = JSON.parse(line);
                            quota(data);
                            if (data.type === "error") throw Error(data.error);
                            if (data.type === "delta" && typeof data.text === "string") {
                                text += data.text;
                                setStreamedAnswer(text);
                            }
                            if (data.type === "done") answer = data;
                        }
                        if (done) break;
                    }
                } finally {
                    await reader.cancel().catch(() => {});
                    reader.releaseLock();
                }
            }
            if (!answer || typeof answer.text !== "string") throw Error(locale === "zh" ? "回答连接中断，请重试。" : "The answer was interrupted. Please retry.");
            const completed = answer;
            setTurns(previous => [...previous, { role: "user", content: question }, { role: "assistant", content: completed.text, sources: completed.sources }]);
            setPrompt("");
        }
        catch (cause) {
            if (!requestController.signal.aborted)
                setError(cause instanceof Error ? cause.message : locale === "zh" ? "连接失败，请重试。" : "Connection failed. Please retry.");
        }
        finally {
            locked.current = false;
            setStreamedAnswer("");
            setBusy(false);
        }
    };
    const clear = () => { if (!locked.current) {
        setTurns([]);
        setPrompt("");
        setError("");
    } };
    return { turns, prompt, setPrompt, busy, streamedAnswer, enabled, remaining, error, submit, clear };
}
export function FieldAgent({ session, locale, onClose, onNavigate }: {
  session: ReturnType<typeof useFieldAgentSession>;
  locale: "zh" | "en";
  onClose: () => void;
  onNavigate: (href: string) => void;
}) {
  const zh = locale === "zh";
  const log = useRef<HTMLDivElement | null>(null);
  const view = useRef<HTMLDivElement | null>(null);
  const animatedTurns = useRef(session.turns.length);
  const { motionEnabled } = usePageTransition();
  const empty = session.turns.length === 0 && !session.busy;

  useGSAP(() => {
    if (!motionEnabled) return;
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .fromTo("[data-agent-shell-enter]", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08, clearProps: "opacity,visibility,transform" }, 0.08);
  }, { scope: view, dependencies: [motionEnabled], revertOnUpdate: true });

  useGSAP(() => {
    if (!motionEnabled || !empty) return;
    gsap.timeline().fromTo("[data-agent-welcome-enter]", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.075, ease: "power3.out", clearProps: "opacity,visibility,transform" }, 0.16);
  }, { scope: view, dependencies: [empty, motionEnabled], revertOnUpdate: true });

  useGSAP(() => {
    const previous = animatedTurns.current;
    animatedTurns.current = session.turns.length;
    if (!motionEnabled || session.turns.length <= previous) return;
    const incoming = Array.from(view.current?.querySelectorAll("[data-agent-turn]") ?? []).slice(previous);
    if (incoming.length) gsap.fromTo(incoming, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.06, ease: "power2.out", clearProps: "opacity,visibility,transform" });
  }, { scope: view, dependencies: [session.turns.length, motionEnabled], revertOnUpdate: true });
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [session.turns, session.busy, session.streamedAnswer]);
  const questions = zh
    ? ["Neptune 项目是做什么的？", "这个网站的技术栈是什么？", "用简单的话解释什么是 Agent。"]
    : ["What is the Neptune project?", "What is this site's tech stack?", "Explain what an agent is in simple terms."];
  const canSend = !session.busy && session.enabled === true && session.remaining !== 0;
  return (
    <div ref={view} className="relative flex h-full min-h-0 w-full flex-col" style={{backgroundImage:"radial-gradient(ellipse at 90% 0%,rgba(34,211,238,0.10),transparent 45%),radial-gradient(ellipse at 0% 55%,rgba(99,102,241,0.07),transparent 50%)"}}>
      <div aria-hidden="true" className="field-agent-ambient"><span className="field-agent-glow field-agent-glow-cyan" /><span className="field-agent-glow field-agent-glow-indigo" /><div className="field-agent-particles"><Particles particleCount={85} particleColors={agentColors} particleBaseSize={4} speed={0.65} paused={!motionEnabled} pixelRatio={1} /></div><div className="field-agent-grid" /></div>
      <header data-agent-shell-enter className="relative flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="field-agent-mark relative grid size-10 place-items-center rounded-xl border border-cyan-300/40 bg-cyan-300/[0.12] text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.25)]"><Bot className="size-5" aria-hidden="true" /></span>
          <div><h2 id="field-agent-title" className="text-base font-semibold tracking-tight">Field Agent<span className="ml-2 font-mono text-[9px] tracking-[0.16em] text-cyan-300">AI</span></h2>
            <p className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400"><span className={`size-1.5 rounded-full ${session.enabled ? "bg-cyan-300 shadow-[0_0_8px_#67e8f9]" : "bg-slate-500"}`} />{session.enabled === null ? (zh ? "正在连接" : "Connecting") : session.enabled ? (zh ? "聊天与本站探索助手" : "Chat and site guide") : (zh ? "暂未开放" : "Currently unavailable")}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" aria-label={zh ? "新对话" : "New chat"} title={zh ? "新对话" : "New chat"} disabled={session.busy || !session.turns.length} onClick={session.clear} className="grid size-9 place-items-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-cyan-200 disabled:opacity-25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"><Trash2 className="size-4" /></button>
          <button type="button" data-agent-close aria-label={zh ? "关闭 Field Agent" : "Close Field Agent"} onClick={onClose} className="grid size-9 place-items-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"><X className="size-5" /></button>
        </div>
      </header>

      <div ref={log} className={`relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 py-6 sm:px-6 ${empty ? "justify-center" : ""}`} role="log" aria-label={zh ? "Field Agent 对话" : "Field Agent conversation"} aria-live="polite" aria-relevant="additions">
      <section className="field-agent-discovery-dock relative z-10 shrink-0 border-b border-cyan-300/10 bg-[#0b1627] px-5 py-2 sm:px-6" data-state={empty ? "welcome" : "conversation"} aria-label={zh ? "全息内容信号矩阵" : "Holographic content signals"}>
        <FieldAgentDiscovery animated={motionEnabled} locale={locale} canAsk={canSend} onNavigate={onNavigate} onAsk={question => { session.setPrompt(question); document.getElementById("field-agent-prompt")?.focus({ preventScroll: true }); }} />
      </section>

        {!session.turns.length && !session.busy ? (
          <div className="flex flex-col justify-center pb-3">
            <div data-agent-welcome-enter className="field-agent-hero relative mb-6 text-center">
              <span className="field-agent-console-label relative inline-flex items-center gap-2 font-mono text-[9px] tracking-[0.22em] text-cyan-200"><span className="size-1.5 rounded-full bg-cyan-300" /> NEXTFIELD / KNOWLEDGE CONSOLE</span>
              <h3 className="relative text-[clamp(1.65rem,5vw,2rem)] font-medium leading-[1.3] tracking-[-0.04em]">{zh ? "你好，我是" : "Hello, I'm"}<span className="ml-2 bg-gradient-to-r from-cyan-200 via-sky-300 to-violet-300 bg-clip-text text-transparent">Field Agent</span></h3>
              <p className="relative mx-auto mt-3 max-w-xs text-xs leading-6 text-slate-400">{zh ? "可以聊日常问题，也能探索本站项目与文章。关于本站的回答会附上资料来源。" : "Ask everyday questions or explore this site's projects and writing. Site answers include sources."}</p>
            </div>
            <p data-agent-welcome-enter className="mb-3 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">{zh ? "从这里开始 / START HERE" : "START HERE"}</p>
            <div data-agent-welcome-enter className="space-y-2">
              {questions.map((question,index) => <button key={question} type="button" disabled={!canSend} onClick={() => {session.setPrompt(question); document.getElementById("field-agent-prompt")?.focus();}} className="field-agent-suggestion group flex w-full items-center gap-3 rounded-xl border border-cyan-300/20 bg-[#101c30]/85 px-4 py-3 text-left transition hover:border-cyan-300/60 hover:bg-cyan-300/[0.12] disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"><span className="field-agent-card-number grid size-8 shrink-0 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 font-mono text-[11px] text-cyan-200">0{index+1}</span><span className="flex-1"><span className="mb-0.5 block text-[10px] font-medium text-violet-300">{(zh ? ["项目探索", "站内架构", "日常问答"] : ["PROJECTS", "SITE ARCHITECTURE", "EVERYDAY QUESTIONS"])[index]}</span><span className="block text-xs leading-5 text-slate-200 group-hover:text-white">{question}</span></span><ChevronRight className="size-4 text-cyan-300/60 group-hover:text-cyan-200" /></button>)}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {session.turns.map((turn,index) => turn.role === "user" ? <article data-agent-turn key={index} className="ml-8 rounded-2xl rounded-tr-md border border-cyan-300/10 bg-cyan-300/[0.075] px-4 py-3"><p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-100">{turn.content}</p></article> : <article data-agent-turn key={index}><p className="mb-3 flex items-center gap-2 font-mono text-[9px] tracking-[0.15em] text-cyan-300"><Sparkles className="size-3" /> FIELD AGENT</p><p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">{answerText(turn.content)}</p>{Boolean(turn.sources?.length) && <div className="mt-4 space-y-2">{turn.sources?.map(source => <button key={source.id} type="button" onClick={() => onNavigate(source.href)} className="field-agent-source group flex w-full items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 text-left text-[11px] text-slate-400 transition hover:border-cyan-300/30 hover:text-cyan-200"><FileText className="size-3.5 shrink-0 text-cyan-300/60" /><span className="min-w-0 flex-1 break-words">{source.title}</span><ArrowUpRight className="size-3.5 shrink-0" /></button>)}</div>}</article>)}
            {session.busy && <><article className="ml-8 rounded-2xl rounded-tr-md border border-cyan-300/10 bg-cyan-300/[0.075] px-4 py-3"><p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-100">{session.prompt}</p></article>{session.streamedAnswer && <article aria-busy="true"><p className="mb-3 flex items-center gap-2 font-mono text-[9px] tracking-[0.15em] text-cyan-300"><Sparkles className="size-3" /> FIELD AGENT</p><p className="field-agent-streaming whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">{answerText(session.streamedAnswer, true)}<span aria-hidden="true" className="field-agent-stream-cursor" /></p></article>}<div role="status" className="flex items-center gap-1 text-xs text-cyan-200/75"><FieldAgentCore animated={motionEnabled} active={session.busy} compact /><p>{session.streamedAnswer ? (zh ? "正在生成回答…" : "Writing the answer…") : (zh ? "正在准备回答…" : "Preparing the answer…")}</p></div></>}
          </div>
        )}
      </div>

      <footer data-agent-shell-enter className="relative shrink-0 border-t border-white/[0.07] bg-[#0a111e]/95 px-5 pt-4 sm:px-6" style={{paddingBottom:"max(1rem,env(safe-area-inset-bottom))"}}>
        {session.enabled === false && <p role="status" className="mb-3 text-xs leading-5 text-amber-200/80">{zh ? "助手暂未开放，你仍可浏览项目和文章。" : "The assistant is unavailable. Projects and articles remain open."}</p>}
        {session.error && <p role="alert" className="mb-3 max-h-20 overflow-y-auto text-xs leading-5 text-rose-300">{session.error}</p>}
        <form data-busy={session.busy} onSubmit={session.submit} className="field-agent-composer relative overflow-hidden rounded-2xl border border-cyan-300/40 bg-[#101c30] p-3 shadow-[0_0_24px_rgba(34,211,238,0.12)] transition focus-within:border-cyan-300/80 focus-within:shadow-[0_0_25px_rgba(34,211,238,0.22)]">
          <label htmlFor="field-agent-prompt" className="sr-only">{zh ? "你的问题" : "Your question"}</label>
          <textarea id="field-agent-prompt" value={session.prompt} onChange={event => session.setPrompt(event.target.value)} onKeyDown={event => {
            if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
            event.preventDefault();
            if (canSend && session.prompt.trim()) event.currentTarget.form?.requestSubmit();
          }} maxLength={1500} rows={2} disabled={!canSend} placeholder={zh ? "有什么想了解的？" : "What would you like to know?"} className="block max-h-32 w-full resize-none bg-transparent text-base leading-6 text-slate-100 outline-none placeholder:text-slate-500 disabled:opacity-50 sm:text-sm" />
          <div className="mt-2 flex items-center justify-between gap-3"><span className="text-[10px] text-slate-500">{session.remaining === null ? (zh ? "每日 15 次 · 日常与本站问答" : "15 questions daily · Chat and site answers") : (zh ? `今日剩余 ${session.remaining} 次` : `${session.remaining} remaining today`)} · {zh ? "回车发送 / Shift+回车换行" : "Enter to send / Shift+Enter for a new line"}</span><button type="submit" aria-label={zh ? "发送问题" : "Send question"} disabled={!canSend || !session.prompt.trim()} className="field-agent-send grid size-8 shrink-0 place-items-center rounded-xl bg-cyan-200 text-[#09111c] shadow-[0_0_16px_rgba(103,232,249,0.2)] transition hover:bg-cyan-100 disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"><Send className="size-3.5" /></button></div>
        </form>
        <details className="mt-3 text-[10px] text-slate-500"><summary className="w-fit cursor-pointer transition hover:text-slate-300">{zh ? "关于回答、数据与额度" : "About answers, data and limits"}</summary><p className="mt-2 max-h-24 overflow-y-auto leading-5">{zh ? "本站问题会附来源；一般问题由模型回答，可能出错。问题、近期对话及相关站内资料会发送至 DeepSeek，请勿输入密钥或敏感信息。每 IP 每日 15 次、全站每日 300 次；失败请求也计入额度，共用网络可能共用额度。北京时间 00:00 重置。" : "Site answers include sources; general answers come from the model and may be wrong. Your question, recent conversation and relevant site excerpts are sent to DeepSeek. Avoid secrets or sensitive information. Limits: 15 per IP and 300 site-wide daily, including failures. Shared networks share a quota. Reset: 00:00 UTC+8."}</p></details>
      </footer>
    </div>
  );
}
