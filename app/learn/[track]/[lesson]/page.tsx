import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonExperience } from "@/components/learn/lesson-experience";
import { findLearningLesson, findLearningTrack, LEARNING_TRACKS } from "@/lib/learn-data";
import { LEARNING_GUIDES } from "@/lib/learn-guides";

export function generateStaticParams() { return LEARNING_TRACKS.flatMap((track) => track.lessons.map((lesson) => ({ track: track.slug, lesson: lesson.slug }))); }
export async function generateMetadata({ params }: { params: Promise<{ track: string; lesson: string }> }): Promise<Metadata> { const { track: trackSlug, lesson: lessonSlug } = await params; const track = findLearningTrack(trackSlug); const lesson = track ? findLearningLesson(track, lessonSlug) : undefined; return lesson ? { title: lesson.title.zh, description: lesson.summary.zh } : {}; }
export default async function LearningLessonPage({ params }: { params: Promise<{ track: string; lesson: string }> }) { const { track: trackSlug, lesson: lessonSlug } = await params; const track = findLearningTrack(trackSlug); const lesson = track ? findLearningLesson(track, lessonSlug) : undefined; if (!track || !lesson) notFound(); const index = track.lessons.indexOf(lesson); return <LessonExperience key={`${track.slug}/${lesson.slug}`} guide={LEARNING_GUIDES[`${track.slug}/${lesson.slug}`]} lesson={lesson} next={track.lessons[index + 1]} previous={track.lessons[index - 1]} track={track} />; }
