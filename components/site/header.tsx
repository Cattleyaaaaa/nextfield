"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { MotionToggle } from "@/components/site/motion-toggle";
import { HeaderSpecularButton } from "@/components/site/header-specular-button";
import { usePageTransition } from "@/components/site/page-transition-provider";
import { TransitionLink } from "@/components/site/transition-link";
import { useStudioBadgeDrop } from "@/components/visual/studio-badge-drop";
import { BadgePlus } from "lucide-react";
import { headerSections } from "@/lib/nav";
import { siteConfig } from "@/site.config";

// 首页已经是门户，站内导航全部走真实路由：
// /about（九屏自述）、/projects、/blog。不再依赖切屏事件。
export function Header() {
  const { dropBadge } = useStudioBadgeDrop();
  const { navigate } = usePageTransition();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-paper/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-site items-center justify-between px-5 sm:px-8 lg:px-12">
        <TransitionLink className="group flex items-center gap-3" href="/">
          <span className="grid size-7 place-items-center rounded-full bg-ink text-[10px] font-bold text-paper transition-transform duration-300 group-hover:rotate-12">
            Y
          </span>
          <span className="hidden text-sm font-semibold tracking-[-0.02em] sm:inline">{siteConfig.name}</span>
        </TransitionLink>
        <div className="flex items-center gap-2 sm:gap-7">
          <nav aria-label="主导航" className="flex items-center gap-1 sm:gap-3">
            {headerSections.map((section) => {
              // 首页的 href 是 "/"，startsWith 会误判所有路由，根路径要特判成全等。
              const active =
                section.href === "/"
                  ? pathname === "/"
                  : pathname === section.href || pathname.startsWith(`${section.href}/`);
              return (
                <HeaderSpecularButton
                  className={active ? "header-specular-button--nav header-specular-button--active" : "header-specular-button--nav"}
                  href={section.href}
                  key={section.href}
                  onLinkClick={(event) => {
                    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                    event.preventDefault();
                    navigate(section.href, { x: event.clientX, y: event.clientY });
                  }}
                >
                  {section.eyebrow}
                </HeaderSpecularButton>
              );
            })}
          </nav>
          <HeaderSpecularButton ariaLabel="进入工作室并掉落工牌" className="header-specular-button--studio" onClick={dropBadge} type="button">
            <BadgePlus className="size-3.5" /> <span className="hidden sm:inline">ENTER STUDIO</span>
          </HeaderSpecularButton>
          <div className="flex items-center gap-1 sm:gap-2">
            <MotionToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
