import { describe, expect, it } from "vitest";
import {
  classifyPacing,
  formatDuration,
  parseDuration,
  resolveTeamEntryTotals,
  splitPer500m,
} from "@/lib/pace";

describe("formatDuration", () => {
  it("formats sub-minute values", () => {
    expect(formatDuration(45.2)).toBe("0:45.2");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(412.4)).toBe("6:52.4");
  });

  it("formats past an hour", () => {
    expect(formatDuration(3735)).toBe("1:02:15.0");
  });

  it("handles negative/NaN defensively", () => {
    expect(formatDuration(-5)).toBe("0:00.0");
    expect(formatDuration(NaN)).toBe("0:00.0");
  });
});

describe("parseDuration", () => {
  it("parses m:ss.t", () => {
    expect(parseDuration("6:52.4")).toBeCloseTo(412.4);
  });

  it("parses h:mm:ss", () => {
    expect(parseDuration("1:02:15")).toBe(3735);
  });

  it("parses bare seconds", () => {
    expect(parseDuration("412.4")).toBeCloseTo(412.4);
  });

  it("rejects garbage", () => {
    expect(parseDuration("not a time")).toBeNull();
    expect(parseDuration("")).toBeNull();
    expect(parseDuration("1:xx")).toBeNull();
  });
});

describe("splitPer500m", () => {
  it("computes split for a 2k", () => {
    // 2000m in 6:52.4x2 = 7:12.8 per 1000, i.e. 3:36.4 per 500m for an 8:52.4 2k? Use concrete numbers instead.
    // 2000m in 420s -> 500m split = 420/2000*500 = 105s = 1:45.0
    expect(splitPer500m(2000, 420)).toBeCloseTo(105);
  });

  it("returns 0 for zero/negative distance", () => {
    expect(splitPer500m(0, 100)).toBe(0);
    expect(splitPer500m(-5, 100)).toBe(0);
  });
});

describe("resolveTeamEntryTotals", () => {
  it("uses the target as distance and the entry as time in distance mode", () => {
    expect(resolveTeamEntryTotals("distance", 2000, 420)).toEqual({
      totalDistanceMeters: 2000,
      totalTimeSeconds: 420,
    });
  });

  it("uses the target as time and the entry as distance in time mode", () => {
    expect(resolveTeamEntryTotals("time", 1200, 5200)).toEqual({
      totalDistanceMeters: 5200,
      totalTimeSeconds: 1200,
    });
  });
});

describe("classifyPacing", () => {
  it("detects a negative split (faster second half)", () => {
    expect(classifyPacing([110, 108, 104, 100])).toBe("negative");
  });

  it("detects a positive split (fading)", () => {
    expect(classifyPacing([100, 102, 108, 112])).toBe("positive");
  });

  it("detects even splits within threshold", () => {
    expect(classifyPacing([105, 105.2, 104.8, 105.1])).toBe("even");
  });

  it("returns unknown for too few splits", () => {
    expect(classifyPacing([105])).toBe("unknown");
  });
});
