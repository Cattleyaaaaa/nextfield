"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { GlareHover } from "@/components/react-bits/glare-hover";
import { useLanguage } from "@/components/site/language-provider";
import { usePageTransition } from "@/components/site/page-transition-provider";
import { gsap, useGSAP } from "@/lib/gsap";

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
  const { motionEnabled } = usePageTransition();
  const { locale } = useLanguage();
  const gridRef = useRef<HTMLUListElement>(null);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (selected === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
      if (event.key === "ArrowLeft")
        setSelected((value) =>
          value === null ? null : (value - 1 + items.length) % items.length,
        );
      if (event.key === "ArrowRight")
        setSelected((value) =>
          value === null ? null : (value + 1) % items.length,
        );
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selected, items.length]);

  useGSAP(
    () => {
      if (!motionEnabled) return;

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
    },
    { scope: gridRef, dependencies: [motionEnabled], revertOnUpdate: true },
  );

  return (
    <ul
      className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      ref={gridRef}
    >
      {items.map((item, index) => (
        <li className="group" data-gallery-card key={item.src}>
          <GlareHover
            {...GALLERY_GLARE}
            className="overflow-hidden rounded-3xl"
          >
            <button
              aria-label={`${locale === "zh" ? "查看大图" : "View image"}：${item.title}`}
              className="block w-full overflow-hidden rounded-3xl border border-line bg-panel text-left transition-colors duration-500 group-hover:border-accent/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              onClick={() => setSelected(index)}
              type="button"
            >
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={item.alt}
                  className="aspect-[4/3] w-full bg-ink/5 object-contain transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                  height={800}
                  loading="lazy"
                  src={item.src}
                  width={800}
                />
                <figcaption className="flex items-baseline justify-between gap-3 px-5 py-4">
                  <span className="font-display text-lg tracking-[-0.03em]">
                    {item.title}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </figcaption>
              </figure>
            </button>
          </GlareHover>
          <p className="mt-2 text-xs leading-5 text-muted">{item.note}</p>
        </li>
      ))}
      {selected !== null && (
        <li
          className="fixed inset-0 z-[110] grid place-items-center bg-ink/95 p-3 text-paper sm:p-8"
          role="presentation"
          onClick={() => setSelected(null)}
        >
          <div
            aria-label={locale === "zh" ? "图片预览" : "Image preview"}
            aria-modal="true"
            className="relative flex max-h-full w-full max-w-6xl flex-col"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="mb-3 flex items-center justify-between gap-4">
              <span className="min-w-0 truncate font-display text-xl">
                {items[selected].title}{" "}
                <span className="ml-2 font-mono text-xs text-paper/55">
                  {selected + 1} / {items.length}
                </span>
              </span>
              <button
                aria-label={locale === "zh" ? "关闭预览" : "Close preview"}
                className="grid size-10 shrink-0 place-items-center rounded-full border border-paper/25 hover:bg-paper/15"
                onClick={() => setSelected(null)}
                type="button"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center">
              <button
                aria-label={locale === "zh" ? "上一张" : "Previous image"}
                className="absolute left-1 z-10 grid size-10 place-items-center rounded-full bg-ink/65 hover:bg-ink sm:left-4"
                onClick={() =>
                  setSelected((selected - 1 + items.length) % items.length)
                }
                type="button"
              >
                <ChevronLeft className="size-6" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={items[selected].alt}
                className="max-h-[75svh] max-w-full rounded-lg object-contain"
                src={items[selected].src}
              />
              <button
                aria-label={locale === "zh" ? "下一张" : "Next image"}
                className="absolute right-1 z-10 grid size-10 place-items-center rounded-full bg-ink/65 hover:bg-ink sm:right-4"
                onClick={() => setSelected((selected + 1) % items.length)}
                type="button"
              >
                <ChevronRight className="size-6" />
              </button>
            </div>
            <p className="mt-3 truncate text-center font-mono text-xs text-paper/55">
              {items[selected].note}
            </p>
          </div>
        </li>
      )}
    </ul>
  );
}
