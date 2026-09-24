"use client";

import { ArrowUpRight, Github, Globe2, Orbit } from "lucide-react";
import { GlareHover } from "@/components/react-bits/glare-hover";
import { useLanguage } from "@/components/site/language-provider";

const NEPTUNE_SITE = "http://myneptune.tech/";
const NEPTUNE_REPOSITORY = "https://github.com/Cattleyaaaaa/Neptune-Multi-agent-Workspace";

export function NeptuneFeature() {
  const { locale } = useLanguage();

  return (
    <GlareHover className="rounded-[2rem]">
      <article className="relative isolate overflow-hidden rounded-[2rem] border border-paper/10 bg-ink p-7 text-paper sm:p-10 lg:p-12">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_50%,rgb(var(--liquid-mid)/0.36),transparent_43%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-liquid-foam">
              <span className="inline-flex size-8 items-center justify-center rounded-full border border-liquid-foam/30"><Orbit className="size-4" aria-hidden="true" /></span>
              {locale === "zh" ? "重点项目 / 01" : "FEATURED PROJECT / 01"}
            </div>
            <h2 className="mt-8 font-display text-[clamp(3.25rem,7vw,6rem)] leading-[0.86] tracking-[-0.07em]">Neptune<span className="text-liquid-foam">.</span></h2>
            <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-liquid-foam/75">Multi-agent Workspace</p>
            <p className="mt-7 max-w-2xl text-base leading-8 text-paper/75">
              {locale === "zh"
                ? "Neptune 是我围绕多 Agent 协作构建的工作空间项目，探索让不同 Agent 在同一任务中分工、衔接并共同推进的方式。项目网站呈现它当前的形态，GitHub 仓库记录源码与后续迭代。"
                : "Neptune is my multi-agent workspace project. It explores how different agents can divide work, pass context along, and move a shared task forward. The website shows its current form, while GitHub holds the source and future iterations."}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a className="inline-flex items-center gap-2 rounded-full bg-liquid-foam px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-paper" href={NEPTUNE_SITE} rel="noopener noreferrer" target="_blank">
                <Globe2 className="size-4" aria-hidden="true" /> {locale === "zh" ? "访问项目网站" : "Visit project website"} <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
              <a className="inline-flex items-center gap-2 rounded-full border border-paper/30 px-5 py-3 text-sm text-paper transition-colors hover:border-liquid-foam hover:text-liquid-foam" href={NEPTUNE_REPOSITORY} rel="noopener noreferrer" target="_blank">
                <Github className="size-4" aria-hidden="true" /> {locale === "zh" ? "查看 GitHub 仓库" : "View GitHub repository"} <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>
          <div aria-hidden="true" className="relative mx-auto hidden size-56 place-items-center lg:grid">
            <span className="absolute inset-0 rounded-full border border-liquid-foam/15" />
            <span className="absolute inset-6 rounded-full border border-liquid-foam/25" />
            <span className="absolute inset-12 rounded-full border border-liquid-foam/40" />
            <span className="absolute left-7 top-5 size-3 rounded-full bg-liquid-foam shadow-[0_0_28px_rgb(var(--liquid-foam)/0.65)]" />
            <span className="absolute bottom-10 right-5 size-2 rounded-full bg-paper/70" />
            <Orbit className="size-24 text-liquid-foam/65" strokeWidth={0.7} />
          </div>
        </div>
      </article>
    </GlareHover>
  );
}
