import { notFound } from "next/navigation";
import { ExamExperience } from "@/components/learn/exam-experience";
import { findLearningTrack, LEARNING_TRACKS } from "@/lib/learn-data";

export const metadata = { title: "结课考试 / FIELD SCHOOL" };
export function generateStaticParams() { return LEARNING_TRACKS.map(track => ({ track: track.slug })); }
export default async function Page({ params }: { params: Promise<{ track: string }> }) {
  const { track: slug } = await params;
  const track = findLearningTrack(slug);
  if (!track) notFound();
  return <ExamExperience track={track}/>;
}
