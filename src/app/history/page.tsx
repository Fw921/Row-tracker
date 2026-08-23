import Link from "next/link";
import { Activity, Filter, Plus, Upload, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { formatDate, formatMeters, WORKOUT_TYPE_SHORT } from "@/lib/format";
import { formatDuration, formatSplit } from "@/lib/pace";
import { WORKOUT_TYPE_LABELS } from "@/lib/constants";
import { DeleteWorkoutButton } from "@/components/DeleteWorkoutButton";
import { Avatar, Badge, Button, Card, EmptyState, PageHeader, Select, inputClass } from "@/components/ui";
import { Reveal } from "@/components/motion/Reveal";
import type { Prisma } from "@/generated/prisma/client";

type SearchParams = { type?: string; from?: string; to?: string; athlete?: string };

export const dynamic = "force-dynamic";

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
  if (params.athlete === "me") where.athleteId = null;
  else if (params.athlete) where.athleteId = params.athlete;

  const [workouts, athletes] = await Promise.all([
    prisma.workout.findMany({
      where,
      orderBy: { date: "desc" },
      include: { athlete: true },
    }),
    prisma.athlete.findMany({
      where: { userId: user.id, archived: false },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const hasFilters = params.type || params.from || params.to || params.athlete;

  return (
    <div>
      <PageHeader
        title="History"
        description="Everything logged — your own pieces and every team piece."
        action={
          <Button href="/log">
            <Plus className="h-4 w-4" aria-hidden />
            Log workout
          </Button>
        }
      />

      <Card className="mb-4 p-3 sm:p-4">
        <form className="flex flex-wrap items-end gap-3 text-sm" method="get">
          <label className="block w-36">
            <span className="mb-1 block text-xs font-medium text-muted">Type</span>
            <Select name="type" defaultValue={params.type ?? ""}>
              <option value="">All</option>
              {Object.entries(WORKOUT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </label>
          <label className="block w-36">
            <span className="mb-1 block text-xs font-medium text-muted">Rower</span>
            <Select name="athlete" defaultValue={params.athlete ?? ""}>
              <option value="">Everyone</option>
              <option value="me">Me</option>
              {athletes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="block w-36">
            <span className="mb-1 block text-xs font-medium text-muted">From</span>
            <input type="date" name="from" defaultValue={params.from ?? ""} className={inputClass} />
          </label>
          <label className="block w-36">
            <span className="mb-1 block text-xs font-medium text-muted">To</span>
            <input type="date" name="to" defaultValue={params.to ?? ""} className={inputClass} />
          </label>
          <button
            type="submit"
            className="flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-medium text-foreground transition-colors hover:border-border-strong hover:bg-background"
          >
            <Filter className="h-3.5 w-3.5" aria-hidden />
            Filter
          </button>
          {hasFilters && (
            <Link
              href="/history"
              className="flex items-center gap-1 px-2 py-1.5 text-muted transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
              Clear
            </Link>
          )}
        </form>
      </Card>

      {workouts.length === 0 ? (
        <EmptyState
          icon={<Activity className="h-6 w-6" aria-hidden />}
          title={hasFilters ? "No workouts match those filters" : "No workouts yet"}
          description={
            hasFilters
              ? "Try clearing a filter."
              : "Log one yourself, import a Concept2 CSV, or log a team piece."
          }
          action={
            !hasFilters && (
              <div className="flex flex-wrap justify-center gap-2">
                <Button href="/log">
                  <Plus className="h-4 w-4" aria-hidden />
                  Log a workout
                </Button>
                <Button href="/import" variant="secondary">
                  <Upload className="h-4 w-4" aria-hidden />
                  Import CSV
                </Button>
              </div>
            )
          }
        />
      ) : (
        // A single reveal for the whole table, not a per-row stagger: this
        // list is unbounded (a season's worth of history can be hundreds of
        // rows), and staggering every row would make the bottom of a long
        // table take seconds to finish animating in.
        <Reveal>
          <Card className="overflow-hidden">
            {/* Table — sm and up. */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-background text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3 py-2.5">Date</th>
                    <th className="px-3 py-2.5">Rower</th>
                    <th className="px-3 py-2.5">Type</th>
                    <th className="px-3 py-2.5">Title</th>
                    <th className="px-3 py-2.5 text-right">Distance</th>
                    <th className="px-3 py-2.5 text-right">Time</th>
                    <th className="px-3 py-2.5 text-right">Split /500m</th>
                    <th className="px-3 py-2.5 text-right">Avg HR</th>
                    <th className="px-3 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {workouts.map((w) => (
                    <tr key={w.id} className="border-b border-border transition-colors last:border-0 hover:bg-background">
                      <td className="px-3 py-2.5">
                        <Link href={`/workouts/${w.id}`} className="hover:underline">
                          {formatDate(w.date)}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="flex items-center gap-2">
                          <Avatar name={w.athlete?.name ?? "Me"} />
                          {w.athlete?.name ?? "Me"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge tone="neutral">{WORKOUT_TYPE_SHORT[w.type]}</Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        {w.title ?? "—"}{" "}
                        {w.source === "CONCEPT2_CSV" && (
                          <Badge tone="accent" className="ml-1">
                            C2
                          </Badge>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular">
                        {formatMeters(w.totalDistanceMeters)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular">
                        {formatDuration(w.totalTimeSeconds)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular font-medium">{formatSplit(w.avgSplitSeconds500m)}</td>
                      <td className="px-3 py-2.5 text-right tabular text-muted">{w.avgHeartRate ?? "—"}</td>
                      <td className="px-3 py-2.5 text-right">
                        <DeleteWorkoutButton id={w.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Stacked cards — below sm, where a 9-column table would only scroll. */}
            <ul className="divide-y divide-border sm:hidden">
              {workouts.map((w) => (
                <li key={w.id} className="px-4 py-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/workouts/${w.id}`} className="text-sm font-medium hover:underline">
                        {w.title || WORKOUT_TYPE_SHORT[w.type]}
                      </Link>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                        {formatDate(w.date)}
                        <Badge tone="neutral">{WORKOUT_TYPE_SHORT[w.type]}</Badge>
                        {w.source === "CONCEPT2_CSV" && <Badge tone="accent">C2</Badge>}
                      </div>
                    </div>
                    <DeleteWorkoutButton id={w.id} />
                  </div>
                  <div className="mb-2 flex items-center gap-2 text-xs text-muted">
                    <Avatar name={w.athlete?.name ?? "Me"} />
                    {w.athlete?.name ?? "Me"}
                  </div>
                  <dl className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <dt className="text-muted">Distance</dt>
                      <dd className="tabular font-medium">{formatMeters(w.totalDistanceMeters)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Time</dt>
                      <dd className="tabular font-medium">{formatDuration(w.totalTimeSeconds)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Split</dt>
                      <dd className="tabular font-medium">{formatSplit(w.avgSplitSeconds500m)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Avg HR</dt>
                      <dd className="tabular font-medium">{w.avgHeartRate ?? "—"}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      )}
    </div>
  );
}
