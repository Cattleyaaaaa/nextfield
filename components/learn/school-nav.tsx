"use client";
import {useLanguage} from "@/components/site/language-provider";
import {TransitionLink} from "@/components/site/transition-link";
export function SchoolNav(){
 const {locale}=useLanguage();
 return <nav aria-label={locale==="zh"?"学习工具":"Learning tools"} className="my-8 flex flex-wrap gap-3">{[["/learn#case-library","案例库","Case library"],["/learn/dashboard","学习工作台","Workspace"],["/learn/exam","结课考试","Final exams"],["/learn/practice","代码练习","Code practice"],["/learn/ai","模型练习场与导师","LLM playground & tutor"],["/learn/login","GitHub 登录","GitHub sign-in"]].map(([href,zh,en])=><TransitionLink key={href} href={href} className="rounded-full border border-line px-4 py-2 text-sm hover:border-accent">{locale==="zh"?zh:en} ↗</TransitionLink>)}</nav>;
}
