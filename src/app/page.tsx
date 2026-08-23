import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { DashboardCharts } from "@/components/DashboardCharts";
import type { DashboardWorkout } from "@/lib/dashboard";

// Always reflects the latest logged/imported workouts — never prerender.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const workouts = await prisma.workout.findMany({
    where: { userId: user.id },
    orderBy: { date: "asc" },
    include: { splits: { orderBy: { index: "asc" } } },
  });

  if (workouts.length === 0) {
    return (
      <div className="max-w-lg">
        <h1 className="mb-2 text-xl font-semibold">Welcome to Row Tracker</h1>
        <p className="mb-4 text-sm text-muted">
          Log your first 2k, 5k, or training row to start seeing charts here.
        </p>
        <div className="flex gap-3">
          <Link href="/log" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
            Log a workout
          </Link>
          <Link href="/import" className="rounded-md border border-border px-4 py-2 text-sm">
            Import from Concept2
          </Link>
        </div>
      </div>
    );
  }

  const data: DashboardWorkout[] = workouts.map((w) => ({
    id: w.id,
    date: w.date.toISOString(),
    type: w.type,
    title: w.title,
    totalDistanceMeters: w.totalDistanceMeters,
    totalTimeSeconds: w.totalTimeSeconds,
    avgSplitSeconds500m: w.avgSplitSeconds500m,
    avgHeartRate: w.avgHeartRate,
    splits: w.splits.map((s) => ({ index: s.index, splitSeconds500m: s.splitSeconds500m })),
  }));

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Dashboard</h1>
      <DashboardCharts workouts={data} />
    </div>
  );
}
