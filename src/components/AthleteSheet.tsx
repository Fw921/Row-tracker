"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, Award, CalendarRange, Route } from "lucide-react";
import { formatMeters, formatRelativeDate, WORKOUT_TYPE_SHORT } from "@/lib/format";
import { formatDuration } from "@/lib/pace";
import { Avatar, Button, Card, EmptyState, Skeleton, StatTile } from "@/components/ui";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SplitTrendChart } from "@/components/SplitTrendChart";
import {
  bestSplitForBucket,
  bucketLabel,
  distinctBuckets,
  workoutsInBucket,
  type DashboardWorkout,
} from "@/lib/dashboard";

/**
 * Slide-over athlete profile for the coach dashboard: click a roster
 * athlete anywhere and see their PR, volume, split trend, and recent
 * pieces without leaving the page. Data is fetched on demand — a roster
 * can be dozens of athletes, and most of them won't get clicked in a
 * given visit, so eagerly loading everyone's full split history up front
 * would be wasted work.
 */
export function AthleteSheet({
  athleteId,
  athleteName,
  open,
  onOpenChange,
}: {
  athleteId: string | null;
  athleteName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // Cached per athlete (not reset on close) so re-opening the same
  // athlete's profile in one visit doesn't refetch. All setState calls
  // below happen inside the fetch's async continuation, not synchronously
  // in the effect body.
  const [cache, setCache] = useState<Record<string, DashboardWorkout[]>>({});

  useEffect(() => {
    if (!open || !athleteId || cache[athleteId]) return;
    let cancelled = false;
    fetch(`/api/athletes/${athleteId}/workouts`)
      .then((res) => (res.ok ? res.json() : { workouts: [] }))
      .then((data) => {
        if (cancelled) return;
        setCache((prev) => ({ ...prev, [athleteId]: data.workouts ?? [] }));
      });
    return () => {
      cancelled = true;
    };
  }, [open, athleteId, cache]);

  const workouts = athleteId ? (cache[athleteId] ?? null) : null;
  const loading = open && athleteId !== null && workouts === null;

  // The bucket with the most data is the most representative one to chart —
  // usually 2k, but not every roster tests the same distance.
  const primaryBucket = useMemo(() => {
    if (!workouts) return null;
    const buckets = distinctBuckets(workouts);
    if (buckets.length === 0) return null;
    return buckets
      .map((b) => ({ b, count: workoutsInBucket(workouts, b).length }))
      .sort((a, b) => b.count - a.count)[0].b;
  }, [workouts]);

  const pr = workouts && primaryBucket ? bestSplitForBucket(workouts, primaryBucket) : null;
  const totalMeters = workouts?.reduce((sum, w) => sum + w.totalDistanceMeters, 0) ?? 0;
  const recent = workouts
    ? workouts.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
    : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <div className="flex items-center gap-3">
            <Avatar name={athleteName} className="h-10 w-10 text-sm" />
            <div className="min-w-0">
              <SheetTitle className="truncate">{athleteName}</SheetTitle>
              <SheetDescription>Roster athlete</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <SheetBody>
          {loading && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-48 rounded-xl" />
            </div>
          )}

          {!loading && workouts && workouts.length === 0 && (
            <EmptyState icon="🚣" title="No pieces logged yet" description="Nothing logged for this athlete yet." />
          )}

          {!loading && workouts && workouts.length > 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <StatTile
                  icon={<Award className="h-3.5 w-3.5" aria-hidden />}
                  tone="highlight"
                  label={primaryBucket ? `${bucketLabel(primaryBucket)} PR` : "PR"}
                  value={pr ? formatDuration(pr.totalTimeSeconds) : "—"}
                />
                <StatTile
                  icon={<Route className="h-3.5 w-3.5" aria-hidden />}
                  label="Total meters"
                  value={formatMeters(totalMeters)}
                />
                <StatTile
                  icon={<Activity className="h-3.5 w-3.5" aria-hidden />}
                  label="Workouts logged"
                  value={String(workouts.length)}
                />
                <StatTile
                  icon={<CalendarRange className="h-3.5 w-3.5" aria-hidden />}
                  label="Last workout"
                  value={recent[0] ? formatRelativeDate(recent[0].date) : "—"}
                />
              </div>

              {primaryBucket && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    {bucketLabel(primaryBucket)} progress
                  </h3>
                  <SplitTrendChart workouts={workouts} bucket={primaryBucket} height={200} />
                </div>
              )}

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Recent workouts
                </h3>
                <Card className="overflow-hidden">
                  <ul className="divide-y divide-border">
                    {recent.map((w) => (
                      <li key={w.id}>
                        <Link
                          href={`/workouts/${w.id}`}
                          className="flex items-center justify-between gap-3 px-3 py-2 text-sm transition-colors hover:bg-background"
                        >
                          <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                            {w.title || WORKOUT_TYPE_SHORT[w.type]}
                          </span>
                          <span className="tabular shrink-0 text-muted">
                            {formatDuration(w.totalTimeSeconds)}
                          </span>
                          <span className="w-14 shrink-0 text-right text-xs text-muted">
                            {formatRelativeDate(w.date)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          )}
        </SheetBody>

        {athleteId && (
          <div className="border-t border-border p-4">
            <Button href={`/history?athlete=${athleteId}`} variant="secondary" className="w-full">
              View full history
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
