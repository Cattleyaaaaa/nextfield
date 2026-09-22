import type { Metadata } from "next";
import { LearningDashboard } from "@/components/learn/learning-dashboard";

export const metadata: Metadata = { title: "学习工作台 / FIELD SCHOOL" };

export default function DashboardPage() { return <LearningDashboard />; }
