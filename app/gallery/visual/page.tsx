import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { TransitionLink } from "@/components/site/transition-link";
import { GALLERY_ITEMS } from "@/lib/gallery-data";

export const metadata: Metadata = {
  title: "画廊",
  description: "以图片为主的视觉档案：插画、配色实验与构建现场。",
};

export default function GalleryVisualPage() {
  return (
    <div className="relative isolate mx-auto max-w-site px-5 pb-28 pt-20 sm:px-8 sm:pt-28 lg:px-12">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Visual archive / 04</p>
      <h1 className="mt-6 max-w-5xl text-balance font-display text-[clamp(3rem,7vw,6rem)] leading-[0.92] tracking-[-0.06em]">
        先有画面，<br />再谈解释。
      </h1>
      <p className="mt-8 max-w-2xl text-lg leading-9 text-muted">
        这里只有图片和它的一句注脚。每张图下面写清它是什么、为什么留下来，不写更多。
      </p>

      <GalleryGrid items={GALLERY_ITEMS} />

      <div className="mt-16 border-t border-line pt-8">
        <TransitionLink className="group inline-flex items-center gap-2 text-sm text-muted hover:text-accent" href="/gallery">
          <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
          回到开放实验室
        </TransitionLink>
      </div>
    </div>
  );
}
