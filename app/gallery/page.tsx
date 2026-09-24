import type { Metadata } from "next";
import { OpenExperiments } from "@/components/home/open-experiments";
import { ExpandedExperiments } from "@/components/gallery/expanded-experiments";
import { PointerEffectsLab } from "@/components/gallery/pointer-effects-lab";

export const metadata: Metadata = {
  title: "开放实验室",
  description: "文字、空间、声音与界面反馈的交互实验。",
};

export default function GalleryPage() {
  return (
    <div className="relative isolate mx-auto max-w-site px-5 pb-28 pt-20 sm:px-8 sm:pt-28 lg:px-12">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Open experiments / 04</p>
      <h1 className="mt-6 max-w-5xl text-balance font-display text-[clamp(3rem,7vw,6rem)] leading-[0.92] tracking-[-0.06em]">不是展品，<br />是可以触碰的想法。</h1>
      <p className="mt-8 max-w-2xl text-lg leading-9 text-muted">这里收纳尚未成为完整产品的交互研究。移动指针、拖动参数或点击画面，每个实验都会作出回应。</p>
      <div className="mt-14"><OpenExperiments compact /></div>
      <ExpandedExperiments />
      <PointerEffectsLab />
      <div className="mt-16 grid gap-4 border-t border-line pt-8 sm:grid-cols-3">
        {[['01', 'Small by design', '每个实验只验证一个问题，不急着扩展成完整产品。'], ['02', 'Browser native', '优先使用 Canvas、Web Audio 与 CSS，让想法保持轻盈。'], ['03', 'Always unfinished', '实验会被更新、拆解，也可能成为未来项目的一部分。']].map(([number, title, copy]) => <article className="rounded-2xl border border-line bg-panel p-5" key={number}><span className="font-mono text-[10px] text-accent">{number}</span><h2 className="mt-10 font-display text-2xl">{title}</h2><p className="mt-3 text-sm leading-6 text-muted">{copy}</p></article>)}
      </div>
    </div>
  );
}
