/** LRC 歌词解析：只保留带时间轴且有文字的行（纯间奏的空行会让歌词一格格闪空白）。 */
export type LyricLine = { time: number; text: string };

const STAMP = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

export function parseLrc(source: string): LyricLine[] {
  const lines: LyricLine[] = [];

  for (const raw of source.split(/\r?\n/)) {
    const trimmed = raw.trim();
    // [ti:] [ar:] [offset:] 这类标签不含「数字:数字」，所以下面的正则天然忽略它们
    if (!trimmed) continue;

    const stamps = [...trimmed.matchAll(STAMP)];
    if (stamps.length === 0) continue;

    const text = trimmed.slice((stamps.at(-1)?.index ?? 0) + (stamps.at(-1)?.[0].length ?? 0)).trim();
    if (!text) continue;

    for (const stamp of stamps) {
      const fraction = stamp[3] ? Number(`0.${stamp[3]}`) : 0;
      lines.push({ time: Number(stamp[1]) * 60 + Number(stamp[2]) + fraction, text });
    }
  }

  return lines.sort((a, b) => a.time - b.time);
}

/** 约定：/audio/x.mp3 的歌词放 /lyrics/x.lrc。外链曲目或自定义歌词用 track.lyrics 覆盖。 */
export function lyricsPathFor(src?: string) {
  if (!src || !src.startsWith("/audio/")) return null;
  return `/lyrics/${src.slice("/audio/".length).replace(/\.[^.]+$/, "")}.lrc`;
}

/** 二分找到 currentTime 落在哪一行（行数很少，但每次都线性扫也不合适）。 */
export function activeLineIndex(lines: readonly LyricLine[], currentTime: number) {
  if (lines.length === 0) return -1;
  let low = 0;
  let high = lines.length - 1;
  let found = -1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (lines[mid].time <= currentTime) {
      found = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return found;
}
