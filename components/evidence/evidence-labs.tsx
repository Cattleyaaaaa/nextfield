"use client";

import { useState } from "react";
import { CheckCircle2, ChevronRight, Code2, Eye, Layers3, RotateCcw, ShieldAlert } from "lucide-react";

const SCENARIOS = [
  { label: "立即执行删除", risk: "High", ux: "看似迅速，但工具已经产生外部副作用，删除边界并不明确。", verdict: "缺少确认范围和补偿动作，可能造成不可逆的数据损失。" },
  { label: "停止并请求确认", risk: "Low", ux: "解释已经发生的调用，列出将被删除的对象，并让用户明确确认。", verdict: "推荐：把高影响动作变成清晰的控制点，同时保留恢复信息。" },
  { label: "静默撤销所有工具", risk: "Medium", ux: "用户暂时看不到冲突，但部分外部系统可能没有真正的撤销能力。", verdict: "只有在每个工具都有经过验证的补偿操作时才成立。" },
] as const;

export function ScenarioLab() {
  const [choice, setChoice] = useState<number | null>(null);
  return <div className="mt-14 grid gap-4 lg:grid-cols-[1fr_22rem]"><section className="rounded-[2rem] border border-line bg-panel p-6 sm:p-10"><div className="flex items-center gap-3"><ShieldAlert className="size-5 text-accent" /><span className="font-mono text-[10px] tracking-[.16em] text-accent">SCENARIO / HIGH IMPACT ACTION</span></div><h2 className="mt-12 max-w-3xl font-display text-4xl leading-[.98] tracking-[-.05em] sm:text-5xl">用户要求删除数据，但 Agent 已经调用了三个外部工具。你会怎么做？</h2><div className="mt-10 space-y-3">{SCENARIOS.map((item, index) => <button className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left ${choice === index ? "border-accent bg-paper" : "border-line bg-paper/60 hover:border-accent"}`} key={item.label} onClick={() => setChoice(index)} type="button"><span><span className="text-sm font-medium">{item.label}</span><span className="mt-1 block text-xs text-muted">Risk / {item.risk}</span></span><ChevronRight className="size-4" /></button>)}</div></section><aside className="flex min-h-80 flex-col rounded-[2rem] border border-line bg-ink p-6 text-paper">{choice === null ? <><Eye className="size-5 text-liquid-foam" /><p className="mt-auto text-sm leading-7 text-paper/55">选择一个方案。这里不会只告诉你对错，而会展开用户体验、安全风险和工程前提。</p></> : <><span className={`grid size-11 place-items-center rounded-full ${choice === 1 ? "bg-liquid-foam text-ink" : "bg-paper/10 text-paper"}`}>{choice === 1 ? <CheckCircle2 className="size-5" /> : <ShieldAlert className="size-5" />}</span><p className="mt-10 font-mono text-[9px] tracking-[.16em] text-liquid-foam">CONSEQUENCE</p><p className="mt-3 text-sm leading-7 text-paper/70">{SCENARIOS[choice].ux}</p><p className="mt-8 border-t border-paper/15 pt-6 text-sm leading-7">{SCENARIOS[choice].verdict}</p><button className="mt-auto flex items-center gap-2 pt-8 text-xs text-paper/45 hover:text-liquid-foam" onClick={() => setChoice(null)} type="button"><RotateCcw className="size-3.5" />重新选择</button></>}</aside></div>;
}

const LAYERS = [
  { label: "Interface", detail: "流式回答、来源、确认按钮、错误和恢复入口。", tech: "React / state UI" },
  { label: "Streaming state", detail: "把等待、工具执行和部分结果编码为可观察状态。", tech: "Events / reducer" },
  { label: "Agent workflow", detail: "规划、检索、工具调用、确认与恢复的显式图。", tech: "State graph" },
  { label: "Tool layer", detail: "用稳定契约隔离搜索、数据库与外部服务。", tech: "Typed tools" },
  { label: "Retrieval", detail: "召回、重排、版本过滤与引用验证。", tech: "Hybrid RAG" },
  { label: "Observability", detail: "记录轨迹、延迟、失败类别与质量评估。", tech: "Traces / evals" },
] as const;

export function ArchitectureXray() {
  const [active, setActive] = useState(0);
  return <div className="mt-14 grid gap-5 lg:grid-cols-[1fr_22rem]"><section className="rounded-[2rem] border border-line bg-[radial-gradient(circle_at_50%_50%,rgb(var(--accent)/.12),transparent_58%)] p-5 sm:p-10"><div className="space-y-3">{LAYERS.map((layer, index) => <button className={`group relative flex w-full items-center justify-between overflow-hidden rounded-2xl border px-5 py-5 text-left transition-transform ${active === index ? "z-10 border-accent bg-ink text-paper sm:scale-[1.025]" : "border-line bg-panel hover:border-accent"}`} key={layer.label} onClick={() => setActive(index)} style={{ marginLeft: `${index * 2}%`, width: `${100 - index * 4}%` }} type="button"><span className="flex items-center gap-4"><span className="font-mono text-[9px] text-accent">{String(index + 1).padStart(2, "0")}</span><span className="font-display text-xl">{layer.label}</span></span><span className="font-mono text-[9px] opacity-50">{layer.tech}</span></button>)}</div></section><aside className="flex flex-col rounded-[2rem] border border-line bg-panel p-6"><Layers3 className="size-5 text-accent" /><p className="mt-10 font-mono text-[9px] tracking-[.16em] text-accent">ACTIVE LAYER</p><h2 className="mt-3 font-display text-3xl">{LAYERS[active].label}</h2><p className="mt-5 text-sm leading-7 text-muted">{LAYERS[active].detail}</p><div className="mt-auto border-t border-line pt-5"><span className="font-mono text-[9px] text-muted">IMPLEMENTATION</span><p className="mt-2 text-sm">{LAYERS[active].tech}</p></div></aside></div>;
}

const VERSIONS = [
  { version: "v1", title: "Static surface", code: ".card { border: 1px solid; }", note: "先确定内容层次与链接语义，没有动画。", score: "Baseline" },
  { version: "v2", title: "CSS feedback", code: ".card:hover { transform: translateY(-4px); }", note: "增加明确但简单的 hover 反馈。", score: "Low cost" },
  { version: "v3", title: "Pointer parallax", code: "quickTo(card, 'rotationY', { duration: .5 })", note: "让角度跟随指针，并复用 tween 避免高频创建。", score: "Responsive" },
  { version: "v4", title: "Depth layers", code: "gsap.set(layer, { z: depth })", note: "标题、装饰与高光进入不同 Z 轴层级。", score: "Spatial" },
  { version: "v5", title: "Accessible fallback", code: "matchMedia('(prefers-reduced-motion: reduce)')", note: "触屏和减少动态效果模式保留完整静态体验。", score: "Production" },
] as const;

export function CodeArchaeology() {
  const [version, setVersion] = useState(4);
  const item = VERSIONS[version];
  return <div className="mt-14 overflow-hidden rounded-[2rem] border border-line bg-panel"><div className="grid lg:grid-cols-[15rem_1fr]"><nav className="border-b border-line p-5 lg:border-b-0 lg:border-r">{VERSIONS.map((entry, index) => <button className={`w-full border-l px-4 py-4 text-left ${version === index ? "border-accent text-ink" : "border-line text-muted"}`} key={entry.version} onClick={() => setVersion(index)} type="button"><span className="font-mono text-[10px]">{entry.version}</span><span className="mt-1 block text-xs">{entry.title}</span></button>)}</nav><section className="min-h-[32rem] p-7 sm:p-12"><div className="flex items-center justify-between"><Code2 className="size-5 text-accent" /><span className="rounded-full border border-line px-3 py-1 font-mono text-[9px] text-muted">{item.score}</span></div><p className="mt-16 font-mono text-[10px] text-accent">{item.version.toUpperCase()}</p><h2 className="mt-3 font-display text-5xl tracking-[-.055em]">{item.title}</h2><pre className="mt-8 overflow-x-auto rounded-2xl bg-ink p-5 text-xs leading-6 text-liquid-foam"><code>{item.code}</code></pre><p className="mt-6 max-w-xl text-sm leading-7 text-muted">{item.note}</p><input aria-label="选择组件版本" className="radio-volume mt-12 w-full" max={VERSIONS.length - 1} min="0" onChange={(event) => setVersion(Number(event.target.value))} type="range" value={version} /></section></div></div>;
}
