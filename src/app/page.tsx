import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { DashboardCharts } from "@/components/DashboardCharts";
import { formatDate, formatMeters, WORKOUT_TYPE_SHORT } from "@/lib/format";
import { formatDuration } from "@/lib/pace";
import { Badge, Button, Card, EmptyState, PageHeader } from "@/components/ui";
import type { DashboardWorkout } from "@/lib/dashboard";

// Always reflects the latest logged/imported workouts — never prerender.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const [workouts, recentPieceGroups] = await Promise.all([
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
  ]);

  if (workouts.length === 0 && recentPieceGroups.length === 0) {
    return (
      <div className="max-w-lg">
        <PageHeader title="Welcome to Row Tracker" />
        <EmptyState
          icon="🚣"
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
    splits: w.splits.map((s) => ({ index: s.index, splitSeconds500m: s.splitSeconds500m })),
  }));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        action={<Button href="/log/team">+ Log team piece</Button>}
      />

      {recentPieceGroups.length > 0 && (
        <Card className="mb-8 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <h2 className="text-sm font-medium">Recent team pieces</h2>
            <Link href="/team" className="text-xs text-accent underline">
              See all →
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {recentPieceGroups.map((pg) => (
              <li key={pg.id}>
                <Link
                  href={`/team/${pg.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm hover:bg-background"
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
        <DashboardCharts workouts={data} />
      ) : (
        <EmptyState
          icon="📊"
          title="No personal pieces yet"
          description="These charts track your own results — log one to see your trend."
          action={<Button href="/log">Log a workout</Button>}
        />
      )}
    </div>
  );
}
