"use client";

import { BlurText } from "@/components/react-bits/blur-text";
import { useLanguage } from "@/components/site/language-provider";
import { usePageTransition } from "@/components/site/page-transition-provider";

export const BLOG_INTRO_MOTION = {
  text: "写下来的东西。",
  delay: 72,
  stepDuration: 0.38,
  from: { filter: "blur(14px)", opacity: 0, y: 30 },
  to: [
    { filter: "blur(6px)", opacity: 0.58, y: 8 },
    { filter: "blur(0px)", opacity: 1, y: 0 },
  ],
};

export function BlogIntro({ postCount }: { postCount: number }) {
  const { locale } = useLanguage();
  const { motionEnabled } = usePageTransition();
  return (
    <>
      <p className="mb-6 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
        Writing / Index
      </p>
      <BlurText
        {...BLOG_INTRO_MOTION}
        enabled={motionEnabled}
        text={locale === "en" ? "Things written down." : BLOG_INTRO_MOTION.text}
        as="h1"
        className="max-w-5xl text-balance font-display text-[clamp(3.5rem,9vw,7.5rem)] leading-[0.92] tracking-[-0.06em]"
      />
      <p className="mt-8 max-w-2xl text-lg leading-9 text-muted">
        把踩过的坑与验证过的方法以及感悟整理成可复用的文字。
        {postCount > 0 ? ` 目前 ${postCount} 篇。` : null}
      </p>
    </>
  );
}
