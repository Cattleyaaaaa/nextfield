"use client";

import { useId, useRef, useState } from "react";
import { ArrowUpRight, RefreshCw, Sparkles, X } from "lucide-react";
import { FIELD_AGENT_SIGNALS, SIGNAL_TOPICS, type SignalTopic } from "@/lib/field-agent-signals";
import { FieldAgentCore } from "./field-agent-core";

export function FieldAgentDiscovery({ animated, locale, canAsk, onAsk, onNavigate }: {
  animated: boolean;
  locale: "zh" | "en";
  canAsk: boolean;
  onAsk: (question: string) => void;
  onNavigate: (href: string) => void;
}) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const titleId = useId();
  const discovery = useRef<HTMLDivElement>(null);
  const zh = locale === "zh";
  const hovered = FIELD_AGENT_SIGNALS.find(signal => signal.id === hoverId);
  const selected = FIELD_AGENT_SIGNALS.find(signal => signal.id === selectedId);
  const matrixLabel = hovered
    ? `${SIGNAL_TOPICS[hovered.topic].label[locale]} · ${hovered.title[locale]}. ${zh ? "点击或按 Enter 查看，方向键切换光柱。" : "Click or press Enter to discover. Arrow keys select columns."}`
    : zh ? "探索本站内容。点击光柱查看内容，方向键选择，Enter 打开。" : "Discover site content. Click a column, or use arrow keys and Enter.";
  const changeSignal = () => {
    if (!selected) return;
    const siblings = FIELD_AGENT_SIGNALS.filter(signal => signal.topic === selected.topic);
    const index = siblings.findIndex(signal => signal.id === selected.id);
    setSelectedId(siblings[(index + 1) % siblings.length].id);
  };

  return <div ref={discovery} className="field-agent-discovery">
    <FieldAgentCore animated={animated} onSignalHover={setHoverId} onSignalSelect={setSelectedId} label={matrixLabel} />
    <p className="field-agent-signal-hint mb-3 min-h-5 font-mono text-[10px] leading-5 text-cyan-200/80" aria-hidden="true">
      {hovered ? `${SIGNAL_TOPICS[hovered.topic].label[locale]} · ${zh ? "点击发现内容" : "Click to discover"}` : zh ? "点亮一根光柱，发现一条本站内容" : "Pick a column to discover site content"}
    </p>
    <div className="mt-4 flex flex-wrap justify-center gap-1.5" role="group" aria-label={zh ? "按主题发现内容" : "Discover by topic"}>
      {(Object.keys(SIGNAL_TOPICS) as SignalTopic[]).map(topic => <button key={topic} type="button" aria-pressed={selected?.topic === topic} onClick={() => setSelectedId(FIELD_AGENT_SIGNALS.find(signal => signal.topic === topic)!.id)} className="field-agent-signal-topic inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1.5 text-[10px] text-slate-400 transition hover:border-cyan-300/40 hover:text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">
        <span aria-hidden="true" className="size-1 rounded-full" style={{ backgroundColor: `rgb(${SIGNAL_TOPICS[topic].color.join(",")})` }} />{SIGNAL_TOPICS[topic].label[locale]}
      </button>)}
    </div>
    <span role="status" className="sr-only">{selected ? `${zh ? "已发现" : "Discovered"}: ${selected.title[locale]}` : ""}</span>
    {selected && <section aria-labelledby={titleId} className="field-agent-signal-card relative mt-4 overflow-hidden rounded-2xl border border-cyan-300/30 bg-[#0d1b30]/95 p-4 text-left shadow-[0_0_24px_rgba(34,211,238,0.08)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.15em] text-cyan-200"><span className="size-1.5 rounded-full" style={{ backgroundColor: `rgb(${SIGNAL_TOPICS[selected.topic].color.join(",")})` }} />{SIGNAL_TOPICS[selected.topic].label[locale]} / {zh ? "内容信号" : "CONTENT SIGNAL"}</span>
        <button type="button" onClick={() => { setSelectedId(null); discovery.current?.querySelector<HTMLButtonElement>("button.field-agent-core")?.focus({ preventScroll: true }); }} aria-label={zh ? "收起内容卡片" : "Close content card"} className="grid size-6 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"><X className="size-3.5" /></button>
      </div>
      <h4 id={titleId} className="text-sm font-medium leading-6 text-slate-100">{selected.title[locale]}</h4>
      <p className="mt-2 text-xs leading-6 text-slate-400">{selected.summary[locale]}</p>
      <div className="mt-3 rounded-xl border border-violet-300/15 bg-violet-300/[0.04] px-3 py-2.5">
        <p className="mb-1 flex items-center gap-1.5 text-[9px] text-violet-300"><Sparkles className="size-3" />{zh ? "你可以这样问" : "A question to start with"}</p>
        <p className="text-xs leading-5 text-slate-300">{selected.question[locale]}</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => onNavigate(selected.href)} className="field-agent-signal-action inline-flex items-center gap-1.5 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-[11px] text-cyan-100 hover:bg-cyan-300/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">{zh ? "打开原文" : "Open source"}<ArrowUpRight className="size-3" /></button>
        <button type="button" disabled={!canAsk} onClick={() => onAsk(selected.question[locale])} className="field-agent-signal-action inline-flex items-center gap-1.5 rounded-lg border border-violet-300/30 bg-violet-300/10 px-3 py-2 text-[11px] text-violet-200 hover:bg-violet-300/20 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300"><Sparkles className="size-3" />{zh ? "问问 Field Agent" : "Ask Field Agent"}</button>
        <button type="button" onClick={changeSignal} className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-2 text-[10px] text-slate-500 hover:text-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"><RefreshCw className="size-3" />{zh ? "换一条" : "Another"}</button>
      </div>
      <p className="mt-3 text-[9px] leading-4 text-slate-500">{zh ? "发现内容不消耗次数；提问先填入输入框，发送后计入额度。" : "Discovery uses no quota. Questions are filled in first; sending uses a request."}</p>
    </section>}
  </div>;
}
