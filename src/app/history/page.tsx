import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { formatDate, formatMeters, WORKOUT_TYPE_SHORT } from "@/lib/format";
import { formatDuration, formatSplit } from "@/lib/pace";
import { WORKOUT_TYPE_LABELS } from "@/lib/constants";
import { DeleteWorkoutButton } from "@/components/DeleteWorkoutButton";
import type { Prisma } from "@/generated/prisma/client";

type SearchParams = { type?: string; from?: string; to?: string };

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();

  const where: Prisma.WorkoutWhereInput = { userId: user.id };
  if (params.type) where.type = params.type as Prisma.WorkoutWhereInput["type"];
  if (params.from || params.to) {
    where.date = {
      ...(params.from ? { gte: new Date(params.from) } : {}),
      ...(params.to ? { lte: new Date(params.to) } : {}),
    };
  }

  const workouts = await prisma.workout.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">History</h1>
        <Link href="/log" className="text-sm text-accent underline">
          + Log workout
        </Link>
      </div>

      <form className="mb-4 flex flex-wrap items-end gap-3 text-sm" method="get">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">Type</span>
          <select
            name="type"
            defaultValue={params.type ?? ""}
            className="rounded-md border border-border bg-surface px-2 py-1"
          >
            <option value="">All</option>
            {Object.entries(WORKOUT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">From</span>
          <input
            type="date"
            name="from"
            defaultValue={params.from ?? ""}
            className="rounded-md border border-border bg-surface px-2 py-1"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">To</span>
          <input
            type="date"
            name="to"
            defaultValue={params.to ?? ""}
            className="rounded-md border border-border bg-surface px-2 py-1"
          />
        </label>
        <button
          type="submit"
          className="rounded-md border border-border px-3 py-1.5 hover:bg-surface"
        >
          Filter
        </button>
        {(params.type || params.from || params.to) && (
          <Link href="/history" className="px-2 py-1.5 text-muted underline">
            Clear
          </Link>
        )}
      </form>

      {workouts.length === 0 ? (
        <p className="text-sm text-muted">
          No workouts yet. <Link href="/log" className="text-accent underline">Log one</Link> or{" "}
          <Link href="/import" className="text-accent underline">import a CSV</Link>.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2 text-right">Distance</th>
                <th className="px-3 py-2 text-right">Time</th>
                <th className="px-3 py-2 text-right">Split /500m</th>
                <th className="px-3 py-2 text-right">Avg HR</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {workouts.map((w) => (
                <tr key={w.id} className="border-b border-border last:border-0 hover:bg-surface">
                  <td className="px-3 py-2">
                    <Link href={`/workouts/${w.id}`} className="hover:underline">
                      {formatDate(w.date)}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-muted">{WORKOUT_TYPE_SHORT[w.type]}</td>
                  <td className="px-3 py-2">{w.title ?? "—"}</td>
                  <td className="px-3 py-2 text-right tabular">
                    {formatMeters(w.totalDistanceMeters)}
                  </td>
                  <td className="px-3 py-2 text-right tabular">
                    {formatDuration(w.totalTimeSeconds)}
                  </td>
                  <td className="px-3 py-2 text-right tabular">{formatSplit(w.avgSplitSeconds500m)}</td>
                  <td className="px-3 py-2 text-right tabular">{w.avgHeartRate ?? "—"}</td>
                  <td className="px-3 py-2 text-right">
                    <DeleteWorkoutButton id={w.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
