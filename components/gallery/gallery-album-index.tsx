"use client";

import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Image as ImageIcon } from "lucide-react";
import { GlareHover } from "@/components/react-bits/glare-hover";
import { useLanguage } from "@/components/site/language-provider";
import { TransitionLink } from "@/components/site/transition-link";
import type { GalleryAlbum } from "@/lib/gallery-data";

export function GalleryVisualFrame({
  albums,
}: {
  albums: readonly GalleryAlbum[];
}) {
  const { locale } = useLanguage();
  return (
    <div className="relative isolate mx-auto max-w-site px-5 pb-28 pt-20 sm:px-8 sm:pt-28 lg:px-12">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
        Visual archive / 04
      </p>
      <h1 className="mt-6 max-w-5xl text-balance font-display text-[clamp(3rem,7vw,6rem)] leading-[0.92] tracking-[-0.06em]">
        {locale === "zh" ? "一类画面，一本相册。" : "One theme. One album."}
      </h1>
      <p className="mt-8 max-w-2xl text-lg leading-9 text-muted">
        {locale === "zh"
          ? "按主题分册收藏图片。打开一个分类，再慢慢看其中的每一张。"
          : "Images are collected by theme. Open an album, then take your time with each image."}
      </p>
      <GalleryAlbumIndex albums={albums} />
      <details className="mt-16 rounded-2xl border border-line bg-panel px-5 py-4 text-sm text-muted">
        <summary className="cursor-pointer font-medium text-ink">
          {locale === "zh" ? "如何向画廊添加图片" : "How to add images"}
        </summary>
        <p className="mt-3 leading-7">
          {locale === "zh"
            ? "在 public/gallery/ 下创建以分类命名的文件夹，然后把 JPG、PNG、WebP、AVIF 或 GIF 图片放进去。文件夹自动成为相册，图片自动成为相册内容；新增内容发布到线上时需要重新构建部署。可放一张 _cover.jpg 作为分类封面，它不会计入图片数量。"
            : "Create a named folder under public/gallery/ and place JPG, PNG, WebP, AVIF or GIF files inside. Folders become albums automatically; rebuild and redeploy to publish new files. An optional _cover.jpg sets the album cover without appearing in the photo count."}
        </p>
      </details>
      <div className="mt-16 border-t border-line pt-8">
        <TransitionLink
          className="group inline-flex items-center gap-2 text-sm text-muted hover:text-accent"
          href="/gallery"
        >
          <ArrowLeft
            className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
          {locale === "zh" ? "回到开放实验室" : "Back to the open lab"}
        </TransitionLink>
      </div>
    </div>
  );
}

export function GalleryAlbumIndex({
  albums,
}: {
  albums: readonly GalleryAlbum[];
}) {
  const { locale } = useLanguage();

  if (!albums.length)
    return (
      <p className="mt-12 rounded-2xl border border-dashed border-line p-8 text-sm text-muted">
        {locale === "zh"
          ? "还没有相册。先在 public/gallery/ 下创建一个文件夹。"
          : "No albums yet. Create a folder under public/gallery/ to begin."}
      </p>
    );

  return (
    <ul className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
      {albums.map((album, index) => (
        <li className="group min-w-0" key={album.slug}>
          <GlareHover
            className="rounded-[1.75rem]"
            glareColor="rgb(var(--liquid-foam) / 0.14)"
          >
            <TransitionLink
              className="block rounded-[1.75rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              href={`/gallery/visual/${encodeURIComponent(album.slug)}`}
            >
              <div className="relative aspect-[5/4] overflow-hidden rounded-[1.75rem] border border-line bg-panel transition-colors duration-300 group-hover:border-accent/60">
                {album.cover ? (
                  <>
                    {album.previews[2] && (
                      <span className="absolute inset-x-[16%] bottom-[9%] top-[15%] rotate-[9deg] overflow-hidden rounded-xl border border-paper/50 bg-ink shadow-xl">
                        <Image
                          alt=""
                          className="size-full object-cover"
                          fill
                          loading="lazy"
                          sizes="(min-width: 1280px) 320px, (min-width: 640px) 45vw, 90vw"
                          src={album.previews[2]}
                        />
                      </span>
                    )}
                    {album.previews[1] && (
                      <span className="absolute inset-x-[13%] bottom-[10%] top-[13%] -rotate-[6deg] overflow-hidden rounded-xl border border-paper/50 bg-ink shadow-xl">
                        <Image
                          alt=""
                          className="size-full object-cover"
                          fill
                          loading="lazy"
                          sizes="(min-width: 1280px) 320px, (min-width: 640px) 45vw, 90vw"
                          src={album.previews[1]}
                        />
                      </span>
                    )}
                    <span className="absolute inset-x-[12%] bottom-[10%] top-[11%] overflow-hidden rounded-xl border border-paper/50 bg-ink shadow-[0_20px_40px_rgb(0_0_0/.18)] transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-[-2deg]">
                      <Image
                        alt=""
                        className="size-full object-cover"
                        fill
                        loading="lazy"
                        sizes="(min-width: 1280px) 320px, (min-width: 640px) 45vw, 90vw"
                        src={album.cover}
                      />
                    </span>
                  </>
                ) : (
                  <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_40%,rgb(var(--liquid-foam)/.2),transparent_52%)]">
                    <div className="grid size-24 place-items-center rounded-[1.4rem] border border-line bg-paper/60 shadow-lg transition-transform duration-500 group-hover:-rotate-6 group-hover:-translate-y-2">
                      <ImageIcon
                        className="size-10 text-accent"
                        strokeWidth={1.2}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                )}
                <span className="absolute left-5 top-5 rounded-full border border-line/70 bg-paper/85 px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] text-ink backdrop-blur-md">
                  {locale === "zh" ? "相册" : "ALBUM"} /{" "}
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="absolute bottom-5 right-5 rounded-full bg-accent px-3 py-1.5 font-mono text-[10px] text-white shadow-lg">
                  {album.photos.length} {locale === "zh" ? "张" : "PHOTOS"}
                </span>
              </div>
              <div className="mt-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-display text-2xl tracking-[-0.04em] transition-colors group-hover:text-accent sm:text-3xl">
                    {album.title}
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    {album.photos.length
                      ? locale === "zh"
                        ? "进入相册，浏览全部图片"
                        : "Open album to browse the collection"
                      : locale === "zh"
                        ? "等待加入图片"
                        : "Waiting for images"}
                  </p>
                </div>
                <ArrowUpRight
                  className="mt-1 size-5 shrink-0 text-accent transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </div>
            </TransitionLink>
          </GlareHover>
        </li>
      ))}
    </ul>
  );
}
