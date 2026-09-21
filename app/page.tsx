import { ArrowUpRight } from "lucide-react";
import { TransitionLink } from "@/components/site/transition-link";
import { KeywordMarquee } from "@/components/home/keyword-marquee";
import { KineticHero } from "@/components/home/kinetic-hero";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { SectionCards } from "@/components/home/section-cards";

// 首页参考 gsap.com 的结构：巨幅动态字 hero → 滚动逐字点亮 → 板块卡片 → 跑马灯 → CTA。
// 动效只用 GSAP（ScrollTrigger / 逐字 stagger）与 CSS，不引入 canvas / WebGL。
export default function HomePage() {
  return (
    <div className="relative isolate">
      <KineticHero />
      <ScrollReveal />
      <SectionCards />
      <KeywordMarquee />

      <section className="mx-auto max-w-site px-5 pb-28 pt-24 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-10 rounded-[2rem] border border-line bg-panel p-8 sm:p-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Contact</p>
            <h2 className="mt-5 max-w-2xl font-display text-[clamp(2.2rem,4.5vw,3.6rem)] leading-[1.02] tracking-[-0.05em]">
              下一步，从一个想法开始。
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-6 text-muted">
              想聊 Agent 落地、全栈架构，或者只是看看这个站怎么搭的——都在 about 里。
            </p>
          </div>
          <TransitionLink
            className="group inline-flex items-center gap-3 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-paper transition-colors duration-300 hover:bg-accent hover:text-white"
            href="/about#contact"
          >
            联系我
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </TransitionLink>
        </div>
      </section>
    </div>
  );
}
