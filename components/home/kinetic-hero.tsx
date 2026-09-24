"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { TransitionLink } from "@/components/site/transition-link";
import { AmbientGlow } from "@/components/visual/ambient-glow";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotionPreference } from "@/lib/use-motion-preference";

// 大屏构图对照 gsap.com 首页：巨幅两行错位字、左上花朵与右下弹簧线。
// 颜色直接继承站点主题，确保首页首次加载的浅色模式不会被这一屏局部覆盖。

const HERO_LINES = ["Create", "Anything"];
const SPRING_PATH =
  "M28 8 C 62 16, 62 28, 28 36 C -2 44, -2 56, 28 64 C 62 72, 62 84, 28 92 C -2 100, -2 112, 28 120 C 62 128, 60 140, 34 150";

// 行容器用 inline-block 收缩到文字实际宽度：弹簧线 absolute left-full 才能贴着
// 最后一个字母，而不是靠百分比去猜词尾在哪（猜错就会盖住字母，看起来像 bug）。
function CharLine({ text, trailing }: { text: string; trailing?: ReactNode }) {
  return (
    <div className="relative inline-block">
      {text.split("").map((char, index) => (
        // pb 给下伸部（y / g 的尾巴）留出可见区域，-mb 抵消掉它占的高度，排版不受影响。
        // data-hero-cell 是悬停起伏的目标：动 clip 层本身，字母不会被自己的裁剪切到。
        <span className="inline-block overflow-hidden pb-[0.26em] -mb-[0.26em] align-top" data-hero-cell key={`${text}-${index}`}>
          <span className="inline-block will-change-transform" data-hero-char>
            {char}
          </span>
        </span>
      ))}
      {trailing}
    </div>
  );
}

export function KineticHero() {
  const reducedMotion = useMotionPreference();
  const rootRef = useRef<HTMLElement>(null);
  const springRef = useRef<SVGPathElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  /** 入场完成前悬停会 overwrite 掉入场进度，把字母冻在半空——就绪前不响应悬停 */
  const heroReadyRef = useRef(false);

  useGSAP(() => {
    const chars = gsap.utils.toArray<HTMLElement>("[data-hero-char]");
    if (reducedMotion || chars.length === 0) return;

    const timeline = gsap.timeline({ delay: 0.12 });

    // 花朵先落下，随后文字逐字顶出，弹簧线描完，最后副题与按钮浮起。
    timeline.fromTo(
      "[data-hero-flower]",
      { scale: 0, rotate: -120, autoAlpha: 0 },
      { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.9, ease: "back.out(1.6)" },
    );

    // 花朵慢速自转：与弹簧线同理，无限循环独立排在入场之后；
    // 只转 rotate，悬停动效只动 scale，两者互不 overwrite。
    gsap.to("[data-hero-flower]", {
      rotate: "+=360",
      duration: 26,
      ease: "none",
      repeat: -1,
      delay: 1.4,
    });

    // 位移要盖住「文字下沿 + 裁切留白」，留白加大后 118% 会在入场前露出一截字头
    timeline.fromTo(
      chars,
      { yPercent: 140 },
      { yPercent: 0, duration: 1.05, ease: "expo.out", stagger: 0.04 },
      0.1,
    );

    const path = springRef.current;
    if (path) {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      timeline.to(path, { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" }, "-=0.55");

      // 弹簧线的呼吸：挤压—回弹。无限循环不能进 entrance timeline，
      // 否则 timeline 时长被撑成无限，后面 "-=0.5" 的插入点永远到不了，副题会静默失效。
      const spring = path.ownerSVGElement;
      if (spring) {
        gsap.to(spring, {
          duration: 1.9,
          ease: "sine.inOut",
          repeat: -1,
          rotate: 5,
          scaleX: 0.94,
          scaleY: 1.07,
          transformOrigin: "50% 100%",
          yoyo: true,
          delay: 2.1,
        });
      }
    }

    timeline.fromTo(
      "[data-hero-meta]",
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.12 },
      "-=0.5",
    );

    timeline.eventCallback("onComplete", () => {
      heroReadyRef.current = true;
    });
  }, { scope: rootRef, dependencies: [reducedMotion] });

  // 悬停逐字起伏：靠近指针的字母抬得高、邻座轻微带动，像被指尖推了一下。
  // 目标是 clip 层（cell）而不是内层字母——内层在自己的 overflow-hidden 里，转起来会被裁掉角。
  useEffect(() => {
    if (reducedMotion) return;
    const root = rootRef.current;
    const text = textRef.current;
    if (!root || !text) return;

    const cells = Array.from(root.querySelectorAll<HTMLElement>("[data-hero-cell]"));
    const spring = springRef.current?.ownerSVGElement ?? null;

    const settle = () => {
      gsap.to(cells, { duration: 0.5, ease: "power2.out", overwrite: "auto", rotate: 0, scale: 1, yPercent: 0 });
      if (spring) gsap.to(spring, { duration: 0.5, ease: "power2.out", overwrite: "auto", y: 0 });
    };

    const lift = (event: PointerEvent) => {
      if (!heroReadyRef.current) return;
      const cell = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-hero-cell]");
      if (!cell) return;
      const index = cells.indexOf(cell);
      gsap.to(cells, {
        duration: 0.45,
        ease: "back.out(1.6)",
        overwrite: "auto",
        rotate: (i: number) => (i === index ? -3 : 0),
        scale: (i: number) => (i === index ? 1.06 : 1),
        yPercent: (i: number) => (i === index ? -9 : Math.abs(i - index) === 1 ? -4 : 0),
      });
      // 弹簧线跟着被压下一点（用 y，不和呼吸动画的 rotate/scale 抢属性）
      if (spring) gsap.to(spring, { duration: 0.4, ease: "power2.out", overwrite: "auto", y: -10 });
    };

    text.addEventListener("pointerover", lift);
    text.addEventListener("pointerleave", settle);

    // 花朵悬停：弹性放大一下。只动 scale——自转动画占着 rotate，
    // overwrite "auto" 只杀同名属性，自转不会被悬停打断。
    const flower = root.querySelector<HTMLElement>("[data-hero-flower]");
    const flowerPop = () => {
      if (!heroReadyRef.current) return;
      gsap.to(flower, { duration: 0.4, ease: "back.out(1.7)", overwrite: "auto", scale: 1.18 });
    };
    const flowerRest = () => {
      gsap.to(flower, { duration: 0.45, ease: "power2.out", overwrite: "auto", scale: 1 });
    };
    flower?.addEventListener("pointerover", flowerPop);
    flower?.addEventListener("pointerout", flowerRest);

    return () => {
      text.removeEventListener("pointerover", lift);
      text.removeEventListener("pointerleave", settle);
      flower?.removeEventListener("pointerover", flowerPop);
      flower?.removeEventListener("pointerout", flowerRest);
      gsap.killTweensOf(cells);
      if (flower) gsap.killTweensOf(flower);
    };
  }, [reducedMotion]);

  return (
    <section className="relative overflow-hidden bg-paper text-ink" ref={rootRef}>
      <AmbientGlow />
      <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-site flex-col px-5 pb-12 pt-10 sm:px-8 lg:px-12">
        <div className="relative my-auto">
          {/* 左上花朵 */}
          <svg
            aria-hidden="true"
            className="absolute -top-[3.5rem] left-[3%] w-[4.5rem] sm:-top-[5rem] sm:w-[6.5rem]"
            data-hero-flower
            viewBox="0 0 100 100"
          >
            <defs>
              <linearGradient id="hero-petal" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#f6c445" />
                <stop offset="1" stopColor="#e2694f" />
              </linearGradient>
            </defs>
            <g fill="url(#hero-petal)" transform="rotate(45 50 50)">
              <ellipse cx="50" cy="25" rx="13" ry="24" />
              <ellipse cx="75" cy="50" rx="24" ry="13" />
              <ellipse cx="50" cy="75" rx="13" ry="24" />
              <ellipse cx="25" cy="50" rx="24" ry="13" />
            </g>
          </svg>

          <h1 className="sr-only">Create Anything</h1>
          <div aria-hidden="true" className="relative font-sans text-[clamp(4rem,14vw,12.5rem)] font-medium leading-[0.85] tracking-[-0.04em]" ref={textRef}>
            <div className="pl-[4%]">
              <CharLine text={HERO_LINES[0]} />
            </div>
            <div className="pl-[14%] sm:pl-[26%]">
              <CharLine
                text={HERO_LINES[1]}
                trailing={
                  /* 右下弹簧线：锚在行容器（词尾）右侧，随字号用 em 缩放 */
                  <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 left-full ml-[0.03em] w-[0.38em]"
                    data-hero-spring
                    fill="none"
                    viewBox="0 0 80 160"
                  >
                    <defs>
                      <linearGradient id="hero-spring" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0" stopColor="rgb(var(--liquid-foam))" />
                        <stop offset="1" stopColor="rgb(var(--liquid-mid))" />
                      </linearGradient>
                    </defs>
                    <path d={SPRING_PATH} ref={springRef} stroke="url(#hero-spring)" strokeLinecap="round" strokeWidth="11" />
                  </svg>
                }
              />
            </div>
          </div>
        </div>

        {/* 左下大括号副题 + 右下按钮 */}
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-10">
          <div className="flex items-center gap-3 sm:gap-5" data-hero-meta>
            <span aria-hidden="true" className="font-display text-[2.8rem] leading-none text-ink/40 sm:text-[4rem]">
              {`{`}
            </span>
            <p className="max-w-xs text-sm leading-6 text-ink/85">
              把 AI 能力，变成真正好用的产品。
            </p>
            <span aria-hidden="true" className="font-display text-[2.8rem] leading-none text-ink/40 sm:text-[4rem]">
              {`}`}
            </span>
          </div>

          <TransitionLink
            className="group inline-flex items-center gap-3 rounded-full border border-ink/30 px-6 py-3 text-sm font-medium text-ink transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-[rgb(9_25_29)]"
            data-hero-meta
            href="/projects"
          >
            看看我做过的项目
            <span className="grid size-5 place-items-center rounded-full border border-current">
              <ArrowUpRight className="size-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}
