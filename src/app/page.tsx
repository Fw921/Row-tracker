import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  Gauge,
  LineChart,
  Sailboat,
  Ship,
  Target,
  TrendingUp,
  Trophy,
  Upload,
  User,
  Users,
} from "lucide-react";
import { Card, buttonClassName } from "@/components/ui";
import { Reveal, RevealList, RevealListItem } from "@/components/motion/Reveal";
import { WelcomeHero } from "@/components/welcome/WelcomeHero";
import { ProductPreview } from "@/components/welcome/ProductPreview";

export const metadata: Metadata = {
  title: "Row Tracker — Training data, made fast",
};

const FEATURES = [
  {
    icon: TrendingUp,
    title: "2K progress",
    description: "Watch your predicted 2K time trend across a season, piece by piece.",
  },
  {
    icon: Activity,
    title: "Training volume",
    description: "Daily and weekly meters, at a glance, so gaps in training are obvious.",
  },
  {
    icon: Gauge,
    title: "Pacing analysis",
    description: "See splits against target pace for every piece you log.",
  },
  {
    icon: Trophy,
    title: "Team overview",
    description: "Coaches get a real-data roster view — no lineups or mock numbers.",
  },
  {
    icon: Ship,
    title: "Boat builder",
    description: "Build a lineup by boat class and fill every seat from your roster.",
  },
];

const STEPS = [
  {
    icon: Upload,
    title: "Log or import a piece",
    description: "Type in a result by hand, or pull it straight from a Concept2 CSV export.",
  },
  {
    icon: LineChart,
    title: "See it as a trend",
    description: "Every piece adds a point to your pacing, volume, and 2K-progress charts.",
  },
  {
    icon: Target,
    title: "Chase your next PR",
    description: "Set a target and watch how close each new piece gets you.",
  },
];

/** Public landing page at "/". Nav.tsx hides itself here (see
 * NAV_HIDDEN_ROUTES) — this is the pre-login entry point; the actual app
 * lives at /dashboard once you log in or create an account. */
export default function WelcomePage() {
  return (
    <div>
      <WelcomeHero />

      <Reveal className="mx-auto max-w-3xl py-16 text-center sm:py-20">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Everything you log, turned into something you can read
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          Row Tracker is built for the same erg data you already have — no
          new devices, no manual spreadsheets.
        </p>
      </Reveal>

      <Reveal className="px-4 pb-16 sm:px-6">
        <ProductPreview />
      </Reveal>

      <RevealList className="mx-auto grid max-w-4xl grid-cols-1 gap-4 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <RevealListItem key={feature.title}>
              <Card interactive className="h-full p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
                  <Icon className="h-4.5 w-4.5" aria-hidden />
                </span>
                <h3 className="mt-3 font-display text-sm font-semibold tracking-tight text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{feature.description}</p>
              </Card>
            </RevealListItem>
          );
        })}
      </RevealList>

      {/* How it works — full-bleed band, same left-1/2/w-screen breakout as
       * WelcomeHero/AuthLayout (a negative margin alone can't escape the
       * root layout's centered max-w-6xl column). */}
      <div className="relative left-1/2 w-screen -translate-x-1/2 border-t border-border bg-surface">
        <Reveal className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            From erg to insight in three steps
          </h2>
        </Reveal>

        <RevealList className="mx-auto grid max-w-4xl grid-cols-1 gap-8 px-4 pb-20 sm:grid-cols-3 sm:gap-6 sm:px-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <RevealListItem key={step.title} className="text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-soft">
                  Step {i + 1}
                </div>
                <h3 className="mt-1 font-display text-base font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.description}</p>
              </RevealListItem>
            );
          })}
        </RevealList>
      </div>

      {/* Athlete / coach split */}
      <Reveal className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-4 py-16 sm:grid-cols-2 sm:px-6 sm:py-20">
        <Card className="p-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
            <User className="h-4.5 w-4.5" aria-hidden />
          </span>
          <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-foreground">
            If you&rsquo;re rowing
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            A personal dashboard: 2K progress, training volume, pacing, and
            personal records, built from pieces you log yourself.
          </p>
        </Card>
        <Card className="p-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-highlight-soft text-highlight-strong">
            <Users className="h-4.5 w-4.5" aria-hidden />
          </span>
          <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-foreground">
            If you&rsquo;re coaching
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            A roster-wide view of team pieces, plus a lineup builder — log
            the whole boat at once and try out who rows where.
          </p>
        </Card>
      </Reveal>

      {/* Closing CTA — dark bookend to match the hero; same full-bleed breakout. */}
      <Reveal className="relative left-1/2 w-screen -translate-x-1/2 border-t border-border bg-[#0a1420] px-4 py-16 text-center sm:px-6 sm:py-20">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Start logging your training
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/60">
          It only takes one piece to see your first chart.
        </p>
        <Link href="/signup" className={buttonClassName({ size: "lg", className: "mt-6" })}>
          Create account
        </Link>
      </Reveal>

      <footer className="relative left-1/2 w-screen -translate-x-1/2 border-t border-border px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <span className="flex items-center gap-2">
            <Sailboat className="h-4 w-4" aria-hidden />
            Row Tracker
          </span>
          <Link href="/login" className="font-medium text-accent hover:text-accent-strong">
            Log in
          </Link>
        </div>
      </footer>
    </div>
  );
}
