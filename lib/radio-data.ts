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
  /** 唱片封面：public 下的路径，如 "/covers/song.jpg"。留空则由 RadioDisc 按标题生成底色 */
  cover?: string;
  title: string;
  artist: string;
  /** 可选的第二行小字：专辑 / 年份 / 版本 */
  note?: string;
};

export const RADIO_TRACKS: readonly RadioTrack[] = [
  { src: "/audio/周杰伦 - 东风破.mp3", title: "东风破", artist: "周杰伦", note: "专辑 · 叶惠美", cover: "/covers/dongfengpo.jpg" },
  { src: "/audio/周杰伦 - 半岛铁盒.mp3", title: "半岛铁盒", artist: "周杰伦", note: "专辑 · 八度空间", cover: "/covers/bandaotiehe.jpg" },
  { src: "/audio/周杰伦 - 发如雪.mp3", title: "发如雪", artist: "周杰伦", note: "专辑 · 十一月的萧邦", cover: "/covers/faruxue.jpg" },
  { src: "/audio/周杰伦 - 花海.mp3", title: "花海", artist: "周杰伦", note: "专辑 · 魔杰座", cover: "/covers/huahai.jpg" },
  { src: "/audio/周杰伦 - 回到过去.mp3", title: "回到过去", artist: "周杰伦", note: "专辑 · 八度空间", cover: "/covers/huidao-guoqu.jpg" },
  { src: "/audio/周杰伦 - 龙卷风.mp3", title: "龙卷风", artist: "周杰伦", note: "专辑 · Jay", cover: "/covers/longjuanfeng.jpg" },
  { src: "/audio/周杰伦 - 说好的幸福呢.mp3", title: "说好的幸福呢", artist: "周杰伦", note: "专辑 · 魔杰座", cover: "/covers/shuohaode-xingfunne.jpg" },
  { src: "/audio/Lyn - 星と僕らと.mp3", title: "星星与我们", artist: "Lyn", cover: "/covers/xingxing-yu-women.jpg" },
  { src: "/audio/陈奕迅 - 葡萄成熟时.mp3", title: "葡萄成熟时", artist: "陈奕迅", note: "专辑 · U87", cover: "/covers/putao-chengshushi.jpg" },
  { src: "/audio/陈奕迅 - 十面埋伏.mp3", title: "十面埋伏", artist: "陈奕迅", note: "专辑 · The Best Moment", cover: "/covers/shimian-maifu.jpg" },
  { src: "/audio/陈奕迅 - 单车.mp3", title: "单车", artist: "陈奕迅", cover: "/covers/danche.jpg" },
  { src: "/audio/方大同 - Love Song.mp3", title: "Love Song", artist: "方大同", note: "专辑 · 未来", cover: "/covers/love-song.jpg" },
  { src: "/audio/方大同 - 爱爱爱.mp3", title: "爱爱爱", artist: "方大同", note: "专辑 · 爱爱爱", cover: "/covers/aiaiai.jpg" },
  { src: "/audio/方大同 - 才二十三.mp3", title: "才二十三", artist: "方大同", note: "梦想家 The Dreamer", cover: "/covers/cai-ershisan.jpg" },
  { src: "/audio/方大同 - 为你写的歌.mp3", title: "为你写的歌", artist: "方大同", note: "专辑 · 橙月", cover: "/covers/weini-xiedege.jpg" },
  { src: "/audio/方大同 - 特别的人.mp3", title: "特别的人", artist: "方大同", note: "专辑 · 危险世界", cover: "/covers/tebiede-ren.jpg" },
  { src: "/audio/方大同 - 红豆.mp3", title: "红豆", artist: "方大同", note: "专辑 · The Soulboy Collection", cover: "/covers/hongdou.jpg" },
  { src: "/audio/方大同 - 麦恩莉.mp3", title: "麦恩莉", artist: "方大同", note: "专辑 · 回到未来", cover: "/covers/maienli.jpg" },
  { src: "/audio/Akie秋绘 - 心拍数♯0822.mp3", title: "心拍数♯0822", artist: "Akie秋绘", note: "翻自 初音ミク · 专辑 冬氤。2016-17", cover: "/covers/xinpaishu-0822.svg" },
  { src: "/audio/Akie秋绘 - 約束.mp3", title: "约束", artist: "Akie秋绘", note: "专辑 · 约定", cover: "/covers/yueshu.svg" },
];
