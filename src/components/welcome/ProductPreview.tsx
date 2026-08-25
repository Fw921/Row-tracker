"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Badge, StatGrid, StatTile } from "@/components/ui";

// Illustrative only, same honesty rule as AuthShowcase's demo panel — a
// labeled "Sample data" mockup of what the real dashboard looks like once
// there's training history behind it, never presented as a real result.
const TREND = [432, 425, 419, 415, 410, 406, 412, 402].map((v, i) => ({ i, v }));

/** A bigger, second "here's the actual product" moment for the welcome
 * page, below the plain feature-icon grid. Client Component for the chart
 * (Recharts), unlike the rest of the static landing page. */
export function ProductPreview() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-border bg-surface p-1.5 shadow-[var(--shadow-raised)]">
        <div className="flex items-center justify-between rounded-t-xl bg-background px-4 py-2.5">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          </div>
          <span className="text-xs font-medium text-muted">Dashboard</span>
          <Badge tone="neutral">Sample data</Badge>
        </div>

        <div className="p-4 sm:p-6">
          <StatGrid className="grid-cols-3">
            <StatTile label="2K PR" value="6:52.4" numericValue={412} format="split" />
            <StatTile label="This week" value="18,400m" numericValue={18400} format="meters" />
            <StatTile label="Avg split" value="1:54.2" numericValue={114.2} format="split" />
          </StatGrid>

          <div className="mt-4 h-32 sm:h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="previewTrendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#previewTrendFill)"
                  animationDuration={600}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-1 text-center text-xs text-muted-soft">2K progress over a season</p>
        </div>
      </div>
    </div>
  );
}
