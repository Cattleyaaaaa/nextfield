"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotionPreference } from "@/lib/use-motion-preference";

// 滚动逐字点亮：ScrubTrigger 把「字从灰到墨」映射到滚动进度上，
// 手法来自 gsap.com 的 Why 区块，文案是自己的。
const REVEAL_TEXT =
  "我把大语言模型、检索系统、工具调用与产品体验连接起来，构建可以落地、可以长期跑的 AI 应用——从界面、服务端、数据到部署，每一环都在自己手上。";

export function ScrollReveal() {
  const reducedMotion = useMotionPreference();
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const chars = gsap.utils.toArray<HTMLElement>("[data-reveal-char]");
    if (reducedMotion || chars.length === 0) return;

    gsap.fromTo(
      chars,
      { opacity: 0.14 },
      {
        opacity: 1,
        duration: 1,
        ease: "none",
        stagger: 0.06,
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 82%",
          // 固定 560px 的滚动距离：整段文字在约半屏滚动里逐字点亮。
          // 若按区块自身高度算，区块矮时滚动区间会短到一晃而过。
          end: "+=560",
          scrub: 0.5,
        },
      },
    );
  }, { scope: rootRef, dependencies: [reducedMotion] });

  return (
    <section className="mx-auto max-w-site px-5 py-24 sm:px-8 lg:px-12">
      <div ref={rootRef}>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Why this site</p>
        <p className="mt-8 max-w-4xl font-display text-[clamp(1.6rem,3.4vw,2.8rem)] leading-[1.45] tracking-[-0.03em] text-ink">
          {REVEAL_TEXT.split("").map((char, index) => (
            <span data-reveal-char key={index}>
              {char}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
