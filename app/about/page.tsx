import type { Metadata } from "next";
import { FullpagePortfolio } from "@/components/home/fullpage-portfolio";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "关于我",
  description: "用 Agent 与全栈能力，解决真实的问题。从 Agent 工作流，到生产级 Web 产品。",
};

// 九屏自述内容整体放在这里。它需要 header（4rem）之外的满屏高度，
// 并由 FullpagePortfolio 自己给 <html> 打上 data-fullpage 来锁滚动。
export default function AboutPage() {
  return <FullpagePortfolio posts={getAllPosts()} />;
}
