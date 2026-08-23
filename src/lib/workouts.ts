import { prisma } from "@/lib/prisma";
import { resolveTeamEntryTotals, splitPer500m } from "@/lib/pace";
import type { TeamPieceInput, WorkoutInput } from "@/lib/validation";
import type { DataSource } from "@/generated/prisma/client";

/**
 * Create a workout (plus optional splits) with derived fields computed
 * server-side. Shared by the manual-entry API and the CSV importer so
 * the two paths can never disagree on how avgSplitSeconds500m etc. are
 * derived.
 */
export async function createWorkout(
  userId: string,
  input: WorkoutInput,
  opts: { source: DataSource; importBatchId?: string } = { source: "MANUAL" },
) {
  const avgSplitSeconds500m = splitPer500m(input.totalDistanceMeters, input.totalTimeSeconds);

  return prisma.workout.create({
    data: {
      userId,
      date: new Date(input.date),
      type: input.type,
      title: input.title,
      description: input.description,
      totalDistanceMeters: input.totalDistanceMeters,
      totalTimeSeconds: input.totalTimeSeconds,
      avgSplitSeconds500m,
      avgWatts: input.avgWatts,
      avgHeartRate: input.avgHeartRate,
      maxHeartRate: input.maxHeartRate,
      avgStrokeRate: input.avgStrokeRate,
      dragFactor: input.dragFactor,
      calories: input.calories,
      notes: input.notes,
      source: opts.source,
      importBatchId: opts.importBatchId,
      splits: input.splits?.length
        ? {
            create: input.splits.map((split, i) => ({
              index: i + 1,
              distanceMeters: split.distanceMeters,
              timeSeconds: split.timeSeconds,
              splitSeconds500m: splitPer500m(split.distanceMeters, split.timeSeconds),
              restTimeSeconds: split.restTimeSeconds,
              restDistanceMeters: split.restDistanceMeters,
              avgWatts: split.avgWatts,
              avgHeartRate: split.avgHeartRate,
              avgStrokeRate: split.avgStrokeRate,
            })),
          }
        : undefined,
    },
    include: { splits: { orderBy: { index: "asc" } } },
  });
}

/**
 * Create a "team piece": one PieceGroup (the shared distance/time everyone
 * rowed) plus one Workout per rower, each with their own result for the
 * varying side of that piece. Mirrors what a coxswain writes on the erg
 * room whiteboard — same piece, everyone's individual split.
 */
export async function createTeamPiece(userId: string, input: TeamPieceInput) {
  return prisma.$transaction(async (tx) => {
    const pieceGroup = await tx.pieceGroup.create({
      data: {
        userId,
        date: new Date(input.date),
        type: input.type,
        title: input.title,
        targetDistanceMeters: input.mode === "distance" ? input.target : undefined,
        targetTimeSeconds: input.mode === "time" ? input.target : undefined,
      },
    });

    const workouts = [];
    for (const entry of input.entries) {
      const { totalDistanceMeters, totalTimeSeconds } = resolveTeamEntryTotals(
        input.mode,
        input.target,
        entry.value,
      );

      const workout = await tx.workout.create({
        data: {
          userId,
          date: new Date(input.date),
          type: input.type,
          title: input.title,
          totalDistanceMeters,
          totalTimeSeconds,
          avgSplitSeconds500m: splitPer500m(totalDistanceMeters, totalTimeSeconds),
          avgWatts: entry.avgWatts,
          avgHeartRate: entry.avgHeartRate,
          avgStrokeRate: entry.avgStrokeRate,
          notes: entry.notes,
          source: "MANUAL",
          athleteId: entry.athleteId,
          pieceGroupId: pieceGroup.id,
        },
      });
      workouts.push(workout);
    }

    return { pieceGroup, workouts };
  });
}
