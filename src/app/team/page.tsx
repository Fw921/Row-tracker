import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { formatDate, formatMeters, WORKOUT_TYPE_SHORT } from "@/lib/format";
import { formatDuration } from "@/lib/pace";
import { summarizeAthlete, type AthleteWorkout, type TeamPieceEvent } from "@/lib/team";
import { Badge, Button, Card, EmptyState, PageHeader } from "@/components/ui";
import { TeamOverviewCharts } from "@/components/TeamOverviewCharts";

export const dynamic = "force-dynamic";

export default async function TeamIndexPage() {
  const user = await getCurrentUser();

  const [athletes, pieceGroups] = await Promise.all([
    prisma.athlete.findMany({
      where: { userId: user.id, archived: false },
      orderBy: { name: "asc" },
      include: {
        workouts: {
          select: { date: true, totalDistanceMeters: true, totalTimeSeconds: true, avgSplitSeconds500m: true },
        },
      },
    }),
    prisma.pieceGroup.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      include: { workouts: { select: { avgSplitSeconds500m: true } } },
    }),
  ]);

  if (athletes.length === 0 && pieceGroups.length === 0) {
    return (
      <div className="max-w-lg">
        <PageHeader eyebrow="Coach" title="Team" />
        <EmptyState
          icon="🏁"
          title="No team data yet"
          description="Add your roster and log a team piece — like calling out splits in the erg room — and this page turns into a coach dashboard."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button href="/roster">Build your roster</Button>
              <Button href="/log/team" variant="secondary">
                Log a team piece
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  const athleteWorkoutLists: { id: string; workouts: AthleteWorkout[] }[] = athletes.map((a) => ({
    id: a.id,
    workouts: a.workouts.map((w) => ({
      date: w.date.toISOString(),
      totalDistanceMeters: w.totalDistanceMeters,
      totalTimeSeconds: w.totalTimeSeconds,
      avgSplitSeconds500m: w.avgSplitSeconds500m,
    })),
  }));

  const athleteSummaries = athletes.map((a, i) =>
    summarizeAthlete(a.id, a.name, athleteWorkoutLists[i].workouts),
  );

  const pieceEvents: TeamPieceEvent[] = pieceGroups.map((pg) => ({
    date: pg.date.toISOString(),
    targetDistanceMeters: pg.targetDistanceMeters,
    splits: pg.workouts.map((w) => w.avgSplitSeconds500m),
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Coach"
        title="Team"
        description="Everyone on the roster, and every piece you've logged for the whole boat at once."
        action={
          <Button href="/log/team">
            <Plus className="h-4 w-4" aria-hidden />
            Log team piece
          </Button>
        }
      />

      <div className="mb-8">
        <TeamOverviewCharts
          athletes={athleteWorkoutLists}
          pieceEvents={pieceEvents}
          athleteSummaries={athleteSummaries}
        />
      </div>

      <h2 className="mb-2 font-display text-sm font-semibold text-foreground">Recent team pieces</h2>
      {pieceGroups.length === 0 ? (
        <EmptyState
          icon="🏁"
          title="No team pieces yet"
          description="Log the same piece for everyone at once and it'll show up here as a leaderboard."
          action={
            <Button href="/log/team">
              <Plus className="h-4 w-4" aria-hidden />
              Log a team piece
            </Button>
          }
        />
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {pieceGroups.map((pg) => (
              <li key={pg.id}>
                <Link
                  href={`/team/${pg.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-background"
                >
                  <div>
                    <div className="font-medium">
                      {pg.title || WORKOUT_TYPE_SHORT[pg.type]}
                    </div>
                    <div className="text-xs text-muted">
                      {formatDate(pg.date)} ·{" "}
                      {pg.targetDistanceMeters
                        ? formatMeters(pg.targetDistanceMeters)
                        : formatDuration(pg.targetTimeSeconds ?? 0)}
                    </div>
                  </div>
                  <Badge tone="accent">
                    {pg.workouts.length} rower{pg.workouts.length === 1 ? "" : "s"}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
