// 电台曲目清单：这里登记一条就会出现在 Field Radio 里。
import { fieldRadioCover } from "@/lib/radio-cover";

// 封面一律站内托管：public/covers/<slug>.jpg。
// 曾经用 coverartarchive.org 的 front-500 直链，但那个地址会 307 跳到 archive.org，
// 而 archive.org 在部分网络下不可达，结果是封面静默退回渐变色块——看起来就是「这首歌没有封面」。
// 所以发行封面先按 MusicBrainz 的发行组资料核对（专辑名 / 艺人 / 发行日期），
// 确认无误后再把官方专辑图存进 public/covers/，页面只引用本地路径。
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
  /** 唱片封面：public 下的路径，如 "/covers/song.jpg"。留空则生成本站原创视觉封面 */
  cover?: string;
  title: string;
  artist: string;
  /** 可选的第二行小字：专辑 / 年份 / 版本 */
  note?: string;
};

const LISTED_TRACKS: readonly RadioTrack[] = [
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
  { src: "/audio/Akie秋绘 - 約束.mp3", title: "约束", artist: "Akie秋绘", cover: "/covers/yueshu.svg" },
  { src: "/audio/G.E.M.邓紫棋 - 多远都要在一起.mp3", title: "多远都要在一起", artist: "邓紫棋", note: "专辑 · 新的心跳", cover: "/covers/xinde-xintiao.jpg" },
  { src: "/audio/G.E.M.邓紫棋 - 光年之外.mp3", title: "光年之外", artist: "邓紫棋", note: "专辑 · 光年之外", cover: "/covers/guangnian-zhiwai.jpg" },
  { src: "/audio/G.E.M.邓紫棋 - 桃花诺.mp3", title: "桃花诺", artist: "邓紫棋", cover: "/covers/taohua-nuo.jpg" },
  { src: "/audio/G.E.M.邓紫棋 - 再见（good bye）.mp3", title: "再见（good bye）", artist: "邓紫棋", note: "专辑 · 新的心跳", cover: "/covers/xinde-xintiao.jpg" },
  { src: "/audio/Justin Bieber - Come Around Me.mp3", title: "Come Around Me", artist: "Justin Bieber", note: "专辑 · Changes", cover: "/covers/come-around-me.jpg" },
  { src: "/audio/Justin Bieber - Intentions (Acoustic).mp3", title: "Intentions (Acoustic)", artist: "Justin Bieber", note: "单曲 · Intentions (acoustic)", cover: "/covers/intentions-acoustic.jpg" },
  { src: "/audio/Justin Bieber,Daniel Caesar,GIVĒON - Peaches.mp3", title: "Peaches", artist: "Justin Bieber", note: "专辑 · Justice", cover: "/covers/peaches.jpg" },
  { src: "/audio/鷲尾伶菜 - 散る散る満ちる.mp3", title: "散る散る満ちる", artist: "鷲尾伶菜", note: "专辑 · For My Dear", cover: "/covers/chiruchiru-michiru.jpg" },
  { src: "/audio/蔡徐坤 - Deadman.mp3", title: "Deadman", artist: "蔡徐坤", note: "单曲 · Deadman", cover: "/covers/deadman.jpg" },
  { src: "/audio/蔡徐坤 - Hug me (抱我).mp3", title: "Hug me", artist: "蔡徐坤", note: "单曲 · Hug me", cover: "/covers/hug-me.jpg" },
  { src: "/audio/蔡徐坤 - 情人.mp3", title: "情人", artist: "蔡徐坤", note: "单曲 · 情人", cover: "/covers/qingren.jpg" },
  { src: "/audio/鹿晗 - 勋章.mp3", title: "勋章", artist: "鹿晗", note: "单曲 · 勋章", cover: "/covers/xunzhang.jpg" },
  { src: "/audio/鹿晗 - 我们的明天.mp3", title: "我们的明天", artist: "鹿晗", note: "单曲 · 我们的明天", cover: "/covers/women-de-mingtian.jpg" },
  { src: "/audio/王力宏 - 爱的就是你.mp3", title: "爱的就是你", artist: "王力宏", note: "专辑 · 唯一", cover: "/covers/weiyi.jpg" },
  { src: "/audio/王力宏 - 唯一.mp3", title: "唯一", artist: "王力宏", note: "专辑 · 唯一", cover: "/covers/weiyi.jpg" },
];

// 未核实的专辑图使用本站原创 SVG 视觉封面，避免把占位图伪装成官方唱片封面。
// 目前 35 首都已配图：33 首用发行图（31 张 jpg，《新的心跳》《唯一》各被两首共用），
// 2 首 Akie 秋绘的翻唱没有官方封面，继续用本站原创图。这条兜底只防以后新增曲目漏配图。
export const RADIO_TRACKS: readonly RadioTrack[] = LISTED_TRACKS.map((track) => ({
  ...track,
  cover: track.cover ?? fieldRadioCover(track.title, track.artist),
}));
