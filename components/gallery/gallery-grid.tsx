"use client";

import { useRef } from "react";
import { GlareHover } from "@/components/react-bits/glare-hover";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotionPreference } from "@/lib/use-motion-preference";

export type GalleryItem = {
  src: string;
  alt: string;
  title: string;
  note: string;
};

export const GALLERY_MOTION = {
  start: "top 86%",
  y: 34,
  scale: 0.975,
  duration: 0.8,
  stagger: 0.12,
  ease: "power3.out",
};

export const GALLERY_GLARE = {
  glareColor: "rgb(var(--liquid-foam) / 0.2)",
  glareAngle: -38,
  glareSize: 220,
  duration: 820,
};

export function GalleryGrid({ items }: { items: readonly GalleryItem[] }) {
  const reducedMotion = useMotionPreference();
  const gridRef = useRef<HTMLUListElement>(null);

  useGSAP(() => {
    if (reducedMotion) return;

    gsap.fromTo(
      "[data-gallery-card]",
      { autoAlpha: 0, y: GALLERY_MOTION.y, scale: GALLERY_MOTION.scale },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: GALLERY_MOTION.duration,
        stagger: GALLERY_MOTION.stagger,
        ease: GALLERY_MOTION.ease,
        clearProps: "opacity,visibility,transform",
        scrollTrigger: {
          trigger: gridRef.current,
          start: GALLERY_MOTION.start,
          once: true,
        },
      },
    );
  }, { scope: gridRef, dependencies: [reducedMotion], revertOnUpdate: true });

  return (
    <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" ref={gridRef}>
      {items.map((item, index) => (
        <li className="group" data-gallery-card key={item.src}>
          <GlareHover {...GALLERY_GLARE} className="overflow-hidden rounded-3xl">
            <figure className="overflow-hidden rounded-3xl border border-line bg-panel transition-colors duration-500 group-hover:border-accent/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={item.alt}
                className="aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                height={800}
                src={item.src}
                width={800}
              />
              <figcaption className="flex items-baseline justify-between gap-3 px-5 py-4">
                <span className="font-display text-lg tracking-[-0.03em]">{item.title}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </figcaption>
            </figure>
          </GlareHover>
          <p className="mt-2 text-xs leading-5 text-muted">{item.note}</p>
        </li>
      ))}
    </ul>
  );
}
