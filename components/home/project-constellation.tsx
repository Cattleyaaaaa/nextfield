"use client";

import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { TransitionLink } from "@/components/site/transition-link";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotionPreference } from "@/lib/use-motion-preference";

const NODES = [
  { id: "01", title: "Knowledge Copilot", kind: "Agent", x: 18, y: 30, size: 118, copy: "知识检索、引用与工具调用的统一入口。" },
  { id: "02", title: "Agent Operations", kind: "Platform", x: 58, y: 22, size: 146, copy: "观察、调试和评估复杂 Agent 流程。" },
  { id: "03", title: "Semantic Search", kind: "AI", x: 77, y: 66, size: 112, copy: "连接业务数据与用户真实意图。" },
  { id: "04", title: "NEXTFIELD", kind: "Web", x: 38, y: 71, size: 92, copy: "这个持续生长的数字场域本身。" },
] as const;

const CONNECTIONS = [[0, 1], [1, 2], [2, 3], [3, 0], [1, 3]] as const;
const FILTERS = ["All", "Agent", "Platform", "AI", "Web"] as const;

export function ProjectConstellation() {
  const rootRef = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [active, setActive] = useState(0);
  const reducedMotion = useMotionPreference();

  useGSAP(() => {
    if (reducedMotion) return;
    gsap.fromTo("[data-map-node]", { autoAlpha: 0, scale: 0.65 }, { autoAlpha: 1, scale: 1, duration: 0.75, stagger: 0.09, ease: "back.out(1.5)", scrollTrigger: { trigger: rootRef.current, start: "top 72%", once: true } });
    gsap.fromTo("[data-map-line]", { strokeDashoffset: 160 }, { strokeDashoffset: 0, duration: 1.2, stagger: 0.08, ease: "power2.out", scrollTrigger: { trigger: rootRef.current, start: "top 72%", once: true } });
  }, { scope: rootRef, dependencies: [reducedMotion] });

  const visible = (kind: string) => filter === "All" || kind === filter;
  const selected = NODES[active];

  return (
    <section className="border-y border-line bg-panel" ref={rootRef}>
      <div className="mx-auto max-w-site px-5 py-24 sm:px-8 lg:px-12">
        <div className="grid gap-7 lg:grid-cols-12 lg:items-end">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent lg:col-span-3">Project constellation / 03</p>
          <h2 className="font-display text-[clamp(3rem,6vw,6rem)] leading-[0.88] tracking-[-0.06em] lg:col-span-6">WORK,<br />CONNECTED.</h2>
          <p className="max-w-sm text-sm leading-6 text-muted lg:col-span-3">项目不是孤立的卡片，而是一组共享技术、方法与问题意识的节点。</p>
        </div>
        <div className="mt-10 flex flex-wrap gap-2" aria-label="筛选项目类型">
          {FILTERS.map((item) => <button className={`rounded-full border px-3.5 py-1.5 text-xs ${filter === item ? "border-ink bg-ink text-paper" : "border-line text-muted hover:border-accent hover:text-accent"}`} key={item} onClick={() => setFilter(item)} type="button">{item}</button>)}
        </div>
        <div className="mt-6 grid overflow-hidden rounded-[2rem] border border-line bg-paper lg:grid-cols-[1fr_18rem]">
          <div className="relative min-h-[34rem] overflow-hidden bg-[radial-gradient(circle_at_50%_50%,rgb(var(--accent)/0.1),transparent_55%)]">
            <svg aria-hidden="true" className="absolute inset-0 size-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              {CONNECTIONS.map(([from, to]) => <line data-map-line key={`${from}-${to}`} stroke="rgb(var(--line))" strokeDasharray="4 3" strokeDashoffset="160" strokeWidth="0.25" x1={NODES[from].x} x2={NODES[to].x} y1={NODES[from].y} y2={NODES[to].y} />)}
            </svg>
            {NODES.map((node, index) => <button aria-label={`查看 ${node.title}`} className={`group absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-center shadow-[0_14px_40px_rgb(var(--liquid-deep)/0.1)] transition-[opacity,background-color,border-color] duration-300 ${active === index ? "border-accent bg-ink text-paper" : "border-line bg-panel text-ink hover:border-accent"} ${visible(node.kind) ? "opacity-100" : "pointer-events-none opacity-15"}`} data-map-node key={node.id} onFocus={() => setActive(index)} onMouseEnter={() => setActive(index)} onClick={() => setActive(index)} style={{ left: `${node.x}%`, top: `${node.y}%`, width: node.size, height: node.size }} type="button"><span><span className="block font-mono text-[9px] tracking-[0.15em] text-accent">{node.id} / {node.kind}</span><span className="mt-1 block px-3 font-display text-sm leading-tight">{node.title}</span></span></button>)}
          </div>
          <aside className="flex flex-col border-t border-line p-6 lg:border-l lg:border-t-0">
            <span className="font-mono text-[10px] tracking-[0.18em] text-accent">ACTIVE NODE / {selected.id}</span>
            <h3 className="mt-auto pt-16 font-display text-3xl leading-none tracking-[-0.04em]">{selected.title}</h3>
            <p className="mt-4 text-sm leading-6 text-muted">{selected.copy}</p>
            <TransitionLink className="mt-8 inline-flex items-center justify-between border-t border-line pt-4 text-sm hover:text-accent" href="/projects">查看项目档案 <ArrowUpRight className="size-4" /></TransitionLink>
          </aside>
        </div>
      </div>
    </section>
  );
}
