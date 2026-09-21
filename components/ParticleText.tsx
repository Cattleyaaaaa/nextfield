"use client";

// React Bits ParticleText (TS + CSS variant), kept local so the canvas has no external dependency.
import { useEffect, useRef, type CSSProperties } from "react";
import "./ParticleText.css";

export interface ParticleTextProps {
  text?: string; particleSize?: number; density?: number; color?: string; highlightColor?: string;
  scatter?: number; gatherDuration?: number; stagger?: number; pointerRepel?: number; repelRadius?: number;
  idleDrift?: number; trigger?: "mount" | "hover" | "click"; fontSize?: number | string;
  fontWeight?: number | string; fontFamily?: string; glow?: boolean; className?: string; style?: CSSProperties;
}
type Particle = { x: number; y: number; sx: number; sy: number; tx: number; ty: number; seed: number; depth: number; color: string };
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const ease = (value: number) => 1 - Math.pow(1 - value, 3);
const rgb = (value: string) => {
  const hex = value.replace("#", "").trim();
  if (!/^[\da-f]{6}$/i.test(hex)) return null;
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)] as const;
};
const mix = (a: readonly number[] | null, b: readonly number[] | null, amount: number, fallback: string) =>
  a && b ? `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * amount)).join(", ")})` : fallback;

export default function ParticleText({
  text = "React Bits", particleSize = 2, density = 4, color = "#ffffff", highlightColor = "#8b5cf6",
  scatter = 180, gatherDuration = 1600, stagger = 420, pointerRepel = 40, repelRadius = 120,
  idleDrift = 0.7, trigger = "mount", fontSize = "clamp(3rem, 12vw, 8rem)", fontWeight = 800,
  fontFamily = "inherit", glow = true, className = "", style
}: ParticleTextProps) {
  const containerRef = useRef<HTMLDivElement>(null); const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const container = containerRef.current, canvas = canvasRef.current, context = canvas?.getContext("2d");
    if (!container || !canvas || !context) return;
    let particles: Particle[] = [], frame = 0, resizeFrame = 0, build = 0, start = 0, gathering = false;
    let width = 0, height = 0, reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0, y: 0, sx: 0, sy: 0, active: false };
    const replay = (scatterStart: boolean) => {
      const now = performance.now();
      for (const p of particles) {
        if (scatterStart) { const angle = p.seed * Math.PI * 2, distance = (reduced ? 0 : scatter) * (0.35 + p.depth * 0.75); p.x = p.tx + Math.cos(angle) * distance; p.y = p.ty + Math.sin(angle) * distance; }
        p.sx = p.x; p.sy = p.y;
      }
      start = now; gathering = !reduced;
    };
    const render = (now: number) => {
      context.clearRect(0, 0, width, height); context.shadowBlur = glow && !reduced ? particleSize * 3 : 0; context.shadowColor = highlightColor;
      pointer.sx += (pointer.x - pointer.sx) * .18; pointer.sy += (pointer.y - pointer.sy) * .18; let done = true;
      for (const p of particles) {
        const delay = p.seed * stagger, progress = gathering ? clamp((now - start - delay) / Math.max(1, gatherDuration), 0, 1) : 1;
        let x = gathering ? p.sx + (p.tx - p.sx) * ease(progress) : p.tx, y = gathering ? p.sy + (p.ty - p.sy) * ease(progress) : p.ty;
        if (progress < 1) done = false;
        if (!gathering && !reduced) { x += Math.sin(now / 1100 + p.seed * 10) * idleDrift * p.depth; y += Math.cos(now / 1330 + p.seed * 8) * idleDrift * p.depth; }
        if (pointer.active && !reduced) { const dx = x - pointer.sx, dy = y - pointer.sy, d = Math.hypot(dx, dy); if (d > 0 && d < repelRadius) { const force = Math.pow(1 - d / repelRadius, 2) * pointerRepel; x += dx / d * force; y += dy / d * force; } }
        p.x += (x - p.x) * (reduced ? 1 : .22); p.y += (y - p.y) * (reduced ? 1 : .22); context.globalAlpha = .35 + progress * .65; context.fillStyle = p.color; context.fillRect(p.x - particleSize / 2, p.y - particleSize / 2, particleSize, particleSize);
      }
      context.globalAlpha = 1; context.shadowBlur = 0; if (done) gathering = false; frame = requestAnimationFrame(render);
    };
    const sample = async () => {
      const id = ++build, rect = container.getBoundingClientRect(); width = Math.floor(rect.width); height = Math.floor(rect.height); if (!width || !height) return;
      const dpr = Math.min(devicePixelRatio || 1, 2); canvas.width = width * dpr; canvas.height = height * dpr; context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const computed = getComputedStyle(container), family = fontFamily === "inherit" ? computed.fontFamily : fontFamily;
      const probe = document.createElement("span"); probe.style.cssText = `position:absolute;visibility:hidden;font:${fontWeight} ${fontSize} ${family}`; probe.textContent = "M"; container.append(probe); let size = parseFloat(getComputedStyle(probe).fontSize) || 96; probe.remove();
      await document.fonts?.ready; if (id !== build) return;
      const off = document.createElement("canvas"), offContext = off.getContext("2d", { willReadFrequently: true })!; let font = `${fontWeight} ${size}px ${family}`; offContext.font = font;
      const max = width * .92, measured = offContext.measureText(text).width; if (measured > max) { size *= max / measured; font = `${fontWeight} ${size}px ${family}`; offContext.font = font; }
      const metrics = offContext.measureText(text), ascent = Math.ceil(metrics.actualBoundingBoxAscent || size * .78), descent = Math.ceil(metrics.actualBoundingBoxDescent || size * .22), pad = Math.ceil(size * .1);
      off.width = Math.ceil(metrics.width + pad * 2); off.height = ascent + descent + pad * 2; offContext.font = font; offContext.fillStyle = "white"; offContext.fillText(text, pad, pad + ascent);
      const image = offContext.getImageData(0, 0, off.width, off.height), base = rgb(color), high = rgb(highlightColor), step = Math.max(2, Math.floor(density)); const next: Particle[] = [];
      for (let y = 0; y < off.height; y += step) for (let x = 0; x < off.width; x += step) if (image.data[(y * off.width + x) * 4 + 3] > 40) { const seed = ((next.length * 9301 + 49297) % 233280) / 233280, depth = .45 + (((next.length * 233 + 97) % 1000) / 1000) * .9, tx = width / 2 - off.width / 2 + x, ty = height / 2 - off.height / 2 + y; next.push({ x: tx, y: ty, sx: tx, sy: ty, tx, ty, seed, depth, color: mix(base, high, clamp(tx / width + (seed - .5) * .25, 0, 1), color) }); }
      particles = next; pointer.x = pointer.sx = width / 2; pointer.y = pointer.sy = height / 2; replay(true);
    };
    const queue = () => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(() => void sample()); };
    const move = (event: PointerEvent) => { const r = canvas.getBoundingClientRect(); pointer.x = event.clientX - r.left; pointer.y = event.clientY - r.top; pointer.active = true; };
    const enter = (event: PointerEvent) => { move(event); if (trigger === "hover") replay(true); };
    const media = matchMedia("(prefers-reduced-motion: reduce)"), reducedChange = (event: MediaQueryListEvent) => { reduced = event.matches; void sample(); };
    const observer = new ResizeObserver(queue); observer.observe(container); media.addEventListener("change", reducedChange); canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerenter", enter); canvas.addEventListener("pointerleave", () => pointer.active = false); canvas.addEventListener("click", () => { if (trigger === "click") replay(true); }); void sample(); frame = requestAnimationFrame(render);
    return () => { ++build; observer.disconnect(); media.removeEventListener("change", reducedChange); cancelAnimationFrame(frame); cancelAnimationFrame(resizeFrame); };
  }, [text, particleSize, density, color, highlightColor, scatter, gatherDuration, stagger, pointerRepel, repelRadius, idleDrift, trigger, fontSize, fontWeight, fontFamily, glow]);
  return <div ref={containerRef} className={`particle-text ${className}`} style={style} aria-label={text}><canvas ref={canvasRef} className="particle-text__canvas" aria-hidden="true" /><span className="particle-text__sr">{text}</span></div>;
}
