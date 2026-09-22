import type { Metadata } from "next";
import { StudioConsole } from "@/components/site/studio-console";

export const metadata: Metadata = { title: "Live Studio", description: "NEXTFIELD 当前正在构建、测试与计划的内容。" };
export default function LiveStudioPage() { return <div className="mx-auto max-w-site px-5 pb-28 pt-20 sm:px-8 sm:pt-28 lg:px-12"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Live studio / 09</p><h1 className="mt-6 max-w-5xl font-display text-[clamp(3rem,7vw,6rem)] leading-[0.9] tracking-[-0.065em]">WHAT&apos;S HAPPENING<br />RIGHT NOW.</h1><p className="mt-8 max-w-2xl text-lg leading-9 text-muted">不是假装实时的仪表盘，而是一张明确说明当前构建、测试与下一步计划的工作台。</p><StudioConsole /></div>; }
