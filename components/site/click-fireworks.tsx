"use client";

import { useEffect, useRef } from "react";
import { usePageTransition } from "@/components/site/page-transition-provider";
import {
  useGlobalEffects,
  type ClickEffectStyle,
} from "@/components/site/global-effects-provider";
import {
  CLICK_EFFECT_PREVIEW_EVENT,
  type ClickEffectPreview,
} from "@/lib/effect-signal";

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  color: string;
  angle: number;
  spin: number;
  style: ClickEffectStyle;
};
type Ring = { x: number; y: number; radius: number; life: number };

const MAX_SPARKS = 420; // 连点时兜底，超过就少生成
const GRAVITY = 0.055;
const DRAG = 0.985;

/**
 * 全站点击烟花：每次 pointerdown 在点击处炸开一簇火花 + 一圈扩散光环。
 * 颜色跟随主题令牌（--liquid-foam / --accent / --ink）；只在有火花时跑动画循环；
 * 减少动态效果（motionEnabled=false）时整个关闭。
 */
export function ClickFireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { motionEnabled } = usePageTransition();
  const { clickEnabled, clickStyle, clickAmount } = useGlobalEffects();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !motionEnabled || !clickEnabled) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    let width = 0;
    let height = 0;
    let sparks: Spark[] = [];
    let rings: Ring[] = [];
    let frameId = 0;
    const colors = { foam: "0 191 188", accent: "0 140 160", ink: "24 28 34" };
    let colorsReadAt = 0;

    const readColors = () => {
      if (performance.now() - colorsReadAt < 2000) return;
      const style = getComputedStyle(document.documentElement);
      const foam = style.getPropertyValue("--liquid-foam").trim();
      const accent = style.getPropertyValue("--accent").trim();
      const ink = style.getPropertyValue("--ink").trim();
      if (foam) colors.foam = foam;
      if (accent) colors.accent = accent;
      if (ink) colors.ink = ink;
      colorsReadAt = performance.now();
    };

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(scale, 0, 0, scale, 0, 0);
    };

    const spawnBurst = (
      x: number,
      y: number,
      style: ClickEffectStyle = clickStyle,
    ) => {
      readColors();
      const palette = [colors.foam, colors.foam, colors.accent, colors.ink];
      const budget = Math.max(0, MAX_SPARKS - sparks.length);
      const count =
        style === "rings" ? 0 : Math.min(8 + clickAmount * 8, budget);
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.6 + Math.random() * 4.6;
        const maxLife = 42 + Math.random() * 26;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.9, // 轻微上抛，更接近烟花
          life: maxLife,
          maxLife,
          radius: 0.9 + Math.random() * 1.6,
          color: palette[Math.floor(Math.random() * palette.length)],
          angle: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.14,
          style,
        });
      }
      const ringCount = style === "rings" ? clickAmount : 1;
      for (let index = 0; index < ringCount; index += 1)
        rings.push({
          x,
          y,
          radius: 6 + index * 17,
          life: Math.max(0.62, 1 - index * 0.08),
        });
      if (sparks.length > MAX_SPARKS) sparks = sparks.slice(-MAX_SPARKS);
      if (rings.length > 24) rings = rings.slice(-24);
    };

    const step = () => {
      context.clearRect(0, 0, width, height);

      sparks = sparks.filter((spark) => spark.life > 0);
      for (const spark of sparks) {
        spark.life -= 1;
        spark.vx *= DRAG;
        spark.vy =
          spark.vy * DRAG +
          (spark.style === "confetti" ? GRAVITY * 1.5 : GRAVITY);
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.angle += spark.spin;
        const alpha = Math.max(0, spark.life / spark.maxLife);
        context.fillStyle = `rgb(${spark.color} / ${alpha.toFixed(3)})`;
        if (spark.style === "confetti") {
          context.save();
          context.translate(spark.x, spark.y);
          context.rotate(spark.angle);
          context.fillRect(
            -spark.radius * 2,
            -spark.radius / 2,
            spark.radius * 4,
            spark.radius,
          );
          context.restore();
        } else {
          context.beginPath();
          context.arc(spark.x, spark.y, spark.radius, 0, Math.PI * 2);
          context.fill();
        }
      }

      rings = rings.filter((ring) => ring.life > 0);
      for (const ring of rings) {
        ring.life -= 0.027;
        ring.radius += 3.2;
        context.beginPath();
        context.strokeStyle = `rgb(${colors.accent} / ${(Math.max(0, ring.life) * 0.9).toFixed(3)})`;
        context.lineWidth = Math.max(1.5, ring.life * 3.6);
        context.shadowColor = `rgb(${colors.foam} / 0.9)`;
        context.shadowBlur = 12;
        context.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        context.stroke();
        context.shadowBlur = 0;
      }

      if (sparks.length > 0 || rings.length > 0) {
        frameId = window.requestAnimationFrame(step);
      } else {
        context.clearRect(0, 0, width, height);
        frameId = 0;
      }
    };

    const ensureLoop = () => {
      if (!frameId) frameId = window.requestAnimationFrame(step);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest("[data-effect-lab], [data-effect-controls]")
      )
        return;
      spawnBurst(event.clientX, event.clientY);
      ensureLoop();
    };

    const onPreview = (event: Event) => {
      const { x, y, style } = (event as CustomEvent<ClickEffectPreview>).detail;
      spawnBurst(x, y, style);
      ensureLoop();
    };

    const onVisibility = () => {
      if (document.hidden) {
        if (frameId) {
          window.cancelAnimationFrame(frameId);
          frameId = 0;
        }
      } else if (sparks.length > 0 || rings.length > 0) {
        ensureLoop();
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener(CLICK_EFFECT_PREVIEW_EVENT, onPreview);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener(CLICK_EFFECT_PREVIEW_EVENT, onPreview);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [motionEnabled, clickEnabled, clickStyle, clickAmount]);

  return (
    <canvas
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[90]"
      ref={canvasRef}
    />
  );
}
