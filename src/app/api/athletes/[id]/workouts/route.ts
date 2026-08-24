import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import type { DashboardWorkout } from "@/lib/dashboard";

// Powers the coach dashboard's athlete detail sheet: fetched on demand when
// a coach opens a roster athlete's profile, rather than eagerly loading
// every athlete's full workout+split history on every /team page load.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  const { id } = await params;

  const athlete = await prisma.athlete.findFirst({ where: { id, userId: user.id } });
  if (!athlete) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const workouts = await prisma.workout.findMany({
    where: { userId: user.id, athleteId: id },
    orderBy: { date: "asc" },
    include: { splits: { orderBy: { index: "asc" } } },
  });

  const data: DashboardWorkout[] = workouts.map((w) => ({
    id: w.id,
    date: w.date.toISOString(),
    type: w.type,
    title: w.title,
    totalDistanceMeters: w.totalDistanceMeters,
    totalTimeSeconds: w.totalTimeSeconds,
    avgSplitSeconds500m: w.avgSplitSeconds500m,
    avgHeartRate: w.avgHeartRate,
    splits: w.splits.map((s) => ({
      index: s.index,
      distanceMeters: s.distanceMeters,
      timeSeconds: s.timeSeconds,
      splitSeconds500m: s.splitSeconds500m,
      avgStrokeRate: s.avgStrokeRate,
    })),
  }));

  return NextResponse.json({ athlete: { id: athlete.id, name: athlete.name }, workouts: data });
}
