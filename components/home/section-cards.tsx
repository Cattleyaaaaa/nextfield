"use client";

import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { TransitionLink } from "@/components/site/transition-link";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotionPreference } from "@/lib/use-motion-preference";
import { navSections } from "@/lib/nav";

// 板块卡片：对应 gsap.com 的 Tools 区，但内容是本站的五个入口。
export function SectionCards() {
  const reducedMotion = useMotionPreference();
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const cards = gsap.utils.toArray<HTMLElement>("[data-section-card]");
    if (reducedMotion || cards.length === 0) return;

    gsap.fromTo(
      cards,
      { autoAlpha: 0, y: 30 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.09,
        scrollTrigger: { trigger: rootRef.current, start: "top 82%", once: true },
      },
    );
  }, { scope: rootRef, dependencies: [reducedMotion] });

  return (
    <section className="mx-auto max-w-site px-5 py-24 sm:px-8 lg:px-12" ref={rootRef}>
      <div className="flex items-baseline justify-between gap-6 border-b border-line pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Fragments / 片段</p>
        <p className="text-xs tracking-[0.06em] text-muted">{navSections.length} 个入口</p>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {navSections.map((section) => (
          <li data-section-card key={section.href}>
            <TransitionLink
              className="group flex h-full flex-col rounded-3xl border border-line bg-panel p-6 transition-colors duration-300 hover:border-accent"
              href={section.href}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-[0.12em] text-accent">№ {section.number}</span>
                <ArrowUpRight className="size-4 text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
              </div>
              <h2 className="mt-10 font-display text-3xl leading-none tracking-[-0.04em] transition-colors duration-300 group-hover:text-accent">
                {section.label}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">{section.description}</p>
              <span className="mt-6 font-mono text-[11px] text-muted">{section.href}</span>
            </TransitionLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
