const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

const compiledModule = { exports: {} };
const source = fs.readFileSync("lib/school-exam-data.ts", "utf8");
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
vm.runInNewContext(code, { module: compiledModule, exports: compiledModule.exports, require: name => name === "server-only" ? {} : require(name) });
const { EXAM_QUESTIONS, PASSING_SCORE, publicExamQuestions, gradeExam } = compiledModule.exports;
const userId = "00000000-0000-4000-8000-000000000001";

for (const track of ["agent", "fullstack", "product"]) {
  const sourceQuestions = EXAM_QUESTIONS[track];
  const publicQuestions = publicExamQuestions(track, userId);
  assert.equal(sourceQuestions.length, 6);
  assert.equal(publicQuestions.length, 6);
  assert.equal(new Set(sourceQuestions.map(question => question.id)).size, 6);
  assert.equal(PASSING_SCORE, 5);
  const correctAnswers = sourceQuestions.map((question, index) => {
    assert.equal(question.options.length, 4);
    for (const locale of ["zh", "en"]) {
      assert.ok(question.prompt[locale]?.length > 10);
      assert.ok(question.explanation[locale]?.length > 10);
      assert.ok(question.options.every(option => option[locale]?.length > 3));
    }
    const publicQuestion = publicQuestions[index];
    assert.equal(publicQuestion.answer, undefined);
    assert.equal(publicQuestion.explanation, undefined);
    return publicQuestion.options.findIndex(option => option.zh === question.options[question.answer].zh);
  });
  assert.ok(gradeExam(track, userId, correctAnswers).every(item => item.correct));
  assert.ok(gradeExam(track, userId, correctAnswers.map(answer => (answer + 1) % 4)).every(item => !item.correct));
}

console.log("PASS: three six-question bilingual exams, hidden answers, stable option order and server grading.");
