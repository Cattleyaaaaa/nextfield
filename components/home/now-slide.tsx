"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotionPreference } from "@/lib/use-motion-preference";

const NOW_SLIDE_MOTION = {
  delay: 0.32,
  ease: "power2.out",
  intro: { at: 0, y: 18, duration: 0.55 },
  groups: { at: 0.18, y: 14, duration: 0.45, stagger: 0.1 },
};

// 占位内容 —— 这一屏的维护成本很低，隔几个月改一次就行。
const nowIntro = {
  headline: "现在在做这些。",
  body: "主要在把 Agent 从能做出来推进到能长期跑：检索质量、失败恢复和成本控制是眼下最花时间的三件事。同时把手上的工程经验整理成可复用的文字。",
  updated: "最后更新 · 2026 · 09",
};

const nowGroups = [
  { label: "正在做", items: ["团队知识库 Agent 的召回优化", "内部 Agent 运行观测平台"] },
  { label: "正在深入", items: ["多 Agent 编排的失败恢复", "长上下文下的成本控制"] },
  { label: "愿意交流", items: ["Agent 产品落地", "全栈架构评审", "技术分享与内训"] },
];

export function NowSlide() {
  const reducedMotion = useMotionPreference();
  const slideRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (reducedMotion) return;

    const timeline = gsap.timeline({
      delay: NOW_SLIDE_MOTION.delay,
      defaults: { ease: NOW_SLIDE_MOTION.ease },
    });

    timeline.fromTo(
      "[data-now-intro]",
      { autoAlpha: 0, y: NOW_SLIDE_MOTION.intro.y },
      {
        autoAlpha: 1,
        y: 0,
        duration: NOW_SLIDE_MOTION.intro.duration,
        clearProps: "opacity,visibility,transform",
      },
      NOW_SLIDE_MOTION.intro.at,
    );

    timeline.fromTo(
      "[data-now-group]",
      { autoAlpha: 0, y: NOW_SLIDE_MOTION.groups.y },
      {
        autoAlpha: 1,
        y: 0,
        duration: NOW_SLIDE_MOTION.groups.duration,
        stagger: NOW_SLIDE_MOTION.groups.stagger,
        clearProps: "opacity,visibility,transform",
      },
      NOW_SLIDE_MOTION.groups.at,
    );
  }, { scope: slideRef, dependencies: [reducedMotion], revertOnUpdate: true });

  return (
    <section className="mx-auto flex h-full max-w-site items-center px-5 py-8 sm:px-8 lg:px-12" ref={slideRef}>
      <div className="w-full">
        <div className="grid gap-8 border-y border-line py-8 lg:grid-cols-12 lg:gap-10 lg:py-12">
          <div className="lg:col-span-7" data-now-intro>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">04 / Now</p>
            <h2 className="mt-4 max-w-2xl font-display text-[clamp(2.4rem,4.6vw,4.25rem)] leading-[0.94] tracking-[-0.055em]">
              {nowIntro.headline}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-muted sm:text-lg sm:leading-9">{nowIntro.body}</p>
            <p className="mt-7 font-mono text-xs tracking-[0.06em] text-accent">{nowIntro.updated}</p>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-5 lg:pt-2">
            {nowGroups.map((group) => (
              <div data-now-group key={group.label}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">{group.label}</p>
                <ul className="mt-2.5 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li className="rounded-full border border-line bg-panel px-3 py-1.5 text-xs text-ink" key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
