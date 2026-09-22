import type { Metadata } from "next";
import { AccessibilityLab } from "@/components/evidence/accessibility-lab";

export const metadata: Metadata = { title: "Accessibility Lab", description: "检查 NEXTFIELD 的对比度、键盘焦点、动态偏好与静态降级。" };
export default function AccessibilityPage() { return <div className="mx-auto max-w-site px-5 pb-28 pt-20 sm:px-8 sm:pt-28 lg:px-12"><p className="text-xs font-semibold uppercase tracking-[.24em] text-accent">Accessibility lab / 18</p><h1 className="mt-6 font-display text-[clamp(3rem,7vw,6rem)] leading-[.9] tracking-[-.06em]">DESIGN FOR<br />MORE THAN ONE BODY.</h1><p className="mt-8 max-w-2xl text-lg leading-9 text-muted">无障碍不是发布前的检查项，而是颜色、焦点、动态和降级路径在设计阶段共同形成的系统。</p><AccessibilityLab /></div>; }
