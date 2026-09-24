import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonExperience } from "@/components/learn/lesson-experience";
import { findLearningLesson, findLearningTrack, LEARNING_TRACKS } from "@/lib/learn-data";
import { LEARNING_GUIDES } from "@/lib/learn-guides";

export const dynamicParams = false;
export function generateStaticParams() { return LEARNING_TRACKS.flatMap((track) => track.lessons.map((lesson) => ({ track: track.slug, lesson: lesson.slug }))); }
export function generateMetadata({ params }: { params: { track: string; lesson: string } }): Metadata { const track = findLearningTrack(params.track); const lesson = track ? findLearningLesson(track, params.lesson) : undefined; return lesson ? { title: lesson.title.zh, description: lesson.summary.zh } : {}; }
export default function LearningLessonPage({ params }: { params: { track: string; lesson: string } }) { const track = findLearningTrack(params.track); const lesson = track ? findLearningLesson(track, params.lesson) : undefined; if (!track || !lesson) notFound(); const index = track.lessons.indexOf(lesson); return <LessonExperience guide={LEARNING_GUIDES[`${track.slug}/${lesson.slug}`]} lesson={lesson} next={track.lessons[index + 1]} previous={track.lessons[index - 1]} track={track} />; }
