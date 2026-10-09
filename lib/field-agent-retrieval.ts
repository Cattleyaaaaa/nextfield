import documents from "@/lib/generated/field-agent-content.json";
import { siteConfig } from "@/site.config";
import { navSections, fieldSections } from "@/lib/nav";
export type FieldAgentSource = {
    id: number;
    title: string;
    href: string;
    excerpt: string;
};
const STOP_WORDS = new Set(["什么", "怎么", "如何", "可以", "哪些", "一个", "这个", "那个", "介绍", "请问", "网站", "本站", "about", "what", "with", "the", "and", "how", "this", "that"]);
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
    if (isSiteOverview(prompt)) {
        const sections = [...navSections, ...fieldSections];
        return [{ id: 1, title: "NEXTFIELD 网站介绍", href: "/", excerpt: [siteConfig.name, siteConfig.description, siteConfig.role, siteConfig.statement, ...sections.map(section => `${section.label}: ${section.description}`)].join("\n") }];
    }
    const query = terms(prompt);
    const followUp = /它|该项目|该文章|上面|上述|刚才|继续|详细一点|更多细节|再说说|\b(?:it|its|that|those|continue|more details|tell me more)\b/i.test(prompt);
    const contextual = prompt.length < 80 && followUp ? terms(previousQuestion).slice(0, 12) : [];
    const scored = documents.flatMap(doc => {
        const title = doc.title.toLowerCase();
        const chunks = doc.text.match(/[\s\S]{1,1000}/g) ?? [];
        return chunks.map(excerpt => {
            const text = excerpt.toLowerCase();
            let score = 0;
            for (const token of query)
                score += (title.includes(token) ? 5 : 0) + (text.includes(token) ? 1 : 0);
            for (const token of contextual)
                score += (title.includes(token) ? 3 : 0) + (text.includes(token) ? 0.6 : 0);
            if (score > 0 && doc.locale === locale)
                score += 0.2;
            return { title: doc.title, href: doc.href, excerpt, score };
        });
    }).filter(item => item.score >= 1).sort((a, b) => b.score - a.score);
    const result: FieldAgentSource[] = [];
    for (const item of scored) {
        if (result.some(source => source.href === item.href))
            continue;
        result.push({ id: result.length + 1, title: item.title, href: item.href, excerpt: item.excerpt });
        if (result.length === 5)
            break;
    }
    return result;
}
