import type { Metadata } from "next";
import { GalleryGrid, type GalleryItem } from "@/components/gallery/gallery-grid";

export const metadata: Metadata = {
  title: "AI 画廊",
  description: "提示词与生成图的公开档案。",
};

// 素材来源：用户提供（Steam 创意工坊 Wallpaper Engine 预览图，第三方作品）。
// 换成自己的生成图后，请同步删除下方的占位提示条。
const galleryItems = [
  {
    src: "/gallery/preview-01.jpg",
    alt: "占位素材：深色发丝与晶状眼睛的角色特写",
    title: "占位素材",
    note: "这张图来自用户提供的占位文件，替换成你自己的生成图即可。",
  },
] satisfies GalleryItem[];

export default function GalleryPage() {
  return (
    <div className="relative isolate mx-auto max-w-site px-5 pb-28 pt-20 sm:px-8 sm:pt-28 lg:px-12">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Gallery / 04</p>
      <h1 className="mt-6 max-w-4xl text-balance font-display text-[clamp(3rem,7vw,6rem)] leading-[0.95] tracking-[-0.06em]">
        AI 画廊。
      </h1>
      <p className="mt-8 max-w-2xl text-lg leading-9 text-muted">
        一个收纳生成图的公开档案：每一次提示词的落笔，都会留下一张可被回望的图像。
        目前还是占位内容，等你把图放进来。
      </p>

      <p className="mt-8 rounded-2xl border border-dashed border-accent/50 bg-accent/[0.06] px-5 py-4 text-sm leading-6 text-ink">
        这一页是占位页。把生成图放进 <span className="font-mono text-ink">public/gallery/</span>，
        再把上面 <span className="font-mono text-ink">app/gallery/page.tsx</span> 里的数组换成真实条目即可。
      </p>

      <GalleryGrid items={galleryItems} />
    </div>
  );
}
