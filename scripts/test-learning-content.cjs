const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function load(file) {
  const module = { exports: {} };
  const source = fs.readFileSync(file, "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports }, { filename: file });
  return module.exports;
}

const { LEARNING_TRACKS } = load("lib/learn-data.ts");
const { LEARNING_GUIDES, TRACK_PROJECTS } = load("lib/learn-guides.ts");
const { LEARNING_CASES, LEARNING_GLOSSARY } = load("lib/learning-resources.ts");
const expected = new Set();
for (const track of LEARNING_TRACKS) {
  const project = TRACK_PROJECTS[track.slug];
  assert.ok(project, `Missing project for ${track.slug}`);
  assert.equal(project.milestones.length, track.lessons.length);
  for (const locale of ["zh", "en"]) {
    assert.ok(project.brief[locale].length > (locale === "zh" ? 55 : 95));
    assert.ok(project.deliverable[locale].length > 20);
  }
  for (const lesson of track.lessons) {
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
