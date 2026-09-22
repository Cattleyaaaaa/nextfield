import type { Metadata } from "next";
import { LearningHub } from "@/components/learn/learning-hub";

export const metadata: Metadata = { title: "FIELD SCHOOL", description: "通过交互课程学习 Agent 开发、全栈开发与 Agent 产品设计。" };

export default function LearnPage() {
  return <div className="mx-auto max-w-site px-5 pb-28 pt-16 sm:px-8 sm:pt-24 lg:px-12"><section className="grid gap-10 border-b border-line pb-14 lg:grid-cols-[1fr_23rem] lg:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">NEXTFIELD / FIELD SCHOOL</p><h1 className="mt-6 max-w-5xl font-display text-[clamp(4rem,10vw,9rem)] leading-[0.8] tracking-[-0.075em]">LEARN BY<br />BUILDING SYSTEMS.</h1></div><div><p className="text-base leading-8 text-muted">不是术语目录，也不是视频播放列表。沿着概念、心智模型、代码骨架和交互检查点，把 Agent 与全栈能力连接成真正的产品。</p><div className="mt-6 flex gap-5 font-mono text-[9px] uppercase tracking-[0.14em] text-accent"><span>3 paths</span><span>12 lessons</span><span>Local progress</span></div></div></section><div className="mt-8"><LearningHub /></div></div>;
}
