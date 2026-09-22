"use client";

import { useRef } from "react";
import { ArrowUpRight, Bot, Braces, Database } from "lucide-react";
import { TransitionLink } from "@/components/site/transition-link";
import { GlareHover } from "@/components/react-bits/glare-hover";
import { TiltSurface } from "@/components/motion/tilt-surface";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useMotionPreference } from "@/lib/use-motion-preference";

export const ZENTRY_HOME_MOTION = {
  hero: { duration: 0.9, stagger: 0.08, y: 34, ease: "power4.out" },
  stage: { end: "+=125%", scrub: 0.75 },
  cards: { y: 42, duration: 0.7, stagger: 0.1, start: "top 84%", ease: "power3.out" },
};

const INDEX_SECTIONS = [
  {
    id: "01",
    label: "Selected work",
    detail: "Agent 工作台、运行观测与语义检索，记录从问题到产品的过程。",
    icon: Bot,
    href: "/projects",
  },
  {
    id: "02",
    label: "Field notes",
    detail: "仍在生长的观点、技术取舍、过程记录与可以被复用的方法。",
    icon: Braces,
    href: "/blog",
  },
  {
    id: "03",
    label: "Open experiments",
    detail: "触碰文字、空间与信号，把尚未命名的想法做成可以操作的原型。",
    icon: Database,
    href: "/gallery",
  },
];

function OrbitalVisual() {
  return (
    <TiltSurface aria-hidden="true" className="relative aspect-[1.08/1] overflow-hidden rounded-[2rem] border border-line bg-[radial-gradient(circle_at_65%_28%,rgb(var(--liquid-foam)/0.72),transparent_18%),radial-gradient(circle_at_35%_76%,rgb(var(--accent)/0.2),transparent_38%),linear-gradient(140deg,rgb(var(--panel)),rgb(var(--paper)))] shadow-[0_30px_80px_rgb(var(--liquid-deep)/0.12)]" lift={4} maxTilt={5}>
      <span className="absolute left-[7%] top-[8%] font-mono text-[10px] tracking-[0.22em] text-muted" data-tilt-depth="18">SPACE / OPEN</span>
      <span className="absolute right-[8%] top-[9%] grid size-8 place-items-center rounded-full border border-accent/40 bg-paper/75 text-[10px] text-accent" data-tilt-depth="26">01</span>
      <div className="absolute left-1/2 top-1/2 size-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/25" data-tilt-depth="26" data-zentry-orbit-a />
      <div className="absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-line" data-tilt-depth="12" data-zentry-orbit-b />
      <div className="absolute left-1/2 top-1/2 size-[33%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_32%_28%,white_0%,rgb(var(--liquid-foam))_18%,rgb(var(--accent))_56%,rgb(var(--liquid-deep))_100%)] shadow-[0_0_80px_rgb(var(--accent)/0.35)]" data-tilt-depth="52" data-zentry-core />
      <span className="absolute left-[19%] top-[31%] size-3 rounded-full bg-accent shadow-[0_0_24px_rgb(var(--accent))]" data-tilt-depth="42" data-zentry-node />
      <span className="absolute bottom-[19%] right-[19%] size-2.5 rounded-full bg-liquid-foam shadow-[0_0_20px_rgb(var(--liquid-foam))]" data-tilt-depth="34" data-zentry-node />
      <span className="absolute bottom-[9%] left-[8%] font-mono text-[10px] tracking-[0.18em] text-muted" data-tilt-depth="18">IDEAS / WORK / ARCHIVE</span>
    </TiltSurface>
  );
}

export function ZentryHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useMotionPreference();

  useGSAP(() => {
    if (reducedMotion) return;

    const intro = gsap.timeline({ defaults: { ease: ZENTRY_HOME_MOTION.hero.ease } });
    intro
      .fromTo("[data-zentry-hero-kicker]", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5 })
      .fromTo(
        "[data-zentry-hero-line]",
        { autoAlpha: 0, yPercent: ZENTRY_HOME_MOTION.hero.y },
        { autoAlpha: 1, yPercent: 0, duration: ZENTRY_HOME_MOTION.hero.duration, stagger: ZENTRY_HOME_MOTION.hero.stagger },
        "<0.06",
      )
      .fromTo("[data-zentry-hero-meta]", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.1 }, "<-0.25");

    const stage = rootRef.current?.querySelector<HTMLElement>("[data-zentry-stage]");
    if (stage) {
      const stageTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: ZENTRY_HOME_MOTION.stage.end,
          scrub: ZENTRY_HOME_MOTION.stage.scrub,
          pin: true,
        },
        defaults: { ease: "none" },
      });

      stageTimeline
        .to("[data-zentry-stage-title]", { yPercent: -18, scale: 0.91 }, 0)
        .to("[data-zentry-orbit-a]", { rotation: 135, scale: 1.22 }, 0)
        .to("[data-zentry-orbit-b]", { rotation: -95, scale: 0.86 }, 0)
        .to("[data-zentry-core]", { scale: 1.32, rotation: 42 }, 0)
        .to("[data-zentry-node]", { x: (index: number) => (index ? -62 : 70), y: (index: number) => (index ? -38 : 48) }, 0)
        .fromTo("[data-zentry-stage-copy]", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.34 }, 0.2)
        .to("[data-zentry-stage-copy]", { autoAlpha: 0, y: -20, duration: 0.28 }, 0.62);
    }

    const cards = gsap.utils.toArray<HTMLElement>("[data-zentry-card]");
    ScrollTrigger.batch(cards, {
      start: ZENTRY_HOME_MOTION.cards.start,
      once: true,
      onEnter: (batch) => gsap.fromTo(
        batch,
        { autoAlpha: 0, y: ZENTRY_HOME_MOTION.cards.y },
        { autoAlpha: 1, y: 0, duration: ZENTRY_HOME_MOTION.cards.duration, stagger: ZENTRY_HOME_MOTION.cards.stagger, ease: ZENTRY_HOME_MOTION.cards.ease, clearProps: "opacity,visibility,transform" },
      ),
    });

  }, { scope: rootRef, dependencies: [reducedMotion], revertOnUpdate: true });

  return (
    <div className="relative isolate overflow-hidden" ref={rootRef}>
      <section className="relative mx-auto min-h-[82svh] max-w-site px-5 pb-10 pt-8 sm:px-8 lg:px-12">
        <div className="absolute inset-x-0 top-0 -z-10 h-[78%] bg-[radial-gradient(ellipse_56%_52%_at_78%_32%,rgb(var(--liquid-foam)/0.32),transparent_68%),radial-gradient(ellipse_48%_40%_at_5%_95%,rgb(var(--accent)/0.14),transparent_72%)]" />
        <div className="flex items-center justify-between border-b border-line pb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted" data-zentry-hero-kicker>
          <span>Now / live signal</span><span>Updated / Sep 2026</span>
        </div>
        <div className="grid min-h-[calc(82svh-6rem)] items-center gap-10 py-12 lg:grid-cols-[1.14fr_0.86fr] lg:py-16">
          <div>
            <p className="mb-6 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent" data-zentry-hero-meta><span className="size-2 animate-pulse rounded-full bg-accent" /> CURRENTLY BUILDING / 02</p>
            <h2 className="font-display text-[clamp(3.8rem,8.8vw,8.6rem)] leading-[0.79] tracking-[-0.075em] text-ink">
              {[["AGENT-NATIVE", "AGENT-NATIVE"], ["INTERFACES", "INTERFACES"], ["THAT FEEL", "THAT FEEL"], ["NATURAL.", "NATURAL."]].map(([label, text]) => (
                <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]" key={label}><span className="block" data-zentry-hero-line>{text}</span></span>
              ))}
            </h2>
            <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3" data-zentry-hero-meta>
              {[['FOCUS', 'Agent products'], ['STATUS', 'Open to ideas'], ['BASED', 'NanChang']].map(([label, value]) => <div className="border-t border-line pt-3" key={label}><span className="font-mono text-[9px] tracking-[0.18em] text-muted">{label}</span><p className="mt-1 text-sm text-ink">{value}</p></div>)}
            </div>
          </div>
          <div className="mx-auto w-full max-w-[34rem]" data-zentry-hero-meta><OrbitalVisual /></div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-line bg-ink text-paper" data-zentry-stage>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_45%,rgb(var(--liquid-mid)/0.8),transparent_32%),radial-gradient(circle_at_12%_88%,rgb(var(--accent)/0.35),transparent_38%)]" />
        <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-site flex-col justify-between px-5 py-10 sm:px-8 lg:px-12">
          <div className="flex justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-paper/55"><span>Room for new work</span><span>Scroll to explore</span></div>
          <div className="grid items-end gap-10 lg:grid-cols-[1fr_0.72fr]" data-zentry-stage-title>
            <h2 className="max-w-5xl font-display text-[clamp(3.8rem,10vw,9.5rem)] leading-[0.8] tracking-[-0.075em]">IDEAS<br /><span className="text-liquid-foam">IN MOTION.</span></h2>
            <p className="max-w-sm text-base leading-7 text-paper/72 sm:text-lg sm:leading-8">首页不承担个人介绍，而是一张会持续生长的地图：新的内容可以从任何一个节点进入。</p>
          </div>
          <div className="absolute bottom-[18%] right-[9%] max-w-xs rounded-2xl border border-paper/20 bg-paper/10 p-5 backdrop-blur" data-zentry-stage-copy>
            <p className="font-mono text-[10px] tracking-[0.18em] text-liquid-foam">FIELD / 03</p><p className="mt-3 text-sm leading-6 text-paper/80">项目、笔记与实验会在这里不断增加，也可以随时重新编排。</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-site px-5 py-24 sm:px-8 lg:px-12">
        <div className="grid gap-8 border-b border-line pb-10 lg:grid-cols-12 lg:items-end">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent lg:col-span-3">Index / open sections</p>
          <h2 className="font-display text-[clamp(3rem,6vw,6rem)] leading-[0.88] tracking-[-0.06em] lg:col-span-7">THREE WAYS<br />INTO THE FIELD.</h2>
          <p className="max-w-sm text-sm leading-6 text-muted lg:col-span-2">从作品、笔记或实验进入，同一个实践的不同切面。</p>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {INDEX_SECTIONS.map((track, index) => {
            const Icon = track.icon;
            return <div data-zentry-card key={track.id}>
              <TiltSurface className="h-full rounded-[1.7rem]" maxTilt={4.5}>
                <GlareHover className="h-full overflow-hidden rounded-[1.7rem]" glareColor="rgb(var(--liquid-foam) / 0.22)">
                  <TransitionLink className={`group flex h-full min-h-[23rem] flex-col rounded-[1.7rem] border border-line p-6 ${index === 1 ? "bg-ink text-paper" : "bg-panel"}`} href={track.href}>
                    <div className="flex items-start justify-between" data-tilt-depth="24"><span className={`font-mono text-[11px] tracking-[0.18em] ${index === 1 ? "text-liquid-foam" : "text-accent"}`}>{track.id}</span><ArrowUpRight className={`size-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 ${index === 1 ? "text-paper/60" : "text-muted"}`} /></div>
                    <div className="mt-auto" data-tilt-depth="34"><Icon className={`mb-8 size-8 ${index === 1 ? "text-liquid-foam" : "text-accent"}`} strokeWidth={1.3} /><h3 className="font-display text-4xl leading-[0.9] tracking-[-0.05em]">{track.label}</h3><p className={`mt-4 max-w-xs text-sm leading-6 ${index === 1 ? "text-paper/65" : "text-muted"}`}>{track.detail}</p></div>
                  </TransitionLink>
                </GlareHover>
              </TiltSurface>
            </div>;
          })}
        </div>
      </section>

    </div>
  );
}
