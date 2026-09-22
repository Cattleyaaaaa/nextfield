// 电台曲目清单：这里登记一条就会出现在 Field Radio 里。
//
// 例：
// { src: "/audio/slow-current.mp3", title: "Slow Current", artist: "Cattleya", note: "Night Terminal EP · 2026" },
// { href: "https://music.163.com/#/song?id=<歌曲ID>", hrefLabel: "在网易云收听", title: "星星与我们", artist: "Lyn" },
export type RadioTrack = {
  /** 本地音频：public/audio/ 下的路径，如 "/audio/song.mp3" */
  src?: string;
  /** 外部收听链接：授权平台页面或自有 CDN */
  href?: string;
  /** 链接按钮上的文字，默认「去平台收听」 */
  hrefLabel?: string;
  /** 歌词：默认按约定找 /lyrics/同名.lrc，需要别的路径时才写这里 */
  lyrics?: string;
  title: string;
  artist: string;
  /** 可选的第二行小字：专辑 / 年份 / 版本 */
  note?: string;
};

// 音频由 flac 统一转为 mp3（VBR ≈ 190kbps），原始 flac 已移出 public/audio/。
export const RADIO_TRACKS: readonly RadioTrack[] = [
  { src: "/audio/周杰伦 - 东风破.mp3", title: "东风破", artist: "周杰伦", note: "专辑 · 叶惠美" },
  { src: "/audio/周杰伦 - 半岛铁盒.mp3", title: "半岛铁盒", artist: "周杰伦", note: "专辑 · 八度空间" },
  { src: "/audio/周杰伦 - 发如雪.mp3", title: "发如雪", artist: "周杰伦", note: "专辑 · 十一月的萧邦" },
  { src: "/audio/周杰伦 - 花海.mp3", title: "花海", artist: "周杰伦", note: "专辑 · 魔杰座" },
  { src: "/audio/周杰伦 - 回到过去.mp3", title: "回到过去", artist: "周杰伦", note: "专辑 · 八度空间" },
  { src: "/audio/周杰伦 - 龙卷风.mp3", title: "龙卷风", artist: "周杰伦", note: "专辑 · Jay" },
  { src: "/audio/周杰伦 - 说好的幸福呢.mp3", title: "说好的幸福呢", artist: "周杰伦", note: "专辑 · 魔杰座" },
  { src: "/audio/Akie秋绘 - 心拍数♯0822.mp3", title: "心拍数♯0822", artist: "Akie秋绘" },
  { src: "/audio/Akie秋绘 - 約束.mp3", title: "约束", artist: "Akie秋绘", note: "专辑 · 约定" },
];
