import type { Metadata } from "next"; import { ScenarioLab } from "@/components/evidence/evidence-labs";
export const metadata: Metadata = { title: "Agent Scenario Lab", description: "在真实约束下作出 Agent 产品决定并查看后果。" };
export default function Page() { return <div className="mx-auto max-w-site px-5 pb-28 pt-20 sm:px-8 sm:pt-28 lg:px-12"><p className="text-xs font-semibold uppercase tracking-[.24em] text-accent">Agent scenario lab / 14</p><h1 className="mt-6 font-display text-[clamp(3rem,7vw,6rem)] leading-[.9] tracking-[-.06em]">DECISIONS<br />UNDER UNCERTAINTY.</h1><ScenarioLab /></div>; }
