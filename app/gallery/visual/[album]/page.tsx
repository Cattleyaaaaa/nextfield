import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GalleryAlbumView } from "@/components/gallery/gallery-album-view";
import { getGalleryAlbum, getGalleryAlbums } from "@/lib/gallery-data";

export async function generateStaticParams() {
  return (await getGalleryAlbums()).map((album) => ({ album: album.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ album: string }>;
}): Promise<Metadata> {
  const { album: slug } = await params;
  const album = await getGalleryAlbum(slug);
  return { title: album ? `${album.title} · 画廊` : "相册不存在" };
}

export default async function GalleryAlbumPage({
  params,
}: {
  params: Promise<{ album: string }>;
}) {
  const { album: slug } = await params;
  const album = await getGalleryAlbum(slug);
  if (!album) notFound();
  return <GalleryAlbumView album={album} />;
}
