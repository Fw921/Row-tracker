import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  Flame,
  Gauge,
  Medal,
  Route,
  Timer,
  Trophy,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import { Badge, Button, Card, initialsAvatarStyle } from "@/components/ui";
import { LandingDemoChart } from "@/components/LandingDemoChart";
import { WORKOUT_TYPE_LABELS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Row Tracker — Every stroke, tracked",
  description:
    "An energetic tour of Row Tracker: log erg pieces, watch your splits drop, and race your whole boat on one leaderboard.",
};

const WORKOUT_PREVIEWS: {
  type: keyof typeof WORKOUT_TYPE_LABELS;
  icon: typeof Zap;
  blurb: string;
  href: string;
}[] = [
  {
    type: "SINGLE_DISTANCE",
    icon: Flame,
    blurb: "A 2k, a 5k, a 10k test — set the distance, log the damage.",
    href: "/log",
  },
  {
    type: "STEADY_STATE",
    icon: Gauge,
    blurb: "30 steady minutes at a rate cap. Base-building, tracked.",
    href: "/log",
  },
  {
    type: "INTERVALS",
    icon: Zap,
    blurb: "6x500m, 4x1000m — whatever the set, splits stack up per rep.",
    href: "/log",
  },
  {
    type: "SINGLE_TIME",
    icon: Timer,
    blurb: "Everybody rows the same 20 minutes — see who covered more meters.",
    href: "/log/team",
  },
];

const CREW = [
  { name: "Jordan Ade", seat: "Stroke", split: "1:52.3" },
  { name: "Sam Ruiz", seat: "3 Seat", split: "1:55.8" },
  { name: "Priya Nair", seat: "Bow", split: "1:58.1" },
];

const FEATURE_GRID = [
  {
    icon: Upload,
    title: "Import from Concept2",
    body: "Upload a season CSV from log.concept2.com and every row becomes a workout — no manual re-typing.",
  },
  {
    icon: ClipboardList,
    title: "Filterable history",
    body: "Every piece you or your teammates have logged, sortable by date, type, or distance, with one-click delete.",
  },
  {
    icon: BarChart3,
    title: "Real dashboard analytics",
    body: "Split trend, heart-rate trend, pacing-strategy overlays, weekly volume, and a PR card per distance.",
  },
];

export default function WelcomePage() {
  return (
    <div className="space-y-24 pb-16">
      {/* Hero */}
      <section className="relative -mx-4 overflow-hidden px-4 pt-10 pb-4 sm:-mx-6 sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--accent-soft),transparent)]"
        />
        <div className="mx-auto max-w-3xl text-center">
          <Badge tone="highlight" className="mx-auto">
            <Trophy className="h-3 w-3" aria-hidden />
            Free · no subscription · just your data
          </Badge>
          <h1 className="mt-5 font-display text-4xl leading-[1.05] font-bold tracking-tight text-foreground sm:text-6xl">
            Every stroke,{" "}
            <span className="bg-gradient-to-r from-accent to-highlight bg-clip-text text-transparent">
              tracked
            </span>
            . Every PR,{" "}
            <span className="bg-gradient-to-r from-highlight to-accent bg-clip-text text-transparent">
              chased
            </span>
            .
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Row Tracker turns erg pieces into pacing charts, PR history, and team leaderboards. Log a
            piece by hand or import straight from Concept2 Logbook — the trend line does the rest.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="/log" size="lg" className="shadow-[var(--shadow-accent-glow)]">
              <Flame className="h-4 w-4" aria-hidden />
              Log your first piece
            </Button>
            <Button href="/import" variant="secondary" size="lg">
              <Upload className="h-4 w-4" aria-hidden />
              Import from Concept2
            </Button>
          </div>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-accent"
          >
            or jump straight to the dashboard <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </section>

      {/* Workout preview cards */}
      <section>
        <SectionHeader
          eyebrow="Log anything"
          title="Every piece has a home"
          description="Pick the shape of the workout — Row Tracker handles the math (splits, pace, avg 500m) either way."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WORKOUT_PREVIEWS.map(({ type, icon: Icon, blurb, href }) => (
            <Card key={type} interactive className="group flex flex-col p-5">
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-positive text-accent-foreground shadow-[var(--shadow-accent-glow)]">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="font-display text-base font-semibold text-foreground">
                {WORKOUT_TYPE_LABELS[type]}
              </h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{blurb}</p>
              <Link
                href={href}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent transition-colors group-hover:text-accent-strong"
              >
                Log it <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Progress tracking demo */}
      <section>
        <SectionHeader
          eyebrow="Progress tracking"
          title="Watch your splits drop"
          description="This is a live chart component — same one your real dashboard renders — seeded with sample numbers so you can see the payoff before you log a single piece."
        />
        <LandingDemoChart />
      </section>

      {/* Crew / roster ("trainer profiles" equivalent) */}
      <section>
        <SectionHeader
          eyebrow="Built for a boat, not just a solo athlete"
          title="Log for the whole crew at once"
          description="Add teammates to your roster, then log one piece for everybody — set the shared distance or time, enter each rower's result, and get a fastest-to-slowest leaderboard automatically."
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {CREW.map((athlete, i) => (
              <Card key={athlete.name} className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
                    style={initialsAvatarStyle(athlete.name)}
                  >
                    {athlete.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
                  </span>
                  {i === 0 && (
                    <Badge tone="highlight">
                      <Medal className="h-3 w-3" aria-hidden />
                      1st
                    </Badge>
                  )}
                </div>
                <p className="font-display text-sm font-semibold text-foreground">{athlete.name}</p>
                <p className="text-xs text-muted">{athlete.seat}</p>
                <p className="tabular mt-2 font-display text-lg font-semibold text-foreground">
                  {athlete.split}
                  <span className="ml-1 text-xs font-normal text-muted">/500m</span>
                </p>
              </Card>
            ))}
          </div>
          <Card className="flex flex-col justify-center gap-4 p-6">
            <div className="flex items-center gap-2 text-accent">
              <Users className="h-5 w-5" aria-hidden />
              <span className="font-display text-sm font-semibold">Roster &amp; team pieces</span>
            </div>
            <p className="text-sm leading-relaxed text-muted">
              No logins for teammates required — just names on a roster. Call out results like you would
              in the erg room, and everyone&apos;s piece lands on the leaderboard for that event.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button href="/roster" variant="secondary" size="sm">
                Set up your roster
              </Button>
              <Button href="/log/team" size="sm">
                Log a team piece
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Feature grid */}
      <section>
        <SectionHeader eyebrow="Everything else" title="The rest of the boathouse" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {FEATURE_GRID.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="p-5">
              <Icon className="h-5 w-5 text-highlight" aria-hidden />
              <h3 className="mt-3 font-display text-sm font-semibold text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA banner */}
      <section>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent via-[#c73408] to-positive px-6 py-12 text-center shadow-[var(--shadow-accent-glow)] sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_50%_100%,rgba(255,255,255,0.18),transparent)]"
          />
          <Route className="mx-auto h-8 w-8 text-white/90" aria-hidden />
          <h2 className="mx-auto mt-3 max-w-lg font-display text-2xl font-bold text-white sm:text-3xl">
            Ready to find your next PR?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/85">
            Free, no sign-up wall, no subscription tiers — just log a piece and watch the trend line move.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              href="/log"
              size="lg"
              className="bg-white text-accent-strong shadow-lg hover:bg-white/90"
            >
              Log your first workout
            </Button>
            <Button
              href="/"
              size="lg"
              variant="secondary"
              className="border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10"
            >
              View the dashboard
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6 max-w-2xl">
      {eyebrow && (
        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
          {eyebrow}
        </div>
      )}
      <h2 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {title}
      </h2>
      {description && <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>}
    </div>
  );
}
