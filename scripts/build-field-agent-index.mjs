import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';

async function readData(file) {
  const source = await fs.readFile(file, 'utf8');
  const output = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  const module = {exports:{}};
  new Function('module','exports','require',output)(module,module.exports,() => {throw Error('Unexpected import in '+file);});
  return module.exports;
}
const documents = [];
const add = (title, href, text, locale='zh') => documents.push({title,href,text,locale});
const { siteConfig } = await readData('site.config.ts');
const { navSections, fieldSections } = await readData('lib/nav.ts');
const { BUILD_LOG_ARTICLES, COLOPHON_ARTICLES, ESSAY_ARTICLES } = await readData('lib/editorial-data.ts');
const { FAILURE_ITEMS } = await readData('lib/nextfield-data.ts');
add('关于 NEXTFIELD', '/about', [siteConfig.name,siteConfig.role,siteConfig.description,siteConfig.statement,siteConfig.location,...siteConfig.socials.map(s=>`${s.label}: ${s.href}`)].join('\n'));
for (const page of [...navSections,...fieldSections]) add(page.label,page.href,page.description);
const projectFile = ts.createSourceFile('projects.tsx',await fs.readFile('components/projects/project-grid.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const profileFile = ts.createSourceFile('profile.tsx', await fs.readFile('components/home/fullpage-portfolio.tsx', 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const profileText = [];
function visitProfile(node) {
  if (ts.isFunctionDeclaration(node) && ['ProfileOverview', 'ProfileDetail'].includes(node.name?.text)) {
    const collect = child => {
      if (ts.isJsxText(child) && child.text.trim()) profileText.push(child.text.trim());
      ts.forEachChild(child, collect);
    };
    collect(node);
    return;
  }
  ts.forEachChild(node, visitProfile);
}
visitProfile(profileFile);
// Include the capability descriptions that visitors can read on /about.
for (const [file, names] of [
  ['components/home/agent-slide.tsx', ['agentPipeline', 'agentFrameworks']],
  ['components/home/fullstack-slide.tsx', ['fullstackLayers']],
]) {
  const sourceFile = ts.createSourceFile(file, await fs.readFile(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = node => {
    if (ts.isVariableDeclaration(node) && names.includes(node.name.getText(sourceFile)) && node.initializer) {
      const collect = child => {
        if (ts.isPropertyAssignment(child) && ['name', 'description', 'note'].includes(child.name.getText(sourceFile)) && ts.isStringLiteral(child.initializer)) profileText.push(child.initializer.text);
        ts.forEachChild(child, collect);
      };
      collect(node.initializer);
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
}
const biography = [siteConfig.role, siteConfig.statement, ...profileText, `所在地: ${siteConfig.location}`, ...siteConfig.socials.map(s => `${s.label}: ${s.href}`)].join('\n');
add('NEXTFIELD 作者介绍', '/about', biography);
add('About the NEXTFIELD author', '/about', biography, 'en');
const property = (node,name) => node.properties.find(p=>ts.isPropertyAssignment(p)&&p.name.getText(projectFile)===name)?.initializer;
function visitProjects(node) {
  if(ts.isVariableDeclaration(node)&&node.name.getText(projectFile)==='projects'&&ts.isArrayLiteralExpression(node.initializer)){
    for(const item of node.initializer.elements){
      const name=property(item,'name');const description=property(item,'description');const tags=property(item,'tags');
      for(const locale of ['zh','en'])add(name.text,'/projects',[property(description,locale).text,...tags.elements.map(tag=>tag.text)].join('\n'),locale);
    }
  }
  ts.forEachChild(node,visitProjects);
}
visitProjects(projectFile);
const neptuneFile=ts.createSourceFile('neptune.tsx',await fs.readFile('components/projects/neptune-feature.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
function visitNeptune(node){
  if(ts.isStringLiteral(node)&&(node.text.startsWith('Neptune 是')||node.text.startsWith('Neptune is'))){
    add('Neptune Multi-agent Workspace','/projects',node.text,node.text.startsWith('Neptune is')?'en':'zh');
  }
  ts.forEachChild(node,visitNeptune);
}
visitNeptune(neptuneFile);
for (const [base, articles] of [['build-log',BUILD_LOG_ARTICLES],['colophon',COLOPHON_ARTICLES],['essays',ESSAY_ARTICLES]]) {
  for (const article of articles) for (const locale of ['zh','en']) {
    add(article.title[locale],`/${base}/${article.slug}`,[article.summary[locale],...article.sections.flatMap(s=>[s.heading[locale],...s.paragraphs.map(p=>p[locale])])].join('\n\n'),locale);
  }
}
for (const item of FAILURE_ITEMS) add(item.title,'/failures',[item.tried,item.failed,item.survived].join('\n'));
const trackedFiles = execFileSync('git',['ls-files','-z','--','content/posts'],{encoding:'utf8'}).split('\0').filter(f=>f.endsWith('.mdx'));
const releaseSlugs = JSON.parse(await fs.readFile('content/field-agent-posts.json', 'utf8'));
if (!Array.isArray(releaseSlugs) || releaseSlugs.some(slug => typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug))) throw Error('Invalid Field Agent publication manifest');
const releaseFiles = releaseSlugs.flatMap(slug => [`content/posts/${slug}.mdx`, `content/posts/en/${slug}.mdx`]);
const files = [...new Set([...trackedFiles, ...releaseFiles])];
for (const file of files) {
  const source = await fs.readFile(file,'utf8');
  const match = /^---\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/.exec(source);
  if (!match || /^(?:draft|sample):\s*["']?true["']?\s*$/m.test(match[1])) continue;
  const title = /^title:\s*(.*?)\s*$/m.exec(match[1])?.[1]?.replace(/^["']|["']$/g,'');
  if (!title) continue;
  const slug = path.basename(file,'.mdx');
  const text = source.slice(match[0].length).replace(/<[^>]+>/g,'').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1');
  add(title,`/blog/${encodeURIComponent(slug)}`,text,file.includes('/en/')?'en':'zh');
}
await fs.mkdir('lib/generated',{recursive:true});
await fs.writeFile('lib/generated/field-agent-content.json',JSON.stringify(documents));
// A small client manifest for matrix discovery, sourced from the same public documents.
const signalEntries = [
  { id: 'neptune', topic: 'projects', href: '/projects', title: 'Neptune Multi-agent Workspace' },
  { id: 'knowledge-copilot', topic: 'projects', href: '/projects', title: 'Knowledge Copilot' },
  { id: 'agent-states', topic: 'writing', href: '/blog/agent-interface-is-a-state-machine' },
  { id: 'recovery', topic: 'writing', href: '/blog/recovery-is-part-of-the-path' },
  { id: 'site-guide', topic: 'build', href: '/build-log/field-agent-from-chat-to-site-guide' },
  { id: 'radio', topic: 'build', href: '/build-log/v1-3-1-radio-in-motion' },
  { id: 'agent-sources', topic: 'craft', href: '/colophon/field-agent-sources-streaming-and-limits' },
  { id: 'motion-exit', topic: 'craft', href: '/colophon/motion-with-an-exit' },
  { id: 'laptop', topic: 'essays', href: '/essays/after-closing-the-laptop' },
  { id: 'evening', topic: 'essays', href: '/essays/an-evening-page' },
];
const signals = signalEntries.map(entry => {
  const title = {}, summary = {}, question = {};
  for (const locale of ['zh', 'en']) {
    const doc = documents.find(doc => doc.href === entry.href && doc.locale === locale && (!entry.title || doc.title === entry.title));
    if (!doc) throw Error(`Missing public signal source: ${entry.id} / ${locale}`);
    title[locale] = doc.title;
    const paragraph = doc.text.split(/\n\s*\n|\n/).find(line => line.trim() && !line.startsWith('#')) || '';
    const limit = locale === 'zh' ? 160 : 260;
    summary[locale] = paragraph.length > limit ? paragraph.slice(0, limit).trimEnd() + '…' : paragraph;
    question[locale] = locale === 'zh'
      ? entry.topic === 'projects' ? `${doc.title} 项目是做什么的？` : `介绍一下《${doc.title}》，它有哪些值得关注的内容？`
      : entry.topic === 'projects' ? `What is the ${doc.title} project?` : `Introduce “${doc.title}” and explain its main ideas.`;
  }
  return { id: entry.id, topic: entry.topic, href: entry.href, title, summary, question };
});
await fs.writeFile('lib/generated/field-agent-signals.json', JSON.stringify(signals));
console.log(`Field Agent: indexed ${documents.length} public source documents.`);
