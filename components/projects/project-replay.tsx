"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleDashed, GitBranch, TriangleAlert } from "lucide-react";

const MOMENTS = [
  { day: "DAY 00", title: "The request", body: "团队需要一个能从内部知识库回答问题的助手，并且每个结论都必须可追溯。", decision: "先定义可信答案，而不是先选择向量数据库。", icon: CircleDashed },
  { day: "DAY 03", title: "The first failure", body: "单次检索能返回相似片段，但复杂问题会混合多个版本的文档，引用也无法稳定对应。", decision: "将检索、重排和引用验证拆成独立步骤。", icon: TriangleAlert },
  { day: "DAY 07", title: "The architecture shift", body: "工作流改为显式状态图，每一步保存输入、输出与失败原因，并允许从中断点恢复。", decision: "用可观察状态换取复杂度，而不是隐藏复杂度。", icon: GitBranch },
  { day: "DAY 14", title: "The product surface", body: "界面开始展示检索来源、工具状态与需要用户确认的节点，不再只有一个等待中的聊天气泡。", decision: "把控制权和系统状态同时交还给用户。", icon: CheckCircle2 },
  { day: "AFTER", title: "What survived", body: "最终留下的不是某个提示词，而是一套可追踪、可评估、可恢复的 Agent 产品结构。", decision: "如果重做，会更早建立离线评估集与失败分类。", icon: CheckCircle2 },
] as const;

export function ProjectReplay() {
  const [step, setStep] = useState(0);
  const moment = MOMENTS[step];
  const Icon = moment.icon;
  return (
    <div className="mt-14 overflow-hidden rounded-[2rem] border border-line bg-panel">
      <div className="grid lg:grid-cols-[15rem_1fr]">
        <nav aria-label="项目时间线" className="border-b border-line p-5 lg:border-b-0 lg:border-r">
          {MOMENTS.map((item, index) => <button aria-current={step === index ? "step" : undefined} className={`flex w-full items-center gap-3 border-l px-4 py-4 text-left ${step === index ? "border-accent text-ink" : "border-line text-muted hover:text-accent"}`} key={item.day} onClick={() => setStep(index)} type="button"><span className="font-mono text-[10px]">{item.day}</span></button>)}
        </nav>
        <div className="min-h-[32rem] p-7 sm:p-12"><div className="flex items-center justify-between"><span className="grid size-12 place-items-center rounded-full bg-ink text-liquid-foam"><Icon className="size-5" /></span><span className="font-mono text-[10px] tracking-[0.18em] text-accent">{String(step + 1).padStart(2, "0")} / {String(MOMENTS.length).padStart(2, "0")}</span></div><p className="mt-16 font-mono text-[10px] tracking-[0.18em] text-accent">{moment.day}</p><h2 className="mt-4 font-display text-5xl tracking-[-0.055em]">{moment.title}</h2><p className="mt-6 max-w-2xl text-base leading-8 text-muted">{moment.body}</p><div className="mt-8 max-w-2xl border-l-2 border-accent pl-5"><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent">Decision</p><p className="mt-2 text-sm leading-6">{moment.decision}</p></div><div className="mt-12 flex gap-3"><button aria-label="上一步" className="grid size-11 place-items-center rounded-full border border-line disabled:opacity-30" disabled={step === 0} onClick={() => setStep((value) => value - 1)} type="button"><ArrowLeft className="size-4" /></button><button aria-label="下一步" className="grid size-11 place-items-center rounded-full bg-ink text-paper disabled:opacity-30" disabled={step === MOMENTS.length - 1} onClick={() => setStep((value) => value + 1)} type="button"><ArrowRight className="size-4" /></button></div></div>
      </div>
    </div>
  );
}
