import { describe, expect, it } from "vitest";
import { z } from "zod";
import { teamPieceInputSchema } from "@/lib/validation";

type TeamPieceRawInput = z.input<typeof teamPieceInputSchema>;

function baseInput(overrides: Partial<TeamPieceRawInput> = {}): TeamPieceRawInput {
  return {
    date: "2026-06-01",
    type: "SINGLE_DISTANCE",
    mode: "distance",
    target: 2000,
    entries: [{ athleteId: "a1", value: 420 }],
    ...overrides,
  };
}

describe("teamPieceInputSchema", () => {
  it("accepts a minimal valid distance-mode piece", () => {
    const result = teamPieceInputSchema.safeParse(baseInput());
    expect(result.success).toBe(true);
  });

  it("accepts a time-mode piece", () => {
    const result = teamPieceInputSchema.safeParse(
      baseInput({ mode: "time", target: 1200, entries: [{ athleteId: "a1", value: 5200 }] }),
    );
    expect(result.success).toBe(true);
  });

  it("rejects an empty entries list", () => {
    const result = teamPieceInputSchema.safeParse(baseInput({ entries: [] }));
    expect(result.success).toBe(false);
  });

  it("rejects a non-positive entry value", () => {
    const result = teamPieceInputSchema.safeParse(
      baseInput({ entries: [{ athleteId: "a1", value: 0 }] }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects an entry with an out-of-range heart rate", () => {
    const result = teamPieceInputSchema.safeParse(
      baseInput({ entries: [{ athleteId: "a1", value: 420, avgHeartRate: 400 }] }),
    );
    expect(result.success).toBe(false);
  });

  it("accepts multiple rowers on the same piece", () => {
    const result = teamPieceInputSchema.safeParse(
      baseInput({
        entries: [
          { athleteId: "a1", value: 420 },
          { athleteId: "a2", value: 435.2 },
        ],
      }),
    );
    expect(result.success).toBe(true);
  });
});
