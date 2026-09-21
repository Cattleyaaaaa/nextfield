"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AmbientGlow } from "@/components/visual/ambient-glow";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { useMotionPreference } from "@/lib/use-motion-preference";
import { siteConfig } from "@/site.config";

const HERO_TITLE_ANIMATION = {
  startDelay: 420,
  y: 30,
  blur: "7px",
  duration: 0.72,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function Hero({ onExplore, onContact }: { onExplore?: () => void; onContact?: () => void }) {
  const reducedMotion = useMotionPreference();
  const [titleReady, setTitleReady] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setTitleReady(true);
      return;
    }
    const timer = window.setTimeout(() => setTitleReady(true), HERO_TITLE_ANIMATION.startDelay);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  return (
    <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
      <AmbientGlow />
      <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-site flex-col justify-between px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
        <Stagger className="grid gap-10 lg:grid-cols-12">
          <StaggerItem className="lg:col-span-5">
            <p className="max-w-sm text-sm leading-6 text-muted">
              专注于 Agent 开发、AI 应用与全栈产品构建，把复杂能力转化为稳定、自然的用户体验。
            </p>
          </StaggerItem>
          <StaggerItem className="flex gap-10 text-[11px] uppercase leading-5 tracking-[0.18em] text-muted lg:col-span-4 lg:col-start-9 lg:justify-end">
            <p>Based in<br /><span className="text-ink">{siteConfig.location}</span></p>
            <p>Focus<br /><span className="text-ink">AI / Web</span></p>
          </StaggerItem>
        </Stagger>

        <Stagger className="my-16 sm:my-24">
          <StaggerItem>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-accent">Agent development / Full-stack engineering</p>
          </StaggerItem>
          {reducedMotion ? (
            <h1 className="max-w-6xl text-balance font-display text-[clamp(3.5rem,9vw,7.8rem)] leading-[0.88] tracking-[-0.065em]">
              {siteConfig.statement}
            </h1>
          ) : (
            <motion.h1
              animate={titleReady ? "visible" : "hidden"}
              className="max-w-6xl text-balance font-display text-[clamp(3.5rem,9vw,7.8rem)] leading-[0.88] tracking-[-0.065em]"
              initial="hidden"
              transition={{ duration: HERO_TITLE_ANIMATION.duration, ease: HERO_TITLE_ANIMATION.ease }}
              variants={{
                hidden: { opacity: 0, y: HERO_TITLE_ANIMATION.y, filter: `blur(${HERO_TITLE_ANIMATION.blur})` },
                visible: { opacity: 1, y: 0, filter: "blur(0px)" },
              }}
            >
              {siteConfig.statement}
            </motion.h1>
          )}
          <StaggerItem>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <button className="group inline-flex items-center gap-3 rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-accent hover:text-white" onClick={onExplore} type="button">
                探索方向
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>
              <button className="link-line text-sm text-muted hover:text-ink" onClick={onContact} type="button">联系我</button>
            </div>
          </StaggerItem>
        </Stagger>

        <Stagger className="grid items-end gap-8 border-t border-line pt-6 sm:grid-cols-2">
          <StaggerItem>
            <p className="font-display text-xl italic text-muted sm:text-2xl">设计 Agent，也把产品做完整。</p>
          </StaggerItem>
          <StaggerItem className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted sm:justify-end">
            向下探索 <ArrowDownRight className="size-4 text-accent" />
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}
