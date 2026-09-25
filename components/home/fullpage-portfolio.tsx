"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMotionPreference } from "@/lib/use-motion-preference";
import { ArrowDown, ArrowUpRight, ChevronDown, Github, MousePointer2 } from "lucide-react";
import { useTheme } from "next-themes";
import { type TouchEvent, useCallback, useEffect, useRef, useState } from "react";
import { Hero } from "@/components/home/hero";
import { IntroSlide } from "@/components/home/intro-slide";
import PixelSwap from "@/components/visual/PixelSwap";
import { BlurText } from "@/components/react-bits/blur-text";
import { ShinyText } from "@/components/react-bits/shiny-text";
import SpecularButton from "@/components/visual/SpecularButton";
import { AmbientParticles } from "@/components/visual/ambient-particles";
import { AgentSlide } from "@/components/home/agent-slide";
import { FullStackSlide } from "@/components/home/fullstack-slide";
import { NowSlide } from "@/components/home/now-slide";
import { WritingSlide } from "@/components/home/writing-slide";
import { siteConfig } from "@/site.config";
import { useLanguage } from "@/components/site/language-provider";
import { gsap, useGSAP } from "@/lib/gsap";
import type { PostMeta } from "@/types/post";

const slides = ["intro", "hero", "profile", "agent", "fullstack", "writing", "now", "contact"] as const;
type SlideName = (typeof slides)[number];

const labels: Record<SlideName, string> = {
  intro: "序幕",
  hero: "首页",
  profile: "简介",
  agent: "Agent 开发",
  fullstack: "全栈开发",
  writing: "写作",
  now: "近况",
  contact: "联系",
};

const PROFILE_PIXEL_SWAP_CONFIG = {
  pixelSize: 84,
  gap: 0,
  pixelRadius: 8,
  pixelSpin: 0,
  pixelScale: 0.35,
  duration: 1100,
  pixelDuration: 360,
  pattern: "random" as const,
  randomness: 0.24,
  fade: true,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  trigger: "click" as const,
};

const CONTACT_SLIDE_REVEAL_CONFIG = {
  y: 20,
  duration: 0.6,
  stagger: 0.14,
  delay: 0.32,
  ease: "power2.out",
};

// 面板顶边在入场时从中心向两侧画出来，营造「卡片成形」的观感。
const CONTACT_PANEL_RULE_CONFIG = {
  duration: 0.7,
  at: 0,
};

// 标题交给 React Bits BlurText：中文没有空格，按字拆分才有错落感。
const CONTACT_TITLE_CONFIG = {
  text: "有想做的产品？\n一起把它落地。",
  delay: 45,
  at: 0.04,
};

// 联系按钮沿用顶栏那套高光按钮（会额外占 1 个 WebGL 上下文，已确认接受）。
const CONTACT_SPECULAR_CONFIG = {
  size: "md" as const,
  radius: 24,
  tint: "#ffffff",
  tintOpacity: 0,
  blur: 0,
  textColor: "rgb(var(--paper))",
  intensity: 2.2,
  shineSize: 22,
  shineFade: 44,
  thickness: 1.75,
  speed: 0.35,
  followMouse: true,
  proximity: 420,
  autoAnimate: false,
};

const CONTACT_SPECULAR_COLORS = {
  light: { lineColor: "#2a97a5", baseColor: "#9cbfc3" },
  dark: { lineColor: "#a1e6df", baseColor: "#4b7981" },
};

const PROFILE_SWAP_LAYOUT = {
  heightClass: "min-h-[24rem] sm:min-h-[22rem]",
  shellClass: "flex h-full flex-col justify-between py-1",
  eyebrowClass: "text-xs font-semibold uppercase tracking-[0.22em] text-accent",
  titleClass: "text-balance font-display text-[clamp(2.7rem,5vw,5rem)] leading-[0.92] tracking-[-0.055em]",
  bodyClass: "mt-7 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8",
  hintClass: "text-xs font-semibold uppercase tracking-[0.2em] text-accent",
};

export function FullpagePortfolio({ posts }: { posts: PostMeta[] }) {
  const reducedMotion = useMotionPreference();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [transitionCount, setTransitionCount] = useState(0);
  const lockedRef = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const initialNavigationHandled = useRef(false);

  useEffect(() => {
    if (reducedMotion) return;
    document.documentElement.dataset.fullpage = "true";
    return () => {
      delete document.documentElement.dataset.fullpage;
    };
  }, [reducedMotion]);

  const goTo = useCallback((nextIndex: number) => {
    const boundedIndex = Math.max(0, Math.min(slides.length - 1, nextIndex));
    if (boundedIndex === activeIndex || lockedRef.current) return;
    lockedRef.current = true;
    setDirection(boundedIndex > activeIndex ? 1 : -1);
    setActiveIndex(boundedIndex);
    setTransitionCount((count) => count + 1);
    window.setTimeout(() => {
      lockedRef.current = false;
    }, 780);
  }, [activeIndex]);

  // 顶栏已改为直接跳路由（/about /projects /blog），所以这里的
  // portfolio-nav-to-slide 事件与 sessionStorage 兜底都删掉了；
  // 只保留「用 hash 落到某一屏」的能力，例如 /about#writing。
  useEffect(() => {
    if (initialNavigationHandled.current) return;
    initialNavigationHandled.current = true;
    const target = window.location.hash.slice(1);
    const index = slides.findIndex((name) => name === target);
    if (index < 0) return;
    if (reducedMotion) document.getElementById(target)?.scrollIntoView({ behavior: "auto" });
    else goTo(index);
  }, [goTo, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 16) return;
      event.preventDefault();
      goTo(activeIndex + (event.deltaY > 0 ? 1 : -1));
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        goTo(activeIndex + 1);
      }
      if (["ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        goTo(activeIndex - 1);
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, goTo, reducedMotion]);

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartY.current = event.touches[0]?.clientY ?? null;
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (reducedMotion || touchStartY.current === null) return;
    const distance = touchStartY.current - (event.changedTouches[0]?.clientY ?? touchStartY.current);
    touchStartY.current = null;
    if (Math.abs(distance) >= 48) goTo(activeIndex + (distance > 0 ? 1 : -1));
  };

  if (reducedMotion) {
    return <ReducedMotionPortfolio posts={posts} />;
  }

  const activeSlide = slides[activeIndex];
  return (
    <div className="relative isolate h-[calc(100svh-4rem)] overflow-hidden" onTouchEnd={onTouchEnd} onTouchStart={onTouchStart}>
      {activeSlide !== "intro" && <AmbientParticles />}
      <AnimatePresence custom={direction} initial={false} mode="wait">
        <motion.section
          animate="center"
          className="absolute inset-0 z-10"
          custom={direction}
          exit="exit"
          initial="enter"
          key={activeSlide}
          transition={{ duration: 0.36, ease: [0.65, 0, 0.25, 1] }}
          variants={{
            enter: (step: number) => ({ opacity: 0, scale: 0.985, y: step > 0 ? 52 : -52, filter: "blur(8px)" }),
            center: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" },
            exit: (step: number) => ({ opacity: 0, scale: 0.97, y: step > 0 ? -34 : 34, filter: "blur(5px)" }),
          }}
        >
          <SlideContent posts={posts} slide={activeSlide} goTo={goTo} />
        </motion.section>
      </AnimatePresence>

      {transitionCount > 0 && <motion.div
        animate={{ y: ["112%", "4%", "-112%"], opacity: [0, 0.58, 0] }}
        className="pointer-events-none absolute inset-x-[-15%] bottom-[-12%] z-20 h-[128%] rounded-t-[48%] bg-liquid-mid/40"
        key={transitionCount}
        transition={{ duration: 0.72, ease: [0.65, 0, 0.25, 1] }}
      />}

      <nav aria-label="首页分页" className="absolute right-5 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-3 sm:right-8">
        {slides.map((slide, index) => (
          <button
            aria-label={`跳转至${labels[slide]}`}
            aria-current={activeIndex === index ? "step" : undefined}
            className="group flex items-center justify-end gap-3"
            key={slide}
            onClick={() => goTo(index)}
            type="button"
          >
            <span className={`hidden text-[10px] uppercase tracking-[0.18em] transition-opacity sm:block ${activeIndex === index ? "opacity-100 text-ink" : "opacity-0 text-muted group-hover:opacity-100"}`}>{labels[slide]}</span>
            <span className={`block rounded-full transition-all duration-300 ${activeIndex === index ? "h-7 w-1.5 bg-accent" : "size-1.5 bg-line group-hover:bg-muted"}`} />
          </button>
        ))}
      </nav>

      {activeIndex < slides.length - 1 && (
        <button className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted hover:text-accent" onClick={() => goTo(activeIndex + 1)} type="button">
          <MousePointer2 className="size-3" /> {activeSlide === "intro" ? "向下探索" : "向下切换"} <ChevronDown className="size-3" />
        </button>
      )}
    </div>
  );
}

function SlideContent({ slide, goTo, posts }: { slide: SlideName; goTo: (index: number) => void; posts: PostMeta[] }) {
  if (slide === "intro") return <IntroSlide />;
  if (slide === "hero") return <Hero onContact={() => goTo(slides.indexOf("contact"))} onExplore={() => goTo(slides.indexOf("profile"))} />;
  if (slide === "profile") return <ProfileSlide onNext={() => goTo(slides.indexOf("agent"))} />;
  if (slide === "agent") return <AgentSlide />;
  if (slide === "fullstack") return <FullStackSlide />;
  if (slide === "writing") return <WritingSlide posts={posts} />;
  if (slide === "now") return <NowSlide />;
  return <ContactSlide />;
}

function ProfileSlide({ onNext }: { onNext: () => void }) {
  return (
    <div className="mx-auto flex h-full max-w-site items-center px-5 sm:px-8 lg:px-12">
      <div className="grid w-full gap-10 border-y border-line py-10 lg:grid-cols-12 lg:items-end lg:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent lg:col-span-3">Profile / Overview</p>
        <div className="lg:col-span-7">
          <PixelSwap
            {...PROFILE_PIXEL_SWAP_CONFIG}
            aspectRatio="auto"
            className={PROFILE_SWAP_LAYOUT.heightClass}
            firstContent={<ProfileOverview />}
            secondContent={<ProfileDetail />}
          />
        </div>
        <div className="lg:col-span-2 lg:pb-1"><button className="group inline-flex items-center gap-2 text-sm font-medium hover:text-accent" onClick={onNext} type="button">查看技术栈 <ArrowDown className="size-4 transition-transform group-hover:translate-y-1" /></button></div>
      </div>
    </div>
  );
}

function ProfileOverview() {
  return (
    <div className={PROFILE_SWAP_LAYOUT.shellClass}>
      <div>
        <p aria-hidden="true" className={`${PROFILE_SWAP_LAYOUT.eyebrowClass} invisible`}>Profile / Overview</p>
        <h2 className={`mt-5 ${PROFILE_SWAP_LAYOUT.titleClass}`}>从 Agent 工作流，到生产级 Web 产品。</h2>
        <p className={PROFILE_SWAP_LAYOUT.bodyClass}>Agent 开发 & 全栈开发者 / 专注把 AI 能力变成真正好用的产品。</p>
      </div>
      <p className={PROFILE_SWAP_LAYOUT.hintClass}>点击展开</p>
    </div>
  );
}

function ProfileDetail() {
  return (
    <div className={PROFILE_SWAP_LAYOUT.shellClass}>
      <div>
        <p className={PROFILE_SWAP_LAYOUT.eyebrowClass}>About / Detail</p>
        <h2 className={`mt-5 ${PROFILE_SWAP_LAYOUT.titleClass}`}>让 AI 能力，成为产品体验。</h2>
        <p className={PROFILE_SWAP_LAYOUT.bodyClass}>我把大语言模型、检索系统和工具调用融入真实业务，并完成从产品界面、服务端逻辑到数据层与部署的全栈交付。</p>
      </div>
      <div>
        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div><p className="font-medium text-ink">Agent 开发</p><p className="mt-2 text-muted">工作流 · RAG · 工具调用</p></div>
          <div><p className="font-medium text-ink">全栈开发</p><p className="mt-2 text-muted">产品界面 · 服务端 · 部署</p></div>
        </div>
        <p className={`mt-6 ${PROFILE_SWAP_LAYOUT.hintClass}`}>再次点击收起</p>
      </div>
    </div>
  );
}

function ContactSlide() {
  const reducedMotion = useMotionPreference();
  const { locale } = useLanguage();
  const { resolvedTheme } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (reducedMotion) return;

    const timeline = gsap.timeline({
      delay: CONTACT_SLIDE_REVEAL_CONFIG.delay,
      defaults: { ease: CONTACT_SLIDE_REVEAL_CONFIG.ease },
    });

    timeline.fromTo(
      "[data-contact-rule]",
      { scaleX: 0 },
      { scaleX: 1, duration: CONTACT_PANEL_RULE_CONFIG.duration, clearProps: "transform" },
      CONTACT_PANEL_RULE_CONFIG.at,
    );

    timeline.fromTo(
      "[data-contact-reveal]",
      { autoAlpha: 0, y: CONTACT_SLIDE_REVEAL_CONFIG.y },
      {
        autoAlpha: 1,
        y: 0,
        duration: CONTACT_SLIDE_REVEAL_CONFIG.duration,
        stagger: CONTACT_SLIDE_REVEAL_CONFIG.stagger,
        clearProps: "opacity,visibility,transform",
      },
      CONTACT_TITLE_CONFIG.at,
    );
  }, { scope: panelRef, dependencies: [reducedMotion], revertOnUpdate: true });

  const specularColors = CONTACT_SPECULAR_COLORS[resolvedTheme === "dark" ? "dark" : "light"];

  return (
    <div className="mx-auto flex h-full max-w-site items-center px-5 sm:px-8 lg:px-12">
      <div className="relative grid w-full overflow-hidden rounded-[2rem] border border-line bg-panel p-8 sm:p-12 lg:grid-cols-12 lg:gap-8 lg:p-16" ref={panelRef}>
        <span aria-hidden="true" className="absolute inset-x-8 top-0 h-px origin-center bg-accent/50 sm:inset-x-12" data-contact-rule />
        <div className="lg:col-span-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em]" data-contact-reveal>
            <ShinyText text="Contact" />
          </p>
          {/* 标题归 React Bits BlurText 管，所以不再挂 data-contact-reveal ——
              避免 GSAP 与 Framer Motion 同时操作同一个 h2。 */}
          <BlurText
            as="h2"
            className="mt-6 max-w-3xl font-display text-[clamp(3rem,6vw,5.5rem)] leading-[0.9] tracking-[-0.055em]"
            delay={CONTACT_TITLE_CONFIG.delay}
            text={locale === "en" ? "Have a product in mind?\nLet's make it real." : CONTACT_TITLE_CONFIG.text}
          />
        </div>
        <div className="mt-10 flex flex-col items-start justify-end gap-4 lg:col-span-4 lg:mt-0" data-contact-reveal>
          <SpecularButton
            {...CONTACT_SPECULAR_CONFIG}
            {...specularColors}
            className="contact-specular-button group"
            href={siteConfig.socials[0].href}
          >
            <Github className="size-4" />
            访问 GitHub
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </SpecularButton>
        </div>
      </div>
    </div>
  );
}

function ReducedMotionPortfolio({ posts }: { posts: PostMeta[] }) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "auto" });
  };

  return (
    <div className="relative isolate mx-auto max-w-site px-5 sm:px-8 lg:px-12">
      <AmbientParticles fixed />
      <div className="relative z-10">
        <div className="relative" id="intro">
          <IntroSlide />
          <button className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 text-[10px] tracking-[0.2em] text-muted hover:text-accent" onClick={() => scrollTo("home-hero")} type="button">向下探索 <ChevronDown className="size-3" /></button>
        </div>
        <div id="home-hero"><Hero onContact={() => scrollTo("contact")} onExplore={() => scrollTo("profile")} /></div>
        <div id="profile"><ProfileSlide onNext={() => scrollTo("agent-stack")} /></div>
        <div id="agent-stack"><AgentSlide /></div>
        <FullStackSlide />
        <div id="writing"><WritingSlide posts={posts} /></div>
        <div id="now"><NowSlide /></div>
        <div id="contact"><ContactSlide /></div>
      </div>
    </div>
  );
}
