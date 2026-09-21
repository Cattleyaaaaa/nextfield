"use client";

import { useEffect, useRef } from "react";
import { usePageTransition } from "@/components/site/page-transition-provider";

type Ripple = { x: number; y: number; radius: number; opacity: number; velocity: number };

const MAX_RIPPLES = 10;
const MIN_DISTANCE = 34;
const MIN_INTERVAL = 48;

export function WaterRipple() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { motionEnabled } = usePageTransition();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !motionEnabled) return;
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
      ripples.push({ x, y, radius: emphasis ? 9 : 5, opacity: emphasis ? 0.38 : 0.24, velocity: emphasis ? 2.6 : 1.4 });
      ripples.push({ x, y, radius: emphasis ? 2 : 0, opacity: emphasis ? 0.16 : 0.1, velocity: emphasis ? 1.55 : 0.9 });
      while (ripples.length > MAX_RIPPLES) ripples.shift();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      const now = performance.now();
      const distance = Math.hypot(event.clientX - lastX, event.clientY - lastY);
      if (distance < MIN_DISTANCE || now - lastTime < MIN_INTERVAL) return;
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
      const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim().split(/\s+/).join(", ");
      for (let index = ripples.length - 1; index >= 0; index -= 1) {
        const ripple = ripples[index];
        context.beginPath();
        context.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        context.strokeStyle = `rgba(${accent}, ${ripple.opacity})`;
        context.lineWidth = ripple.opacity > 0.2 ? 1.5 : 1;
        context.stroke();
        ripple.radius += ripple.velocity;
        ripple.opacity *= 0.972;
        if (ripple.opacity < 0.012) ripples.splice(index, 1);
      }
      frameId = requestAnimationFrame(draw);
    };

    resize();
    frameId = requestAnimationFrame(draw);
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("water-ripple", onTransitionRipple);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("water-ripple", onTransitionRipple);
    };
  }, [motionEnabled]);

  if (!motionEnabled) return null;
  return <canvas aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 hidden md:block" ref={canvasRef} />;
}
