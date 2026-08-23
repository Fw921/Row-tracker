import type { Metadata } from "next";
import { Activity, Gauge, TrendingUp, Trophy } from "lucide-react";
import { Card } from "@/components/ui";
import { Reveal, RevealList, RevealListItem } from "@/components/motion/Reveal";
import { WelcomeHero } from "@/components/welcome/WelcomeHero";

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

      <RevealList className="mx-auto grid max-w-5xl grid-cols-1 gap-4 pb-20 sm:grid-cols-2 lg:grid-cols-4">
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
    </div>
  );
}
