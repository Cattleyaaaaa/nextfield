import type { Metadata } from "next"; import { FieldMissions } from "@/components/evidence/local-systems";
export const metadata: Metadata = { title: "Field Missions", description: "通过探索任务认识 NEXTFIELD 并生成 Field Pass。" };
export default function Page() { return <div className="mx-auto max-w-site px-5 pb-28 pt-20 sm:px-8 sm:pt-28 lg:px-12"><p className="text-xs font-semibold uppercase tracking-[.24em] text-accent">Field missions / 22</p><h1 className="mt-6 font-display text-[clamp(3rem,7vw,6rem)] leading-[.9] tracking-[-.06em]">EXPLORE WITH<br />A PURPOSE.</h1><FieldMissions /></div>; }
