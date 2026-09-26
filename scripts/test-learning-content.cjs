const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const path = require("node:path");
const cache = new Map();

function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  const module = { exports: {} };
  cache.set(file, module.exports);
  const source = fs.readFileSync(file, "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: (name) => load(path.resolve(path.dirname(file), name) + ".ts") }, { filename: file });
  return module.exports;
}

const { LEARNING_TRACKS } = load("lib/learn-data.ts");
const { LEARNING_GUIDES, TRACK_PROJECTS } = load("lib/learn-guides.ts");
const { LEARNING_CASES, LEARNING_GLOSSARY } = load("lib/learning-resources.ts");
const expected = new Set();
const counts = { agent: 12, fullstack: 14, product: 6 };
const first = { agent: "what-is-agent", fullstack: "what-is-fullstack", product: "product-introduction" };
for (const track of LEARNING_TRACKS) {
  assert.equal(track.lessons.length, counts[track.slug]);
  assert.equal(track.lessons[0].slug, first[track.slug]);
  assert.equal(new Set(track.lessons.map(l => l.slug)).size, track.lessons.length);
  const project = TRACK_PROJECTS[track.slug];
  assert.ok(project, `Missing project for ${track.slug}`);
  assert.equal(project.milestones.length, track.lessons.length);
  for (const locale of ["zh", "en"]) {
    assert.ok(project.brief[locale].length > (locale === "zh" ? 55 : 95));
    assert.ok(project.deliverable[locale].length > 20);
  }
  for (const lesson of track.lessons) {
    assert.equal(lesson.number, String(track.lessons.indexOf(lesson) + 1).padStart(2, "0"));
    assert.equal(lesson.challenge.options.filter(option => option.correct).length, 1);
    assert.ok(lesson.concept.length >= 2);
    assert.ok(lesson.code.trim().length > 20);
    const key = `${track.slug}/${lesson.slug}`;
    expected.add(key);
    const guide = LEARNING_GUIDES[key];
    assert.ok(guide, `Missing guide for ${key}`);
    assert.equal(guide.steps.length, 3, key);
    assert.equal(guide.checks.length, 3, key);
    assert.ok(lesson.minutes >= 15, key);
    for (const locale of ["zh", "en"]) {
      assert.ok(guide.scenario[locale].length > (locale === "zh" ? 35 : 70), `${key}: scenario ${locale}`);
      assert.ok(guide.task[locale].length > (locale === "zh" ? 20 : 45), `${key}: task ${locale}`);
      assert.ok(guide.pitfall[locale].length > (locale === "zh" ? 25 : 45), `${key}: pitfall ${locale}`);
      for (const step of guide.steps) assert.ok(step.detail[locale].length > (locale === "zh" ? 25 : 50), `${key}: step ${locale}`);
      for (const check of guide.checks) assert.ok(check[locale].length >= 5, `${key}: check ${locale}`);
    }
  }
}
assert.deepEqual(Object.keys(LEARNING_GUIDES).sort(), [...expected].sort());
assert.equal(LEARNING_CASES.length, 6);
assert.equal(LEARNING_GLOSSARY.length, 9);
for (const item of LEARNING_CASES) {
  assert.ok(expected.has(item.lesson), `Unknown case lesson: ${item.lesson}`);
  assert.equal(item.steps.length, 3, item.id);
  for (const locale of ["zh", "en"]) {
    assert.ok(item.situation[locale].length > 25, `${item.id}: situation ${locale}`);
    assert.ok(item.outcome[locale].length > 15, `${item.id}: outcome ${locale}`);
    for (const step of item.steps) assert.ok(step.detail[locale].length > (locale === "zh" ? 20 : 35), `${item.id}: step ${locale}`);
  }
}
for (const item of LEARNING_GLOSSARY) {
  assert.ok(expected.has(item.lesson), `Unknown glossary lesson: ${item.lesson}`);
  assert.ok(item.definition.zh && item.definition.en, `Missing glossary translation: ${item.term}`);
}
console.log(`PASS: ${LEARNING_TRACKS.length} project briefs, ${expected.size} bilingual lesson guides, ${LEARNING_CASES.length} cases and ${LEARNING_GLOSSARY.length} glossary entries.`);
