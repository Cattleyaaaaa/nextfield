import type { Metadata } from "next";
import { ProjectGrid } from "@/components/projects/project-grid";
import { ProjectsIntro } from "@/components/projects/projects-intro";

export const metadata: Metadata = {
  title: "项目",
  description: "把想法做成产品的几个例子：Agent 工作台、运行观测平台与语义检索。",
};

export default function ProjectsPage() {
  return (
    <div className="relative isolate mx-auto max-w-site px-5 pb-28 pt-20 sm:px-8 sm:pt-28 lg:px-12">
      <ProjectsIntro />

      <div className="mt-14">
        <ProjectGrid />
      </div>
    </div>
  );
}
