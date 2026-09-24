"use client";

import { useRef, type MouseEvent } from "react";
import { ArrowUpRight, Bot, LayoutDashboard, SearchCheck } from "lucide-react";
import { motion } from "framer-motion";
import { GlareHover } from "@/components/react-bits/glare-hover";
import SpotlightCard from "@/components/SpotlightCard";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotionPreference } from "@/lib/use-motion-preference";
import { useLanguage } from "@/components/site/language-provider";

// 进场：先卡片容器，再卡片内部元素，层次感比整体淡入更好。
const PROJECT_GRID_REVEAL_CONFIG = {
  delay: 0.12,
  ease: "power2.out",
  rule: { at: 0.04, duration: 0.6 },
  cards: { at: 0, y: 26, duration: 0.58, stagger: 0.1 },
  items: { at: 0.36, y: 10, duration: 0.42, stagger: 0.035 },
};

// 封面轻微视差：这里随鼠标纵向位置驱动。
// range 是 yPercent 的总行程；封面顶部预留了 32px 溢出量，±6% 不会露出空隙。
const PROJECT_PARALLAX_CONFIG = {
  range: 12,
  duration: 0.7,
  ease: "power3.out",
};

const PROJECT_SPOTLIGHT_CONFIG = {
  spotlightColor: "rgb(var(--accent) / 0.18)",
};

export const projects = [
  {
    name: "Knowledge Copilot",
    description: {
      zh: "探索团队知识库中的 Agent 体验：把文档检索、引用与工具调用放在同一条任务路径上。",
      en: "Exploring an Agent experience for team knowledge: retrieval, citations, and tool use in one task flow.",
    },
    tags: ["LangGraph", "RAG", "Next.js"],
    icon: Bot,
    cover: "linear-gradient(135deg, rgb(var(--liquid-mid) / 0.26), rgb(var(--accent) / 0.06))",
  },
  {
    name: "Agent Operations",
    description: {
      zh: "探索如何将 Agent 的运行轨迹、失败原因与评估结果组织成可读的工作界面。",
      en: "Exploring how traces, failures, and evaluation results can become an understandable workspace.",
    },
    tags: ["TypeScript", "PostgreSQL", "Streaming"],
    icon: LayoutDashboard,
    cover: "linear-gradient(160deg, rgb(var(--accent) / 0.22), rgb(var(--liquid-foam) / 0.12))",
  },
  {
    name: "Semantic Search",
    description: {
      zh: "探索结构化数据与语义检索如何协作，让搜索结果更贴近用户意图。",
      en: "Exploring how structured data and semantic retrieval can bring search closer to user intent.",
    },
    tags: ["Embedding", "Vector DB", "API"],
    icon: SearchCheck,
    cover: "linear-gradient(205deg, rgb(var(--liquid-deep) / 0.2), rgb(var(--accent) / 0.07))",
  },
];

type Project = (typeof projects)[number];

function ProjectCardItem({ project }: { project: Project }) {
  const { locale } = useLanguage();
  const reducedMotion = useMotionPreference();
  const coverRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<((value: number) => void) | null>(null);
  const Icon = project.icon;

  useGSAP(() => {
    if (reducedMotion || !coverRef.current) return;
    // quickTo：连续跟随鼠标而不重启动画，滚动性能比逐帧 fromTo 好。
    parallaxRef.current = gsap.quickTo(coverRef.current, "yPercent", {
      duration: PROJECT_PARALLAX_CONFIG.duration,
      ease: PROJECT_PARALLAX_CONFIG.ease,
    });
    return () => {
      parallaxRef.current = null;
    };
  }, { dependencies: [reducedMotion], revertOnUpdate: true });

  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!parallaxRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientY - rect.top) / rect.height - 0.5;
    parallaxRef.current(ratio * -PROJECT_PARALLAX_CONFIG.range);
  };

  const onMouseLeave = () => {
    parallaxRef.current?.(0);
  };

  return (
    <SpotlightCard {...PROJECT_SPOTLIGHT_CONFIG} className="h-full">
      <GlareHover className="h-full">
        <motion.article
          className="group relative flex h-full min-h-[16rem] flex-col overflow-hidden rounded-3xl border border-line bg-panel p-5 shadow-none transition-shadow duration-300 hover:shadow-card dark:hover:shadow-card-dark sm:p-6"
          onMouseLeave={onMouseLeave}
          onMouseMove={onMouseMove}
          whileHover={reducedMotion ? undefined : { y: -4 }}
        >
          {/* 抽象封面：顶部渐变色带 + 幽灵图标，随鼠标做轻微视差 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-8 h-44"
            data-project-cover
            ref={coverRef}
            style={{ backgroundImage: project.cover }}
          >
            <Icon className="absolute -right-2 bottom-1 size-24 text-accent/10" strokeWidth={1} />
            <span className="absolute inset-x-0 bottom-0 h-px bg-line/70" />
          </div>

          {/* 内容层需要 position:relative，否则会被绝对定位的封面盖住 */}
          <div className="relative flex flex-1 flex-col">
            <div className="flex items-start justify-between">
              <span className="grid size-10 place-items-center rounded-2xl border border-line text-accent transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-white" data-project-item>
                <Icon className="size-4" />
              </span>
              <span aria-hidden="true" className="grid size-9 place-items-center rounded-full border border-line text-muted" data-project-item>
                <ArrowUpRight className="size-4" />
              </span>
            </div>
            <div className="mt-auto pt-7">
              <h2 className="font-display text-2xl leading-none tracking-[-0.04em] transition-colors duration-300 group-hover:text-accent" data-project-item>{project.name}</h2>
              <p className="mt-3 text-xs leading-5 text-muted" data-project-item>{project.description[locale]}</p>
              <div className="mt-5 flex flex-wrap gap-1.5" data-project-item>
                {project.tags.map((tag) => <span className="rounded-full border border-line px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-muted" key={tag}>{tag}</span>)}
              </div>
            </div>
          </div>
        </motion.article>
      </GlareHover>
    </SpotlightCard>
  );
}

export function ProjectGrid() {
  const { locale } = useLanguage();
  const reducedMotion = useMotionPreference();
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (reducedMotion) return;

    const timeline = gsap.timeline({
      delay: PROJECT_GRID_REVEAL_CONFIG.delay,
      defaults: { ease: PROJECT_GRID_REVEAL_CONFIG.ease },
    });

    timeline.fromTo(
      "[data-project-rule]",
      { scaleX: 0 },
      { scaleX: 1, duration: PROJECT_GRID_REVEAL_CONFIG.rule.duration, clearProps: "transform" },
      PROJECT_GRID_REVEAL_CONFIG.rule.at,
    );

    timeline.fromTo(
      "[data-project-card]",
      { autoAlpha: 0, y: PROJECT_GRID_REVEAL_CONFIG.cards.y },
      {
        autoAlpha: 1,
        y: 0,
        duration: PROJECT_GRID_REVEAL_CONFIG.cards.duration,
        stagger: PROJECT_GRID_REVEAL_CONFIG.cards.stagger,
        clearProps: "opacity,visibility,transform",
      },
      PROJECT_GRID_REVEAL_CONFIG.cards.at,
    );

    timeline.fromTo(
      "[data-project-item]",
      { autoAlpha: 0, y: PROJECT_GRID_REVEAL_CONFIG.items.y },
      {
        autoAlpha: 1,
        y: 0,
        duration: PROJECT_GRID_REVEAL_CONFIG.items.duration,
        stagger: PROJECT_GRID_REVEAL_CONFIG.items.stagger,
        clearProps: "opacity,visibility,transform",
      },
      PROJECT_GRID_REVEAL_CONFIG.items.at,
    );
  }, { scope: gridRef, dependencies: [reducedMotion], revertOnUpdate: true });

  return (
    <div ref={gridRef}>
      <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">{locale === "zh" ? "探索中的方向 / 02" : "PROJECT DIRECTIONS / 02"}</p>
      <span aria-hidden="true" className="mb-8 block h-px origin-left bg-accent" data-project-rule />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div data-project-card key={project.name}>
            <ProjectCardItem project={project} />
          </div>
        ))}
      </div>
    </div>
  );
}
