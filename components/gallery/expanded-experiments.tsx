"use client";

import { useState } from "react";
import { ArrowRight, Bot, LayoutGrid, Type } from "lucide-react";
import { GlareHover } from "@/components/react-bits/glare-hover";
import { useLanguage } from "@/components/site/language-provider";

const risks = [
  { zh: "读取公开资料", en: "Read public material" },
  { zh: "修改个人草稿", en: "Edit a private draft" },
  { zh: "发布或删除内容", en: "Publish or delete content" },
] as const;

function AgentGate() {
  const { locale } = useLanguage();
  const [risk, setRisk] = useState(0);
  const [autonomy, setAutonomy] = useState(1);
  const outcome = risk === 2 ? "block" : risk > autonomy ? "confirm" : "allow";
  const copy = {
    allow: { zh: "允许执行", en: "Allow action" },
    confirm: { zh: "请求确认", en: "Ask for confirmation" },
    block: { zh: "阻止操作", en: "Block action" },
  }[outcome];
  return <GlareHover className="h-full"><article className="flex h-full flex-col rounded-[1.75rem] border border-line bg-panel p-6 sm:p-7">
    <div className="flex items-center justify-between"><Bot className="size-5 text-accent" aria-hidden="true"/><span className="font-mono text-[10px] text-muted">05 / Agent</span></div>
    <h2 className="mt-6 font-display text-3xl">{locale === "zh" ? "行动边界" : "Action boundary"}</h2>
    <p className="mt-3 text-sm leading-6 text-muted">{locale === "zh" ? "选择任务和授权程度，观察规则如何决定 Agent 的下一步。" : "Choose a task and autonomy level to see how a simple rule gates an Agent action."}</p>
    <label className="mt-7 block text-xs text-muted">{locale === "zh" ? "准备做什么" : "Proposed action"}<select className="mt-2 w-full rounded-xl border border-line bg-paper p-3 text-sm text-ink" value={risk} onChange={event=>setRisk(Number(event.target.value))}>{risks.map((item,index)=><option value={index} key={item.en}>{item[locale]}</option>)}</select></label>
    <label className="mt-5 block text-xs text-muted">{locale === "zh" ? "自主程度" : "Autonomy level"} · {autonomy + 1}/3<input className="radio-volume mt-3 block w-full" type="range" min="0" max="2" step="1" value={autonomy} onChange={event=>setAutonomy(Number(event.target.value))}/></label>
    <div aria-live="polite" className={`mt-auto rounded-2xl border p-5 pt-5 ${outcome === "block" ? "border-rose-400/50 bg-rose-500/10" : outcome === "confirm" ? "border-amber-400/50 bg-amber-500/10" : "border-accent/50 bg-accent/[0.07]"}`}><p className="font-mono text-[10px] tracking-[0.14em] text-accent">{locale === "zh" ? "规则判断" : "RULE-BASED RESULT"}</p><strong className="mt-2 block font-display text-2xl font-normal">{copy[locale]}</strong><p className="mt-2 text-xs leading-5 text-muted">{outcome === "block" ? (locale === "zh" ? "发布与删除始终由人决定。" : "Publishing and deletion stay with a human.") : outcome === "confirm" ? (locale === "zh" ? "当前授权不足，需要访客确认。" : "This exceeds the selected autonomy and needs confirmation.") : (locale === "zh" ? "处于当前授权范围内，可以继续。" : "This is within the selected autonomy level.")}</p></div>
    <p className="mt-4 text-[10px] leading-5 text-muted">{locale === "zh" ? "规则演示，不会调用真实 Agent 或修改数据。" : "Rule demo only; no Agent call or data changes."}</p>
  </article></GlareHover>;
}

function TypeTuner() {
  const { locale } = useLanguage();
  const [measure, setMeasure] = useState(34);
  const [leading, setLeading] = useState(1.7);
  return <GlareHover className="h-full"><article className="flex h-full flex-col rounded-[1.75rem] border border-line bg-panel p-6 sm:p-7">
    <div className="flex items-center justify-between"><Type className="size-5 text-accent" aria-hidden="true"/><span className="font-mono text-[10px] text-muted">06 / {locale === "zh" ? "排版" : "TYPE"}</span></div>
    <h2 className="mt-6 font-display text-3xl">{locale === "zh" ? "阅读调音台" : "Reading tuner"}</h2>
    <p className="mt-3 text-sm leading-6 text-muted">{locale === "zh" ? "拉动行宽与行距，感受同一段话如何改变阅读节奏。" : "Adjust line width and spacing to feel how a paragraph's rhythm changes."}</p>
    <div className="my-7 flex min-h-52 items-center overflow-hidden rounded-2xl border border-line bg-paper p-5"><p className="max-w-full text-sm text-ink transition-[max-width,line-height] duration-200" style={{ maxWidth: `${measure}ch`, lineHeight: leading }}>{locale === "zh" ? "好的界面不催促读者。每行的长度、行与行之间的空气，决定一段话是向你靠近，还是让你停下来重新寻找起点。" : "A good interface does not rush its reader. The length of each line and the air between lines decide whether a paragraph feels welcoming or asks you to find your place again."}</p></div>
    <label className="block text-xs text-muted">{locale === "zh" ? "行宽" : "Line width"} · {measure}ch<input className="radio-volume mt-2 block w-full" type="range" min="18" max="58" value={measure} onChange={event=>setMeasure(Number(event.target.value))}/></label>
    <label className="mt-5 block text-xs text-muted">{locale === "zh" ? "行距" : "Line height"} · {leading.toFixed(1)}<input className="radio-volume mt-2 block w-full" type="range" min="1.2" max="2.2" step="0.1" value={leading} onChange={event=>setLeading(Number(event.target.value))}/></label>
  </article></GlareHover>;
}

function LayoutTuner() {
  const { locale } = useLanguage();
  const [columns, setColumns] = useState(2);
  const [gap, setGap] = useState(12);
  return <GlareHover className="h-full"><article className="flex h-full flex-col rounded-[1.75rem] border border-line bg-panel p-6 sm:p-7">
    <div className="flex items-center justify-between"><LayoutGrid className="size-5 text-accent" aria-hidden="true"/><span className="font-mono text-[10px] text-muted">07 / {locale === "zh" ? "布局" : "LAYOUT"}</span></div>
    <h2 className="mt-6 font-display text-3xl">{locale === "zh" ? "密度试验" : "Density study"}</h2>
    <p className="mt-3 text-sm leading-6 text-muted">{locale === "zh" ? "改变列数和间隔：信息一样多，但浏览顺序和呼吸感会变。" : "Change columns and spacing: the content stays the same, but its scan path changes."}</p>
    <div className="my-7 min-h-52 rounded-2xl border border-line bg-paper p-4"><div className="grid transition-[gap] duration-200" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap }}>{[0,1,2,3,4,5].map(index=><div className="min-w-0 rounded-xl border border-line bg-panel p-3" key={index}><span className="font-mono text-[9px] text-accent">0{index+1}</span><span className="mt-3 block h-2 w-4/5 rounded bg-line"/><span className="mt-2 block h-2 w-3/5 rounded bg-line"/></div>)}</div></div>
    <label className="block text-xs text-muted">{locale === "zh" ? "列数" : "Columns"} · {columns}<input className="radio-volume mt-2 block w-full" type="range" min="1" max="3" step="1" value={columns} onChange={event=>setColumns(Number(event.target.value))}/></label>
    <label className="mt-5 block text-xs text-muted">{locale === "zh" ? "间隔" : "Spacing"} · {gap}px<input className="radio-volume mt-2 block w-full" type="range" min="4" max="28" step="4" value={gap} onChange={event=>setGap(Number(event.target.value))}/></label>
  </article></GlareHover>;
}

export function ExpandedExperiments() {
  const { locale } = useLanguage();
  return <section aria-labelledby="more-experiments" className="mt-16 border-t border-line pt-10"><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[10px] tracking-[0.18em] text-accent">{locale === "zh" ? "新增实验 / 05–07" : "THREE MORE / 05–07"}</p><h2 id="more-experiments" className="mt-3 font-display text-4xl tracking-[-0.05em]">{locale === "zh" ? "再往里试一点。" : "Try a little further."}</h2></div><span className="inline-flex items-center gap-2 text-xs text-muted">{locale === "zh" ? "全部在本地运行" : "All local, in your browser"}<ArrowRight className="size-4" aria-hidden="true"/></span></div><div className="grid gap-4 lg:grid-cols-3"><AgentGate/><TypeTuner/><LayoutTuner/></div></section>;
}
