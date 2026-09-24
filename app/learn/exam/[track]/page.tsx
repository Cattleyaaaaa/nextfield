import { notFound } from "next/navigation";
import { ExamExperience } from "@/components/learn/exam-experience";
import { findLearningTrack, LEARNING_TRACKS } from "@/lib/learn-data";

export const dynamicParams = false;
export const metadata = { title: "结课考试 / FIELD SCHOOL" };
export function generateStaticParams() { return LEARNING_TRACKS.map(track => ({ track: track.slug })); }
export default function Page({ params }: { params: { track: string } }) {
  const track = findLearningTrack(params.track);
  if (!track) notFound();
  return <ExamExperience track={track}/>;
}
