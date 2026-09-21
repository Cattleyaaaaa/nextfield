"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotionPreference } from "@/lib/use-motion-preference";

export const PROJECTS_INTRO_MOTION = {
  delay: 0.12,
  ease: "power3.out",
  eyebrow: { y: 12, duration: 0.5 },
  title: { yPercent: 112, duration: 0.9, stagger: 0.1 },
  description: { y: 18, duration: 0.65 },
  rule: { duration: 0.85 },
};

const TITLE_LINES = ["把想法，", "做成产品。"];

export function ProjectsIntro() {
  const reducedMotion = useMotionPreference();
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (reducedMotion) return;

    const timeline = gsap.timeline({
      delay: PROJECTS_INTRO_MOTION.delay,
      defaults: { ease: PROJECTS_INTRO_MOTION.ease },
    });

    timeline.fromTo(
      "[data-projects-eyebrow]",
      { autoAlpha: 0, y: PROJECTS_INTRO_MOTION.eyebrow.y },
      {
        autoAlpha: 1,
        y: 0,
        duration: PROJECTS_INTRO_MOTION.eyebrow.duration,
        clearProps: "opacity,visibility,transform",
      },
      0,
    );

    timeline.fromTo(
      "[data-projects-title-line]",
      { yPercent: PROJECTS_INTRO_MOTION.title.yPercent },
      {
        yPercent: 0,
        duration: PROJECTS_INTRO_MOTION.title.duration,
        stagger: PROJECTS_INTRO_MOTION.title.stagger,
        clearProps: "transform",
      },
      0.08,
    );

    timeline.fromTo(
      "[data-projects-description]",
      { autoAlpha: 0, y: PROJECTS_INTRO_MOTION.description.y },
      {
        autoAlpha: 1,
        y: 0,
        duration: PROJECTS_INTRO_MOTION.description.duration,
        clearProps: "opacity,visibility,transform",
      },
      0.34,
    );

    timeline.fromTo(
      "[data-projects-rule]",
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: PROJECTS_INTRO_MOTION.rule.duration,
        clearProps: "transform",
      },
      0.22,
    );
  }, { scope: rootRef, dependencies: [reducedMotion], revertOnUpdate: true });

  return (
    <div className="relative flex items-baseline justify-between gap-6 pb-10" ref={rootRef}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent" data-projects-eyebrow>
          Projects / Selected work
        </p>
        <h1 className="mt-6 max-w-4xl text-balance font-display text-[clamp(3rem,7vw,6rem)] leading-[0.95] tracking-[-0.06em]">
          {TITLE_LINES.map((line) => (
            <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]" key={line}>
              <span className="block" data-projects-title-line>{line}</span>
            </span>
          ))}
        </h1>
      </div>
      <p className="hidden max-w-sm text-sm leading-6 text-muted sm:block" data-projects-description>
        以下为可直接替换链接、描述和技术标签的作品占位内容。
      </p>
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px origin-left bg-line" data-projects-rule />
    </div>
  );
}
