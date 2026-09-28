import type { Metadata } from "next";
import { Guestbook } from "@/components/site/guestbook";

export const metadata: Metadata = {
  title: "留言板",
  description: "留下一个想法，与 NEXTFIELD 的作者交流。",
};

export default function MessagesPage() {
  return <Guestbook />;
}
