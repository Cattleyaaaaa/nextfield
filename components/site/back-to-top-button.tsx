"use client";

import { ArrowUp } from "lucide-react";
import { useLanguage } from "@/components/site/language-provider";
import { usePageTransition } from "@/components/site/page-transition-provider";
import { HeaderSpecularButton } from "@/components/site/header-specular-button";

export function BackToTopButton() {
  const { locale } = useLanguage();
  const { motionEnabled } = usePageTransition();
  const label = locale === "zh" ? "返回页面顶部" : "Back to top";

  const goToTop = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (motionEnabled) {
      const bounds = event.currentTarget.getBoundingClientRect();
      window.dispatchEvent(new CustomEvent("water-ripple", {
        detail: { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 },
      }));
    }
    window.scrollTo({ top: 0, behavior: motionEnabled ? "smooth" : "auto" });
  };

  return (
    <HeaderSpecularButton
      ariaLabel={label}
      className="header-specular-button--icon"
      onClick={goToTop}
      title={label}
      type="button"
    >
      <ArrowUp className="size-4" aria-hidden="true" />
    </HeaderSpecularButton>
  );
}
