import type { Metadata } from "next";
import { ProjectGrid } from "@/components/projects/project-grid";

export const metadata: Metadata = {
  title: "项目",
  description: "把想法做成产品的几个例子：Agent 工作台、运行观测平台与语义检索。",
};

export default function ProjectsPage() {
  return (
    <div className="relative isolate mx-auto max-w-site px-5 pb-28 pt-20 sm:px-8 sm:pt-28 lg:px-12">
      <div className="flex items-baseline justify-between gap-6 border-b border-line pb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Projects / Selected work</p>
          <h1 className="mt-6 max-w-4xl text-balance font-display text-[clamp(3rem,7vw,6rem)] leading-[0.95] tracking-[-0.06em]">
            把想法，做成产品。
          </h1>
        </div>
        <p className="hidden max-w-sm text-sm leading-6 text-muted sm:block">
          以下为可直接替换链接、描述和技术标签的作品占位内容。
        </p>
      </div>

      <div className="mt-14">
        <ProjectGrid />
      </div>
    </div>
  );
}
