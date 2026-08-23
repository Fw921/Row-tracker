"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Award, CalendarCheck, Route, Users } from "lucide-react";
import { formatDate, formatMeters, formatRelativeDate } from "@/lib/format";
import { formatSplit } from "@/lib/pace";
import { bucketLabel } from "@/lib/dashboard";
import { Badge, Card, Chip, EmptyState, StatTile } from "@/components/ui";
import { AthleteSheet } from "@/components/AthleteSheet";
import {
  distinctTeamBuckets,
  teamOverview,
  teamPerformanceTrend,
  type AthleteSummary,
  type TeamPieceEvent,
} from "@/lib/team";
import type { AthleteWorkout } from "@/lib/team";

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "var(--shadow-raised)",
};
const axisTick = { fontSize: 12, fill: "var(--muted)" };

export function TeamOverviewCharts({
  athletes,
  pieceEvents,
  athleteSummaries,
}: {
  athletes: { id: string; workouts: AthleteWorkout[] }[];
  pieceEvents: TeamPieceEvent[];
  athleteSummaries: AthleteSummary[];
}) {
  const overview = useMemo(() => teamOverview(athletes), [athletes]);
  const buckets = useMemo(() => distinctTeamBuckets(pieceEvents), [pieceEvents]);
  const [bucket, setBucket] = useState<number | null>(buckets[0] ?? null);
  const [selectedAthlete, setSelectedAthlete] = useState<{ id: string; name: string } | null>(null);
  const trend = useMemo(
    () => (bucket === null ? [] : teamPerformanceTrend(pieceEvents, bucket)),
    [pieceEvents, bucket],
  );
  const chartData = trend.map((t) => ({ date: formatDate(t.date), split: t.avgSplitSeconds500m }));

  return (
    <div className="space-y-8">
      {/* Team overview cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        <StatTile icon={<Users className="h-3.5 w-3.5" aria-hidden />} label="Athletes" value={String(overview.athleteCount)} />
        <StatTile
          icon={<CalendarCheck className="h-3.5 w-3.5" aria-hidden />}
          label="Active this week"
          value={String(overview.activeThisWeek)}
        />
        <StatTile icon={<Route className="h-3.5 w-3.5" aria-hidden />} label="Team meters" value={formatMeters(overview.teamMeters)} />
        <StatTile icon={<Activity className="h-3.5 w-3.5" aria-hidden />} label="Workouts logged" value={String(overview.workoutCount)} />
        <StatTile
          icon={<Award className="h-3.5 w-3.5" aria-hidden />}
          label="Average 2K"
          value={overview.avgSplit2kSeconds !== null ? formatSplit(overview.avgSplit2kSeconds) : "—"}
        />
        <StatTile
          icon={<Award className="h-3.5 w-3.5" aria-hidden />}
          tone="highlight"
          label="2K PRs this season"
          value={String(overview.prsThisSeason)}
        />
      </div>

      {/* Team performance trend */}
      <Card className="p-4 sm:p-6" interactive>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">Team performance</h2>
            <p className="text-xs text-muted">Average split across everyone in each team piece</p>
          </div>
          {buckets.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {buckets.map((b) => (
                <Chip key={b} active={bucket === b} onClick={() => setBucket(b)}>
                  {bucketLabel(b)}
                </Chip>
              ))}
            </div>
          )}
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={axisTick} />
              <YAxis
                reversed
                tickFormatter={(v) => formatSplit(v)}
                tick={axisTick}
                width={64}
                domain={["dataMin - 2", "dataMax + 2"]}
              />
              <Tooltip formatter={(v) => [formatSplit(Number(v)), "Team avg split"]} contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="split" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            icon="📈"
            title="No team pieces at a standard distance yet"
            description="Log a 2k or 5k team piece to start a trend line here."
          />
        )}
      </Card>

      {/* Athlete overview table */}
      <div>
        <h2 className="mb-2 font-display text-sm font-semibold text-foreground">Athlete overview</h2>
        {athleteSummaries.length === 0 ? (
          <EmptyState icon="👥" title="No athletes on the roster yet" />
        ) : (
          <Card className="overflow-hidden">
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-background text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-2.5">Athlete</th>
                    <th className="px-4 py-2.5 text-right">2K</th>
                    <th className="px-4 py-2.5 text-right">PR</th>
                    <th className="px-4 py-2.5 text-right">Change</th>
                    <th className="px-4 py-2.5 text-right">Meters</th>
                    <th className="px-4 py-2.5 text-right">Last workout</th>
                  </tr>
                </thead>
                <tbody>
                  {athleteSummaries.map((a) => (
                    <tr key={a.id} className="border-b border-border transition-colors last:border-0 hover:bg-background">
                      <td className="px-4 py-2.5">
                        <button
                          type="button"
                          onClick={() => setSelectedAthlete({ id: a.id, name: a.name })}
                          className="cursor-pointer font-medium hover:underline"
                        >
                          {a.name}
                        </button>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular">
                        {a.current2kSeconds !== null ? formatSplit(a.current2kSeconds) : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular font-medium">
                        {a.pr2kSeconds !== null ? formatSplit(a.pr2kSeconds) : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <ChangeBadge seconds={a.change2kSeconds} />
                      </td>
                      <td className="px-4 py-2.5 text-right tabular">{formatMeters(a.totalMeters)}</td>
                      <td className="px-4 py-2.5 text-right text-muted">
                        {a.lastWorkoutDate ? formatRelativeDate(a.lastWorkoutDate) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-border sm:hidden">
              {athleteSummaries.map((a) => (
                <li key={a.id} className="px-4 py-3">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAthlete({ id: a.id, name: a.name })}
                      className="cursor-pointer text-sm font-medium hover:underline"
                    >
                      {a.name}
                    </button>
                    <ChangeBadge seconds={a.change2kSeconds} />
                  </div>
                  <dl className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <dt className="text-muted">2K</dt>
                      <dd className="tabular font-medium">
                        {a.current2kSeconds !== null ? formatSplit(a.current2kSeconds) : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">PR</dt>
                      <dd className="tabular font-medium">
                        {a.pr2kSeconds !== null ? formatSplit(a.pr2kSeconds) : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">Meters</dt>
                      <dd className="tabular font-medium">{formatMeters(a.totalMeters)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Last</dt>
                      <dd className="font-medium">
                        {a.lastWorkoutDate ? formatRelativeDate(a.lastWorkoutDate) : "—"}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <AthleteSheet
        athleteId={selectedAthlete?.id ?? null}
        athleteName={selectedAthlete?.name ?? ""}
        open={selectedAthlete !== null}
        onOpenChange={(open) => !open && setSelectedAthlete(null)}
      />
    </div>
  );
}

function ChangeBadge({ seconds }: { seconds: number | null }) {
  if (seconds === null) return <span className="text-xs text-muted">—</span>;
  const faster = seconds < 0;
  const tone = Math.abs(seconds) < 0.1 ? "neutral" : faster ? "faster" : "slower";
  return (
    <Badge tone={tone}>
      {faster ? "-" : "+"}
      {Math.abs(seconds).toFixed(1)}s
    </Badge>
  );
}
