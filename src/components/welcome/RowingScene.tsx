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
      <BoatSilhouette className="bottom-[13%] left-[6%] w-20 text-white/45 animate-row-boat-a" />
      <BoatSilhouette className="bottom-[24%] right-[8%] w-16 text-white/35 animate-row-boat-b" />
      <BoatSilhouette className="hidden bottom-[7%] left-[27%] w-14 text-white/30 animate-row-boat-a sm:block" />
      <BoatSilhouette className="hidden bottom-[17%] right-[26%] w-[4.5rem] text-white/35 animate-row-boat-b sm:block" />

      {/* Wind/current wisps — one over the left third, one over the
       * middle, one over the right, each at a different height so they
       * don't read as a single repeated row. The middle one sits low
       * (below where the buttons land) rather than centered vertically,
       * to stay out of the headline's band. */}
      <WindWisp className="left-[2%] top-[12%] w-40 opacity-10 animate-row-wind-a sm:w-52" />
      <WindWisp className="hidden left-[38%] top-[82%] w-40 opacity-10 animate-row-wind-b sm:block sm:w-56" />
      <WindWisp className="right-[3%] top-[20%] w-36 opacity-10 animate-row-wind-a sm:w-48" />

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
 * A single-scull hull, flattened to a thin lens shape, with two short oar
 * lines (one on each side) — deliberately not a detailed illustration,
 * just enough to read as "rowing shell" at a glance and at small size.
 * The hull and both oars are symmetric, so unlike an earlier one-oar
 * version there's no need to mirror any instance — which also sidesteps
 * a real bug that version had: a mirrored copy used an inline
 * `transform: scaleX(-1)`, but the drift animation's own keyframes only
 * ever set `transform: translateX(...)`, and a running CSS animation
 * takes over its animated property entirely — so the mirror was silently
 * lost the entire time the boat was actually drifting.
 */
function BoatSilhouette({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 120 20" fill="none" className={`absolute ${className}`}>
      <path d="M4 10C24 3 96 3 116 10C96 17 24 17 4 10Z" fill="currentColor" />
      <line x1="52" y1="10" x2="36" y2="-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="68" y1="10" x2="84" y2="-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** A soft curved stroke suggesting wind/current moving across the water. */
function WindWisp({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 200 24" fill="none" className={`absolute ${className}`}>
      <path
        d="M2 16C40 4 70 22 108 12C140 4 165 14 198 8"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
