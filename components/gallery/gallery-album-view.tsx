"use client";

import { ArrowLeft, Images } from "lucide-react";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { useLanguage } from "@/components/site/language-provider";
import { TransitionLink } from "@/components/site/transition-link";
import type { GalleryAlbum } from "@/lib/gallery-data";

export function GalleryAlbumView({ album }: { album: GalleryAlbum }) {
  const { locale } = useLanguage();
  return (
    <div className="relative isolate mx-auto max-w-site px-5 pb-28 pt-20 sm:px-8 sm:pt-28 lg:px-12">
      <TransitionLink
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent"
        href="/gallery/visual"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {locale === "zh" ? "全部相册" : "All albums"}
      </TransitionLink>
      <div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            VISUAL ARCHIVE / ALBUM
          </p>
          <h1 className="mt-5 font-display text-[clamp(3rem,7vw,6rem)] leading-[0.95] tracking-[-0.06em]">
            {album.title}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted">
            {locale === "zh"
              ? "点开图片查看完整画面；可以用键盘左右方向键切换，Esc 退出。"
              : "Open an image to see it in full. Use the arrow keys to browse and Escape to close."}
          </p>
        </div>
        <span className="rounded-full border border-line px-4 py-2 font-mono text-xs text-muted">
          {album.photos.length} {locale === "zh" ? "张图片" : "PHOTOS"}
        </span>
      </div>
      {album.photos.length ? (
        <GalleryGrid items={album.photos} />
      ) : (
        <div className="mt-12 grid min-h-80 place-items-center rounded-[1.75rem] border border-dashed border-line bg-panel px-6 text-center">
          <div>
            <Images
              className="mx-auto size-10 text-accent"
              strokeWidth={1.2}
              aria-hidden="true"
            />
            <h2 className="mt-6 font-display text-2xl">
              {locale === "zh"
                ? "这本相册还空着。"
                : "This album is still empty."}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              {locale === "zh"
                ? `将图片放入 public/gallery/${album.title}/，下次构建后便会出现在这里。`
                : `Add images to public/gallery/${album.title}/ and rebuild the site to see them here.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
