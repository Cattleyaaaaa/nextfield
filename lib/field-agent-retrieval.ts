import documents from "@/lib/generated/field-agent-content.json";
import { siteConfig } from "@/site.config";
import { navSections, fieldSections } from "@/lib/nav";
export type FieldAgentSource = {
    id: number;
    title: string;
    href: string;
    excerpt: string;
};
const STOP_WORDS = new Set(["什么", "怎么", "如何", "可以", "哪些", "一个", "这个", "那个", "介绍", "请问", "网站", "本站", "是什", "有什", "的什", "about", "what", "with", "the", "and", "how", "this", "that"]);
function terms(value: string) {
    const text = value.toLowerCase();
    const tokens = text.match(/[a-z0-9][a-z0-9+#.-]{1,}|[\u3400-\u9fff]+/g) ?? [];
    return [...new Set(tokens.flatMap(token => /[\u3400-\u9fff]/.test(token)
            ? Array.from({ length: Math.max(0, token.length - 1) }, (_, i) => token.slice(i, i + 2))
            : [token]).filter(token => !STOP_WORDS.has(token)))];
}
function isSiteOverview(prompt: string) {
    const question = prompt.toLowerCase().replace(/\s+/g, "");
    const site = "(?:这个网站|这个站|这网站|本站|你的网站|你们的网站|网站|站点|nextfield)";
    const end = "(?:一下|吧|吗|呢|[。！？!?])*$";
    return new RegExp(`(?:介绍|了解|认识)(?:一下|下)?${site}${end}`, "i").test(question)
        || new RegExp(`${site}(?:的)?(?:介绍|简介|概况|概览|是什么|是做什么的|是干什么的|有什么内容|有哪些内容|有哪些板块|有什么功能|有哪些功能|是关于什么的)${end}`, "i").test(question)
        || /(?:introduce|overviewof|tellmeabout|whatis|whats|about)(?:thissite|thiswebsite|yoursite|yourwebsite|nextfield)[.!?]*$/i.test(question);
}
function isSiteStackQuestion(prompt: string) {
    const question = prompt.toLowerCase().replace(/\s+/g, "");
    const site = /这个网站|这个站|本站|网站|站点|nextfield|thissite|thiswebsite|thesite|thewebsite/;
    const stack = /技术栈|技术架构|技术选型|使用什么技术|用了什么技术|用什么技术|什么框架|什么语言|怎么搭建|如何搭建|techstack|technologystack|what(?:technology|technologies|framework)|how(?:isit|wasthe(?:site|website))built/;
    return site.test(question) && stack.test(question);
}
const SITE_SCOPE = /这个网站|这个站|你的站|你们的站|本站|网站|站点|nextfield|this\s+(?:site|website)|the\s+(?:site|website)/i;
const SITE_NAME = /\b(?:field\s*agent|field\s*radio|field\s*school|neptune)\b|建站纪事|制作说明|失败博物馆|留言板|访问统计|站内/i;
const SITE_CONTENT_REQUEST = /(?:推荐|介绍|找|看看|有哪些|有什么|列出|给我)(?:一篇|一些|一下|几篇|本站的|站内的|关于[^，。?？]{0,20}的)?(?:项目|文章|博客|随笔|课程|作品)/i;
const FOLLOW_UP = /它|该项目|该文章|上面|上述|刚才|继续|详细一点|更多细节|再说说|\b(?:it|its|that|those|continue|more details|tell me more)\b/i;
export function isFieldAgentSiteQuestion(prompt: string, previousQuestion = ""): boolean {
    return SITE_SCOPE.test(prompt) || SITE_NAME.test(prompt) || SITE_CONTENT_REQUEST.test(prompt)
        || (FOLLOW_UP.test(prompt) && Boolean(previousQuestion) && isFieldAgentSiteQuestion(previousQuestion));
}
const ROUTE_HINTS: { href: string; pattern: RegExp }[] = [
    { href: "/messages", pattern: /留言|留言板|guestbook|messages?/i },
    { href: "/analytics", pattern: /统计|访问量|浏览量|流量|analytics|traffic|visitors?/i },
    { href: "/gallery/radio", pattern: /电台|音乐|歌曲|曲目|歌词|radio|music|songs?|lyrics/i },
    { href: "/learn", pattern: /课程|学习|考试|field\s*school|lessons?|courses?|exams?/i },
    { href: "/projects", pattern: /项目|作品|projects?/i },
    { href: "/blog", pattern: /写作|文章|博客|writing|articles?|blog/i },
    { href: "/build-log", pattern: /建站纪事|建站过程|更新记录|版本|build\s*log|changelog|versions?/i },
    { href: "/colophon", pattern: /制作说明|设计原则|构建方式|怎么搭建|如何搭建|怎么开发|技术架构|colophon|design\s*principles|how.*built/i },
    { href: "/gallery", pattern: /实验室|交互实验|experiments?|laboratory/i },
    { href: "/essays", pattern: /随笔|essays?/i },
    { href: "/failures", pattern: /失败博物馆|失败记录|failures?/i },
    { href: "/live-studio", pattern: /live\s*studio|正在做|近期计划|working\s+on/i },
    { href: "/systems", pattern: /证据层|systems|evidence\s*layer/i },
];
function siteOverviewSource(): FieldAgentSource {
    const sections = [...navSections, ...fieldSections];
    return { id: 0, title: "NEXTFIELD 网站介绍", href: "/", excerpt: [siteConfig.name, siteConfig.description, siteConfig.role, siteConfig.statement, ...sections.map(section => `${section.label}: ${section.description}`), "留言板: 登录后可以留言或匿名发布，所有访客都能阅读。", "访问统计: 公开查看网站流量与热门国家或地区。"].join("\n") };
}
export function retrieveFieldAgentSources(prompt: string, locale: "zh" | "en", previousQuestion = ""): FieldAgentSource[] {
    const question = prompt.toLowerCase().replace(/\s+/g, "");
    const author = "(?:这个网站的|网站的|本站的|nextfield的)?(?:作者|站长|博主|开发者)";
    const polite = "(?:请|请问|给我|帮我|能否|可以|能不能|我想)*";
    const end = "(?:一下|吧|吗|呢|[。！？!?])*$";
    const authorQuestion = new RegExp(`^${polite}(?:介绍|了解|认识)(?:一下|下)?${author}${end}`, "i").test(question)
        || new RegExp(`^${polite}${author}(?:是谁|是做什么的|是干什么的|的介绍|的简介|擅长什么|做什么|在哪里|怎么联系)${end}`, "i").test(question)
        || /^(?:introduce|tellmeabout|whois)(?:the)?(?:site|website|nextfield)?(?:author|owner|creator)[.!?]*$/i.test(question);
    if (authorQuestion) {
        const biography = documents.find(doc => doc.href === "/about" && doc.title === (locale === "en" ? "About the NEXTFIELD author" : "NEXTFIELD 作者介绍"));
        if (biography) return [{ id: 1, title: biography.title, href: biography.href, excerpt: biography.text }];
    }
    if (isSiteStackQuestion(prompt)) {
        const stack = documents.find(doc => doc.href === "/colophon/the-system-underneath" && doc.locale === locale);
        if (stack) return [{ id: 1, title: stack.title, href: stack.href, excerpt: stack.text }];
    }
    if (isSiteOverview(prompt)) {
        return [{ ...siteOverviewSource(), id: 1 }];
    }
    const scoped = SITE_SCOPE.test(prompt);
    const query = terms(prompt.replace(SITE_SCOPE, ""));
    const followUp = FOLLOW_UP.test(prompt);
    const contextual = prompt.length < 80 && followUp ? terms(previousQuestion).slice(0, 12) : [];
    const result: FieldAgentSource[] = [];
    const push = (source: Omit<FieldAgentSource, "id">) => {
        if (result.some(item => item.href === source.href && item.title === source.title)) return;
        result.push({ ...source, id: result.length + 1 });
    };
    if (scoped) push(siteOverviewSource());
    const hinted = ROUTE_HINTS.find(hint => hint.pattern.test(prompt));
    if (hinted) {
        const pages = documents.filter(doc => doc.href === hinted.href);
        const limit = hinted.href === "/projects" ? 4 : 2;
        for (const page of pages.sort((a, b) => b.text.length - a.text.length).slice(0, limit))
            push({ title: page.title, href: page.href, excerpt: page.text.slice(0, 1600) });
    }
    const candidates = documents.filter(doc => doc.locale === locale || !documents.some(other => other.href === doc.href && other.title === doc.title && other.locale === locale));
    const scored = candidates.flatMap(doc => {
        const title = doc.title.toLowerCase();
        const chunks = doc.text.match(/[\s\S]{1,1200}/g) ?? [];
        return chunks.map(excerpt => {
            const text = excerpt.toLowerCase();
            let score = 0;
            for (const token of query)
                score += (title.includes(token) ? 5 : 0) + (text.includes(token) ? 1 : 0);
            for (const token of contextual)
                score += (title.includes(token) ? 3 : 0) + (text.includes(token) ? 0.6 : 0);
            if (score > 0 && doc.locale === locale) score += 0.5;
            return { title: doc.title, href: doc.href, excerpt, score };
        });
    }).filter(item => item.score >= 1).sort((a, b) => b.score - a.score);
    for (const item of scored) {
        if (result.length === 5) break;
        push({ title: item.title, href: item.href, excerpt: item.excerpt });
    }
    return result.slice(0, 5);
}
