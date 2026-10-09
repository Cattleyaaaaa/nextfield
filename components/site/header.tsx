"use client";

import type { MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { House, MessageCircle, ChartNoAxesCombined } from "lucide-react";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { TransitionLink } from "@/components/site/transition-link";
import { useLanguage } from "@/components/site/language-provider";
import { usePageTransition } from "@/components/site/page-transition-provider";
import { HeaderSpecularButton } from "@/components/site/header-specular-button";
import { ExploreMenu } from "@/components/site/explore-menu";
import { HeaderSettings } from "@/components/site/header-settings";
import { headerSections } from "@/lib/nav";
import { siteConfig } from "@/site.config";
import { FieldAgentLauncher } from "@/components/site/field-agent-launcher";
import "./header.css";

export function Header() {
  const { locale } = useLanguage();
  const { navigate, motionEnabled } = usePageTransition();
  const pathname = usePathname();
  const zh = locale === "zh";
  const active = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  const follow = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(href, { x: event.clientX, y: event.clientY });
  };
  return (
    <header data-motion={motionEnabled ? "on" : "off"} className="site-header sticky top-0 z-40 border-b border-line/60 bg-paper/90 backdrop-blur-xl">
      <div className="relative mx-auto flex h-16 max-w-site items-center gap-1.5 px-3 sm:gap-3 sm:px-6 lg:gap-5 lg:px-8">
        <TransitionLink className="group flex shrink-0 items-center gap-2.5" href="/" aria-label={`${siteConfig.name} ${zh ? "首页" : "home"}`}>
          <span className="grid size-7 place-items-center rounded-full bg-ink text-[10px] font-bold text-paper transition-transform duration-300 group-hover:rotate-12">N</span>
          <span className="hidden text-sm font-semibold tracking-[-0.02em] md:inline">{siteConfig.name}</span>
        </TransitionLink>
        <nav aria-label={zh ? "主导航" : "Main navigation"} className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full lg:bg-panel/70 lg:p-1">
          {headerSections.map(section => {
            const home = section.href === "/";
            const label = zh ? section.label : home ? "Home" : section.eyebrow;
            return <div key={section.href} className={home ? "block" : "hidden lg:block"}>
              <HeaderSpecularButton href={section.href} title={label} ariaLabel={label} ariaCurrent={active(section.href) ? "page" : undefined} onLinkClick={follow(section.href)} className={`site-header-nav header-specular-button--nav ${home ? "site-header-home" : ""} ${active(section.href) ? "header-specular-button--active" : ""}`}>
                {home && <House aria-hidden="true" className="size-3.5" />}
                <span className={home ? "hidden lg:inline" : "inline"}>{label}</span>
              </HeaderSpecularButton>
            </div>;
          })}
          <HeaderSpecularButton href="/messages" ariaCurrent={active("/messages") ? "page" : undefined} title={zh ? "留言板" : "Guestbook"} ariaLabel={zh ? "留言板" : "Guestbook"} onLinkClick={follow("/messages")} className={`site-header-utility header-specular-button--studio ${active("/messages") ? "header-specular-button--active" : ""}`}>
            <MessageCircle aria-hidden="true" className="size-3.5" /><span className="hidden xl:inline">{zh ? "留言" : "Messages"}</span>
          </HeaderSpecularButton>
          <HeaderSpecularButton href="/analytics" ariaCurrent={active("/analytics") ? "page" : undefined} title={zh ? "访问统计" : "Analytics"} ariaLabel={zh ? "访问统计" : "Analytics"} onLinkClick={follow("/analytics")} className={`site-header-utility header-specular-button--studio ${active("/analytics") ? "header-specular-button--active" : ""}`}>
            <ChartNoAxesCombined aria-hidden="true" className="size-3.5" /><span className="hidden xl:inline">{zh ? "统计" : "Analytics"}</span>
          </HeaderSpecularButton>
        </nav>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <span aria-hidden="true" className="mx-1 hidden h-5 border-l border-line sm:block" />
          <FieldAgentLauncher compact iconOnlyOnSmall />
          <ExploreMenu />
          <div className="hidden md:block"><ThemeToggle /></div>
          <HeaderSettings />
        </div>
      </div>
    </header>
  );
}
