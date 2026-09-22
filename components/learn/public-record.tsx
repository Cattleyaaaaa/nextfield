"use client";
import {useLanguage} from "@/components/site/language-provider";
import {LEARNING_TRACKS,lessonKey} from "@/lib/learn-data";
export function PublicRecord({name,bio,records}:{name:string;bio:string;records:{id:string;lesson_key:string;issued_at:string}[]}){
 const {locale}=useLanguage(),zh=locale==="zh";
 const lessons=LEARNING_TRACKS.flatMap(t=>t.lessons.map(l=>({key:lessonKey(t.slug,l.slug),title:l.title})));
 return <main className="mx-auto max-w-3xl px-5 py-20"><a href="/learn">← FIELD SCHOOL</a><p className="mt-10 text-sm text-accent">{zh?"公开学习档案 / 检查题记录":"Public learning profile / Checkpoints"}</p><h1 className="mt-5 text-5xl">{name}</h1><p className="mt-6 whitespace-pre-wrap text-muted">{bio}</p><p className="my-8 text-sm">{zh?"这些记录仅证明账户向服务器提交了正确选项，不证明身份或职业能力。":"These records only confirm that an account submitted a correct answer to the server, not identity or professional competence."}</p>{records.map(r=><article className="mb-4 rounded-2xl border border-line p-5" key={r.id}><h2>{lessons.find(l=>l.key===r.lesson_key)?.title[locale]||r.lesson_key}</h2><p className="my-3 font-mono text-xs text-muted">{r.issued_at.slice(0,10)} · checkpoint-v1</p><a className="break-all text-xs underline" href={`/learn/verify/${r.id}`}>{r.id}</a></article>)}</main>;
}
