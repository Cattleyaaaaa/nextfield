import type { GalleryItem } from "@/components/gallery/gallery-grid";

// 画廊条目：图片放 public/gallery/，在这里加一条就会出现在 /gallery/visual。
// src 写站内绝对路径（以 / 开头），不要带 public/。卡片是 1:1 方形容器，非方图会被裁切。
export const GALLERY_ITEMS: readonly GalleryItem[] = [
  {
    src: "/gallery/preview-01.jpg",
    alt: "特写插画：深色头发下的一只眼睛，瞳孔中是发光的蓝紫晶体",
    title: "晶体之眼",
    note: "810 × 810 方形插画，先用它把方形裁切与悬停反光两条效果跑通。",
  },
];
