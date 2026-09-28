"use client";

import { useEffect, useState } from "react";
import { Check, Fingerprint, Orbit } from "lucide-react";
import { TiltSurface } from "@/components/motion/tilt-surface";
import { useLanguage } from "@/components/site/language-provider";

type Trace = { word: string; color: string; x: number; y: number };

const WORDS = [
  { key: "BUILDING", zh: "构建中", en: "Building" },
  { key: "CURIOUS", zh: "好奇中", en: "Curious" },
  { key: "LEARNING", zh: "学习中", en: "Learning" },
  { key: "SHIPPING", zh: "发布中", en: "Shipping" },
  { key: "RESTING", zh: "休息中", en: "Resting" },
] as const;
const WORD_MIGRATIONS: Record<string, string> = Object.fromEntries(
  WORDS.flatMap((item) => [[item.zh, item.key], [item.en.toUpperCase(), item.key]]),
);
function wordLabel(word: string, zh: boolean) {
  const key = WORD_MIGRATIONS[word] || word;
  const item = WORDS.find((option) => option.key === key);
  return item ? item[zh ? "zh" : "en"] : word;
}
const COLORS = ["#9de5e2", "#e9bd63", "#ec8b78", "#9bb8ef"];
const STARTER_TRACES: Trace[] = [
  { word: "CURIOUS", color: COLORS[0], x: 18, y: 28 },
  { word: "BUILDING", color: COLORS[1], x: 64, y: 19 },
  { word: "LEARNING", color: COLORS[3], x: 78, y: 69 },
];

export function VisitorTrace() {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const [traces, setTraces] = useState<Trace[]>(STARTER_TRACES);
  const [word, setWord] = useState<string>(WORDS[0].key);
  const [color, setColor] = useState(COLORS[0]);
  const [left, setLeft] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("nextfield-visitor-traces");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Trace[];
      if (!Array.isArray(parsed)) return;
      const translated = parsed.filter((trace) => trace && typeof trace === "object").map((trace) => ({
        ...trace,
        word: WORD_MIGRATIONS[trace.word] || trace.word,
      }));
      setTraces([...STARTER_TRACES, ...translated]);
      setLeft(translated.length > 0);
    } catch {
      // Ignore stale or malformed local-only traces.
    }
  }, []);

  function leaveTrace() {
    if (left) return;
    const trace = { word, color, x: 14 + Math.random() * 72, y: 16 + Math.random() * 68 };
    setTraces((current) => [...current, trace]);
    window.localStorage.setItem("nextfield-visitor-traces", JSON.stringify([trace]));
    window.dispatchEvent(new CustomEvent("nextfield:mission", { detail: "trace" }));
    setLeft(true);
  }

  return (
    <section aria-labelledby="visitor-trace-title" className="mt-16 overflow-hidden rounded-[2rem] border border-line bg-ink text-paper shadow-[0_28px_80px_-52px_rgba(9,38,43,0.65)]">
      <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10 lg:p-10">
        <div>
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-liquid-foam"><Fingerprint className="size-3.5" /> {zh ? "访客痕迹" : "VISITOR TRACE"} / 09</p>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <h2 id="visitor-trace-title" className="font-display text-4xl leading-[0.95] tracking-[-0.05em] sm:text-5xl">{zh ? <>留下一个<br className="sm:hidden" />微小信号</> : <>Leave a<br className="sm:hidden" /> small signal</>}</h2>
            <p className="max-w-xs text-xs leading-6 text-paper/55">{zh ? "每位访客都可以在这张地图上留下自己的状态。信号仅储存在当前浏览器。" : "Leave a trace of how you feel right now. Your signal stays in this browser."}</p>
          </div>
          <div aria-label={zh ? "访客信号地图" : "Visitor signal map"} className="relative mt-6 min-h-[19rem] overflow-hidden rounded-2xl border border-paper/15 bg-[radial-gradient(circle_at_50%_50%,rgb(var(--liquid-mid)/.42),transparent_62%)] sm:min-h-[23rem]">
            <span aria-hidden="true" className="absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-liquid-foam/15" />
            <span aria-hidden="true" className="absolute left-1/2 top-1/2 size-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-liquid-foam/20" />
            <span aria-hidden="true" className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-liquid-foam shadow-[0_0_34px_rgb(var(--liquid-foam)/.8)]" />
            {traces.map((trace, index) => <span className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border bg-ink/40 px-3 py-1.5 font-mono text-[10px] tracking-[0.08em] backdrop-blur-sm transition-transform duration-300 hover:scale-110" key={`${trace.word}-${index}`} style={{ borderColor: `${trace.color}88`, color: trace.color, left: `${trace.x}%`, top: `${trace.y}%`, boxShadow: `0 0 24px ${trace.color}33` }}>{wordLabel(trace.word, zh)}</span>)}
            <span className="absolute bottom-3 right-4 font-mono text-[9px] tracking-[0.15em] text-paper/30">{zh ? "仅本地保存" : "LOCAL ONLY"}</span>
          </div>
        </div>

        <TiltSurface maxTilt={4} lift={4} perspective={1000} className="self-end rounded-2xl border border-paper/15 bg-paper/[0.06] p-5 sm:p-6">
          <div data-tilt-depth="16" className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full border border-liquid-foam/30 bg-liquid-foam/10 text-liquid-foam"><Orbit className="size-4" /></span><div><p className="text-sm font-medium">{zh ? "此刻的你" : "Your current state"}</p><p className="mt-1 text-[11px] text-paper/45">{zh ? "选一个最贴近的状态" : "Choose what fits right now"}</p></div></div>
          <div className="mt-5 flex flex-wrap gap-2">{WORDS.map((item) => <button aria-pressed={word === item.key} className={`rounded-full border px-3 py-2 text-xs transition-colors ${word === item.key ? "border-liquid-foam bg-liquid-foam text-ink" : "border-paper/15 text-paper/65 hover:border-liquid-foam/60 hover:text-paper"}`} key={item.key} onClick={() => setWord(item.key)} type="button">{item[locale]}</button>)}</div>
          <p className="mt-6 text-xs text-paper/50">{zh ? "挑选一个信号颜色" : "Choose a signal color"}</p>
          <div className="mt-3 flex gap-3">{COLORS.map((item, index) => <button aria-label={zh ? `选择信号颜色 ${index + 1}` : `Choose signal color ${index + 1}`} aria-pressed={color === item} className={`size-7 rounded-full transition-transform hover:scale-110 ${color === item ? "ring-2 ring-paper ring-offset-2 ring-offset-ink" : ""}`} key={item} onClick={() => setColor(item)} style={{ backgroundColor: item }} type="button" />)}</div>
          <button className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-paper px-4 py-3 text-sm font-medium text-ink transition hover:bg-liquid-foam disabled:cursor-default disabled:opacity-70" disabled={left} onClick={leaveTrace} type="button">{left ? <><Check className="size-4" /> {zh ? "信号已留下" : "Signal received"}</> : zh ? "在地图上留下信号" : "Leave a signal on the map"}</button>
          <p className="mt-3 text-center text-[10px] leading-5 text-paper/35">{zh ? "不上传身份、留言或访问行为；每个浏览器可留下一次。" : "No identity, message, or browsing data is uploaded. One signal per browser."}</p>
        </TiltSurface>
      </div>
    </section>
  );
}
