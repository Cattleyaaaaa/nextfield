import { authenticate, failure, guardOrigin, json, readBody, SchoolError, supabase } from "@/lib/school-server";
import { findLearningTrack, lessonKey, type LearningTrack } from "@/lib/learn-data";
import { EXAM_QUESTIONS, gradeExam, PASSING_SCORE, publicExamQuestions } from "@/lib/school-exam-data";

export const dynamic = "force-dynamic";
type TrackSlug = LearningTrack["slug"];

function examTrack(value: unknown): LearningTrack {
  if (typeof value !== "string") throw new SchoolError(400, "Choose a learning path / 请选择学习路径");
  const track = findLearningTrack(value);
  if (!track) throw new SchoolError(400, "Unknown learning path / 学习路径不存在");
  return track;
}

async function courseProgress(track: LearningTrack, userId: string, token: string) {
  const rows = await supabase(`/rest/v1/school_progress?user_id=eq.${userId}&select=lesson_key`, token) as { lesson_key: string }[];
  const keys = new Set(rows.map(row => row.lesson_key));
  return track.lessons.filter(lesson => !keys.has(lessonKey(track.slug, lesson.slug))).map(lesson => ({ slug: lesson.slug, title: lesson.title }));
}

export async function GET(request: Request) {
  try {
    const track = examTrack(new URL(request.url).searchParams.get("track"));
    const { user, token } = await authenticate();
    const [missing, attempts] = await Promise.all([
      courseProgress(track, user.id, token),
      supabase(`/rest/v1/school_exam_attempts?user_id=eq.${user.id}&track=eq.${track.slug}&select=id,score,total,passed,attempted_at&order=attempted_at.desc&limit=5`, token) as Promise<{id:string;score:number;total:number;passed:boolean;attempted_at:string}[]>,
    ]);
    return json({ eligible: missing.length === 0, missing, attempts, questionCount: EXAM_QUESTIONS[track.slug].length, passingScore: PASSING_SCORE, questions: missing.length === 0 ? publicExamQuestions(track.slug, user.id) : [] });
  } catch (error) { return failure(error); }
}

export async function POST(request: Request) {
  try {
    guardOrigin(request);
    const { user, token } = await authenticate();
    const body = await readBody(request);
    const track = examTrack(body.track);
    const questions = EXAM_QUESTIONS[track.slug];
    if (!Array.isArray(body.answers) || body.answers.length !== questions.length || body.answers.some((answer:unknown) => !Number.isInteger(answer) || (answer as number) < 0 || (answer as number) >= 4)) {
      throw new SchoolError(400, "Answer every question / 请完成全部试题");
    }
    const missing = await courseProgress(track, user.id, token);
    if (missing.length) throw new SchoolError(403, "Finish this path before the exam / 请先完成本路径课程");

    const feedback = gradeExam(track.slug as TrackSlug, user.id, body.answers);
    const score = feedback.filter(item => item.correct).length;
    const attemptId = await supabase("/rest/v1/rpc/school_record_exam", undefined, { method: "POST", body: JSON.stringify({ p_user: user.id, p_track: track.slug, p_score: score }) }, true);
    return json({ attemptId, score, total: questions.length, passed: score >= PASSING_SCORE, passingScore: PASSING_SCORE, feedback });
  } catch (error) { return failure(error); }
}
