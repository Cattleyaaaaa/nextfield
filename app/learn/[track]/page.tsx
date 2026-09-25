import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TrackOverview } from "@/components/learn/track-overview";
import { findLearningTrack, LEARNING_TRACKS } from "@/lib/learn-data";

export function generateStaticParams() { return LEARNING_TRACKS.map(({ slug }) => ({ track: slug })); }
export async function generateMetadata({ params }: { params: Promise<{ track: string }> }): Promise<Metadata> { const { track: slug } = await params; const track = findLearningTrack(slug); return track ? { title: track.title.zh, description: track.summary.zh } : {}; }
export default async function LearningTrackPage({ params }: { params: Promise<{ track: string }> }) { const { track: slug } = await params; const track = findLearningTrack(slug); if (!track) notFound(); return <TrackOverview track={track} />; }
