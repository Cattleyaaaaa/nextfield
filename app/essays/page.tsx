import { redirect } from "next/navigation";

export default function EssaysPage() {
  redirect("/blog?chapter=essays");
}
