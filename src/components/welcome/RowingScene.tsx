/**
 * Decorative rowing-scene accents layered over the hero's ShaderGradient —
 * a few small boat silhouettes, faint wind wisps, and a low shimmer band
 * near the bottom, in CSS/SVG only (no image assets, no new animation
 * library — keyframes live in globals.css next to the existing reveal/
 * print rules). Purely atmospheric: `aria-hidden`, `pointer-events-none`,
 * and kept out of the horizontal band the centered headline/buttons
 * occupy so it never has to compete with them for attention.
 *
 * Not a Client Component itself (no hooks, nothing browser-only) — it's
 * only ever rendered from WelcomeHero.tsx, which already is one.
 */
export function RowingScene() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Boats: biased toward the lower third and the sides, never the
       * centered column the headline/buttons sit in. The first two show
       * at every width; the other two (closer to center, but still well
       * outside a centered max-w-2xl column once the sm breakpoint gives
       * the viewport room) only join in from sm: up, per "reduce the
       * number of boats" on small screens. */}
      <BoatSilhouette className="bottom-[11%] left-[6%] w-20 text-white/45 animate-row-boat-a" />
      <BoatSilhouette className="bottom-[22%] right-[8%] w-16 text-white/35 animate-row-boat-b" />
      <BoatSilhouette className="hidden bottom-[5%] left-[27%] w-14 text-white/30 animate-row-boat-a sm:block" />
      <BoatSilhouette className="hidden bottom-[15%] right-[26%] w-[4.5rem] text-white/35 animate-row-boat-b sm:block" />

      {/* Wind/current wisps — one over the left third, one over the
       * middle, one over the right, each at a different height and a
       * different curve so they don't read as one shape copy-pasted
       * three times. The middle one sits low (below where the buttons
       * land) rather than centered vertically, to stay out of the
       * headline's band. */}
      <WindWisp
        variant="a"
        className="left-[2%] top-[12%] w-40 opacity-10 animate-row-wind-a sm:w-52"
      />
      <WindWisp
        variant="b"
        className="hidden left-[38%] top-[82%] w-40 opacity-10 animate-row-wind-b sm:block sm:w-56"
      />
      <WindWisp
        variant="c"
        className="right-[3%] top-[20%] w-36 opacity-10 animate-row-wind-a sm:w-48"
      />

      {/* Water shimmer band, bottom edge only. */}
      <div
        className="animate-row-water absolute inset-x-0 bottom-0 h-20 opacity-[0.07] sm:h-28"
        style={{
          backgroundImage:
            "repeating-linear-gradient(100deg, transparent 0px, transparent 60px, rgba(255,255,255,0.8) 61px, transparent 64px, transparent 140px)",
        }}
      />
    </div>
  );
}

/**
 * A single-scull hull seen from above — a long, thin, pointed-both-ends
 * shape (how a racing shell actually looks top-down) — with one oar
 * angled out from each side: one off the top edge, one off the bottom
 * edge, each ending in a short cross-stroke "blade". Two oars going the
 * *same* direction off the same edge (an earlier version) reads as
 * nothing recognizable; one per side, on opposite edges, is what actually
 * makes it read as a rowing shell.
 */
function BoatSilhouette({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 120 40" fill="none" className={`absolute ${className}`}>
      <path d="M4 20C24 13 96 13 116 20C96 27 24 27 4 20Z" fill="currentColor" />
      {/* Top-side oar: shaft + blade */}
      <line x1="56" y1="15" x2="40" y2="2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="35" y1="0" x2="44" y2="5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      {/* Bottom-side oar: shaft + blade, mirrored */}
      <line x1="64" y1="25" x2="80" y2="38" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="76" y1="35" x2="85" y2="40" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

const WIND_WISP_PATHS = {
  // Long, lazy sweep with two big rises and falls.
  a: "M2 18C36 4 68 22 104 10C136 0 168 20 198 8",
  // A single gentle arc — fewer bends, lower amplitude.
  b: "M2 12C50 4 100 20 150 10C170 6 185 12 198 9",
  // Tighter, choppier ripple — several small bends instead of one or two big ones.
  c: "M2 14C20 8 35 18 50 12C65 6 80 16 95 10C110 5 125 15 140 9C155 6 170 13 198 10",
} as const;

/** A soft curved stroke suggesting wind/current moving across the water.
 * Three distinct curve shapes (see WIND_WISP_PATHS) so the three on
 * screen read as different wisps, not one copied three times. */
function WindWisp({
  className,
  variant,
}: {
  className: string;
  variant: keyof typeof WIND_WISP_PATHS;
}) {
  return (
    <svg viewBox="0 0 200 24" fill="none" className={`absolute ${className}`}>
      <path
        d={WIND_WISP_PATHS[variant]}
        stroke="white"
        strokeWidth={variant === "b" ? 1.25 : 1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}
