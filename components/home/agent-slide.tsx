"use client";

import { useRef } from "react";
import {
  Binary,
  Bot,
  Database,
  MessageSquare,
  Network,
  Radio,
  Search,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { SplitText, gsap, useGSAP } from "@/lib/gsap";
import { useMotionPreference } from "@/lib/use-motion-preference";
import { useLanguage } from "@/components/site/language-provider";

// 换屏动画约 0.36s，加帘幕，屏内动效统一等这个时间再起。
const AGENT_SLIDE_MOTION = {
  delay: 0.32,
  ease: "power2.out",
  title: { from: 26, blur: 8, stagger: 0.035, duration: 0.6 },
  rail: { at: 0.08, duration: 0.7 },
  steps: { at: 0.24, y: 16, duration: 0.45, stagger: 0.055 },
  frameworks: { at: 0.76, y: 12, duration: 0.4, stagger: 0.07 },
};

type PipelineStep = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
};

// 按真实工作流的先后顺序排列 —— 这是这屏与「全栈分层」在结构上最大的区别。
const agentPipeline: PipelineStep[] = [
  { id: "01", name: "Prompt 工程", description: "把目标、约束与上下文表达得更准确。", icon: MessageSquare },
  { id: "02", name: "Embedding", description: "将非结构化信息转为可计算的语义。", icon: Binary },
  { id: "03", name: "向量数据库", description: "设计高效的检索、索引与召回策略。", icon: Database },
  { id: "04", name: "RAG", description: "让模型从可信的私有知识中回答。", icon: Search },
  { id: "05", name: "LLM 调用", description: "可靠地连接模型、工具与业务上下文。", icon: Bot },
  { id: "06", name: "多 Agent 编排", description: "让角色、任务与工具协同完成复杂流程。", icon: Network },
  { id: "07", name: "流式输出", description: "降低等待感，让反馈在生成时发生。", icon: Radio },
];

// 框架是「支撑」而不是「步骤」，所以从流水线里拆出来单独成组。
const agentFrameworks: Omit<PipelineStep, "id">[] = [
  { name: "LangChain / LangGraph", description: "构建可控、可观测的 Agent 工作流。", icon: Workflow },
  { name: "Vercel AI SDK", description: "为 AI 体验提供流式交互界面。", icon: Sparkles },
];

export function AgentSlide() {
  const reducedMotion = useMotionPreference();
  const { locale } = useLanguage();
  const slideRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const splitRef = useRef<SplitText | null>(null);

  useGSAP(() => {
    if (reducedMotion) return;

    const timeline = gsap.timeline({
      delay: AGENT_SLIDE_MOTION.delay,
      defaults: { ease: AGENT_SLIDE_MOTION.ease },
    });

    const titleElement = titleRef.current;
    if (titleElement) {
      const split = SplitText.create(titleElement, { type: "chars", charsClass: "agent-title-char" });
      splitRef.current = split;
      timeline.fromTo(
        split.chars,
        { autoAlpha: 0, y: AGENT_SLIDE_MOTION.title.from, filter: `blur(${AGENT_SLIDE_MOTION.title.blur}px)` },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: AGENT_SLIDE_MOTION.title.duration,
          stagger: AGENT_SLIDE_MOTION.title.stagger,
        },
        0,
      );
    }

    // 竖轨自上而下生长，先把「这是一条流程」画出来，再让步骤逐个落下。
    timeline.fromTo(
      "[data-agent-rail]",
      { scaleY: 0 },
      { scaleY: 1, duration: AGENT_SLIDE_MOTION.rail.duration, clearProps: "transform" },
      AGENT_SLIDE_MOTION.rail.at,
    );

    timeline.fromTo(
      "[data-agent-step]",
      { autoAlpha: 0, y: AGENT_SLIDE_MOTION.steps.y },
      {
        autoAlpha: 1,
        y: 0,
        duration: AGENT_SLIDE_MOTION.steps.duration,
        stagger: AGENT_SLIDE_MOTION.steps.stagger,
        clearProps: "opacity,visibility,transform",
      },
      AGENT_SLIDE_MOTION.steps.at,
    );

    timeline.fromTo(
      "[data-agent-framework]",
      { autoAlpha: 0, y: AGENT_SLIDE_MOTION.frameworks.y },
      {
        autoAlpha: 1,
        y: 0,
        duration: AGENT_SLIDE_MOTION.frameworks.duration,
        stagger: AGENT_SLIDE_MOTION.frameworks.stagger,
        clearProps: "opacity,visibility,transform",
      },
      AGENT_SLIDE_MOTION.frameworks.at,
    );

    return () => {
      // SplitText 改写了 h2 的 DOM，卸载前必须还原，否则 React 再渲染时会对不上。
      try {
        splitRef.current?.revert();
      } catch {
        // 已由 GSAP context 还原
      }
      splitRef.current = null;
    };
  }, { scope: slideRef, dependencies: [reducedMotion, locale], revertOnUpdate: true });

  return (
    <section className="mx-auto flex h-full max-w-site items-center px-5 py-8 sm:px-8 lg:px-12" ref={slideRef}>
      <div className="w-full">
        <header className="mb-5 flex items-end justify-between gap-6 border-b border-line pb-5 sm:mb-6 sm:pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">01 / Specialty</p>
            <h2 className="mt-3 font-display text-[clamp(2.6rem,5vw,4.75rem)] leading-[0.92] tracking-[-0.055em]" ref={titleRef}>{locale === "en" ? "Agent Development" : "Agent 开发"}</h2>
          </div>
          <p className="hidden max-w-sm text-sm leading-6 text-muted sm:block">让模型推理、工具调用与知识检索在产品中可靠发生。</p>
        </header>

        <ol className="relative">
          <span aria-hidden="true" className="absolute left-[13px] bottom-5 top-5 w-px origin-top bg-accent/25" data-agent-rail />
          {agentPipeline.map((step) => {
            const Icon = step.icon;
            return (
              <li className="relative flex items-start gap-3.5 py-[7px] sm:gap-4" data-agent-step key={step.id}>
                <span className="relative z-10 grid size-7 shrink-0 place-items-center rounded-full border border-line bg-paper text-accent">
                  <Icon className="size-3.5" strokeWidth={1.75} />
                </span>
                <div className="flex flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-5">
                  <h3 className="flex shrink-0 items-baseline gap-2 font-display text-base tracking-[-0.02em] sm:w-56 sm:text-lg">
                    <span className="font-mono text-[10px] tracking-[0.14em] text-accent">{step.id}</span>
                    {step.name}
                  </h3>
                  <p className="text-xs leading-5 text-muted">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-line pt-4">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">框架支撑</span>
          {agentFrameworks.map((framework) => {
            const Icon = framework.icon;
            return (
              <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5" data-agent-framework key={framework.name}>
                <Icon className="size-3.5 shrink-0 text-accent" strokeWidth={1.75} />
                <span className="text-xs font-medium text-ink">{framework.name}</span>
                <span className="hidden text-[11px] text-muted sm:inline">{framework.description}</span>
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
