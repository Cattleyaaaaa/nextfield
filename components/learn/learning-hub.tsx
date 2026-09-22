"use client";

import { SchoolNav } from "./school-nav";
import { ArrowUpRight, Award, Check, LockKeyhole } from "lucide-react";
import { TransitionLink } from "@/components/site/transition-link";
import { useLanguage } from "@/components/site/language-provider";
import { LEARNING_TRACKS, lessonKey } from "@/lib/learn-data";
import { useLearningProgress } from "@/components/learn/use-learning-progress";

function downloadPass(completedTracks: string[]) {
  const labels = LEARNING_TRACKS.filter((track) => completedTracks.includes(track.slug)).map((track) => track.title.en).join(" · ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900"><rect width="1400" height="900" fill="#0d252c"/><circle cx="1180" cy="170" r="115" fill="none" stroke="#79d5cf" stroke-width="2" opacity=".35"/><text x="100" y="125" fill="#79d5cf" font-family="monospace" font-size="20" letter-spacing="5">NEXTFIELD / FIELD SCHOOL</text><text x="100" y="300" fill="#f4f7f5" font-family="sans-serif" font-size="84" font-weight="700">FIELD PASS</text><text x="100" y="390" fill="#9db1b5" font-family="sans-serif" font-size="28">A completed learning path through Agent and full-stack systems.</text><line x1="100" y1="520" x2="1300" y2="520" stroke="#31545a"/><text x="100" y="610" fill="#79d5cf" font-family="monospace" font-size="18">COMPLETED PATHS</text><text x="100" y="680" fill="#f4f7f5" font-family="sans-serif" font-size="28">${labels}</text><text x="100" y="800" fill="#9db1b5" font-family="monospace" font-size="16">Generated locally · ${new Date().toISOString().slice(0, 10)}</text></svg>`;
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = "NEXTFIELD-Field-School-Pass.svg"; anchor.click(); URL.revokeObjectURL(url);
}

export function LearningHub() {
  const { locale } = useLanguage();
  const { completed, ready } = useLearningProgress();
  const completedTracks = LEARNING_TRACKS.filter((track) => track.lessons.every((lesson) => completed.includes(lessonKey(track.slug, lesson.slug)))).map((track) => track.slug);
  const total = LEARNING_TRACKS.reduce((sum, track) => sum + track.lessons.length, 0);

  return <div><SchoolNav/><div className="grid gap-4 lg:grid-cols-3">{LEARNING_TRACKS.map((track) => { const count = track.lessons.filter((lesson) => completed.includes(lessonKey(track.slug, lesson.slug))).length; return <TransitionLink className="group flex min-h-[24rem] flex-col rounded-[2rem] border border-line bg-panel p-6 hover:border-accent sm:p-8" href={`/learn/${track.slug}`} key={track.slug}><div className="flex items-center justify-between"><span className="font-mono text-[10px] tracking-[0.16em] text-accent">PATH / {track.number}</span><span className="font-mono text-[9px] text-muted">{ready ? `${count}/${track.lessons.length}` : `0/${track.lessons.length}`}</span></div><div className="mt-auto"><h2 className="font-display text-4xl tracking-[-0.05em]">{track.title[locale]}</h2><p className="mt-4 text-sm leading-7 text-muted">{track.summary[locale]}</p><div className="mt-8 flex items-center gap-3"><span className="h-1 flex-1 overflow-hidden rounded-full bg-line"><span className="block h-full bg-accent transition-[width]" style={{ width: `${count / track.lessons.length * 100}%` }} /></span><ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div></div></TransitionLink>; })}</div>
  <section className="mt-6 grid gap-8 rounded-[2rem] bg-ink p-7 text-paper sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end"><div><div className="flex items-center gap-3"><Award className="size-5 text-liquid-foam" /><p className="font-mono text-[10px] tracking-[0.16em] text-liquid-foam">FIELD PASS</p></div><h2 className="mt-8 font-display text-4xl tracking-[-0.05em]">{locale === "zh" ? "把完成的路径带走。" : "Take your completed path with you."}</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-paper/55">{locale === "zh" ? `当前完成 ${completed.length}/${total} 节。完成任意一条路径后，可在本地生成学习凭证；访客记录不上传；登录后使用云端进度。此凭证是自报进度纪念卡，不是服务器认证。` : `${completed.length}/${total} lessons complete. Finish any path to generate a local learning pass—guest progress stays local; signed-in progress syncs. This pass is a self-reported keepsake, not server certification.`}</p></div><button className="inline-flex items-center justify-center gap-2 rounded-full bg-liquid-foam px-5 py-3 text-sm text-ink disabled:cursor-not-allowed disabled:opacity-35" disabled={completedTracks.length === 0} onClick={() => downloadPass(completedTracks)} type="button">{completedTracks.length ? <Check className="size-4" /> : <LockKeyhole className="size-4" />}{locale === "zh" ? "生成 Field Pass" : "Generate Field Pass"}</button></section></div>;
}
