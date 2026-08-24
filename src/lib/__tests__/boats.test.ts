import { describe, expect, it } from "vitest";
import { BOAT_CLASS_INFO, COX_SEAT_INDEX, seatIndexesForClass, seatLabel } from "@/lib/boats";

describe("seatIndexesForClass", () => {
  it("returns coxswain-first then bow-to-stroke for a coxed boat", () => {
    expect(seatIndexesForClass("FOUR_PLUS")).toEqual([-1, 0, 1, 2, 3]);
  });

  it("has no coxswain seat for a straight/scull boat", () => {
    expect(seatIndexesForClass("FOUR_MINUS")).toEqual([0, 1, 2, 3]);
    expect(seatIndexesForClass("PAIR")).toEqual([0, 1]);
  });

  it("matches each class's declared seat count", () => {
    for (const [boatClass, info] of Object.entries(BOAT_CLASS_INFO)) {
      const indexes = seatIndexesForClass(boatClass as keyof typeof BOAT_CLASS_INFO);
      const rowingSeats = indexes.filter((i) => i !== COX_SEAT_INDEX);
      expect(rowingSeats).toHaveLength(info.seatCount);
      expect(indexes.includes(COX_SEAT_INDEX)).toBe(info.hasCox);
    }
  });
});

describe("seatLabel", () => {
  it("labels the coxswain seat regardless of boat class", () => {
    expect(seatLabel(COX_SEAT_INDEX, 8)).toBe("Coxswain");
  });

  it("labels bow, middle seats by number, and stroke for an eight", () => {
    expect(seatLabel(0, 8)).toBe("Bow");
    expect(seatLabel(1, 8)).toBe("2");
    expect(seatLabel(6, 8)).toBe("7");
    expect(seatLabel(7, 8)).toBe("Stroke");
  });

  it("labels a single scull's one seat as Rower, not Bow/Stroke", () => {
    expect(seatLabel(0, 1)).toBe("Rower");
  });

  it("labels a pair's two seats as Bow and Stroke", () => {
    expect(seatLabel(0, 2)).toBe("Bow");
    expect(seatLabel(1, 2)).toBe("Stroke");
  });
});
