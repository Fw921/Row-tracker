import type { Metadata } from "next";
import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { LandingDemoChart } from "@/components/LandingDemoChart";
import { StrokeMark, WakeRule } from "@/components/graphics";
import { WORKOUT_TYPE_LABELS } from "@/lib/constants";
import { formatSplit } from "@/lib/pace";

export const metadata: Metadata = {
  title: "Row Tracker: every stroke, tracked",
  description: "Log erg pieces, watch your splits drop, and race your whole boat on one leaderboard.",
};

const WORKOUT_ENTRIES: {
  index: string;
  type: keyof typeof WORKOUT_TYPE_LABELS;
  blurb: string;
  href: string;
}[] = [
  {
    index: "01",
    type: "SINGLE_DISTANCE",
    blurb: "A 2k, a 5k, a 10k test. Set the distance, log the damage.",
    href: "/log",
  },
  {
    index: "02",
    type: "STEADY_STATE",
    blurb: "30 steady minutes at a rate cap. Base-building, tracked.",
    href: "/log",
  },
  {
    index: "03",
    type: "INTERVALS",
    blurb: "6×500m, 4×1000m, whatever the set. Splits stack up per rep.",
    href: "/log",
  },
  {
    index: "04",
    type: "SINGLE_TIME",
    blurb: "Everybody rows the same 20 minutes. See who covered more meters.",
    href: "/log/team",
  },
];

/** Six sample splits (seconds/500m) for the hero proof card: same shape
 * of number the real PR card on the dashboard shows, lower is faster. */
const HERO_SPLITS = [118.4, 116.1, 114.8, 112.9, 111.5, 109.7];
const HERO_MIN = Math.min(...HERO_SPLITS);
const HERO_MAX = Math.max(...HERO_SPLITS);
/** Bar height as a percent, inverted so a faster (lower) split reads taller. */
function heroBarHeight(splitSeconds: number) {
  const range = HERO_MAX - HERO_MIN || 1;
  return 28 + ((HERO_MAX - splitSeconds) / range) * 72;
}

/** Sample roster, styled like a regatta heat sheet (lane, name, seat,
 * result) rather than another row of icon cards. */
const HEAT_SHEET = [
  { lane: 1, name: "Jordan Ade", seat: "Stroke", split: 112.3, place: 1 },
  { lane: 2, name: "Sam Ruiz", seat: "3 Seat", split: 115.8, place: 2 },
  { lane: 3, name: "Priya Nair", seat: "Bow", split: 118.1, place: 3 },
];

const BOATHOUSE_ENTRIES = [
  {
    index: "01",
    title: "Import from Concept2",
    body: "Upload a season CSV from log.concept2.com and every row becomes a workout. No manual re-typing.",
  },
  {
    index: "02",
    title: "Filterable history",
    body: "Every piece you or your teammates have logged, sortable by date, type, or distance, with one-click delete.",
  },
  {
    index: "03",
    title: "Real dashboard analytics",
    body: "Split trend, heart-rate trend, pacing-strategy overlays, weekly volume, and a PR card per distance.",
  },
];

export default function WelcomePage() {
  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="grid grid-cols-1 items-center gap-8 pt-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-4">
        <div>
          <h1 className="font-display text-4xl leading-[1.05] font-bold tracking-tight text-foreground sm:text-6xl">
            Every stroke,
            <br />
            tracked. Every <span className="text-accent">PR</span>, chased.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Row Tracker turns erg pieces into pacing charts, PR history, and team leaderboards. Log a
            piece by hand, or import straight from Concept2 Logbook, and the trend line does the rest.
            Free, no subscription, no sign-up wall.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href="/log" size="lg">
              Log your first piece
            </Button>
            <Button href="/import" variant="secondary" size="lg">
              Import from Concept2
            </Button>
          </div>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-accent"
          >
            or jump straight to the dashboard <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-sm">
          <StrokeMark className="h-full w-full" />
        </div>
      </section>

      <WakeRule className="my-16 h-6 w-full text-border" />

      {/* Progress tracking demo + PR proof, side by side instead of a
       * third row of icon cards */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.65fr]">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Watch your splits drop
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
            This is the same chart component your real dashboard renders, seeded here with sample
            numbers so the payoff is visible before you&apos;ve logged a single piece.
          </p>
          <div className="mt-5">
            <LandingDemoChart />
          </div>
        </div>

        <Card className="flex flex-col justify-between p-5 sm:p-6">
          <div>
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-medium text-foreground">PR · 2000m</span>
              <span>Sample data</span>
            </div>
            <p className="tabular mt-4 text-4xl font-semibold text-foreground">
              {formatSplit(HERO_SPLITS[HERO_SPLITS.length - 1])}
              <span className="ml-1 text-base font-normal text-muted">/500m</span>
            </p>
            <p className="mt-1 text-sm font-medium text-negative">
              {(HERO_SPLITS[0] - HERO_SPLITS[HERO_SPLITS.length - 1]).toFixed(1)}s faster than six weeks
              ago
            </p>
          </div>
          <div className="mt-6 flex h-24 items-end gap-2">
            {HERO_SPLITS.map((split, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm"
                style={{
                  height: `${heroBarHeight(split)}%`,
                  background: i === HERO_SPLITS.length - 1 ? "var(--accent)" : "var(--border-strong)",
                }}
              />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-muted-soft">
            <span>Wk 1</span>
            <span>Wk 6</span>
          </div>
        </Card>
      </section>

      <WakeRule className="my-16 h-6 w-full text-border" />

      {/* Workout types: an indexed list, not a repeated icon-card grid */}
      <section>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Every piece has a home
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
          Pick the shape of the workout. Row Tracker handles the math either way.
        </p>
        <ul className="mt-8 divide-y divide-border border-t border-border">
          {WORKOUT_ENTRIES.map(({ index, type, blurb, href }) => (
            <li key={type}>
              <Link
                href={href}
                className="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 py-5 sm:grid-cols-[4rem_14rem_1fr_auto]"
              >
                <span className="tabular text-xl text-muted-soft">{index}</span>
                <span className="font-display text-lg font-semibold text-foreground">
                  {WORKOUT_TYPE_LABELS[type]}
                </span>
                <span className="col-span-2 text-sm leading-relaxed text-muted sm:col-span-1">
                  {blurb}
                </span>
                <span
                  aria-hidden
                  className="hidden text-lg text-muted transition-colors group-hover:text-accent sm:block"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <WakeRule className="my-16 h-6 w-full text-border" />

      {/* Crew / roster, as a heat sheet rather than a row of stat cards */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Log for the whole crew at once
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
            Add teammates to your roster, then log one piece for everybody: set the shared distance or
            time, enter each rower&apos;s result, and get a leaderboard automatically. No logins for
            teammates required, just names on a roster.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button href="/roster" variant="secondary" size="sm">
              Set up your roster
            </Button>
            <Button href="/log/team" size="sm">
              Log a team piece
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="w-10 px-3 py-2 font-medium">Lane</th>
                <th className="px-3 py-2 font-medium">Rower</th>
                <th className="px-3 py-2 font-medium">Seat</th>
                <th className="px-3 py-2 text-right font-medium">Split /500m</th>
              </tr>
            </thead>
            <tbody className="tabular divide-y divide-border">
              {HEAT_SHEET.map((row) => (
                <tr key={row.lane} className={row.place === 1 ? "bg-highlight-soft" : undefined}>
                  <td className="px-3 py-2.5 text-muted-soft">{row.lane}</td>
                  <td className="px-3 py-2.5 font-sans font-medium text-foreground">{row.name}</td>
                  <td className="px-3 py-2.5 font-sans text-muted">{row.seat}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-foreground">
                    {formatSplit(row.split)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <WakeRule className="my-16 h-6 w-full text-border" />

      {/* Everything else: same indexed-list pattern as the workout types,
       * kept deliberately consistent rather than inventing a third card
       * treatment */}
      <section>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          The rest of the boathouse
        </h2>
        <ul className="mt-8 divide-y divide-border border-t border-border">
          {BOATHOUSE_ENTRIES.map(({ index, title, body }) => (
            <li key={title} className="grid grid-cols-[3rem_1fr] gap-4 py-5 sm:grid-cols-[4rem_14rem_1fr]">
              <span className="tabular text-xl text-muted-soft">{index}</span>
              <span className="font-display text-lg font-semibold text-foreground">{title}</span>
              <span className="col-span-2 text-sm leading-relaxed text-muted sm:col-span-1">{body}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Final CTA: flat, confident, full-bleed */}
      <section className="mt-20">
        <div className="rounded-2xl bg-accent px-6 py-12 text-center sm:px-12">
          <h2 className="mx-auto max-w-lg font-display text-2xl font-bold text-accent-foreground sm:text-3xl">
            Ready to find your next PR?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-accent-foreground/80">
            Free, no sign-up wall, no subscription tiers. Just log a piece and watch the trend line move.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              href="/log"
              size="lg"
              className="!bg-background !text-accent hover:!bg-background/90"
            >
              Log your first workout
            </Button>
            <Button
              href="/"
              size="lg"
              variant="secondary"
              className="!border-accent-foreground/30 !bg-transparent !text-accent-foreground hover:!border-accent-foreground/60 hover:!bg-accent-foreground/10"
            >
              View the dashboard
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
