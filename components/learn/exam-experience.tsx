"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";
import { useLanguage } from "@/components/site/language-provider";
import { TransitionLink } from "@/components/site/transition-link";
import { schoolError } from "@/lib/school-error";
import { getSchoolSession } from "@/lib/school-client";
import type { LearningTrack } from "@/lib/learn-data";
import type { LocalizedText } from "@/lib/editorial-data";
import { SchoolAccount } from "./school-account";
import { SchoolNav } from "./school-nav";

type Question = { id: string; prompt: LocalizedText; options: LocalizedText[] };
type Attempt = { id: string; score: number; total: number; passed: boolean; attempted_at: string };
type ExamData = { eligible: boolean; missing: {slug:string;title:LocalizedText}[]; attempts: Attempt[]; questionCount: number; passingScore: number; questions: Question[] };
type ExamResult = { score: number; total: number; passed: boolean; passingScore: number; feedback: {id:string;correct:boolean;explanation:LocalizedText}[] };

export function ExamExperience({ track }: { track: LearningTrack }) {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const [data, setData] = useState<ExamData>();
  const [access, setAccess] = useState<"loading" | "login" | "ready" | "unavailable">("loading");
  const [message, setMessage] = useState("");
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ExamResult>();

  useEffect(() => {
    let active = true;
    getSchoolSession().then(async session => {
      if (!active) return;
      if (!session.configured) { setAccess("unavailable"); setMessage("Cloud learning is not configured / 云端学习尚未配置"); return; }
      if (!session.user) { setAccess("login"); return; }
      const response = await fetch(`/api/school/exam?track=${track.slug}`, { cache: "no-store" });
      if (response.status === 401) { if (active) setAccess("login"); return; }
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      if (active) { setData(body); setAnswers(Array(body.questionCount).fill(-1)); setAccess("ready"); }
    }).catch(error => { if (active) { setAccess("unavailable"); setMessage(error instanceof Error ? error.message : "Service unavailable / 服务暂不可用"); } });
    return () => { active = false; };
  }, [track.slug]);

  function select(index: number) {
    setAnswers(previous => previous.map((answer, position) => position === current ? index : answer));
  }

  async function submit() {
    if (!data || answers.some(answer => answer < 0)) return;
    setSubmitting(true); setMessage("");
    try {
      const response = await fetch("/api/school/exam", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ track: track.slug, answers }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setResult(body); setStarted(false);
      void fetch(`/api/school/exam?track=${track.slug}`, { cache: "no-store" })
        .then(r => r.ok ? r.json() : null)
        .then(updated => { if (updated) setData(updated); })
        .catch(() => { /* The graded result stays visible if history refresh fails. */ });
    } catch (error) { setMessage(error instanceof Error ? error.message : "Service unavailable / 服务暂不可用"); }
    finally { setSubmitting(false); }
  }

  const question = data?.questions[current];
  return <main className="mx-auto max-w-site px-5 pb-28 pt-16 sm:px-8 lg:px-12">
    <TransitionLink href={`/learn/${track.slug}`} className="inline-flex items-center gap-2 text-sm text-accent"><ArrowLeft className="size-4"/>{zh ? `返回${track.shortTitle.zh}` : `Back to ${track.shortTitle.en}`}</TransitionLink>
    <SchoolNav/>
    <header className="mt-12 max-w-4xl"><p className="font-mono text-[10px] tracking-[0.18em] text-accent">FIELD SCHOOL / FINAL EXAM</p><h1 className="mt-6 font-display text-[clamp(3.5rem,8vw,7rem)] leading-[0.9] tracking-tight">{track.title[locale]}<br/><span className="text-muted">{zh ? "结课考试" : "Final exam"}</span></h1><p className="mt-7 text-base leading-8 text-muted">{zh ? "先完成这条路径的课程，再用一套独立题目检查是否能把概念用在情境中。考试不限时，可以重考；通过后会在账户中留下结课记录。" : "Finish the path, then use a separate set of questions to check whether you can apply the concepts. The exam is untimed and can be retaken. A pass is recorded in your account."}</p></header>
    <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_20rem]"><div>
      {access === "loading" && <p role="status" className="rounded-2xl border border-line p-6">{zh ? "正在读取考试资格…" : "Checking exam eligibility…"}</p>}
      {access === "login" && <section className="rounded-3xl border border-line bg-panel p-7"><LockKeyhole className="size-6 text-accent"/><h2 className="mt-5 font-display text-3xl">{zh ? "先使用 GitHub 登录" : "Sign in with GitHub first"}</h2><p className="mt-4 text-sm leading-7 text-muted">{zh ? "考试成绩保存到个人账户。登录后完成课程，即可进入试卷。" : "Exam results belong to your account. Sign in and complete the lessons to unlock the paper."}</p><TransitionLink href="/learn/login" className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 text-sm text-paper">{zh ? "前往 GitHub 登录" : "Go to GitHub sign-in"}<ArrowRight className="ml-2 size-4"/></TransitionLink></section>}
      {access === "unavailable" && <section className="rounded-3xl border border-line bg-panel p-7"><h2 className="font-display text-3xl">{zh ? "考试暂未开放" : "Exam unavailable"}</h2><p role="alert" className="mt-4 text-sm leading-7 text-muted">{schoolError(message,locale)}</p><TransitionLink href="/learn/login" className="mt-5 inline-block text-accent underline">{zh ? "查看登录状态" : "Check sign-in status"}</TransitionLink></section>}
      {access === "ready" && data && !data.eligible && <section className="rounded-3xl border border-line bg-panel p-7"><h2 className="font-display text-3xl">{zh ? "先完成剩余课程" : "Finish the remaining lessons"}</h2><p className="mt-4 text-sm leading-7 text-muted">{zh ? "考试会核对当前 GitHub 账户中的课程进度。访客本地进度可在学习工作台手动导入。" : "The exam checks progress in this GitHub account. Guest progress can be imported manually from the workspace."}</p><ul className="mt-7 space-y-3">{data.missing.map(lesson=><li key={lesson.slug}><TransitionLink href={`/learn/${track.slug}/${lesson.slug}`} className="inline-flex items-center gap-2 text-accent hover:underline">{lesson.title[locale]}<ArrowRight className="size-4"/></TransitionLink></li>)}</ul></section>}
      {access === "ready" && data?.eligible && !started && !result && <section className="rounded-3xl border border-line bg-panel p-7"><CheckCircle2 className="size-7 text-accent"/><h2 className="mt-5 font-display text-3xl">{zh ? "可以开始考试" : "Ready for the exam"}</h2><p className="mt-4 text-sm leading-7 text-muted">{zh ? `共 ${data.questionCount} 题，答对至少 ${data.passingScore} 题通过。提交后会显示逐题反馈。` : `${data.questionCount} questions; ${data.passingScore} correct answers to pass. You will see feedback after submitting.`}</p><button type="button" onClick={() => {setCurrent(0);setAnswers(Array(data.questionCount).fill(-1));setStarted(true);}} className="mt-7 rounded-full bg-ink px-6 py-3 text-sm text-paper">{zh ? "开始考试" : "Start exam"}<ArrowRight className="ml-2 inline size-4"/></button></section>}
      {access === "ready" && data?.eligible && started && question && <section className="rounded-3xl border border-line bg-panel p-7 sm:p-9"><div className="flex items-center justify-between gap-4 text-xs text-muted"><span>{zh ? "第" : "Question"} {current+1} / {data.questionCount} {zh ? "题" : ""}</span><span>{answers.filter(answer=>answer>=0).length} / {data.questionCount} {zh ? "已作答" : "answered"}</span></div><progress className="mt-4 w-full accent-[rgb(var(--accent))]" max={data.questionCount} value={answers.filter(answer=>answer>=0).length} aria-label={zh ? "作答进度" : "Answer progress"}/><h2 className="mt-8 font-display text-3xl leading-tight">{question.prompt[locale]}</h2><div className="mt-7 space-y-3">{question.options.map((option,index)=><button key={index} type="button" aria-pressed={answers[current]===index} onClick={()=>select(index)} className={`w-full rounded-2xl border p-4 text-left text-sm leading-6 transition-colors ${answers[current]===index ? "border-accent bg-accent/[0.08]" : "border-line bg-paper hover:border-accent"}`}><span className="mr-3 font-mono text-accent">{String.fromCharCode(65+index)}</span>{option[locale]}</button>)}</div><div className="mt-8 flex flex-wrap justify-between gap-3"><button type="button" onClick={()=>setCurrent(i=>Math.max(0,i-1))} disabled={current===0} className="rounded-full border border-line px-5 py-3 text-sm disabled:opacity-40">{zh ? "上一题" : "Previous"}</button>{current < data.questionCount-1 ? <button type="button" onClick={()=>setCurrent(i=>Math.min(data.questionCount-1,i+1))} className="rounded-full bg-ink px-5 py-3 text-sm text-paper">{zh ? "下一题" : "Next"}</button> : <button type="button" onClick={submit} disabled={submitting||answers.some(answer=>answer<0)} className="rounded-full bg-ink px-5 py-3 text-sm text-paper disabled:opacity-40">{submitting ? (zh ? "正在交卷…" : "Submitting…") : (zh ? "提交试卷" : "Submit exam")}</button>}</div><p className="mt-4 text-xs text-muted">{zh ? "所有题目答完后才能交卷，可返回修改。" : "Answer every question before submitting; you can go back and revise."}</p></section>}
      {result && <section aria-live="polite" className="rounded-3xl border border-line bg-panel p-7 sm:p-9"><p className="font-mono text-xs text-accent">{result.passed ? "PASS" : "REVIEW"} / {result.score} OF {result.total}</p><h2 className="mt-5 font-display text-4xl">{result.passed ? (zh ? "考试通过" : "Exam passed") : (zh ? "继续复习，再试一次" : "Review and try again")}</h2><p className="mt-4 text-sm leading-7 text-muted">{result.passed ? (zh ? "结课记录已保存到当前 GitHub 账户。你可以在学习工作台查看。" : "The course completion record is saved to your GitHub account. View it in the workspace.") : (zh ? `需要答对至少 ${result.passingScore} 题。下面可以查看每题的反馈。` : `You need at least ${result.passingScore} correct answers. Review the feedback below.`)}</p><ol className="mt-7 space-y-3">{result.feedback.map((item,index)=><li key={item.id} className="rounded-xl border border-line bg-paper p-4 text-sm"><strong>{index+1}. {item.correct ? (zh ? "正确" : "Correct") : (zh ? "需复习" : "Review")}</strong><p className="mt-2 leading-6 text-muted">{item.explanation[locale]}</p></li>)}</ol><div className="mt-7 flex flex-wrap gap-4"><button type="button" onClick={()=>{setResult(undefined);setAnswers(Array(data?.questionCount??0).fill(-1));setCurrent(0);setStarted(true);}} className="rounded-full bg-ink px-5 py-3 text-sm text-paper">{zh ? "重新考试" : "Retake exam"}</button><TransitionLink href="/learn/dashboard" className="rounded-full border border-line px-5 py-3 text-sm">{zh ? "查看学习工作台" : "View workspace"}</TransitionLink></div></section>}
      {message && access === "ready" && <p role="alert" className="mt-5 text-sm text-red-600">{schoolError(message,locale)}</p>}
    </div><aside className="lg:sticky lg:top-28 lg:self-start"><SchoolAccount/><div className="rounded-2xl border border-line p-6"><h2 className="text-sm font-semibold">{zh ? "考试规则" : "Exam rules"}</h2><ul className="mt-4 space-y-3 text-sm leading-6 text-muted"><li>{zh ? "先完成当前路径所有课程" : "Complete all lessons in this path"}</li><li>{zh ? "使用 GitHub 账户交卷" : "Submit from your GitHub account"}</li><li>{zh ? "每题选择一个答案" : "Choose one answer per question"}</li><li>{zh ? "不限时，可重考" : "Untimed; retakes allowed"}</li></ul><p className="mt-5 border-t border-line pt-4 text-xs leading-6 text-muted">{zh ? "这是一套自学结课题，不是监考考试或职业资格认证。" : "This is a self-study course exam, not a proctored or professional certification."}</p></div>{data?.attempts?.length ? <div className="mt-4 rounded-2xl border border-line p-6"><h2 className="text-sm font-semibold">{zh ? "最近成绩" : "Recent attempts"}</h2>{data.attempts.map(attempt=><p key={attempt.id} className="mt-3 text-xs text-muted">{attempt.attempted_at.slice(0,10)} · {attempt.score}/{attempt.total} · {attempt.passed ? (zh ? "通过" : "Passed") : (zh ? "未通过" : "Not passed")}</p>)}</div> : null}</aside></div>
  </main>;
}
