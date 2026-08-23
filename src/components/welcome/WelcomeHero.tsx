"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Sailboat } from "lucide-react";
import { buttonClassName } from "@/components/ui";
import { RowingScene } from "@/components/welcome/RowingScene";

// ssr: false — @react-three/fiber's Canvas needs a real WebGL context, which
// doesn't exist during server rendering (see ShaderGradientBackground.tsx).
// `next/dynamic` with `ssr: false` is only valid from a Client Component,
// which is why this file (not app/page.tsx) owns the dynamic() call.
const ShaderGradientBackground = dynamic(
  () => import("./ShaderGradientBackground").then((mod) => mod.ShaderGradientBackground),
  {
    ssr: false,
    // Plain CSS gradient in the same palette while the WebGL bundle loads,
    // so the hero never shows a blank/white flash.
    loading: () => (
      <div
        aria-hidden
        className="h-full w-full"
        style={{
          background: "linear-gradient(135deg, #3d84ff 0%, #b9b6db 55%, #d0bce1 100%)",
        }}
      />
    ),
  },
);

/**
 * Public, pre-login landing hero for "/". Nav.tsx hides itself on this
 * route (see NAV_HIDDEN_ROUTES) since there's no session to show nav for.
 *
 * `w-screen` + `left-1/2` + `-translate-x-1/2` breaks out of the root
 * layout's centered `max-w-6xl` container (see AuthLayout.tsx for why a
 * same-magnitude negative margin alone doesn't reach a true full-bleed
 * edge) so the gradient fills the viewport, not just the content column.
 * `min-h-screen` (not a nav-height-subtracted calc) because Nav is hidden
 * here — there's no header height to account for.
 */
export function WelcomeHero() {
  return (
    <div className="relative left-1/2 -mt-6 flex min-h-screen w-screen -translate-x-1/2 flex-col overflow-hidden sm:-mt-8">
      <div className="absolute inset-0" aria-hidden>
        <ShaderGradientBackground />
      </div>
      {/* Scrim: the gradient's light blue/lavender palette doesn't give
       * white text enough contrast on its own. */}
      <div
        className="absolute inset-0"
        aria-hidden
        style={{ background: "linear-gradient(180deg, rgba(10,16,14,0.55) 0%, rgba(10,16,14,0.25) 45%, rgba(10,16,14,0.65) 100%)" }}
      />

      {/* Below the z-10 content that follows (DOM order alone puts it above
       * the gradient/scrim, both z-index:auto) — a rowing scene, not a
       * generic hero background. */}
      <RowingScene />

      <div className="relative z-10 flex flex-1 flex-col px-6 py-8 sm:px-10">
        <div className="flex items-center gap-2.5 text-white">
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm"
          >
            <Sailboat className="h-4 w-4" aria-hidden />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Row Tracker</span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            Where training becomes data, and data becomes speed.
          </h1>
          <p className="mt-4 max-w-md text-balance text-base leading-relaxed text-white/75">
            Log every erg piece, track your 2K over a season, and see pacing
            and volume the way a coach does.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup" className={buttonClassName({ size: "lg" })}>
              Create account
            </Link>
            <Link
              href="/login"
              className={buttonClassName({ variant: "secondary", size: "lg", className: "border-white/30 bg-white/10 text-white hover:border-white/50 hover:bg-white/20" })}
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
