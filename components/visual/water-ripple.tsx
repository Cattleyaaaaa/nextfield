"use client";

import { useEffect, useRef } from "react";
import { usePageTransition } from "@/components/site/page-transition-provider";
import { useGlobalEffects } from "@/components/site/global-effects-provider";

type Ripple = {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  velocity: number;
};

const MAX_RIPPLES = 10;
export function WaterRipple() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { motionEnabled } = usePageTransition();
  const { rippleEnabled, rippleStrength, rippleDensity } = useGlobalEffects();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !motionEnabled || !rippleEnabled) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const ripples: Ripple[] = [];
    let frameId = 0;
    let width = 0;
    let height = 0;
    let scale = 1;
    let lastX = -Infinity;
    let lastY = -Infinity;
    let lastTime = 0;

    const resize = () => {
      scale = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(scale, 0, 0, scale, 0, 0);
    };

    const addRipple = (x: number, y: number, emphasis = false) => {
      const count = emphasis
        ? Math.min(3, Math.ceil(rippleStrength / 2) + 1)
        : Math.ceil(rippleStrength / 2);
      for (let index = 0; index < count; index += 1)
        ripples.push({
          x,
          y,
          radius: (emphasis ? 8 : 4) + index * 8,
          opacity:
            (emphasis ? 0.4 : 0.2 + rippleStrength * 0.035) - index * 0.055,
          velocity: (emphasis ? 2 : 1.1) + rippleStrength * 0.22 + index * 0.15,
        });
      while (ripples.length > MAX_RIPPLES) ripples.shift();
      if (!frameId) frameId = requestAnimationFrame(draw);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest("[data-effect-lab]")
      )
        return;
      const now = performance.now();
      const distance = Math.hypot(event.clientX - lastX, event.clientY - lastY);
      if (distance < 60 - rippleDensity * 10 || now - lastTime < 28) return;
      lastX = event.clientX;
      lastY = event.clientY;
      lastTime = now;
      addRipple(event.clientX, event.clientY);
    };

    const onTransitionRipple = (event: Event) => {
      const detail = (event as CustomEvent<{ x?: number; y?: number }>).detail;
      addRipple(detail?.x ?? width / 2, detail?.y ?? height / 2, true);
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const accent = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim()
        .split(/\s+/)
        .join(", ");
      for (let index = ripples.length - 1; index >= 0; index -= 1) {
        const ripple = ripples[index];
        context.beginPath();
        context.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        context.strokeStyle = `rgba(${accent}, ${ripple.opacity})`;
        context.lineWidth = Math.max(0.8, rippleStrength * 0.4);
        context.stroke();
        ripple.radius += ripple.velocity;
        ripple.opacity *= 0.972;
        if (ripple.opacity < 0.012) ripples.splice(index, 1);
      }
      frameId = ripples.length ? requestAnimationFrame(draw) : 0;
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("water-ripple", onTransitionRipple);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("water-ripple", onTransitionRipple);
    };
  }, [motionEnabled, rippleEnabled, rippleStrength, rippleDensity]);

  if (!motionEnabled || !rippleEnabled) return null;
  return (
    <canvas
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50"
      ref={canvasRef}
    />
  );
}
