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
  params: { album: string };
}): Promise<Metadata> {
  const album = await getGalleryAlbum(params.album);
  return { title: album ? `${album.title} · 画廊` : "相册不存在" };
}

export default async function GalleryAlbumPage({
  params,
}: {
  params: { album: string };
}) {
  const album = await getGalleryAlbum(params.album);
  if (!album) notFound();
  return <GalleryAlbumView album={album} />;
}
