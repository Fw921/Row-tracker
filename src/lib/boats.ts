import type { BoatClass } from "@/generated/prisma/enums";

type BoatClassInfo = {
  /** Full name for form labels, e.g. "Coxed four (4+)". */
  label: string;
  /** Short name for compact display, e.g. list cards — "4+". */
  shortLabel: string;
  /** Number of rowing seats (excludes the coxswain's seat). */
  seatCount: number;
  hasCox: boolean;
};

export const BOAT_CLASS_INFO: Record<BoatClass, BoatClassInfo> = {
  EIGHT_PLUS: { label: "Eight (8+)", shortLabel: "8+", seatCount: 8, hasCox: true },
  FOUR_PLUS: { label: "Coxed four (4+)", shortLabel: "4+", seatCount: 4, hasCox: true },
  FOUR_MINUS: { label: "Straight four (4-)", shortLabel: "4-", seatCount: 4, hasCox: false },
  FOUR_X: { label: "Quad scull (4x)", shortLabel: "4x", seatCount: 4, hasCox: false },
  PAIR: { label: "Pair (2-)", shortLabel: "2-", seatCount: 2, hasCox: false },
  DOUBLE: { label: "Double scull (2x)", shortLabel: "2x", seatCount: 2, hasCox: false },
  SINGLE: { label: "Single scull (1x)", shortLabel: "1x", seatCount: 1, hasCox: false },
};

export const BOAT_CLASSES = Object.keys(BOAT_CLASS_INFO) as BoatClass[];

/** Sentinel `seatIndex` for the coxswain's seat — see the BoatSeat model
 * comment in schema.prisma. Every other seat is 0-based bow-to-stroke. */
export const COX_SEAT_INDEX = -1;

/** Every seatIndex a boat of this class should have (rowing seats, plus the
 * cox sentinel if the class carries one) — the exact set BoatSeat rows are
 * created with, and what a seat-assignment PATCH is validated against. */
export function seatIndexesForClass(boatClass: BoatClass): number[] {
  const info = BOAT_CLASS_INFO[boatClass];
  const seats = Array.from({ length: info.seatCount }, (_, i) => i);
  return info.hasCox ? [COX_SEAT_INDEX, ...seats] : seats;
}

/** Bow, 2, 3, ..., Stroke — the conventional names for a rowing seat by
 * position, regardless of sweep or scull. A single scull just has "Rower".
 * `seatIndexesForClass` already returns seats coxswain-first then
 * bow-to-stroke, ascending — the order a lineup editor should render them. */
export function seatLabel(seatIndex: number, seatCount: number): string {
  if (seatIndex === COX_SEAT_INDEX) return "Coxswain";
  if (seatCount === 1) return "Rower";
  if (seatIndex === seatCount - 1) return "Stroke";
  if (seatIndex === 0) return "Bow";
  return String(seatIndex + 1);
}
