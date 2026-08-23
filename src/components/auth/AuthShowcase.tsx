"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Sailboat } from "lucide-react";

// Illustrative only — a glimpse of what the real dashboard looks like once
// there's training data behind it. Explicitly labeled "sample data" below
// rather than presented as a real athlete's numbers.
const DEMO_TREND = [96, 91, 93, 87, 82, 78, 74, 71].map((v, i) => ({ i, v }));

const KPIS = [
  { label: "2K Erg", value: "1:45.2" },
  { label: "Weekly Distance", value: "42.6 km" },
  { label: "Avg Split", value: "1:52.4" },
  { label: "Stroke Rate", value: "28 spm" },
];

/**
 * The right-side "premium showcase" panel for the auth screens. Deliberately
 * uses its own deep navy/charcoal palette (not the app's teal --accent —
 * see globals.css) since this is a one-off entry-point hero moment, not
 * part of the working dashboard. --chart-5 is reused for the accent glow
 * and chart line so it still reads as the same product's chart color, not
 * an unrelated brand.
 */
export function AuthShowcase() {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#0a1420] px-10 py-10 text-white">
      <WaterBackdrop />

      <div className="relative z-10 flex items-center gap-2.5">
        <span
          aria-hidden
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
          style={{ backgroundColor: "var(--chart-5)" }}
        >
          <Sailboat className="h-4 w-4" aria-hidden />
        </span>
        <span className="font-display text-lg font-semibold tracking-tight">Row Tracker</span>
      </div>

      <div className="relative z-10 mt-16 max-w-sm animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both">
        <h2 className="font-display text-[1.75rem] font-semibold leading-tight tracking-tight">
          Where training becomes data, and data becomes speed.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          Log every erg piece, track your 2K over a season, and see pacing
          and volume the way a coach does.
        </p>
      </div>

      <div className="relative z-10 mt-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-white/50">
              2K progress
            </span>
            <span className="text-[11px] text-white/35">Sample data</span>
          </div>

          <div className="mb-4 h-16">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DEMO_TREND} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="authTrendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-5)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--chart-5)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="var(--chart-5)"
                  strokeWidth={2}
                  fill="url(#authTrendFill)"
                  animationDuration={600}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {KPIS.map((kpi) => (
              <div key={kpi.label} className="rounded-lg bg-white/[0.04] px-3 py-2.5">
                <div className="text-[11px] text-white/45">{kpi.label}</div>
                <div className="tabular font-display text-lg font-semibold">{kpi.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Abstract horizon + water-line motif, CSS/SVG only — no stock imagery. */
function WaterBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 80% 15%, color-mix(in oklab, var(--chart-5) 30%, transparent), transparent)",
        }}
      />
      <svg
        className="absolute inset-x-0 bottom-0 h-2/3 w-full opacity-[0.16]"
        viewBox="0 0 400 300"
        preserveAspectRatio="none"
        fill="none"
      >
        {Array.from({ length: 7 }, (_, i) => (
          <path
            key={i}
            d={`M0 ${60 + i * 32} Q 100 ${40 + i * 32} 200 ${60 + i * 32} T 400 ${60 + i * 32}`}
            stroke="white"
            strokeWidth="1"
          />
        ))}
      </svg>
    </div>
  );
}
