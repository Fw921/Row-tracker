import Link from "next/link";
import { Activity, ChevronRight, LineChart, Plus, Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { DashboardCharts } from "@/components/DashboardCharts";
import { formatDate, formatMeters, WORKOUT_TYPE_SHORT } from "@/lib/format";
import { formatDuration } from "@/lib/pace";
import { Badge, Button, Card, EmptyState, PageHeader } from "@/components/ui";
import type { DashboardWorkout } from "@/lib/dashboard";
import type { GoalRecord } from "@/lib/goals";

// Always reflects the latest logged/imported workouts — never prerender.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const [workouts, recentPieceGroups, goals] = await Promise.all([
    // Only the account owner's own pieces — a teammate's team-piece result
    // shouldn't blend into "my" trend/PR/volume charts. Team results get
    // their own leaderboard view instead (see the block below and /team).
    prisma.workout.findMany({
      where: { userId: user.id, athleteId: null },
      orderBy: { date: "asc" },
      include: { splits: { orderBy: { index: "asc" } } },
    }),
    prisma.pieceGroup.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 3,
      include: { _count: { select: { workouts: true } } },
    }),
    prisma.goal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  if (workouts.length === 0 && recentPieceGroups.length === 0) {
    return (
      <div className="max-w-lg">
        <PageHeader title="Dashboard" />
        <EmptyState
          icon={<Activity className="h-6 w-6" aria-hidden />}
          title="Nothing logged yet"
          description="Log your first 2k, 5k, or training row — or the whole boat's piece at once — to start seeing charts here."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button href="/log">Log a workout</Button>
              <Button href="/log/team" variant="secondary">
                Log for the team
              </Button>
              <Button href="/import" variant="secondary">
                Import from Concept2
              </Button>
            </div>
          }
        />
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
    splits: w.splits.map((s) => ({
      index: s.index,
      distanceMeters: s.distanceMeters,
      timeSeconds: s.timeSeconds,
      splitSeconds500m: s.splitSeconds500m,
      avgStrokeRate: s.avgStrokeRate,
    })),
  }));

  const goalRecords: GoalRecord[] = goals.map((g) => ({
    id: g.id,
    type: g.type,
    label: g.label,
    targetDistanceMeters: g.targetDistanceMeters,
    targetSplitSeconds500m: g.targetSplitSeconds500m,
    targetMeters: g.targetMeters,
    targetWorkoutsPerMonth: g.targetWorkoutsPerMonth,
    createdAt: g.createdAt.toISOString(),
  }));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        action={
          <Button href="/log/team">
            <Plus className="h-4 w-4" aria-hidden />
            Log team piece
          </Button>
        }
      />

      {recentPieceGroups.length > 0 && (
        <Card className="mb-8 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <h2 className="flex items-center gap-1.5 text-sm font-medium">
              <Trophy className="h-4 w-4 text-highlight" aria-hidden />
              Recent team pieces
            </h2>
            <Link
              href="/team"
              className="flex items-center gap-0.5 text-xs font-medium text-accent hover:text-accent-strong"
            >
              See all <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {recentPieceGroups.map((pg) => (
              <li key={pg.id}>
                <Link
                  href={`/team/${pg.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-background"
                >
                  <span>
                    <span className="font-medium">{pg.title || WORKOUT_TYPE_SHORT[pg.type]}</span>{" "}
                    <span className="text-muted">
                      · {formatDate(pg.date)} ·{" "}
                      {pg.targetDistanceMeters
                        ? formatMeters(pg.targetDistanceMeters)
                        : formatDuration(pg.targetTimeSeconds ?? 0)}
                    </span>
                  </span>
                  <Badge tone="accent">
                    {pg._count.workouts} rower{pg._count.workouts === 1 ? "" : "s"}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {workouts.length > 0 ? (
        <DashboardCharts workouts={data} goals={goalRecords} />
      ) : (
        <EmptyState
          icon={<LineChart className="h-6 w-6" aria-hidden />}
          title="No personal pieces yet"
          description="These charts track your own results — log one to see your trend."
          action={<Button href="/log">Log a workout</Button>}
        />
      )}
    </div>
  );
}
