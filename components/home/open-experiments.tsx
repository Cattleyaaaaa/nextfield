"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, Magnet, Rotate3D, SlidersHorizontal, Sparkles } from "lucide-react";
import ParticleText from "@/components/ParticleText";
import { TiltSurface } from "@/components/motion/tilt-surface";
import { TransitionLink } from "@/components/site/transition-link";
import { useMotionPreference } from "@/lib/use-motion-preference";

/**
 * 磁性文字：指针靠近时字母被抬起并放大，越近越明显。
 * 字母中心只在进入时量一次（pointermove 里逐个 getBoundingClientRect 太贵），
 * 之后每帧只读缓存的中心点。
 */
function MagneticType() {
  const reducedMotion = useMotionPreference();
  const wordRef = useRef<HTMLDivElement>(null);
  const centersRef = useRef<number[]>([]);

  const measure = () => {
    const word = wordRef.current;
    if (!word) return;
    centersRef.current = Array.from(word.children).map((child) => {
      const rect = child.getBoundingClientRect();
      return rect.left + rect.width / 2;
    });
  };

  const apply = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    if (centersRef.current.length === 0) measure();
    const word = wordRef.current;
    if (!word) return;
    Array.from(word.children).forEach((child, index) => {
      const center = centersRef.current[index];
      if (typeof center !== "number") return;
      const pull = Math.max(0, 1 - Math.abs(event.clientX - center) / 150);
      const element = child as HTMLElement;
      element.style.transform = `translateY(${-20 * pull}px) scale(${1 + 0.18 * pull})`;
      element.style.opacity = String(0.5 + 0.5 * pull);
    });
  };

  const reset = () => {
    centersRef.current = [];
    const word = wordRef.current;
    if (!word) return;
    Array.from(word.children).forEach((child) => {
      const element = child as HTMLElement;
      element.style.transform = "";
      element.style.opacity = "";
    });
  };

  return (
    <article
      className="relative min-h-[15rem] overflow-hidden rounded-[1.75rem] border border-line bg-panel p-6 lg:col-span-3"
      onPointerEnter={measure}
      onPointerLeave={reset}
      onPointerMove={apply}
    >
      <div className="flex items-center gap-2">
        <Magnet className="size-5 text-accent" />
        <h3 className="font-display text-2xl">Magnetic Type</h3>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Type / pointer</span>
      </div>
      <p className="mt-2 max-w-xl text-xs leading-5 text-muted">指针从左到右掠过，字母会被抬起并放大——距离越近，反应越强。移除指针后回到静止。</p>
      <div className="mt-8 flex flex-wrap items-baseline font-display text-[clamp(2.25rem,7vw,4.5rem)] leading-none tracking-[-0.04em]" ref={wordRef}>
        {"MAGNETIC".split("").map((char, index) => (
          <span className="inline-block origin-bottom px-[0.01em] transition-[transform,opacity] duration-200 ease-out" key={`${char}-${index}`}>{char}</span>
        ))}
      </div>
    </article>
  );
}

export function OpenExperiments({ compact = false }: { compact?: boolean }) {
  const [signal, setSignal] = useState(46);

  return (
    <section className={compact ? "" : "mx-auto max-w-site px-5 py-24 sm:px-8 lg:px-12"}>
      {!compact ? <div className="grid gap-7 lg:grid-cols-12 lg:items-end"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent lg:col-span-3">Open experiments / 04</p><h2 className="font-display text-[clamp(3rem,6vw,6rem)] leading-[0.88] tracking-[-0.06em] lg:col-span-6">TOUCH.<br />TUNE. REPLAY.</h2><p className="max-w-sm text-sm leading-6 text-muted lg:col-span-3">可以被触碰的小型研究：文字、空间与界面反馈如何产生感觉。</p></div> : null}
      <div className={`${compact ? "" : "mt-12"} grid gap-4 lg:grid-cols-3`}>
        <article className="group relative min-h-[24rem] overflow-hidden rounded-[1.75rem] border border-line bg-ink text-paper">
          <ParticleText className="absolute inset-0" color="#9de5e2" density={5} fontSize="5rem" highlightColor="#ffffff" pointerRepel={58} text="NEXT" trigger="click" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/80 to-transparent p-6 pt-20"><Sparkles className="size-5 text-liquid-foam" /><h3 className="mt-4 font-display text-3xl">Particle Type</h3><p className="mt-2 text-xs leading-5 text-paper/60">移动指针扰动文字，点击让粒子重新集合。</p></div>
        </article>
        <article className="relative flex min-h-[24rem] flex-col overflow-hidden rounded-[1.75rem] border border-line bg-panel p-6">
          <div className="absolute inset-0 opacity-70" style={{ backgroundImage: `radial-gradient(circle at 50% 42%, rgb(var(--accent) / ${signal / 150}), transparent ${74 - signal / 2}%), linear-gradient(${110 + signal}deg, transparent 35%, rgb(var(--liquid-foam) / .35), transparent 65%)` }} />
          <SlidersHorizontal className="relative size-5 text-accent" />
          <div className="relative my-auto grid place-items-center"><span className="grid size-40 place-items-center rounded-full border border-accent/30" style={{ transform: `rotate(${signal * 1.8}deg) scale(${0.8 + signal / 250})` }}><span className="size-16 rounded-[40%_60%_55%_45%] bg-accent shadow-[0_0_55px_rgb(var(--accent)/0.42)]" /></span></div>
          <div className="relative"><div className="flex items-center justify-between"><h3 className="font-display text-3xl">Signal Dial</h3><span className="font-mono text-xs text-accent">{signal}%</span></div><input aria-label="调整信号强度" className="radio-volume mt-5 w-full" max="100" min="0" onChange={(event) => setSignal(Number(event.target.value))} type="range" value={signal} /></div>
        </article>
        <TiltSurface className="min-h-[24rem] overflow-hidden rounded-[1.75rem] border border-line bg-[linear-gradient(145deg,rgb(var(--liquid-deep)),rgb(var(--liquid-mid)))] p-6 text-paper" maxTilt={8}>
          <div className="flex h-full min-h-[21rem] flex-col" data-tilt-depth="34"><Rotate3D className="size-5 text-liquid-foam" /><div className="my-auto grid place-items-center"><span className="grid size-36 rotate-12 place-items-center rounded-3xl border border-paper/25 bg-paper/10 shadow-2xl backdrop-blur"><span className="font-display text-5xl">3D</span></span></div>          <h3 className="font-display text-3xl">Depth Study</h3><p className="mt-2 text-xs leading-5 text-paper/60">移动指针，观察平面如何产生空间层次。</p></div>
        </TiltSurface>
        <MagneticType />
      </div>
      {!compact ? <TransitionLink className="mt-8 inline-flex items-center gap-2 text-sm text-muted hover:text-accent" href="/gallery">进入完整实验室 <ArrowUpRight className="size-4" /></TransitionLink> : null}
    </section>
  );
}
