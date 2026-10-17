"use client";

import { useEffect, useRef, useState } from "react";
import { useGlobalEffects } from "@/components/site/global-effects-provider";
import { usePageTransition } from "@/components/site/page-transition-provider";

const interactiveSelector =
  'a, button, summary, label, select, input[type="checkbox"], input[type="radio"], input[type="range"], [role="button"], [role="link"], [role="tab"], [role="menuitem"], [role="option"], [role="switch"], [data-cursor-interactive]';
const nativeCursorSelector =
  'input:not([type]), input[type="text"], input[type="search"], input[type="email"], input[type="password"], input[type="url"], input[type="number"], textarea, [contenteditable]:not([contenteditable="false"]), .cursor-grab, .cursor-grabbing, [data-native-cursor]';

type Magnet = {
  originalTranslate: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  active: boolean;
};

export function FieldCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [finePointer, setFinePointer] = useState(false);
  const { cursorEnabled } = useGlobalEffects();
  const { motionEnabled } = usePageTransition();
  const active = finePointer && cursorEnabled && motionEnabled;

  useEffect(() => {
    const query = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const update = () => setFinePointer(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!active || !cursor) return;

    const root = document.documentElement;
    root.dataset.fieldCursor = "true";
    let highlighted: HTMLElement | null = null;
    const magnets = new Map<HTMLElement, Magnet>();
    let frame = 0;

    const animateMagnets = () => {
      let moving = false;
      magnets.forEach((magnet, element) => {
        magnet.x += (magnet.targetX - magnet.x) * 0.18;
        magnet.y += (magnet.targetY - magnet.y) * 0.18;
        if (
          !magnet.active &&
          Math.abs(magnet.x) < 0.06 &&
          Math.abs(magnet.y) < 0.06
        ) {
          element.style.translate = magnet.originalTranslate;
          magnets.delete(element);
          return;
        }
        element.style.translate = `${magnet.x.toFixed(2)}px ${magnet.y.toFixed(2)}px`;
        if (
          !magnet.active ||
          Math.abs(magnet.targetX - magnet.x) > 0.06 ||
          Math.abs(magnet.targetY - magnet.y) > 0.06
        )
          moving = true;
      });
      frame = moving ? requestAnimationFrame(animateMagnets) : 0;
    };

    const scheduleMagnetFrame = () => {
      if (!frame) frame = requestAnimationFrame(animateMagnets);
    };

    const releaseMagnet = (element: HTMLElement) => {
      const magnet = magnets.get(element);
      if (!magnet) return;
      magnet.active = false;
      magnet.targetX = 0;
      magnet.targetY = 0;
      scheduleMagnetFrame();
    };

    const attract = (element: HTMLElement, event: PointerEvent) => {
      if (!element.matches("a, button, summary, [role='button'], [role='link']"))
        return;
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      let magnet = magnets.get(element);
      if (!magnet) {
        magnet = {
          originalTranslate: element.style.translate,
          x: 0,
          y: 0,
          targetX: 0,
          targetY: 0,
          active: true,
        };
        magnets.set(element, magnet);
      }
      magnet.active = true;
      if (rect.width > 220 || rect.height > 100) {
        magnet.targetX = 0;
        magnet.targetY = -2;
      } else {
        magnet.targetX = Math.max(-3.5, Math.min(3.5,
          ((event.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 3.5,
        ));
        magnet.targetY = Math.max(-3.5, Math.min(3.5,
          ((event.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * 3.5,
        ));
      }
      scheduleMagnetFrame();
    };

    const highlight = (next: Element | null) => {
      const element = next instanceof HTMLElement && !next.matches(":disabled, [aria-disabled='true']")
        ? next
        : null;
      if (element === highlighted) return;
      if (highlighted) {
        highlighted.removeAttribute("data-field-cursor-hover");
        releaseMagnet(highlighted);
      }
      highlighted = element;
      if (!element) return;
      const inlineLink = element.matches("a, [role='link']") &&
        getComputedStyle(element).display === "inline";
      element.dataset.fieldCursorHover = inlineLink ? "link" : "magnet";
    };

    const hide = () => {
      cursor.dataset.visible = "false";
      cursor.dataset.interactive = "false";
      cursor.dataset.pressed = "false";
      highlight(null);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        hide();
        return;
      }
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest(nativeCursorSelector)) {
        hide();
        return;
      }
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      cursor.dataset.visible = "true";
      highlight(target?.closest(interactiveSelector) ?? null);
      cursor.dataset.interactive = highlighted ? "true" : "false";
      if (highlighted && highlighted.dataset.fieldCursorHover === "magnet")
        attract(highlighted, event);
    };
    const down = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      cursor.dataset.pressed = "true";
    };
    const up = () => {
      cursor.dataset.pressed = "false";
    };
    const visibility = () => { if (document.hidden) hide(); };

    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerdown", down, { passive: true });
    document.addEventListener("pointerup", up, { passive: true });
    document.addEventListener("pointercancel", up, { passive: true });
    document.addEventListener("pointerleave", hide);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("blur", hide);

    return () => {
      delete root.dataset.fieldCursor;
      hide();
      if (frame) cancelAnimationFrame(frame);
      magnets.forEach((magnet, element) => {
        element.style.translate = magnet.originalTranslate;
      });
      magnets.clear();
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("pointercancel", up);
      document.removeEventListener("pointerleave", hide);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("blur", hide);
    };
  }, [active]);

  return (
    <div
      aria-hidden="true"
      className="field-cursor"
      data-interactive="false"
      data-pressed="false"
      data-visible="false"
      ref={cursorRef}
    >
      <span className="field-cursor__axis field-cursor__axis--horizontal" />
      <span className="field-cursor__axis field-cursor__axis--vertical" />
      <span className="field-cursor__center" />
      <span className="field-cursor__frame">
        <span className="field-cursor__corner field-cursor__corner--tl" />
        <span className="field-cursor__corner field-cursor__corner--tr" />
        <span className="field-cursor__corner field-cursor__corner--bl" />
        <span className="field-cursor__corner field-cursor__corner--br" />
      </span>
    </div>
  );
}
