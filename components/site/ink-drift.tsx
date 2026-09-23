"use client";

import { useEffect, useRef } from "react";
import { usePageTransition } from "@/components/site/page-transition-provider";

type Particle = { x: number; y: number; vx: number; vy: number; radius: number; foam: boolean };

/** 全屏面积大，密度比写作页局部版调低；随窗口/内容增长自然加密 */
const DENSITY = 24000;
const MIN_PARTICLES = 40;
const MAX_PARTICLES = 110;
const LINK_DISTANCE = 130;
const POINTER_RADIUS = 150;

/**
 * 全站墨滴粒子场：fixed 铺满视口、常驻 layout，粒子缓慢漂移彼此连线，
 * 颜色跟随主题令牌；reduced-motion / 动效开关关闭时只画一帧静态底纹。
 * 与 .field-atmosphere 同层（z-0），永远垫在页面内容下面。
 */
export function InkDrift() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { motionEnabled } = usePageTransition();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !motionEnabled) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    let width = 0;
    let height = 0;
    let scale = 1;
    let particles: Particle[] = [];
    let frameId = 0;
    let pointerX = -9999;
    let pointerY = -9999;
    let colors = { ink: "24 28 34", foam: "0 191 188" };
    let colorsReadAt = 0;

    const readColors = () => {
      if (performance.now() - colorsReadAt < 2000) return;
      const style = getComputedStyle(document.documentElement);
      const ink = style.getPropertyValue("--ink").trim();
      const foam = style.getPropertyValue("--liquid-foam").trim();
      if (ink) colors.ink = ink;
      if (foam) colors.foam = foam;
      colorsReadAt = performance.now();
    };

    const spawn = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.24,
      radius: 0.9 + Math.random() * 1.5,
      foam: Math.random() < 0.32,
    });

    const resize = () => {
      scale = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(scale, 0, 0, scale, 0, 0);

      const target = Math.min(MAX_PARTICLES, Math.max(MIN_PARTICLES, Math.round((width * height) / DENSITY)));
      particles = Array.from({ length: target }, spawn);
      // 静态降级模式没有动画循环，重算尺寸后主动补一帧
      if (!frameId) drawStatic();
    };

    const drawStatic = () => {
      readColors();
      context.clearRect(0, 0, width, height);
      for (const particle of particles) {
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `rgb(${particle.foam ? colors.foam : colors.ink} / 0.16)`;
        context.fill();
      }
    };

    const step = () => {
      readColors();
      context.clearRect(0, 0, width, height);

      for (const particle of particles) {
        const dx = particle.x - pointerX;
        const dy = particle.y - pointerY;
        const distance = Math.hypot(dx, dy);
        if (distance < POINTER_RADIUS && distance > 0.01) {
          const push = (1 - distance / POINTER_RADIUS) * 0.2;
          particle.x += (dx / distance) * push;
          particle.y += (dy / distance) * push;
        }
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < -6) particle.x = width + 6;
        if (particle.x > width + 6) particle.x = -6;
        if (particle.y < -6) particle.y = height + 6;
        if (particle.y > height + 6) particle.y = -6;
      }

      context.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance >= LINK_DISTANCE) continue;
          context.beginPath();
          context.strokeStyle = `rgb(${colors.ink} / ${((1 - distance / LINK_DISTANCE) * 0.12).toFixed(3)})`;
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }

      for (const particle of particles) {
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `rgb(${particle.foam ? colors.foam : colors.ink} / ${particle.foam ? 0.42 : 0.26})`;
        context.fill();
      }

      frameId = window.requestAnimationFrame(step);
    };

    const start = () => {
      if (!frameId) frameId = window.requestAnimationFrame(step);
    };
    const stop = () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };

    const onVisibility = () => (document.hidden ? stop() : start());
    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
    };
    const onPointerLeave = () => {
      pointerX = -9999;
      pointerY = -9999;
    };

    resize();
    if (motionEnabled) {
      start();
      document.addEventListener("visibilitychange", onVisibility);
    } else {
      drawStatic();
    }
    window.addEventListener("resize", resize);
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerleave", onPointerLeave);

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [motionEnabled]);

  return <canvas aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" ref={canvasRef} />;
}
