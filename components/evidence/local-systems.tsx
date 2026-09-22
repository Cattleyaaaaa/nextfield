"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { usePathname } from "next/navigation";
import { Check, Download, Grip, Maximize2, RotateCcw, Sparkles } from "lucide-react";

const MISSIONS: readonly { id: string; label: string; path?: string }[] = [
  { id: "project", label: "查看一个项目", path: "/projects" },
  { id: "failure", label: "阅读一个失败案例", path: "/failures" },
  { id: "experiment", label: "进入开放实验室", path: "/gallery" },
  { id: "radio", label: "播放一首 Field Radio 曲目" },
  { id: "trace", label: "留下一个访客信号" },
  { id: "secret", label: "找到隐藏层", path: "/after-hours" },
] as const;

function readMissions() { try { return JSON.parse(window.localStorage.getItem("nextfield-missions") ?? "[]") as string[]; } catch { return []; } }
function writeMission(id: string) { const next = [...new Set([...readMissions(), id])]; window.localStorage.setItem("nextfield-missions", JSON.stringify(next)); window.dispatchEvent(new Event("nextfield:mission-update")); }

export function MissionTracker() {
  const pathname = usePathname();
  useEffect(() => { const match = MISSIONS.find((mission) => mission.path && (pathname === mission.path || pathname.startsWith(`${mission.path}/`))); if (match) writeMission(match.id); }, [pathname]);
  useEffect(() => { const onMission = (event: Event) => writeMission((event as CustomEvent<string>).detail); window.addEventListener("nextfield:mission", onMission); return () => window.removeEventListener("nextfield:mission", onMission); }, []);
  return null;
}

export function FieldMissions() {
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => { const update = () => setDone(readMissions()); update(); window.addEventListener("nextfield:mission-update", update); return () => window.removeEventListener("nextfield:mission-update", update); }, []);
  const complete = done.length === MISSIONS.length;
  const downloadPass = () => {
    const canvas = document.createElement("canvas"); canvas.width = 1400; canvas.height = 800; const context = canvas.getContext("2d"); if (!context) return;
    context.fillStyle = "#0d252c"; context.fillRect(0, 0, canvas.width, canvas.height); context.fillStyle = "#9de5e2"; context.font = "28px monospace"; context.fillText("NEXTFIELD / FIELD PASS", 80, 90); context.fillStyle = "#f0f5f4"; context.font = "bold 96px Georgia"; context.fillText(complete ? "FIELD EXPLORED" : "FIELD IN PROGRESS", 80, 260); context.font = "30px sans-serif"; context.fillStyle = "#8eb2b5"; context.fillText(`${done.length} OF ${MISSIONS.length} MISSIONS COMPLETE`, 80, 330); context.strokeStyle = "#227783"; context.lineWidth = 2; context.strokeRect(80, 410, 1240, 1); context.font = "24px monospace"; MISSIONS.forEach((mission, index) => { context.fillStyle = done.includes(mission.id) ? "#9de5e2" : "#527178"; context.fillText(`${done.includes(mission.id) ? "[x]" : "[ ]"} ${mission.label}`, 80 + (index % 2) * 620, 480 + Math.floor(index / 2) * 72); });
    const link = document.createElement("a"); link.download = "NEXTFIELD-Field-Pass.png"; link.href = canvas.toDataURL("image/png"); link.click();
  };
  return <div className="mt-14 grid gap-4 lg:grid-cols-[1fr_20rem]"><section className="rounded-[2rem] border border-line bg-panel p-6 sm:p-8"><div className="space-y-3">{MISSIONS.map((mission, index) => { const finished = done.includes(mission.id); return <div className={`flex items-center gap-4 rounded-2xl border p-5 ${finished ? "border-accent bg-accent/[.06]" : "border-line bg-paper"}`} key={mission.id}><span className={`grid size-9 place-items-center rounded-full ${finished ? "bg-accent text-white" : "border border-line text-muted"}`}>{finished ? <Check className="size-4" /> : String(index + 1).padStart(2, "0")}</span><span className={finished ? "text-ink" : "text-muted"}>{mission.label}</span></div>; })}</div></section><aside className="flex flex-col rounded-[2rem] bg-ink p-6 text-paper"><Sparkles className="size-5 text-liquid-foam" /><p className="mt-12 font-display text-6xl">{done.length}/{MISSIONS.length}</p><p className="mt-3 text-sm leading-6 text-paper/55">任务会在浏览过程中自动完成，进度只保存在当前浏览器。</p><button className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-liquid-foam px-4 py-3 text-sm text-ink" onClick={downloadPass} type="button"><Download className="size-4" />生成 Field Pass</button></aside></div>;
}

const ANSWERS = ["在产生外部副作用之前", "系统不确定用户真实意图时", "成本或等待时间显著增加时", "只有不可逆操作才需要"] as const;
const BASE_COUNTS = [38, 31, 21, 10];
export function FieldQuestion() {
  const [choice, setChoice] = useState<number | null>(null);
  useEffect(() => { const stored = window.localStorage.getItem("nextfield-field-question"); if (stored !== null) setChoice(Number(stored)); }, []);
  const counts = BASE_COUNTS.map((value, index) => value + (choice === index ? 1 : 0)); const total = counts.reduce((sum, value) => sum + value, 0);
  const vote = (index: number) => { if (choice !== null) return; setChoice(index); window.localStorage.setItem("nextfield-field-question", String(index)); };
  return <div className="mt-14 grid gap-4 lg:grid-cols-[1fr_22rem]"><section className="rounded-[2rem] border border-line bg-panel p-6 sm:p-10"><p className="font-mono text-[10px] tracking-[.16em] text-accent">QUESTION / SEPTEMBER</p><h2 className="mt-10 max-w-3xl font-display text-4xl leading-[.98] tracking-[-.05em] sm:text-5xl">Agent 应该在什么时候主动请求用户确认？</h2><div className="mt-10 space-y-3">{ANSWERS.map((answer, index) => <button className={`relative w-full overflow-hidden rounded-2xl border p-5 text-left ${choice === index ? "border-accent" : "border-line hover:border-accent"}`} disabled={choice !== null} key={answer} onClick={() => vote(index)} type="button"><span className="absolute inset-y-0 left-0 bg-accent/10 transition-[width]" style={{ width: choice !== null ? `${counts[index] / total * 100}%` : 0 }} /><span className="relative flex justify-between gap-4 text-sm"><span>{answer}</span>{choice !== null ? <span className="font-mono text-xs text-accent">{Math.round(counts[index] / total * 100)}%</span> : null}</span></button>)}</div></section><aside className="rounded-[2rem] bg-ink p-6 text-paper"><p className="font-mono text-[9px] tracking-[.16em] text-liquid-foam">LOCAL-FIRST POLL</p><p className="mt-10 text-sm leading-7 text-paper/60">基础分布用于呈现讨论样貌；你的选择只保存在本机，不会被计入公共服务器或绑定身份。</p><p className="mt-8 border-t border-paper/15 pt-6 text-xs leading-6 text-paper/40">下一期问题：当 Agent 失败时，应该展示多少内部过程？</p></aside></div>;
}

const CARD_CONTENT = [
  { title: "Agent interfaces are state machines", body: "Natural interaction comes from clear, predictable and recoverable behavior.", label: "FIELD NOTE / AGENT UX" },
  { title: "Build, observe, refine", body: "A project is not a final screen. It is a series of decisions under incomplete information.", label: "NEXTFIELD / METHOD" },
  { title: "Depth without weight", body: "Use relative motion and clear layers before reaching for a heavy 3D scene.", label: "OPEN EXPERIMENT / MOTION" },
] as const;
export function ShareCardMaker() {
  const [selected, setSelected] = useState(0); const cardRef = useRef<HTMLDivElement>(null); const item = CARD_CONTENT[selected];
  const download = () => { const canvas = document.createElement("canvas"); canvas.width = 1200; canvas.height = 1200; const ctx = canvas.getContext("2d"); if (!ctx) return; ctx.fillStyle = "#0d252c"; ctx.fillRect(0, 0, 1200, 1200); ctx.fillStyle = "#9de5e2"; ctx.font = "24px monospace"; ctx.fillText(item.label, 80, 100); ctx.fillStyle = "#f0f5f4"; ctx.font = "72px Georgia"; const words = item.title.split(" "); let line = "", y = 300; words.forEach((word) => { const test = `${line}${word} `; if (ctx.measureText(test).width > 1000) { ctx.fillText(line, 80, y); line = `${word} `; y += 92; } else line = test; }); ctx.fillText(line, 80, y); ctx.fillStyle = "#8eb2b5"; ctx.font = "30px sans-serif"; const bodyWords = item.body.split(" "); line = ""; y += 150; bodyWords.forEach((word) => { const test = `${line}${word} `; if (ctx.measureText(test).width > 980) { ctx.fillText(line, 80, y); line = `${word} `; y += 48; } else line = test; }); ctx.fillText(line, 80, y); ctx.fillStyle = "#227783"; ctx.fillRect(80, 1080, 1040, 2); ctx.fillStyle = "#9de5e2"; ctx.font = "22px monospace"; ctx.fillText("NEXTFIELD / A LIVING INDEX", 80, 1130); const link = document.createElement("a"); link.download = `NEXTFIELD-card-${selected + 1}.png`; link.href = canvas.toDataURL("image/png"); link.click(); };
  return <div className="mt-14 grid gap-5 lg:grid-cols-[18rem_1fr]"><aside className="space-y-2">{CARD_CONTENT.map((entry, index) => <button className={`w-full rounded-2xl border p-4 text-left ${selected === index ? "border-accent bg-panel" : "border-line"}`} key={entry.title} onClick={() => setSelected(index)} type="button"><span className="font-mono text-[9px] text-accent">CARD / 0{index + 1}</span><span className="mt-2 block text-sm">{entry.title}</span></button>)}</aside><div><div className="aspect-square w-full max-w-2xl bg-ink p-[7%] text-paper" ref={cardRef}><p className="font-mono text-[10px] tracking-[.18em] text-liquid-foam">{item.label}</p><h2 className="mt-[16%] font-display text-[clamp(2.5rem,6vw,5rem)] leading-[.92] tracking-[-.055em]">{item.title}</h2><p className="mt-[10%] max-w-lg text-sm leading-7 text-paper/55">{item.body}</p><p className="mt-[18%] border-t border-accent/40 pt-4 font-mono text-[9px] text-liquid-foam">NEXTFIELD / A LIVING INDEX</p></div><button className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-paper" onClick={download} type="button"><Download className="size-4" />下载 PNG</button></div></div>;
}

type DeskWindow = { id: string; title: string; x: number; y: number; z: number; large: boolean; content: string; href: string };
const INITIAL_WINDOWS: DeskWindow[] = [
  { id: "work", title: "Selected Work", x: 5, y: 8, z: 1, large: false, content: "Agent workspaces, observability and semantic retrieval.", href: "/projects" },
  { id: "notes", title: "Field Notes", x: 38, y: 18, z: 2, large: false, content: "Decisions, methods and thoughts still in progress.", href: "/blog" },
  { id: "studio", title: "Live Studio", x: 20, y: 48, z: 3, large: false, content: "Building NEXTFIELD OS. Testing local-first traces.", href: "/live-studio" },
] as const;
export function SpatialDesktop() {
  const [windows, setWindows] = useState<DeskWindow[]>([...INITIAL_WINDOWS]); const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);
  useEffect(() => { const saved = window.localStorage.getItem("nextfield-desktop"); if (saved) { try { setWindows(JSON.parse(saved)); } catch {} } }, []);
  useEffect(() => { window.localStorage.setItem("nextfield-desktop", JSON.stringify(windows)); }, [windows]);
  const focus = (id: string) => setWindows((items) => items.map((item) => item.id === id ? { ...item, z: Math.max(...items.map((entry) => entry.z)) + 1 } : item));
  const startDrag = (event: ReactPointerEvent, item: DeskWindow) => { const root = event.currentTarget.closest("[data-desktop]")?.getBoundingClientRect(); if (!root) return; dragRef.current = { id: item.id, dx: event.clientX - root.left - root.width * item.x / 100, dy: event.clientY - root.top - root.height * item.y / 100 }; focus(item.id); const move = (pointer: PointerEvent) => setWindows((items) => items.map((entry) => entry.id === item.id ? { ...entry, x: Math.max(0, Math.min(72, (pointer.clientX - root.left - dragRef.current!.dx) / root.width * 100)), y: Math.max(0, Math.min(72, (pointer.clientY - root.top - dragRef.current!.dy) / root.height * 100)) } : entry)); const up = () => { dragRef.current = null; window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); }; window.addEventListener("pointermove", move); window.addEventListener("pointerup", up); };
  return <div className="mt-14"><div className="relative min-h-[44rem] overflow-hidden rounded-[2rem] border border-paper/15 bg-ink text-paper" data-desktop>{windows.map((item) => <section className={`absolute rounded-2xl border border-paper/20 bg-[rgb(15_36_41/.92)] shadow-2xl backdrop-blur ${item.large ? "h-[28rem] w-[min(36rem,72%)]" : "h-56 w-[min(24rem,72%)]"}`} key={item.id} onPointerDown={() => focus(item.id)} style={{ left: `${item.x}%`, top: `${item.y}%`, zIndex: item.z }}><header className="flex cursor-grab touch-none items-center justify-between border-b border-paper/10 px-4 py-3" onPointerDown={(event) => startDrag(event, item)}><span className="flex items-center gap-2 text-xs"><Grip className="size-3 text-paper/40" />{item.title}</span><button aria-label="切换窗口大小" className="p-1 text-paper/40 hover:text-liquid-foam" onPointerDown={(event) => event.stopPropagation()} onClick={() => setWindows((items) => items.map((entry) => entry.id === item.id ? { ...entry, large: !entry.large } : entry))} type="button"><Maximize2 className="size-3.5" /></button></header><div className="p-5"><p className="text-sm leading-7 text-paper/55">{item.content}</p><a className="mt-8 inline-block text-xs text-liquid-foam" href={item.href}>OPEN WINDOW ↗</a></div></section>)}</div><button className="mt-4 inline-flex items-center gap-2 text-xs text-muted hover:text-accent" onClick={() => setWindows([...INITIAL_WINDOWS])} type="button"><RotateCcw className="size-3.5" />重置桌面</button></div>;
}
