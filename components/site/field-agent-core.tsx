"use client";

import { useEffect, useRef } from "react";
import { SIGNAL_TOPICS, signalForCell } from "@/lib/field-agent-signals";

type Point = { x: number; y: number };
function containsPoint(point: Point, polygon: Point[]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i], b = polygon[j];
    if ((a.y > point.y) !== (b.y > point.y) && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
const CELLS = Array.from({ length: 49 }, (_, index) => ({
  x: index % 7 - 3,
  z: Math.floor(index / 7) - 3,
})).sort((a, b) => a.x + a.z - b.x - b.z);

export function FieldAgentCore({ animated, active = false, compact = false, onSignalHover, onSignalSelect, label }: {
  animated: boolean;
  active?: boolean;
  compact?: boolean;
  onSignalHover?: (id: string | null) => void;
  onSignalSelect?: (id: string) => void;
  label?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const activity = useRef(active);
  const handlers = useRef({ onSignalHover, onSignalSelect });
  const interactive = Boolean(onSignalSelect);
  useEffect(() => { handlers.current = { onSignalHover, onSignalSelect }; }, [onSignalHover, onSignalSelect]);
  useEffect(() => { activity.current = active; }, [active]);

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    const root = element?.parentElement;
    if (!element || !context || !root) return;
    const layer = document.createElement("canvas");
    const surface = layer.getContext("2d");
    if (!surface) return;
    const pointerMedia = window.matchMedia("(hover: hover) and (pointer: fine)");
    const pointer = { x: 0, y: 0, present: false };
    const lifts = CELLS.map(() => 0);
    let hitRegions: { cell: typeof CELLS[number]; polygon: Point[] }[] = [];
    let selected: typeof CELLS[number] | undefined;
    let lastHover: string | null | undefined;
    let flashCell: typeof CELLS[number] | undefined, flashStrength = 0;
    let hovering = false, smoothing = 1;
    let frame = 0, last = 0, time = 0, size = 240, signal = 0;

    const publishHover = () => {
      const id = selected ? signalForCell(selected.x, selected.z).id : null;
      if (id === lastHover) return;
      lastHover = id;
      root.dataset.signalHover = String(Boolean(id));
      handlers.current.onSignalHover?.(id);
    };
    const pick = (point: Point) => {
      for (let i = hitRegions.length - 1; i >= 0; i--) {
        if (containsPoint(point, hitRegions[i].polygon)) return hitRegions[i].cell;
      }
    };
    const movePointer = (event: PointerEvent) => {
      if ((!animated && !interactive) || !pointerMedia.matches || event.pointerType !== "mouse") return;
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointer.x = (event.clientX - rect.left) / rect.width * 240;
      pointer.y = (event.clientY - rect.top) / rect.height * 240;
      pointer.present = true;
      // Keep the selection stable as the column rises underneath a stationary pointer.
      selected = pick(pointer);
      publishHover();
      if (!animated) draw();
    };
    const resetPointer = () => {
      pointer.present = false; selected = undefined;
      publishHover();
    };
    const activate = (event: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const point = { x: (event.clientX - rect.left) / rect.width * 240, y: (event.clientY - rect.top) / rect.height * 240 };
      const cell = event.detail === 0 ? selected ?? CELLS.find(cell => cell.x === 0 && cell.z === 0)
        : pointer.present && selected && Math.hypot(point.x - pointer.x, point.y - pointer.y) < 12 ? selected : pick(point);
      if (!cell) return;
      flashCell = cell;
      flashStrength = animated ? 1 : 0;
      handlers.current.onSignalSelect?.(signalForCell(cell.x, cell.z).id);
      if (!animated) draw();
    };
    const moveWithKeyboard = (event: KeyboardEvent) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const origin = selected ?? { x: 0, z: 0 };
      const x = Math.max(-3, Math.min(3, origin.x + (event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0)));
      const z = Math.max(-3, Math.min(3, origin.z + (event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0)));
      selected = CELLS.find(cell => cell.x === x && cell.z === z);
      pointer.present = true;
      publishHover();
      if (!animated) draw();
    };

    const draw = () => {
      // Fixed logical coordinates keep the same composition in the compact view.
      context.clearRect(0, 0, 240, 240);
      surface.clearRect(0, 0, 240, 240);
      const project = (x: number, z: number, height = 0): Point => ({
        x: 120 + (x - z) * 13,
        y: 151 + (x + z) * 6.3 - height,
      });
      const polygon = (points: Point[], fill: string | CanvasGradient, stroke?: string, lineWidth = 0.65) => {
        surface.beginPath();
        surface.moveTo(points[0].x, points[0].y);
        for (const point of points.slice(1)) surface.lineTo(point.x, point.y);
        surface.closePath();
        surface.fillStyle = fill;
        surface.fill();
        if (stroke) {
          surface.strokeStyle = stroke;
          surface.lineWidth = lineWidth;
          surface.stroke();
        }
      };

      // Floating floor and an isometric grid establish the matrix's footprint.
      polygon([project(-3.8, -3.8), project(3.8, -3.8), project(3.8, 3.8), project(-3.8, 3.8)], "rgba(22,45,73,0.35)", "rgba(103,232,249,0.22)");
      surface.lineWidth = 0.55;
      surface.strokeStyle = "rgba(103,232,249,0.12)";
      for (let line = -3.5; line <= 3.5; line++) {
        for (const [start, end] of [[project(line, -3.5), project(line, 3.5)], [project(-3.5, line), project(3.5, line)]]) {
          surface.beginPath(); surface.moveTo(start.x, start.y); surface.lineTo(end.x, end.y); surface.stroke();
        }
      }

      const hovered = pointer.present ? selected : undefined;
      hovering = Boolean(hovered);
      hitRegions = [];
      for (const [index, cell] of CELLS.entries()) {
        const distance = Math.hypot(cell.x, cell.z);
        const baseHeight = 16 + 29 * Math.exp(-distance * distance / 9) + 8 * (0.5 + 0.5 * Math.sin(cell.x * 1.7 + cell.z * 2.3));
        // A finite neighborhood gives every other column exactly zero hover influence.
        const localDistance = hovered ? Math.hypot(cell.x - hovered.x, cell.z - hovered.z) : Infinity;
        const targetLift = animated ? Math.max(0, 1 - localDistance / 1.35) : 0;
        const response = targetLift > lifts[index] ? Math.min(1, smoothing * 1.8) : smoothing;
        lifts[index] += (targetLift - lifts[index]) * response;
        if (lifts[index] < 0.001 && targetLift === 0) lifts[index] = 0;
        const proximity = lifts[index];
        const wave = 0.5 + 0.5 * Math.sin(distance * 1.5 - time * 5 + cell.x * 0.3);
        const height = baseHeight + proximity * 52 + signal * (8 + wave * 20);
        const flash = cell === flashCell ? flashStrength : 0;
        const brightness = proximity * 0.5 + signal * wave * 0.25 + flash * 0.3;
        const color = SIGNAL_TOPICS[signalForCell(cell.x, cell.z).topic].color;
        const rgb = color.join(",");
        const capColor = color.map(value => Math.round(value + (255 - value) * Math.min(1, proximity * 0.85 + flash * 0.5))).join(",");
        const half = 0.32;
        const a = project(cell.x - half, cell.z - half, height);
        const b = project(cell.x + half, cell.z - half, height);
        const c = project(cell.x + half, cell.z + half, height);
        const d = project(cell.x - half, cell.z + half, height);
        const bottomB = project(cell.x + half, cell.z - half);
        const bottomC = project(cell.x + half, cell.z + half);
        const bottomD = project(cell.x - half, cell.z + half);
        hitRegions.push({ cell, polygon: [a, b, bottomB, bottomC, bottomD, d] });
        const left = surface.createLinearGradient(d.x, d.y, bottomD.x, bottomD.y);
        left.addColorStop(0, `rgba(${rgb},${Math.min(1, 0.55 + brightness * 0.25 + proximity * 0.18)})`);
        left.addColorStop(1, `rgba(${rgb},${0.06 + proximity * 0.24})`);
        const right = surface.createLinearGradient(b.x, b.y, bottomB.x, bottomB.y);
        right.addColorStop(0, `rgba(${rgb},${0.32 + brightness * 0.25 + proximity * 0.28})`);
        right.addColorStop(1, `rgba(${rgb},${0.025 + proximity * 0.16})`);
        // Two translucent sides, a luminous cap, then the front edge.
        polygon([d, c, bottomC, bottomD], left);
        polygon([b, c, bottomC, bottomB], right);
        surface.save();
        surface.shadowColor = `rgba(${rgb},${proximity * 0.9})`;
        surface.shadowBlur = proximity * 14 + flash * 8;
        polygon([a, b, c, d], `rgba(${capColor},${Math.min(1, 0.72 + brightness * 0.25 + proximity * 0.2)})`, `rgba(225,252,255,${Math.min(1, 0.3 + brightness * 0.5 + proximity * 0.45)})`, 0.65 + proximity * 1.3);
        surface.restore();
        surface.beginPath(); surface.moveTo(c.x, c.y); surface.lineTo(bottomC.x, bottomC.y);
        surface.strokeStyle = `rgba(${capColor},${Math.min(1, 0.3 + brightness * 0.4 + proximity * 0.45)})`; surface.lineWidth = 0.65 + proximity * 0.85; surface.stroke();
      }
      // Bloom is separate from the crisp geometry so each column stays readable.
      context.save();
      context.globalCompositeOperation = "screen";
      context.globalAlpha = 0.5;
      context.filter = "blur(7px)";
      context.drawImage(layer, 0, 0, 240, 240);
      context.restore();
      context.drawImage(layer, 0, 0, 240, 240);
    };

    const resize = () => {
      size = element.clientWidth || 240;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      element.width = layer.width = Math.round(size * ratio);
      element.height = layer.height = Math.round(size * ratio);
      const scale = element.width / 240;
      context.setTransform(scale, 0, 0, scale, 0, 0);
      surface.setTransform(scale, 0, 0, scale, 0, 0);
      draw();
    };
    const tick = (now: number) => {
      const delta = now - last;
      if (delta >= 1000 / 30) {
        const elapsed = Math.min(delta, 80);
        smoothing = 1 - Math.exp(-elapsed / 150);
        flashStrength *= Math.exp(-elapsed / 180);
        // Pause generation waves during hover so unrelated columns stay still.
        if (!hovering && !pointer.present) {
          signal += ((activity.current ? 1 : 0) - signal) * smoothing;
          time += elapsed / 1000;
        }
        last = now;
        draw();
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      if (document.hidden || !animated) resetPointer();
      last = performance.now();
      if (animated && !document.hidden) frame = requestAnimationFrame(tick);
      else draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    if (interactive) publishHover();
    sync();
    document.addEventListener("visibilitychange", sync);
    if (animated || interactive) {
      root.addEventListener("pointerenter", movePointer, { passive: true });
      root.addEventListener("pointermove", movePointer, { passive: true });
      root.addEventListener("pointerleave", resetPointer);
      root.addEventListener("pointercancel", resetPointer);
      root.addEventListener("blur", resetPointer);
      window.addEventListener("blur", resetPointer);
      pointerMedia.addEventListener("change", resetPointer);
    }
    if (interactive) {
      root.addEventListener("click", activate);
      root.addEventListener("keydown", moveWithKeyboard);
    }
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      root.removeEventListener("pointerenter", movePointer);
      root.removeEventListener("pointermove", movePointer);
      root.removeEventListener("pointerleave", resetPointer);
      root.removeEventListener("pointercancel", resetPointer);
      root.removeEventListener("blur", resetPointer);
      root.removeEventListener("click", activate);
      root.removeEventListener("keydown", moveWithKeyboard);
      root.removeAttribute("data-signal-hover");
      window.removeEventListener("blur", resetPointer);
      pointerMedia.removeEventListener("change", resetPointer);
      layer.width = layer.height = 0;
    };
  }, [animated, interactive]);

  const Root = interactive ? "button" : "div";
  return <Root type={interactive ? "button" : undefined} className={`field-agent-core${compact ? " field-agent-core-compact" : ""}`} aria-hidden={interactive ? undefined : true} aria-label={interactive ? label : undefined}><span className="field-agent-core-aura" /><span className="field-agent-core-base" /><canvas ref={canvas} aria-hidden="true" className="relative block size-full" /></Root>;
}
