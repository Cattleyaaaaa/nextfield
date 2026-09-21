"use client";

import { useRef } from "react";
import {
  Atom,
  Boxes,
  Braces,
  Cloud,
  Database,
  Globe,
  Package,
  Server,
  ShieldCheck,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { SplitText, gsap, useGSAP } from "@/lib/gsap";
import { useMotionPreference } from "@/lib/use-motion-preference";

// 与 Agent 屏刻意错开：标题自上而下、更慢；层带自底向上「堆起来」。
const FULLSTACK_SLIDE_MOTION = {
  delay: 0.32,
  ease: "power2.out",
  title: { from: -26, blur: 10, stagger: 0.09, duration: 0.65 },
  layers: { at: 0.12, y: 18, duration: 0.5, each: 0.09 },
  bars: { at: 0.24, duration: 0.55, each: 0.09 },
  items: { at: 0.34, y: 8, duration: 0.4, stagger: 0.03 },
};

type TechItem = {
  name: string;
  description: string;
  icon: LucideIcon;
};

type StackLayer = {
  id: string;
  name: string;
  note: string;
  items: TechItem[];
};

// 分层而不是平铺 —— 这是这屏与 Agent 流程屏在结构上的根本区别。
const fullstackLayers: StackLayer[] = [
  {
    id: "L1",
    name: "界面层",
    note: "界面与交互",
    items: [
      { name: "React / Next.js", description: "构建快速、可访问的现代 Web 界面。", icon: Atom },
      { name: "Tailwind CSS", description: "用一致的设计令牌快速落地界面。", icon: Wind },
    ],
  },
  {
    id: "L2",
    name: "服务端层",
    note: "逻辑与接口",
    items: [
      { name: "Node.js", description: "实现稳定的服务端逻辑与工具链。", icon: Server },
      { name: "REST / GraphQL", description: "设计清楚、可演进的应用接口。", icon: Globe },
      { name: "NextAuth", description: "实现安全、顺畅的身份验证流程。", icon: ShieldCheck },
    ],
  },
  {
    id: "L3",
    name: "数据层",
    note: "模型与访问",
    items: [
      { name: "PostgreSQL", description: "设计可靠的数据模型、查询与迁移。", icon: Database },
      { name: "Prisma / Drizzle", description: "保持类型安全的数据访问层。", icon: Boxes },
    ],
  },
  {
    id: "L4",
    name: "交付层",
    note: "构建与运行环境",
    items: [
      { name: "Vercel", description: "交付可扩展、可复现的生产环境。", icon: Cloud },
      { name: "Docker", description: "把运行环境固化，本地与线上保持一致。", icon: Package },
    ],
  },
];

// TypeScript 跨全部层级，所以不塞进任何一层，单独做成底座。
const fullstackFoundation = {
  name: "TypeScript",
  description: "用清晰的类型边界保障长期维护。",
  icon: Braces,
};

export function FullStackSlide() {
  const reducedMotion = useMotionPreference();
  const slideRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const splitRef = useRef<SplitText | null>(null);

  useGSAP(() => {
    if (reducedMotion) return;

    const timeline = gsap.timeline({
      delay: FULLSTACK_SLIDE_MOTION.delay,
      defaults: { ease: FULLSTACK_SLIDE_MOTION.ease },
    });

    const titleElement = titleRef.current;
    if (titleElement) {
      const split = SplitText.create(titleElement, { type: "chars", charsClass: "fullstack-title-char" });
      splitRef.current = split;
      timeline.fromTo(
        split.chars,
        { autoAlpha: 0, y: FULLSTACK_SLIDE_MOTION.title.from, filter: `blur(${FULLSTACK_SLIDE_MOTION.title.blur}px)` },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: FULLSTACK_SLIDE_MOTION.title.duration,
          stagger: FULLSTACK_SLIDE_MOTION.title.stagger,
        },
        0,
      );
    }

    // from: "end" 让它从 DOM 末位开始 —— 也就是底座先落地，再一层层往上堆。
    timeline.fromTo(
      "[data-fullstack-layer]",
      { autoAlpha: 0, y: FULLSTACK_SLIDE_MOTION.layers.y },
      {
        autoAlpha: 1,
        y: 0,
        duration: FULLSTACK_SLIDE_MOTION.layers.duration,
        stagger: { each: FULLSTACK_SLIDE_MOTION.layers.each, from: "end" },
        clearProps: "opacity,visibility,transform",
      },
      FULLSTACK_SLIDE_MOTION.layers.at,
    );

    timeline.fromTo(
      "[data-fullstack-bar]",
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: FULLSTACK_SLIDE_MOTION.bars.duration,
        stagger: { each: FULLSTACK_SLIDE_MOTION.bars.each, from: "end" },
        clearProps: "transform",
      },
      FULLSTACK_SLIDE_MOTION.bars.at,
    );

    timeline.fromTo(
      "[data-fullstack-item]",
      { autoAlpha: 0, y: FULLSTACK_SLIDE_MOTION.items.y },
      {
        autoAlpha: 1,
        y: 0,
        duration: FULLSTACK_SLIDE_MOTION.items.duration,
        stagger: FULLSTACK_SLIDE_MOTION.items.stagger,
        clearProps: "opacity,visibility,transform",
      },
      FULLSTACK_SLIDE_MOTION.items.at,
    );

    return () => {
      try {
        splitRef.current?.revert();
      } catch {
        // 已由 GSAP context 还原
      }
      splitRef.current = null;
    };
  }, { scope: slideRef, dependencies: [reducedMotion], revertOnUpdate: true });

  return (
    <section className="mx-auto flex h-full max-w-site items-center px-5 py-8 sm:px-8 lg:px-12" ref={slideRef}>
      <div className="w-full">
        <header className="mb-4 flex items-end justify-between gap-6 border-b border-line pb-4 sm:mb-5 sm:pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">02 / Specialty</p>
            <h2 className="mt-3 font-display text-[clamp(2.6rem,5vw,4.75rem)] leading-[0.92] tracking-[-0.055em]" ref={titleRef}>全栈开发</h2>
          </div>
          <p className="hidden max-w-sm text-sm leading-6 text-muted sm:block">从界面到数据层，构建可持续演进的 Web 产品。</p>
        </header>

        <div className="space-y-2">
          {fullstackLayers.map((layer) => (
            <div
              className="relative flex flex-col gap-2.5 overflow-hidden rounded-2xl border border-line bg-panel px-4 py-3 sm:flex-row sm:items-center sm:gap-5"
              data-fullstack-layer
              key={layer.id}
            >
              <div className="flex shrink-0 items-baseline gap-2 sm:w-32 sm:flex-col sm:items-start sm:gap-0.5">
                <span className="font-mono text-[10px] tracking-[0.18em] text-accent">{layer.id}</span>
                <p className="font-display text-base leading-tight tracking-[-0.02em]">{layer.name}</p>
                <p className="hidden text-[11px] leading-4 text-muted sm:block">{layer.note}</p>
              </div>
              <div className="flex flex-1 flex-wrap gap-2">
                {layer.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div className="flex min-w-[8.5rem] flex-1 items-start gap-2.5 rounded-xl border border-line bg-paper px-3 py-2" data-fullstack-item key={item.name}>
                      <Icon className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.75} />
                      <div>
                        <p className="text-sm font-medium leading-tight">{item.name}</p>
                        <p className="mt-1 text-[11px] leading-4 text-muted">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <span aria-hidden="true" className="absolute inset-x-4 bottom-0 h-px origin-left bg-accent/45" data-fullstack-bar />
            </div>
          ))}

          {/* 底座：跨全部层级 */}
          <div className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-accent/40 bg-accent/[0.06] px-4 py-3 sm:gap-5" data-fullstack-layer>
            <div className="flex shrink-0 items-baseline gap-2 sm:w-32 sm:flex-col sm:items-start sm:gap-0.5">
              <span className="font-mono text-[10px] tracking-[0.18em] text-accent">BASE</span>
              <p className="font-display text-base leading-tight tracking-[-0.02em]">语言基础</p>
            </div>
            <div className="flex flex-1 items-center gap-2.5">
              <Braces className="size-4 shrink-0 text-accent" strokeWidth={1.75} />
              <p className="text-sm font-medium">{fullstackFoundation.name}</p>
              <p className="hidden text-[11px] text-muted sm:inline">{fullstackFoundation.description}· 贯穿全部层级</p>
            </div>
            <span aria-hidden="true" className="absolute inset-x-4 bottom-0 h-px origin-left bg-accent/45" data-fullstack-bar />
          </div>
        </div>
      </div>
    </section>
  );
}
