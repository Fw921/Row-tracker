import { z } from "zod";

export const workoutTypeSchema = z.enum([
  "SINGLE_DISTANCE",
  "SINGLE_TIME",
  "INTERVALS",
  "STEADY_STATE",
  "OTHER",
]);

export const splitInputSchema = z.object({
  distanceMeters: z.number().positive(),
  timeSeconds: z.number().positive(),
  restTimeSeconds: z.number().min(0).optional(),
  restDistanceMeters: z.number().min(0).optional(),
  avgWatts: z.number().min(0).optional(),
  avgHeartRate: z.number().int().min(0).max(300).optional(),
  avgStrokeRate: z.number().min(0).max(60).optional(),
});

export const workoutInputSchema = z.object({
  date: z.string().min(1, "Date is required"),
  type: workoutTypeSchema,
  title: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  totalDistanceMeters: z.number().positive("Distance must be greater than 0"),
  totalTimeSeconds: z.number().positive("Time must be greater than 0"),
  avgWatts: z.number().min(0).optional(),
  avgHeartRate: z.number().int().min(0).max(300).optional(),
  maxHeartRate: z.number().int().min(0).max(300).optional(),
  avgStrokeRate: z.number().min(0).max(60).optional(),
  dragFactor: z.number().int().min(0).max(300).optional(),
  calories: z.number().min(0).optional(),
  notes: z.string().max(4000).optional(),
  splits: z.array(splitInputSchema).optional(),
});

export type WorkoutInput = z.infer<typeof workoutInputSchema>;
export type SplitInput = z.infer<typeof splitInputSchema>;

// --- Team pieces (mass entry) ---------------------------------------------
//
// "Everyone rows the same piece" means one shared parameter (distance, for
// a 2k test, or time, for a 20' piece) and one varying result per rower.

export const teamEntrySchema = z.object({
  athleteId: z.string().min(1),
  // Seconds if the group target is a distance; meters if the group target
  // is a time. Whichever one *isn't* shared.
  value: z.number().positive("Enter a result for every rower you're logging"),
  avgWatts: z.number().min(0).optional(),
  avgHeartRate: z.number().int().min(0).max(300).optional(),
  avgStrokeRate: z.number().min(0).max(60).optional(),
  notes: z.string().max(1000).optional(),
});

export const teamPieceInputSchema = z.object({
  date: z.string().min(1, "Date is required"),
  type: workoutTypeSchema,
  title: z.string().max(200).optional(),
  mode: z.enum(["distance", "time"]),
  target: z.number().positive("Enter the shared distance or time for this piece"),
  entries: z.array(teamEntrySchema).min(1, "Add at least one rower"),
});

export type TeamEntryInput = z.infer<typeof teamEntrySchema>;
export type TeamPieceInput = z.infer<typeof teamPieceInputSchema>;

// --- Goals ------------------------------------------------------------

export const goalInputSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("SPLIT_TARGET"),
    label: z.string().max(100).optional(),
    targetDistanceMeters: z.number().positive(),
    targetSplitSeconds500m: z.number().positive(),
  }),
  z.object({
    type: z.literal("TOTAL_METERS"),
    label: z.string().max(100).optional(),
    targetMeters: z.number().positive(),
  }),
  z.object({
    type: z.literal("MONTHLY_WORKOUTS"),
    label: z.string().max(100).optional(),
    targetWorkoutsPerMonth: z.number().int().positive(),
  }),
]);

export type GoalInput = z.infer<typeof goalInputSchema>;

// --- Profile ------------------------------------------------------------

export const profileInputSchema = z.object({
  name: z.string().trim().min(1, "Name can't be empty").max(100),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;

// --- Athletes -------------------------------------------------------------

export const athleteSideSchema = z.object({
  side: z.enum(["PORT", "STARBOARD", "EITHER"]).nullable(),
});

export type AthleteSideInput = z.infer<typeof athleteSideSchema>;

// --- Boats (lineup builder) ---------------------------------------------

export const boatClassSchema = z.enum([
  "EIGHT_PLUS",
  "FOUR_PLUS",
  "FOUR_MINUS",
  "FOUR_X",
  "PAIR",
  "DOUBLE",
  "SINGLE",
]);

export const boatInputSchema = z.object({
  name: z.string().trim().max(100).optional(),
  boatClass: boatClassSchema,
  // "Copy previous lineup": seed the new boat's seats from an existing
  // boat of the same class instead of leaving them all open.
  copyFromBoatId: z.string().min(1).optional(),
});

export type BoatInput = z.infer<typeof boatInputSchema>;

// A seat is at most one of athleteId (a roster rower) or guestName (an
// unregistered "*" tile) — never both; enforced in the route, since which
// one's wrong depends on which one the client meant to clear.
export const boatSeatInputSchema = z.object({
  seatIndex: z.number().int(),
  athleteId: z.string().min(1).nullable(),
  guestName: z.string().trim().max(60).nullable().optional(),
});

export const boatUpdateSchema = z.object({
  name: z.string().trim().max(100).optional(),
  seats: z.array(boatSeatInputSchema),
});

export type BoatUpdateInput = z.infer<typeof boatUpdateSchema>;
