import type { Metadata } from "next";
import { LearningLanding } from "@/components/learn/learning-landing";

export const metadata: Metadata = { title: "FIELD SCHOOL", description: "通过交互课程学习 Agent 开发、全栈开发与 Agent 产品设计。" };

export default function LearnPage() {
  return <LearningLanding />;
}
