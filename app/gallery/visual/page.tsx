import type { Metadata } from "next";
import { GalleryVisualFrame } from "@/components/gallery/gallery-album-index";
import { getGalleryAlbums } from "@/lib/gallery-data";

export const metadata: Metadata = {
  title: "画廊",
  description: "以图片为主的视觉档案：插画、配色实验与构建现场。",
};

export default async function GalleryVisualPage() {
  return <GalleryVisualFrame albums={await getGalleryAlbums()} />;
}
