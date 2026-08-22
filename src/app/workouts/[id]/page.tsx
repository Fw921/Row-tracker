import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { formatDate, formatMeters, WORKOUT_TYPE_SHORT } from "@/lib/format";
import { formatDuration, formatSplit, classifyPacing } from "@/lib/pace";
import { PACING_LABELS } from "@/lib/constants";
import { SplitChart } from "@/components/SplitChart";
import { DeleteWorkoutButton } from "@/components/DeleteWorkoutButton";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const workout = await prisma.workout.findFirst({
    where: { id, userId: user.id },
    include: { splits: { orderBy: { index: "asc" } } },
  });

  if (!workout) notFound();

  const pacing = classifyPacing(workout.splits.map((s) => s.splitSeconds500m));

  return (
    <div className="max-w-3xl">
      <Link href="/history" className="text-sm text-accent underline">
        ← History
      </Link>

      <div className="mt-2 mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {workout.title || WORKOUT_TYPE_SHORT[workout.type]}
          </h1>
          <p className="text-sm text-muted">
            {formatDate(workout.date)} · {WORKOUT_TYPE_SHORT[workout.type]} ·{" "}
            {workout.source === "CONCEPT2_CSV" ? "Imported from Concept2" : "Manual entry"}
          </p>
        </div>
        <DeleteWorkoutButton id={workout.id} />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Distance" value={formatMeters(workout.totalDistanceMeters)} />
        <Stat label="Time" value={formatDuration(workout.totalTimeSeconds)} />
        <Stat label="Split /500m" value={formatSplit(workout.avgSplitSeconds500m)} />
        <Stat label="Avg HR" value={workout.avgHeartRate ? `${workout.avgHeartRate} bpm` : "—"} />
        <Stat label="Max HR" value={workout.maxHeartRate ? `${workout.maxHeartRate} bpm` : "—"} />
        <Stat label="Avg watts" value={workout.avgWatts ? `${Math.round(workout.avgWatts)}W` : "—"} />
        <Stat
          label="Stroke rate"
          value={workout.avgStrokeRate ? `${workout.avgStrokeRate}/min` : "—"}
        />
        <Stat label="Drag factor" value={workout.dragFactor ? String(workout.dragFactor) : "—"} />
      </div>

      {workout.notes && (
        <p className="mb-8 rounded-md border border-border bg-surface p-3 text-sm">
          {workout.notes}
        </p>
      )}

      {workout.splits.length > 0 && (
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium">Pacing</h2>
            <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
              {PACING_LABELS[pacing]}
            </span>
          </div>
          <SplitChart splits={workout.splits} />
          <div className="mt-3 overflow-x-auto rounded-md border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-1.5">#</th>
                  <th className="px-3 py-1.5 text-right">Distance</th>
                  <th className="px-3 py-1.5 text-right">Time</th>
                  <th className="px-3 py-1.5 text-right">Split /500m</th>
                  <th className="px-3 py-1.5 text-right">Avg HR</th>
                </tr>
              </thead>
              <tbody>
                {workout.splits.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-1.5">{s.index}</td>
                    <td className="px-3 py-1.5 text-right tabular">
                      {formatMeters(s.distanceMeters)}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular">
                      {formatDuration(s.timeSeconds)}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular">
                      {formatSplit(s.splitSeconds500m)}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular">{s.avgHeartRate ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="tabular text-lg font-semibold">{value}</div>
    </div>
  );
}
