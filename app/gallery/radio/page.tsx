import type { Metadata } from "next";
import { RadioHall } from "@/components/site/radio-hall";

export const metadata: Metadata = {
  title: "电台",
  description: "Field Radio 的曲目清单：本地音频直接播，VIP 曲目跳去平台收听。",
};

export default function GalleryRadioPage() {
  return <RadioHall />;
}
