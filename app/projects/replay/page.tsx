import type { Metadata } from "next";
import { ProjectReplay } from "@/components/projects/project-replay";

export const metadata: Metadata = { title: "项目回放", description: "沿时间线回看一个 Agent 项目中的失败、架构变化与关键决定。" };

export default function ProjectReplayPage() {
  return <div className="mx-auto max-w-site px-5 pb-28 pt-20 sm:px-8 sm:pt-28 lg:px-12"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Replay this project / 02</p><h1 className="mt-6 max-w-5xl font-display text-[clamp(3rem,7vw,6rem)] leading-[0.92] tracking-[-0.06em]">A PROJECT IS<br />A SERIES OF DECISIONS.</h1><p className="mt-8 max-w-2xl text-lg leading-9 text-muted">拖动时间不是为了看一个完美结局，而是回到每个信息并不完整、仍需要作出选择的时刻。</p><ProjectReplay /></div>;
}
