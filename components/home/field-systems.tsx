"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Check, Fingerprint, Orbit, RadioTower } from "lucide-react";
import { TransitionLink } from "@/components/site/transition-link";
import { usePageTransition } from "@/components/site/page-transition-provider";
import { CAPABILITIES, FIELD_CHANNELS } from "@/lib/nextfield-data";

function hash(value: string) {
  return [...value].reduce((result, char) => (result * 31 + char.charCodeAt(0)) >>> 0, 2166136261);
}

function random(seed: number, offset: number) {
  // Use integer-only mixing so the server and browser produce identical values.
  // Math.sin can differ by a few ULPs across runtimes, which is enough to make
  // React report a style-attribute hydration mismatch for these generated forms.
  let value = (seed ^ Math.imul(offset + 1, 0x45d9f3b)) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b) >>> 0;
  value = (value ^ (value >>> 16)) >>> 0;
  return value / 0x1_0000_0000;
}

export function DailyField({ dayKey }: { dayKey: string }) {
  const seed = hash(dayKey);
  const [touches, setTouches] = useState(0);
  const { navigate } = usePageTransition();
  const forms = useMemo(() => Array.from({ length: 8 }, (_, index) => ({ x: random(seed, index) * 82 + 9, y: random(seed, index + 20) * 76 + 12, size: random(seed, index + 40) * 130 + 44, rotate: random(seed, index + 60) * 140 - 70 })), [seed]);

  const touchCore = () => {
    const next = touches + 1;
    setTouches(next);
    if (next >= 7) navigate("/after-hours");
  };

  return (
    <section className="mx-auto max-w-site px-5 py-24 sm:px-8 lg:px-12">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent lg:col-span-3">Daily field / 06</p><h2 className="font-display text-[clamp(3rem,6vw,6rem)] leading-[0.88] tracking-[-0.06em] lg:col-span-6">ONE DAY.<br />ONE FORM.</h2><p className="max-w-sm text-sm leading-6 text-muted lg:col-span-3">日期是随机种子：同一天生成同一张封面，明天它会自然改变。</p></div>
      <button aria-label="今日生成封面。连续触碰核心可能发现隐藏内容。" className="relative mt-12 block min-h-[34rem] w-full overflow-hidden rounded-[2rem] border border-line bg-ink text-left text-paper" onClick={touchCore} type="button">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgb(var(--liquid-mid)/0.65),transparent_36%)]" />
        {forms.map((form, index) => <span className={`absolute rounded-full border ${index % 3 === 0 ? "border-liquid-foam/40 bg-liquid-foam/10" : "border-paper/15"}`} key={index} style={{ height: form.size, left: `${form.x}%`, top: `${form.y}%`, transform: `translate(-50%, -50%) rotate(${form.rotate}deg)`, width: index % 2 ? form.size : form.size * 1.7 }} />)}
        <span className="absolute left-1/2 top-1/2 grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-liquid-foam text-ink shadow-[0_0_90px_rgb(var(--liquid-foam)/0.45)] transition-transform duration-500 hover:scale-110"><Orbit className="size-7" /></span>
        <span className="absolute left-6 top-6 font-mono text-[10px] tracking-[0.2em] text-paper/55">FIELD № {dayKey.replaceAll("-", ".")}</span>
        <span className="absolute bottom-6 left-6 font-display text-3xl tracking-[-0.04em]">Generated once.<br />Remembered for a day.</span>
        <span className="absolute bottom-6 right-6 font-mono text-[9px] text-paper/35">SEED / {seed.toString(16).toUpperCase()}</span>
      </button>
    </section>
  );
}

export function FieldChannels() {
  const [active, setActive] = useState(0);
  const channel = FIELD_CHANNELS[active];
  return (
    <section className="border-y border-line bg-panel">
      <div className="mx-auto max-w-site px-5 py-24 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-12"><div className="lg:col-span-4"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Tune the field / 07</p><h2 className="mt-6 font-display text-[clamp(3rem,5vw,5rem)] leading-[0.9] tracking-[-0.055em]">CHOOSE A<br />CHANNEL.</h2></div><div className="lg:col-span-8">
          <div className="grid grid-cols-2 border-l border-t border-line sm:grid-cols-4">{FIELD_CHANNELS.map((item, index) => <button aria-pressed={active === index} className={`border-b border-r border-line px-4 py-5 text-left font-mono text-xs tracking-[0.15em] ${active === index ? "bg-ink text-paper" : "bg-paper text-muted hover:text-accent"}`} key={item.id} onClick={() => setActive(index)} type="button">{item.label}</button>)}</div>
          <div className="relative min-h-[22rem] overflow-hidden border-x border-b border-line bg-paper p-7 sm:p-10"><span className="absolute -right-20 -top-20 size-64 rounded-full opacity-20 blur-3xl" style={{ background: `rgb(${channel.color})` }} /><RadioTower className="size-5 text-accent" /><p className="mt-16 font-mono text-[10px] tracking-[0.18em] text-accent">CHANNEL / {String(active + 1).padStart(2, "0")}</p><h3 className="mt-4 max-w-xl font-display text-4xl leading-[0.95] tracking-[-0.05em] sm:text-5xl">{channel.title}</h3><p className="mt-5 max-w-lg text-sm leading-7 text-muted">{channel.copy}</p><TransitionLink className="group mt-8 inline-flex items-center gap-2 text-sm hover:text-accent" href={channel.href}>进入频道 <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></TransitionLink></div>
        </div></div>
      </div>
    </section>
  );
}

export function CapabilityMap() {
  const [active, setActive] = useState(0);
  const selected = CAPABILITIES[active];
  return (
    <section className="mx-auto max-w-site px-5 py-24 sm:px-8 lg:px-12">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent lg:col-span-3">Evidence map / 08</p><h2 className="font-display text-[clamp(3rem,6vw,6rem)] leading-[0.88] tracking-[-0.06em] lg:col-span-6">SKILLS NEED<br />EVIDENCE.</h2><p className="max-w-sm text-sm leading-6 text-muted lg:col-span-3">点击能力节点，查看它如何落到项目、文章、实验和真实取舍中。</p></div>
      <div className="mt-12 grid overflow-hidden rounded-[2rem] border border-line bg-panel lg:grid-cols-[1fr_20rem]">
        <div className="relative min-h-[38rem] bg-[linear-gradient(rgb(var(--line)/.2)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--line)/.2)_1px,transparent_1px)] bg-[size:3rem_3rem]">
          <svg aria-hidden="true" className="absolute inset-0 size-full" preserveAspectRatio="none" viewBox="0 0 100 100"><path d="M50 10 L25 37 L20 72 L52 86 L82 72 L75 37 Z M25 37 L75 37 M20 72 L82 72 M50 10 L52 86" fill="none" stroke="rgb(var(--line))" strokeDasharray="2 2" strokeWidth=".3" /></svg>
          {CAPABILITIES.map((item, index) => <button className={`absolute max-w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border px-4 py-3 text-center text-xs shadow-lg ${active === index ? "border-accent bg-ink text-paper" : "border-line bg-paper text-ink hover:border-accent"}`} key={item.id} onClick={() => setActive(index)} style={{ left: `${item.x}%`, top: `${item.y}%` }} type="button">{item.label}</button>)}
        </div>
        <aside className="flex flex-col border-t border-line bg-paper p-6 lg:border-l lg:border-t-0"><Fingerprint className="size-5 text-accent" /><p className="mt-8 font-mono text-[10px] tracking-[0.18em] text-accent">EVIDENCE / {String(active + 1).padStart(2, "0")}</p><h3 className="mt-3 font-display text-3xl tracking-[-0.04em]">{selected.label}</h3><p className="mt-5 text-sm leading-7 text-muted">{selected.evidence}</p><div className="mt-auto space-y-2 pt-10">{selected.links.map((href, index) => <TransitionLink className="flex items-center justify-between border-t border-line py-3 text-xs hover:text-accent" href={href} key={href}>查看证据 {String(index + 1).padStart(2, "0")} <ArrowUpRight className="size-3.5" /></TransitionLink>)}</div></aside>
      </div>
    </section>
  );
}

type Trace = { word: string; color: string; x: number; y: number };
const WORDS = ["BUILDING", "CURIOUS", "LEARNING", "SHIPPING", "RESTING"];
const COLORS = ["#9de5e2", "#e9bd63", "#ec8b78", "#9bb8ef"];
const STARTER_TRACES: Trace[] = [{ word: "CURIOUS", color: COLORS[0], x: 18, y: 28 }, { word: "BUILDING", color: COLORS[1], x: 64, y: 19 }, { word: "LEARNING", color: COLORS[3], x: 78, y: 69 }];

export function VisitorTrace() {
  const [traces, setTraces] = useState<Trace[]>(STARTER_TRACES);
  const [word, setWord] = useState(WORDS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [left, setLeft] = useState(false);
  useEffect(() => {
    const saved = window.localStorage.getItem("nextfield-visitor-traces");
    if (saved) { try { setTraces([...STARTER_TRACES, ...JSON.parse(saved)]); setLeft(true); } catch {} }
  }, []);
  const leave = () => {
    if (left) return;
    const trace = { word, color, x: 14 + Math.random() * 72, y: 16 + Math.random() * 68 };
    setTraces((current) => [...current, trace]);
    window.localStorage.setItem("nextfield-visitor-traces", JSON.stringify([trace]));
    window.dispatchEvent(new CustomEvent("nextfield:mission", { detail: "trace" }));
    setLeft(true);
  };
  return (
    <section className="border-y border-line bg-ink text-paper">
      <div className="mx-auto grid max-w-site gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_22rem] lg:px-12">
        <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-liquid-foam">Visitor trace / 09</p><h2 className="mt-6 font-display text-[clamp(3rem,6vw,6rem)] leading-[0.88] tracking-[-0.06em]">LEAVE A<br />SMALL SIGNAL.</h2><div className="relative mt-10 min-h-[24rem] overflow-hidden rounded-[1.5rem] border border-paper/15 bg-[radial-gradient(circle_at_50%_50%,rgb(var(--liquid-mid)/.45),transparent_60%)]">{traces.map((trace, index) => <span className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-1.5 font-mono text-[9px] tracking-[0.15em]" key={`${trace.word}-${index}`} style={{ borderColor: `${trace.color}77`, color: trace.color, left: `${trace.x}%`, top: `${trace.y}%`, boxShadow: `0 0 24px ${trace.color}33` }}>{trace.word}</span>)}</div></div>
        <aside className="self-end rounded-[1.5rem] border border-paper/15 bg-paper/5 p-6"><p className="text-sm font-medium">你此刻处于什么状态？</p><div className="mt-5 flex flex-wrap gap-2">{WORDS.map((item) => <button className={`rounded-full border px-3 py-1.5 font-mono text-[9px] ${word === item ? "border-liquid-foam bg-liquid-foam text-ink" : "border-paper/15 text-paper/60"}`} key={item} onClick={() => setWord(item)} type="button">{item}</button>)}</div><p className="mt-6 text-xs text-paper/45">选择一个颜色</p><div className="mt-3 flex gap-3">{COLORS.map((item) => <button aria-label={`选择颜色 ${item}`} className={`size-7 rounded-full ${color === item ? "ring-2 ring-paper ring-offset-2 ring-offset-ink" : ""}`} key={item} onClick={() => setColor(item)} style={{ backgroundColor: item }} type="button" />)}</div><button className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-paper px-4 py-3 text-sm text-ink disabled:opacity-50" disabled={left} onClick={leave} type="button">{left ? <><Check className="size-4" /> 信号已留下</> : "留下匿名信号"}</button><p className="mt-4 text-[10px] leading-5 text-paper/35">痕迹只保存在你的浏览器中，不上传身份或行为数据。</p></aside>
      </div>
    </section>
  );
}
