import type { Metadata } from "next";
import { ArrowDown, ArrowUpRight, Boxes, FileClock, FlaskConical, Wrench } from "lucide-react";
import { TransitionLink } from "@/components/site/transition-link";
import { EVIDENCE_SYSTEMS } from "@/lib/evidence-data";

export const metadata: Metadata = {
  title: "Systems",
  description: "NEXTFIELD Evidence Layer 的全部可操作模块。",
};

const GROUPS = [
  { id: "proof", range: "13–18", title: "证明与结构", eyebrow: "Proof & structure", copy: "从能力清单到架构剖面，快速判断我如何定义、实现并验证产品。", icon: Boxes },
  { id: "record", range: "19–21", title: "记录与观测", eyebrow: "Record & observe", copy: "保留版本演变、代码决策与构建预算，让过程可以被检查。", icon: FileClock },
  { id: "participate", range: "22–23", title: "探索与参与", eyebrow: "Explore & participate", copy: "通过任务和本地优先的协作问题，让浏览成为一次主动探索。", icon: FlaskConical },
  { id: "tools", range: "24–25", title: "空间与工具", eyebrow: "Space & tools", copy: "把内容重组为可拖动桌面和可下载卡片，测试新的内容容器。", icon: Wrench },
] as const;

function SystemLink({ item }: { item: (typeof EVIDENCE_SYSTEMS)[number] }) {
  const content = <><span className="font-mono text-[10px] tracking-[0.16em] text-accent">{item.number}</span><span className="min-w-0"><span className="block font-display text-xl tracking-[-0.035em] sm:text-2xl">{item.title}</span><span className="mt-1 block text-xs leading-5 text-muted sm:text-sm sm:leading-6">{item.copy}</span></span><span className="flex items-center gap-3 self-start"><span className="hidden rounded-full border border-line px-2 py-1 font-mono text-[8px] tracking-[0.13em] text-muted sm:inline-flex">{item.status}</span><ArrowUpRight className="mt-1 size-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span></>;
  const className = "group grid grid-cols-[2rem_1fr_auto] gap-3 border-t border-line py-5 transition-colors hover:text-accent sm:grid-cols-[2.5rem_1fr_auto] sm:gap-5";
  return item.href.endsWith(".json") || item.href.endsWith(".pdf")
    ? <a className={className} href={item.href}>{content}</a>
    : <TransitionLink className={className} href={item.href}>{content}</TransitionLink>;
}

export default function SystemsPage() {
  return (
    <div className="mx-auto max-w-site px-5 pb-28 pt-16 sm:px-8 sm:pt-24 lg:px-12">
      <section className="grid gap-12 border-b border-line pb-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end lg:gap-20">
        <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Evidence layer / 13–25</p><h1 className="mt-6 max-w-5xl font-display text-[clamp(3.25rem,7.8vw,7.25rem)] leading-[0.82] tracking-[-0.07em]">NOT MORE CLAIMS.<br /><span className="text-muted">MORE PROOF.</span></h1></div>
        <div className="lg:pb-1"><div className="flex items-end justify-between border-b border-line pb-5"><span className="font-display text-7xl leading-none tracking-[-0.07em]">13</span><span className="pb-1 font-mono text-[9px] uppercase tracking-[0.18em] text-muted">Modules<br />One evidence layer</span></div><p className="mt-5 text-sm leading-7 text-muted">十三个模块把能力声明变成可以浏览、操作、下载或被程序读取的证据。</p></div>
      </section>

      <nav aria-label="证据模块分组" className="grid border-b border-line sm:grid-cols-2 lg:grid-cols-4">
        {GROUPS.map((group, index) => <a className="group flex items-center justify-between gap-4 border-line py-5 sm:px-5 sm:odd:border-r lg:border-r lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0" href={`#${group.id}`} key={group.id}><span><span className="font-mono text-[9px] text-accent">0{index + 1} / {group.range}</span><span className="mt-1 block text-sm">{group.title}</span></span><ArrowDown className="size-3.5 text-muted transition-transform group-hover:translate-y-1" /></a>)}
      </nav>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {GROUPS.map(({ id, range, title, eyebrow, copy, icon: Icon }) => {
          const [start, end] = range.split("–").map(Number);
          const items = EVIDENCE_SYSTEMS.filter((item) => Number(item.number) >= start && Number(item.number) <= end);
          return <section className="scroll-mt-24 rounded-[1.75rem] border border-line bg-panel/55 p-5 sm:p-7" id={id} key={id}><header className="flex min-h-36 items-start justify-between gap-6 pb-7"><div><p className="font-mono text-[9px] uppercase tracking-[0.17em] text-accent">{eyebrow} / {range}</p><h2 className="mt-3 font-display text-3xl tracking-[-0.045em] sm:text-4xl">{title}</h2><p className="mt-3 max-w-md text-xs leading-6 text-muted">{copy}</p></div><span className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-paper text-accent"><Icon className="size-4" /></span></header><div>{items.map((item) => <SystemLink item={item} key={item.number} />)}</div></section>;
        })}
      </div>
    </div>
  );
}
