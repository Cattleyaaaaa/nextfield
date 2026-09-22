import { ArrowUpRight } from "lucide-react";
import { TransitionLink } from "@/components/site/transition-link";
import { navSections } from "@/lib/nav";
import { siteConfig } from "@/site.config";
import { LanguageToggle } from "@/components/site/language-provider";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-site gap-10 px-5 py-12 sm:px-8 md:grid-cols-3 lg:px-12">
        <div>
          <p className="text-sm font-semibold">{siteConfig.name}</p>
          <p className="mt-2 text-sm text-muted">{siteConfig.role}</p>
        </div>
        <nav className="flex flex-wrap gap-5 text-sm text-muted md:justify-center" aria-label="页脚导航">
          {navSections.map((section) => (
            <TransitionLink className="hover:text-accent" href={section.href} key={section.href}>
              {section.label}
            </TransitionLink>
          ))}
          <TransitionLink className="hover:text-accent" href="/colophon">制作说明</TransitionLink>
          <TransitionLink className="hover:text-accent" href="/learn">FIELD SCHOOL</TransitionLink>
          <TransitionLink className="hover:text-accent" href="/essays">随笔</TransitionLink>
          <TransitionLink className="hover:text-accent" href="/live-studio">Live Studio</TransitionLink>
          <TransitionLink className="hover:text-accent" href="/failures">失败博物馆</TransitionLink>
          <TransitionLink className="hover:text-accent" href="/systems">Systems</TransitionLink>
          <LanguageToggle footer />
        </nav>
        <div className="flex flex-wrap gap-4 md:justify-end">
          {siteConfig.socials.map((social) => (
            <a className="group inline-flex items-center gap-1 text-sm text-muted hover:text-accent" href={social.href} key={social.label}>
              {social.label}
              <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          ))}
        </div>
        <p className="text-xs text-muted md:col-span-3">© {new Date().getFullYear()} {siteConfig.name}. A living index, always in progress.</p>
      </div>
    </footer>
  );
}
