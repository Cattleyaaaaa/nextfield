import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TrackOverview } from "@/components/learn/track-overview";
import { findLearningTrack, LEARNING_TRACKS } from "@/lib/learn-data";

export const dynamicParams = false;
export function generateStaticParams() { return LEARNING_TRACKS.map(({ slug }) => ({ track: slug })); }
export function generateMetadata({ params }: { params: { track: string } }): Metadata { const track = findLearningTrack(params.track); return track ? { title: track.title.zh, description: track.summary.zh } : {}; }
export default function LearningTrackPage({ params }: { params: { track: string } }) { const track = findLearningTrack(params.track); if (!track) notFound(); return <TrackOverview track={track} />; }
