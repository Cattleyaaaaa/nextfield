import { readdir } from "node:fs/promises";
import type { Dirent } from "node:fs";
import { join } from "node:path";
import type { GalleryItem } from "@/components/gallery/gallery-grid";

const GALLERY_ROOT = join(process.cwd(), "public", "gallery");
const IMAGE_EXTENSION = /\.(?:avif|gif|jpe?g|png|webp)$/i;
const UNCATEGORIZED = "未分类";

export type GalleryAlbum = {
  slug: string;
  title: string;
  cover: string | null;
  previews: string[];
  photos: GalleryItem[];
};

function imageNames(entries: Dirent<string>[]) {
  return entries
    .filter(
      (entry) =>
        entry.isFile() &&
        IMAGE_EXTENSION.test(entry.name) &&
        !entry.name.startsWith("_"),
    )
    .map((entry) => entry.name)
    .sort((a, b) => b.localeCompare(a, "zh-CN", { numeric: true }));
}

function photoTitle(filename: string, index: number) {
  const name = filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim();
  return /^\d{8,}(?: \d+)?$/.test(name)
    ? `影像 ${String(index + 1).padStart(2, "0")}`
    : name;
}

function toAlbum(
  title: string,
  filenames: string[],
  coverFilename?: string,
  isRoot = false,
): GalleryAlbum {
  const prefix = isRoot ? "/gallery" : `/gallery/${encodeURIComponent(title)}`;
  const photos = filenames.map((filename, index) => ({
    src: `${prefix}/${encodeURIComponent(filename)}`,
    alt: `${title} · ${photoTitle(filename, index)}`,
    title: photoTitle(filename, index),
    note: filename,
  }));
  const cover = coverFilename
    ? `${prefix}/${encodeURIComponent(coverFilename)}`
    : (photos[0]?.src ?? null);
  return {
    slug: isRoot ? "__root" : title,
    title,
    cover,
    previews: photos.slice(0, 3).map((photo) => photo.src),
    photos,
  };
}

/** A folder is an album. Images added to public/gallery/<folder>/ appear on the next build. */
export async function getGalleryAlbums(): Promise<GalleryAlbum[]> {
  let entries: Dirent<string>[];
  try {
    entries = await readdir(GALLERY_ROOT, { withFileTypes: true });
  } catch {
    return [];
  }

  const folders = entries.filter(
    (entry) =>
      entry.isDirectory() &&
      !entry.name.startsWith(".") &&
      !entry.name.startsWith("_"),
  );
  const albums = await Promise.all(
    folders.map(async (folder) => {
      const files = await readdir(join(GALLERY_ROOT, folder.name), {
        withFileTypes: true,
      });
      const names = imageNames(files);
      const coverName = files.find(
        (file) =>
          file.isFile() &&
          /^_cover\.(?:avif|gif|jpe?g|png|webp)$/i.test(file.name),
      )?.name;
      return toAlbum(folder.name, names, coverName);
    }),
  );
  const rootImages = imageNames(entries);
  if (rootImages.length)
    albums.push(toAlbum(UNCATEGORIZED, rootImages, undefined, true));
  return albums.sort(
    (a, b) =>
      Number(b.photos.length > 0) - Number(a.photos.length > 0) ||
      a.title.localeCompare(b.title, "zh-CN"),
  );
}

export async function getGalleryAlbum(slug: string) {
  const albums = await getGalleryAlbums();
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    /* A malformed path matches no album. */
  }
  return (
    albums.find(
      (album) => album.slug.normalize("NFC") === decoded.normalize("NFC"),
    ) ?? null
  );
}
