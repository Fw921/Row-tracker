import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { formatDate, formatMeters, WORKOUT_TYPE_SHORT } from "@/lib/format";
import { formatDuration } from "@/lib/pace";
import { Badge, Button, Card, EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function TeamIndexPage() {
  const user = await getCurrentUser();
  const pieceGroups = await prisma.pieceGroup.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    include: { _count: { select: { workouts: true } } },
  });

  return (
    <div>
      <PageHeader
        eyebrow="Team"
        title="Team pieces"
        description="Every piece you've logged for the whole boat at once."
        action={<Button href="/log/team">+ Log team piece</Button>}
      />

      {pieceGroups.length === 0 ? (
        <EmptyState
          icon="🏁"
          title="No team pieces yet"
          description="Log the same piece for everyone at once — like calling out splits in the erg room — and it'll show up here as a leaderboard."
          action={<Button href="/log/team">Log a team piece</Button>}
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
                    {pg._count.workouts} rower{pg._count.workouts === 1 ? "" : "s"}
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
