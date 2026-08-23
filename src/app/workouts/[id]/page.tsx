import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  ChevronLeft,
  Gauge,
  Heart,
  HeartPulse,
  Route,
  Timer,
  Wind,
  Zap,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { formatCount, formatDate, formatMeters, WORKOUT_TYPE_SHORT } from "@/lib/format";
import { formatDuration, formatSplit, classifyPacing } from "@/lib/pace";
import { PACING_LABELS } from "@/lib/constants";
import { SplitChart } from "@/components/SplitChart";
import { DeleteWorkoutButton } from "@/components/DeleteWorkoutButton";
import { Avatar, Badge, Card, PageHeader, StatTile } from "@/components/ui";
import { Reveal, RevealList, RevealListItem, RevealRow, RevealTableBody } from "@/components/motion/Reveal";

export const dynamic = "force-dynamic";

const PACING_TONE: Record<string, "faster" | "slower" | "neutral"> = {
  negative: "faster",
  positive: "slower",
  even: "neutral",
  unknown: "neutral",
};

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const workout = await prisma.workout.findFirst({
    where: { id, userId: user.id },
    include: {
      splits: { orderBy: { index: "asc" } },
      athlete: true,
      pieceGroup: true,
    },
  });

  if (!workout) notFound();

  const pacing = classifyPacing(workout.splits.map((s) => s.splitSeconds500m));

  return (
    <div className="max-w-3xl">
      <Link
        href={workout.pieceGroup ? `/team/${workout.pieceGroup.id}` : "/history"}
        className="mb-2 flex items-center gap-0.5 text-sm font-medium text-accent hover:text-accent-strong"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        {workout.pieceGroup ? "Team piece" : "History"}
      </Link>

      <PageHeader
        title={workout.title || WORKOUT_TYPE_SHORT[workout.type]}
        description={`${workout.title ? `${WORKOUT_TYPE_SHORT[workout.type]} · ` : ""}${formatDate(workout.date)} · ${
          workout.source === "CONCEPT2_CSV" ? "Imported from Concept2" : "Manual entry"
        }`}
        action={<DeleteWorkoutButton id={workout.id} />}
      />

      <div className="mb-6 flex items-center gap-2">
        <Avatar name={workout.athlete?.name ?? "Me"} />
        <span className="text-sm font-medium">{workout.athlete?.name ?? "Me"}</span>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatTile
          icon={<Route className="h-3.5 w-3.5" aria-hidden />}
          label="Distance"
          value={formatMeters(workout.totalDistanceMeters)}
          numericValue={workout.totalDistanceMeters}
          format={formatMeters}
        />
        <StatTile
          icon={<Timer className="h-3.5 w-3.5" aria-hidden />}
          label="Time"
          value={formatDuration(workout.totalTimeSeconds)}
          numericValue={workout.totalTimeSeconds}
          format={formatDuration}
        />
        <StatTile
          icon={<Gauge className="h-3.5 w-3.5" aria-hidden />}
          label="Split /500m"
          value={formatSplit(workout.avgSplitSeconds500m)}
          numericValue={workout.avgSplitSeconds500m}
          format={formatSplit}
        />
        <StatTile
          icon={<HeartPulse className="h-3.5 w-3.5" aria-hidden />}
          label="Avg HR"
          value={workout.avgHeartRate ? `${workout.avgHeartRate} bpm` : "—"}
          numericValue={workout.avgHeartRate}
          format={(n) => `${formatCount(n)} bpm`}
        />
        <StatTile
          icon={<Heart className="h-3.5 w-3.5" aria-hidden />}
          label="Max HR"
          value={workout.maxHeartRate ? `${workout.maxHeartRate} bpm` : "—"}
          numericValue={workout.maxHeartRate}
          format={(n) => `${formatCount(n)} bpm`}
        />
        <StatTile
          icon={<Zap className="h-3.5 w-3.5" aria-hidden />}
          label="Avg watts"
          value={workout.avgWatts ? `${Math.round(workout.avgWatts)}W` : "—"}
          numericValue={workout.avgWatts}
          format={(n) => `${formatCount(n)}W`}
        />
        <StatTile
          icon={<Activity className="h-3.5 w-3.5" aria-hidden />}
          label="Stroke rate"
          value={workout.avgStrokeRate ? `${workout.avgStrokeRate}/min` : "—"}
          numericValue={workout.avgStrokeRate}
          format={(n) => `${formatCount(n)}/min`}
        />
        <StatTile
          icon={<Wind className="h-3.5 w-3.5" aria-hidden />}
          label="Drag factor"
          value={workout.dragFactor ? String(workout.dragFactor) : "—"}
          numericValue={workout.dragFactor}
          format={formatCount}
        />
      </div>

      {workout.notes && (
        <Card className="mb-8 p-3.5 text-sm leading-relaxed text-foreground">
          {workout.notes}
        </Card>
      )}

      {workout.splits.length > 0 && (
        <Reveal className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-foreground">Pacing</h2>
            <Badge tone={PACING_TONE[pacing]}>{PACING_LABELS[pacing]}</Badge>
          </div>
          <Card className="p-4" interactive>
            <SplitChart splits={workout.splits} />
          </Card>
          <Card className="mt-3 overflow-hidden">
            {/* Table — sm and up. */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-background text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2 text-right">Distance</th>
                    <th className="px-3 py-2 text-right">Time</th>
                    <th className="px-3 py-2 text-right">Split /500m</th>
                    <th className="px-3 py-2 text-right">Avg HR</th>
                  </tr>
                </thead>
                <RevealTableBody>
                  {workout.splits.map((s) => (
                    <RevealRow key={s.id} className="border-b border-border transition-colors last:border-0 hover:bg-background">
                      <td className="px-3 py-2 text-muted">{s.index}</td>
                      <td className="px-3 py-2 text-right tabular">
                        {formatMeters(s.distanceMeters)}
                      </td>
                      <td className="px-3 py-2 text-right tabular">
                        {formatDuration(s.timeSeconds)}
                      </td>
                      <td className="px-3 py-2 text-right tabular font-medium">
                        {formatSplit(s.splitSeconds500m)}
                      </td>
                      <td className="px-3 py-2 text-right tabular text-muted">{s.avgHeartRate ?? "—"}</td>
                    </RevealRow>
                  ))}
                </RevealTableBody>
              </table>
            </div>

            {/* Stacked rows — below sm. */}
            <RevealList className="divide-y divide-border sm:hidden">
              {workout.splits.map((s) => (
                <RevealListItem key={s.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                  <span className="w-5 shrink-0 text-xs text-muted">{s.index}</span>
                  <span className="tabular flex-1">{formatMeters(s.distanceMeters)}</span>
                  <span className="tabular flex-1">{formatDuration(s.timeSeconds)}</span>
                  <span className="tabular flex-1 font-medium">{formatSplit(s.splitSeconds500m)}</span>
                  <span className="tabular w-12 shrink-0 text-right text-muted">{s.avgHeartRate ?? "—"}</span>
                </RevealListItem>
              ))}
            </RevealList>
          </Card>
        </Reveal>
      )}
    </div>
  );
}
