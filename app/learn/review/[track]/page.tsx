import { notFound } from "next/navigation";
import { findLearningTrack, LEARNING_TRACKS } from "@/lib/learn-data";
import { CourseSelfTest } from "@/components/learn/course-self-test";
export const metadata = { title: "课程综合自测 · FIELD SCHOOL" };
export function generateStaticParams() {
  return LEARNING_TRACKS.map((track) => ({ track: track.slug }));
}
export default async function CourseReviewPage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track: slug } = await params;
  const track = findLearningTrack(slug);
  if (!track) notFound();
  return <CourseSelfTest key={track.slug} track={track} />;
}
