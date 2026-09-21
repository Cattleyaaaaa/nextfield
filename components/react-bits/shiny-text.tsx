"use client";

// React Bits · TextAnimations/ShinyText，移植到项目已装的 framer-motion。
//
// 相对原版的两处改造：
//   1. 颜色改用项目调色板变量，跟随深浅主题
//   2. 命中 prefers-reduced-motion 时直接渲染纯文本（原版仍会跑 rAF 循环），
//      这里把动画部分拆成子组件，减弱动效时连循环都不会挂载
import { motion, useAnimationFrame, useMotionValue, useTransform } from "framer-motion";
import { useRef } from "react";
import { useMotionPreference } from "@/lib/use-motion-preference";
import "./shiny-text.css";

export const SHINY_TEXT_CONFIG = {
  speed: 3.2,
  spread: 120,
  color: "rgb(var(--accent))",
  shineColor: "rgb(var(--liquid-foam))",
};

export interface ShinyTextProps {
  text: string;
  className?: string;
  speed?: number;
  spread?: number;
  color?: string;
  shineColor?: string;
}

function AnimatedShinyText({
  text,
  className,
  speed,
  spread,
  color,
  shineColor,
}: Required<Omit<ShinyTextProps, "className">> & { className: string }) {
  const progress = useMotionValue(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const cycleDuration = speed * 1000;
  // 扫光只占一轮的 60%，剩下 40% 是停顿，避免一直在闪
  const sweepDuration = cycleDuration * 0.6;

  useAnimationFrame((time) => {
    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
      return;
    }
    elapsedRef.current += time - lastTimeRef.current;
    lastTimeRef.current = time;
    const cycleTime = elapsedRef.current % cycleDuration;
    progress.set(cycleTime < sweepDuration ? (cycleTime / sweepDuration) * 100 : 100);
  });

  const backgroundPosition = useTransform(progress, (value) => `${150 - value * 2}% center`);

  return (
    <motion.span
      className={`rb-shiny-text ${className}`.trim()}
      style={{
        backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
        backgroundPosition,
        backgroundSize: "200% auto",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {text}
    </motion.span>
  );
}

export function ShinyText({
  text,
  className = "",
  speed = SHINY_TEXT_CONFIG.speed,
  spread = SHINY_TEXT_CONFIG.spread,
  color = SHINY_TEXT_CONFIG.color,
  shineColor = SHINY_TEXT_CONFIG.shineColor,
}: ShinyTextProps) {
  const reducedMotion = useMotionPreference();

  if (reducedMotion) {
    return <span className={`rb-shiny-text ${className}`.trim()}>{text}</span>;
  }

  return (
    <AnimatedShinyText className={className} color={color} shineColor={shineColor} speed={speed} spread={spread} text={text} />
  );
}

export default ShinyText;
