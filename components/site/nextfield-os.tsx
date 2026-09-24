"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Bot, Clock3, Command, ExternalLink, Radio, Search, Sparkles, X } from "lucide-react";
import { usePageTransition } from "@/components/site/page-transition-provider";
import { useMotionPreference } from "@/lib/use-motion-preference";
import { useLanguage } from "@/components/site/language-provider";

type Panel = "command" | "brief" | "agent" | null;

const CORE_COMMANDS = [
  { label: "Open selected work", hint: "项目", href: "/projects" },
  { label: "Enter open experiments", hint: "实验室", href: "/gallery" },
  { label: "Read field notes", hint: "写作", href: "/blog" },
  { label: "Open Live Studio", hint: "实时状态", href: "/live-studio" },
  { label: "Visit Failure Museum", hint: "失败博物馆", href: "/failures" },
  { label: "Read the colophon", hint: "制作说明", href: "/colophon" },
  { label: "Go somewhere unexpected", hint: "隐藏层", href: "/after-hours" },
] as const;

// 命令面板只保留核心导航入口。13-25 号系统入口不在这里重复出现（它们属于 /systems 的编号体系）。
const COMMANDS = [...CORE_COMMANDS];

const BRIEF = [
  { eyebrow: "00 / Identity", title: "NEXTFIELD", body: "一个持续生长的项目、笔记与实验索引。关注 Agent 产品、界面状态与现代全栈实现。" },
  { eyebrow: "01 / Focus", title: "Agent-native interfaces", body: "把工具调用、长任务、确认、错误和恢复设计成用户能够理解并控制的产品体验。" },
  { eyebrow: "02 / Work", title: "From system to surface", body: "覆盖 Agent 架构、语义检索、运行观测、前端交互与生产交付，而不是只完成一层演示界面。" },
  { eyebrow: "03 / Method", title: "Build, observe, refine", body: "通过小型实验验证交互，用 Build Log 记录变化，用 Failure Museum 保留错误判断。" },
  { eyebrow: "04 / Contact", title: "Open to useful problems", body: "适合讨论 Agent 产品、AI 应用、界面系统或需要从原型走向完整交付的合作。" },
] as const;

export function NextfieldOS() {
  const { locale } = useLanguage();
  const [panel, setPanel] = useState<Panel>(null);
  const [query, setQuery] = useState("");
  const [slide, setSlide] = useState(0);
  const [seconds, setSeconds] = useState(90);
  const { navigate } = usePageTransition();
  const reducedMotion = useMotionPreference();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setPanel("command"); }
      if (event.key === "Escape") setPanel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = panel ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [panel]);

  useEffect(() => {
    if (panel !== "brief") return;
    setSeconds(90);
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [panel]);

  const visible = useMemo(() => COMMANDS.filter((item) => `${item.label} ${item.hint}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const go = (href: string) => {
    setPanel(null);
    if (href.endsWith(".json") || href.endsWith(".pdf")) {
      window.location.assign(href);
      return;
    }
    navigate(href);
  };
  const submit = (event: FormEvent) => { event.preventDefault(); if (visible[0]) go(visible[0].href); };

  return (
    <>
      <button className="fixed bottom-4 left-4 z-[68] flex items-center gap-2 rounded-full border border-line bg-paper/90 px-3 py-2.5 text-ink shadow-[0_14px_45px_rgb(var(--liquid-deep)/0.14)] backdrop-blur-xl hover:border-accent sm:bottom-6 sm:left-6" onClick={() => setPanel("command")} type="button"><span className="grid size-7 place-items-center rounded-full bg-accent font-mono text-[9px] font-bold text-white">NF</span><span className="hidden text-xs sm:inline">Command Field</span><kbd className="hidden rounded border border-line px-1.5 py-0.5 font-mono text-[9px] text-muted md:inline">⌘K</kbd></button>
      <AnimatePresence>
        {panel ? <motion.div animate={{ opacity: 1 }} className="fixed inset-0 z-[100] grid place-items-center bg-ink/70 p-3 backdrop-blur-xl sm:p-6" exit={{ opacity: 0 }} initial={reducedMotion ? false : { opacity: 0 }} role="presentation">
          <motion.section aria-label="NEXTFIELD OS" aria-modal="true" className="relative max-h-[min(46rem,calc(100svh-2rem))] w-full max-w-3xl overflow-auto rounded-[2rem] border border-paper/15 bg-paper text-ink shadow-2xl" initial={reducedMotion ? false : { y: 24, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 18, scale: 0.98 }} role="dialog">
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper/90 px-5 py-4 backdrop-blur"><div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-ink font-mono text-[10px] text-paper">NF</span><div><p className="text-sm font-semibold">NEXTFIELD OS</p><p className="font-mono text-[9px] tracking-[0.15em] text-muted">LOCAL INTERFACE / 0.3</p></div></div><button aria-label="关闭" className="rounded-full p-2 hover:bg-panel" onClick={() => setPanel(null)} type="button"><X className="size-4" /></button></header>
            {panel === "command" ? <div className="p-5 sm:p-7">
              <form className="flex items-center gap-3 rounded-2xl border border-line bg-panel px-4" onSubmit={submit}><Search className="size-4 text-muted" /><input autoFocus className="h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" onChange={(event) => setQuery(event.target.value)} placeholder="输入命令或页面名称…" value={query} /><Command className="size-4 text-muted" /></form>
              <div className="mt-4 grid gap-2">{visible.map((item) => <button className="group flex items-center justify-between rounded-xl px-4 py-3 text-left hover:bg-panel" key={item.href} onClick={() => go(item.href)} type="button"><span><span className="block text-sm">{item.label}</span><span className="mt-1 block text-[10px] text-muted">{item.hint}</span></span><ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent" /></button>)}</div>
              <div className="mt-6 grid gap-2 border-t border-line pt-5 sm:grid-cols-3"><button className="rounded-xl border border-line p-4 text-left hover:border-accent" onClick={() => { setSlide(0); setPanel("brief"); }} type="button"><Clock3 className="size-4 text-accent" /><span className="mt-5 block text-sm">90 秒了解我</span></button><button className="rounded-xl border border-line p-4 text-left hover:border-accent" onClick={() => setPanel("agent")} type="button"><Bot className="size-4 text-accent" /><span className="mt-5 block text-sm">Field Agent</span></button><button className="rounded-xl border border-line p-4 text-left hover:border-accent" onClick={() => { setPanel(null); window.dispatchEvent(new Event("field-radio:open")); }} type="button"><Radio className="size-4 text-accent" /><span className="mt-5 block text-sm">打开 Field Radio</span></button></div>
            </div> : null}
            {panel === "brief" ? <div className="p-6 sm:p-10"><div className="flex items-center justify-between"><button className="inline-flex items-center gap-2 text-xs text-muted hover:text-accent" onClick={() => setPanel("command")} type="button"><ArrowLeft className="size-3" /> COMMAND FIELD</button><span className="font-mono text-[10px] text-accent">{seconds}s / {String(slide + 1).padStart(2, "0")}</span></div><div className="mt-16 min-h-[19rem]"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">{BRIEF[slide].eyebrow}</p><h2 className="mt-6 max-w-2xl font-display text-[clamp(3rem,8vw,5.5rem)] leading-[0.88] tracking-[-0.06em]">{BRIEF[slide].title}</h2><p className="mt-8 max-w-xl text-base leading-8 text-muted">{BRIEF[slide].body}</p></div><div className="flex items-center gap-4"><div className="h-px flex-1 bg-line"><span className="block h-full bg-accent transition-[width]" style={{ width: `${((slide + 1) / BRIEF.length) * 100}%` }} /></div><button aria-label="上一页" className="grid size-10 place-items-center rounded-full border border-line disabled:opacity-30" disabled={slide === 0} onClick={() => setSlide((value) => value - 1)} type="button"><ArrowLeft className="size-4" /></button><button aria-label={slide === BRIEF.length - 1 ? "打开联系方式" : "下一页"} className="grid size-10 place-items-center rounded-full bg-ink text-paper" onClick={() => slide === BRIEF.length - 1 ? go("/about") : setSlide((value) => value + 1)} type="button">{slide === BRIEF.length - 1 ? <ExternalLink className="size-4" /> : <ArrowRight className="size-4" />}</button></div></div> : null}
            {panel === "agent" ? <div className="p-7 sm:p-10"><button className="inline-flex items-center gap-2 text-xs text-muted hover:text-accent" onClick={() => setPanel("command")} type="button"><ArrowLeft className="size-3" /> COMMAND FIELD</button><div className="mt-16 rounded-[1.5rem] border border-dashed border-accent/50 bg-accent/[0.06] p-7"><span className="grid size-12 place-items-center rounded-full bg-ink text-liquid-foam"><Bot className="size-5" /></span><p className="mt-8 font-mono text-[10px] tracking-[0.18em] text-accent">RESERVED MODULE / 01</p><h2 className="mt-3 font-display text-4xl tracking-[-0.05em]">{locale === "zh" ? "Field Agent 正在等待接入。" : "Field Agent is reserved."}</h2><p className="mt-5 max-w-xl text-sm leading-7 text-muted">{locale === "zh" ? "数字分身入口已保留。当前可进入 FIELD SCHOOL 的课程导师，围绕指定课程提问；启用后，它也不会模拟站主本人。" : "The digital twin remains reserved. You can visit the FIELD SCHOOL tutor to ask about a selected lesson; it does not impersonate the site owner."}</p><button className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-paper" onClick={() => go("/learn/ai")} type="button">{locale === "zh" ? "进入课程导师" : "Open course tutor"}<ArrowRight className="size-4" /></button><p className="mt-4 text-[10px] text-muted"><Sparkles className="mr-1 inline size-3" />{locale === "zh" ? "课程导师需要 GitHub 登录与模型配置。" : "The tutor requires GitHub sign-in and a configured model."}</p></div></div> : null}
          </motion.section>
        </motion.div> : null}
      </AnimatePresence>
    </>
  );
}
