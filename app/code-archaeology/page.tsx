import type { Metadata } from "next"; import { CodeArchaeology } from "@/components/evidence/evidence-labs";
export const metadata: Metadata = { title: "Code Archaeology", description: "查看一个交互组件从静态版本到生产级实现的演变。" };
export default function Page() { return <div className="mx-auto max-w-site px-5 pb-28 pt-20 sm:px-8 sm:pt-28 lg:px-12"><p className="text-xs font-semibold uppercase tracking-[.24em] text-accent">Code archaeology / 20</p><h1 className="mt-6 font-display text-[clamp(3rem,7vw,6rem)] leading-[.9] tracking-[-.06em]">EVERY INTERACTION<br />HAS A HISTORY.</h1><CodeArchaeology /></div>; }
