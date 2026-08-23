/**
 * Hand-built SVG graphics for the /welcome page — no stock art, no icon
 * library glyphs blown up to "illustration" size. Everything here is
 * generated from actual path math so it can be re-tuned by changing a
 * number, not by re-drawing.
 */

/** One period of a smooth wave: a cubic Bézier arcing up then down back to
 * baseline, repeated `periods` times starting at x=0. Two consecutive
 * calls with the same params tile seamlessly, which is what makes the
 * looping animation in <WaterField> work. */
function buildWavePath(periods: number, period: number, amplitude: number, baseline: number) {
  let d = `M0,${baseline}`;
  for (let i = 0; i < periods * 2; i++) {
    const dir = i % 2 === 0 ? -1 : 1;
    const x0 = i * (period / 2);
    const cx = x0 + period / 4;
    const cy = baseline + dir * amplitude;
    const x1 = x0 + period / 2;
    d += ` C${cx},${cy} ${cx},${cy} ${x1},${baseline}`;
  }
  return d;
}

type WaveLayerSpec = {
  period: number;
  amplitude: number;
  baseline: number;
  color: string;
  strokeWidth: number;
  duration: string;
  reverse?: boolean;
};

const LAYERS: WaveLayerSpec[] = [
  { period: 340, amplitude: 22, baseline: 90, color: "var(--border)", strokeWidth: 1.5, duration: "52s" },
  { period: 260, amplitude: 16, baseline: 150, color: "var(--accent-soft)", strokeWidth: 2, duration: "38s", reverse: true },
  { period: 420, amplitude: 12, baseline: 210, color: "var(--border)", strokeWidth: 1, duration: "64s" },
];

const TILE_WIDTH = 1200;
const FIELD_HEIGHT = 260;

/**
 * Fixed full-bleed background: three drifting contour lines (built from
 * real periodic Bézier paths, not a blurred gradient blob) plus a fine
 * grain texture. Sits behind the whole app at z-index -10. Respects
 * prefers-reduced-motion via the .water-track CSS rule in globals.css.
 */
export function WaterField() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="absolute inset-x-0 bottom-0 h-[70vh] opacity-[0.55]">
        {LAYERS.map((layer, i) => {
          const periods = Math.ceil(TILE_WIDTH / layer.period) + 1;
          const d = buildWavePath(periods, layer.period, layer.amplitude, layer.baseline);
          return (
            <div
              key={i}
              className={`water-track absolute inset-x-0 bottom-0 ${layer.reverse ? "water-track-reverse" : ""}`}
              style={{ height: FIELD_HEIGHT, animationDuration: layer.duration }}
            >
              <svg
                viewBox={`0 0 ${TILE_WIDTH * 2} ${FIELD_HEIGHT}`}
                width="100%"
                height="100%"
                preserveAspectRatio="none"
              >
                <path d={d} fill="none" stroke={layer.color} strokeWidth={layer.strokeWidth} />
                <path
                  d={d}
                  fill="none"
                  stroke={layer.color}
                  strokeWidth={layer.strokeWidth}
                  transform={`translate(${TILE_WIDTH},0)`}
                />
              </svg>
            </div>
          );
        })}
      </div>
      <div className="grain-layer absolute inset-0" />
    </div>
  );
}

/**
 * Hero graphic: concentric rings marking where a stroke catches the
 * water, cut by a single oar shaft running off the edge. Built entirely
 * from <circle>/<line>/<rect> primitives — deliberately abstract rather
 * than attempting a literal boat, so it holds up as clean line art at
 * any size.
 */
export function StrokeMark({ className }: { className?: string }) {
  const rings = [30, 54, 80, 108, 138];
  return (
    <svg viewBox="0 0 420 420" className={className} aria-hidden>
      {rings.map((r, i) => (
        <circle
          key={r}
          cx={210}
          cy={230}
          r={r}
          fill="none"
          stroke="var(--border-strong)"
          strokeWidth={1}
          opacity={0.9 - i * 0.14}
        />
      ))}
      <circle cx={210} cy={230} r={7} fill="var(--accent)" />
      <line
        x1={210}
        y1={230}
        x2={396}
        y2={40}
        stroke="var(--accent)"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <rect
        x={382}
        y={18}
        width={46}
        height={16}
        rx={8}
        transform="rotate(-45 405 26)"
        fill="var(--accent)"
      />
    </svg>
  );
}

/** Thin decorative rule used between sections instead of empty margin —
 * a single wave period rendered flat and small, echoing the background
 * field without repeating it at full size. */
export function WakeRule({ className }: { className?: string }) {
  const d = buildWavePath(6, 90, 5, 12);
  return (
    <svg viewBox="0 0 540 24" className={className} preserveAspectRatio="none" aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth={1} />
    </svg>
  );
}
