import type { Metadata } from "next";
import { ProjectGrid } from "@/components/projects/project-grid";
import { ProjectsIntro } from "@/components/projects/projects-intro";
import { NeptuneFeature } from "@/components/projects/neptune-feature";
import { TransitionLink } from "@/components/site/transition-link";
import { Play } from "lucide-react";

export const metadata: Metadata = {
  title: "项目",
  description: "Neptune 多 Agent 工作空间，以及更多 Agent 与全栈产品方向。",
};

export default function ProjectsPage() {
  return (
    <div className="relative isolate mx-auto max-w-site px-5 pb-28 pt-20 sm:px-8 sm:pt-28 lg:px-12">
      <ProjectsIntro />
      <div className="mt-14"><NeptuneFeature /></div>
      <div className="mt-16">
        <ProjectGrid />
      </div>
      <div className="mt-16 rounded-[2rem] border border-line bg-ink p-7 text-paper sm:p-10"><p className="font-mono text-[10px] tracking-[0.18em] text-liquid-foam">INTERACTIVE CASE STUDY</p><div className="mt-5 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-display text-4xl tracking-[-0.05em]">Replay the decisions.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-paper/60">沿时间线查看一个 Agent 项目的失败、架构变化与关键取舍。</p></div><TransitionLink className="inline-flex items-center gap-2 rounded-full bg-paper px-5 py-3 text-sm text-ink hover:bg-liquid-foam" href="/projects/replay"><Play className="size-4" /> 开始回放</TransitionLink></div></div>
    </div>
  );
}
