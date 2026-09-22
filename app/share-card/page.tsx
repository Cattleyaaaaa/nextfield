import type { Metadata } from "next"; import { ShareCardMaker } from "@/components/evidence/local-systems";
export const metadata: Metadata = { title: "Shareable Cards", description: "生成符合 NEXTFIELD 视觉系统的可下载内容卡片。" };
export default function Page() { return <div className="mx-auto max-w-site px-5 pb-28 pt-20 sm:px-8 sm:pt-28 lg:px-12"><p className="text-xs font-semibold uppercase tracking-[.24em] text-accent">Shareable cards / 25</p><h1 className="mt-6 font-display text-[clamp(3rem,7vw,6rem)] leading-[.9] tracking-[-.06em]">TURN AN IDEA<br />INTO AN OBJECT.</h1><ShareCardMaker /></div>; }
