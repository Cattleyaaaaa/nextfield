"use client";

// React Bits · TextAnimations/BlurText，移植到项目已装的 framer-motion
// （原版 import 自 'motion/react'，本项目没有装 motion 包）。
//
// 相对原版的四处改造：
//   1. 支持 as 指定标签（原版固定 <p>），以便保留语义化的 h2
//   2. 文本用 \n 分行：每行是 display:block，行内再按字/词拆分。
//      原版是 flex + wrap，中文标题会在错误的字符处换行
//   3. 默认按「字」拆分 —— 中文没有空格，按词拆只会得到一个整体，看不出错落
//   4. 命中 prefers-reduced-motion 时直接渲染纯文本，杜绝「动画没触发导致文字一直不可见」
import { motion, type Target, type TargetAndTransition } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type ElementType } from "react";
import { useMotionPreference } from "@/lib/use-motion-preference";

type MotionVars = Record<string, string | number>;

export const BLUR_TEXT_CONFIG = {
  animateBy: "chars" as "chars" | "words",
  delay: 55,
  stepDuration: 0.34,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  from: { filter: "blur(12px)", opacity: 0, y: 24 } as MotionVars,
  to: [
    { filter: "blur(5px)", opacity: 0.55, y: 6 },
    { filter: "blur(0px)", opacity: 1, y: 0 },
  ] as MotionVars[],
};

const buildKeyframes = (from: MotionVars, steps: MotionVars[]): TargetAndTransition => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap((step) => Object.keys(step))]);
  const keyframes: Record<string, unknown[]> = {};
  keys.forEach((key) => {
    keyframes[key] = [from[key], ...steps.map((step) => step[key])];
  });
  return keyframes as unknown as TargetAndTransition;
};

export interface BlurTextProps {
  text: string;
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  animateBy?: "chars" | "words";
  delay?: number;
  stepDuration?: number;
  from?: MotionVars;
  to?: MotionVars[];
}

export function BlurText({
  text,
  as = "p",
  className = "",
  lineClassName = "",
  animateBy = BLUR_TEXT_CONFIG.animateBy,
  delay = BLUR_TEXT_CONFIG.delay,
  stepDuration = BLUR_TEXT_CONFIG.stepDuration,
  from = BLUR_TEXT_CONFIG.from,
  to = BLUR_TEXT_CONFIG.to,
}: BlurTextProps) {
  const reducedMotion = useMotionPreference();
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;
    const element = ref.current;
    if (!element) return;
    // 全屏翻页模式下元素挂载即在视口内，观察器会立刻回调，等价于「挂载即播」。
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const lines = useMemo(() => text.split("\n"), [text]);
  const segments = useMemo(
    () => lines.map((line) => (animateBy === "chars" ? Array.from(line) : line.split(" "))),
    [lines, animateBy],
  );
  // 每行的起始序号：让 delay 跨行连续，而不是每行重新计时
  const lineOffsets = useMemo(() => {
    let total = 0;
    return segments.map((line) => {
      const start = total;
      total += line.length;
      return start;
    });
  }, [segments]);

  const keyframes = useMemo(() => buildKeyframes(from, to), [from, to]);
  const totalDuration = stepDuration * to.length;
  const times = useMemo(
    () => Array.from({ length: to.length + 1 }, (_, index) => index / to.length),
    [to.length],
  );

  const Element = as;

  if (reducedMotion) {
    return (
      <Element className={className} ref={ref}>
        {lines.map((line, index) => (
          <span className={lineClassName} key={index} style={{ display: "block" }}>
            {line}
          </span>
        ))}
      </Element>
    );
  }

  return (
    <Element className={className} ref={ref}>
      {segments.map((segmentsOfLine, lineIndex) => (
        <span className={lineClassName} key={lineIndex} style={{ display: "block" }}>
          {segmentsOfLine.map((segment, index) => (
            <motion.span
              animate={inView ? keyframes : (from as unknown as Target)}
              className="inline-block"
              initial={from as unknown as Target}
              key={index}
              transition={{
                delay: ((lineOffsets[lineIndex] + index) * delay) / 1000,
                duration: totalDuration,
                ease: BLUR_TEXT_CONFIG.ease,
                times,
              }}
            >
              {segment === " " ? "\u00A0" : segment}
            </motion.span>
          ))}
        </span>
      ))}
    </Element>
  );
}

export default BlurText;
