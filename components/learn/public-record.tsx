"use client";
import {useLanguage} from "@/components/site/language-provider";
import {learningRecordTitle} from "@/lib/learn-data";
import {TransitionLink} from "@/components/site/transition-link";
export function PublicRecord({name,bio,records}:{name:string;bio:string;records:{id:string;lesson_key:string;issued_at:string;version:string}[]}){
 const {locale}=useLanguage(),zh=locale==="zh";
 return <main className="mx-auto max-w-3xl px-5 py-20"><TransitionLink href="/learn">← FIELD SCHOOL</TransitionLink><p className="mt-10 text-sm text-accent">{zh?"公开学习档案 / 课程记录":"Public learning profile / Course records"}</p><h1 className="mt-5 text-5xl">{name}</h1><p className="mt-6 whitespace-pre-wrap text-muted">{bio}</p><p className="my-8 text-sm">{zh?"这里展示账户通过的检查题与结课考试，仅供自学参考，不证明真实身份或职业能力。":"These checkpoint and final exam records are for self-study; they do not verify real identity or professional competence."}</p>{records.map(r=><article className="mb-4 rounded-2xl border border-line p-5" key={r.id}><h2>{learningRecordTitle(r.lesson_key,locale)}</h2><p className="my-3 font-mono text-xs text-muted">{r.issued_at.slice(0,10)} · {r.version}</p><TransitionLink className="break-all text-xs underline" href={`/learn/verify/${r.id}`}>{r.id}</TransitionLink></article>)}</main>;
}
