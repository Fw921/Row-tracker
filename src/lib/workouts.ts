import { prisma } from "@/lib/prisma";
import { splitPer500m } from "@/lib/pace";
import type { WorkoutInput } from "@/lib/validation";
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
