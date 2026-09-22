"use client";

import { type HTMLAttributes, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotionPreference } from "@/lib/use-motion-preference";

type TiltSurfaceProps = HTMLAttributes<HTMLDivElement> & {
  maxTilt?: number;
  lift?: number;
  perspective?: number;
};

/** A small, reusable 3D interaction that stays on the compositor. */
export function TiltSurface({
  children,
  className = "",
  maxTilt = 7,
  lift = 6,
  perspective = 900,
  ...props
}: TiltSurfaceProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useMotionPreference();

  useGSAP(() => {
    const element = rootRef.current;
    if (!element || reducedMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    gsap.set(element, { transformPerspective: perspective, transformStyle: "preserve-3d" });
    element.querySelectorAll<HTMLElement>("[data-tilt-depth]").forEach((layer) => {
      gsap.set(layer, { z: Number(layer.dataset.tiltDepth) || 0, transformStyle: "preserve-3d" });
    });

    const rotateXTo = gsap.quickTo(element, "rotationX", { duration: 0.55, ease: "power3.out" });
    const rotateYTo = gsap.quickTo(element, "rotationY", { duration: 0.55, ease: "power3.out" });
    const yTo = gsap.quickTo(element, "y", { duration: 0.45, ease: "power3.out" });
    const scaleTo = gsap.quickTo(element, "scale", { duration: 0.45, ease: "power3.out" });
    const shineX = gsap.quickSetter(element, "--tilt-shine-x", "%");
    const shineY = gsap.quickSetter(element, "--tilt-shine-y", "%");

    const onEnter = () => {
      yTo(-lift);
      scaleTo(1.012);
    };
    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      rotateXTo((0.5 - y) * maxTilt * 2);
      rotateYTo((x - 0.5) * maxTilt * 2);
      shineX(x * 100);
      shineY(y * 100);
    };
    const onLeave = () => {
      rotateXTo(0);
      rotateYTo(0);
      yTo(0);
      scaleTo(1);
      shineX(50);
      shineY(50);
    };

    element.addEventListener("pointerenter", onEnter);
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);

    return () => {
      element.removeEventListener("pointerenter", onEnter);
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
    };
  }, { scope: rootRef, dependencies: [lift, maxTilt, perspective, reducedMotion], revertOnUpdate: true });

  return (
    <div className={`tilt-surface ${className}`.trim()} ref={rootRef} {...props}>
      {children}
      <span aria-hidden="true" className="tilt-surface__shine" />
    </div>
  );
}
