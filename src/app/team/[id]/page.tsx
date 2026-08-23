import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { formatDate, formatMeters, WORKOUT_TYPE_SHORT } from "@/lib/format";
import { formatDuration, formatSplit } from "@/lib/pace";
import { Avatar, Badge, Card, PageHeader } from "@/components/ui";
import { TeamLeaderboardChart } from "@/components/TeamLeaderboardChart";
import { DeletePieceGroupButton } from "@/components/DeletePieceGroupButton";

export const dynamic = "force-dynamic";

export default async function TeamPieceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const pieceGroup = await prisma.pieceGroup.findFirst({
    where: { id, userId: user.id },
    include: {
      workouts: {
        include: { athlete: true },
        orderBy: { avgSplitSeconds500m: "asc" },
      },
    },
  });

  if (!pieceGroup) notFound();

  const chartRows = pieceGroup.workouts.map((w) => ({
    name: w.athlete?.name ?? "Unknown",
    splitSeconds500m: w.avgSplitSeconds500m,
  }));

  return (
    <div className="max-w-3xl">
      <Link href="/team" className="text-sm text-accent underline">
        ← Team pieces
      </Link>

      <PageHeader
        eyebrow={WORKOUT_TYPE_SHORT[pieceGroup.type]}
        title={pieceGroup.title || "Team piece"}
        description={`${formatDate(pieceGroup.date)} · ${
          pieceGroup.targetDistanceMeters
            ? `${formatMeters(pieceGroup.targetDistanceMeters)}, everyone's own time`
            : `${formatDuration(pieceGroup.targetTimeSeconds ?? 0)}, everyone's own distance`
        }`}
        action={<DeletePieceGroupButton id={pieceGroup.id} />}
      />

      <Card className="mb-6 p-4">
        <h2 className="mb-3 text-sm font-medium">Splits, fastest to slowest</h2>
        <TeamLeaderboardChart rows={chartRows} />
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-background text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Rower</th>
              <th className="px-4 py-2 text-right">
                {pieceGroup.targetDistanceMeters ? "Time" : "Distance"}
              </th>
              <th className="px-4 py-2 text-right">Split /500m</th>
              <th className="px-4 py-2 text-right">Avg HR</th>
            </tr>
          </thead>
          <tbody>
            {pieceGroup.workouts.map((w, i) => (
              <tr key={w.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5 text-muted">
                  {i === 0 ? <Badge tone="highlight">1st</Badge> : i + 1}
                </td>
                <td className="px-4 py-2.5">
                  <Link
                    href={`/workouts/${w.id}`}
                    className="flex items-center gap-2 hover:underline"
                  >
                    <Avatar name={w.athlete?.name ?? "?"} />
                    {w.athlete?.name ?? "Unknown"}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-right tabular">
                  {pieceGroup.targetDistanceMeters
                    ? formatDuration(w.totalTimeSeconds)
                    : formatMeters(w.totalDistanceMeters)}
                </td>
                <td className="px-4 py-2.5 text-right tabular">
                  {formatSplit(w.avgSplitSeconds500m)}
                </td>
                <td className="px-4 py-2.5 text-right tabular">{w.avgHeartRate ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
