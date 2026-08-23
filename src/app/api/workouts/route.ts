import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { workoutInputSchema } from "@/lib/validation";
import { createWorkout } from "@/lib/workouts";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(request.url);

  const type = searchParams.get("type");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Prisma.WorkoutWhereInput = { userId: user.id };
  if (type) where.type = type as Prisma.WorkoutWhereInput["type"];
  if (from || to) {
    where.date = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const workouts = await prisma.workout.findMany({
    where,
    orderBy: { date: "desc" },
    include: { splits: { orderBy: { index: "asc" } } },
  });

  return NextResponse.json({ workouts });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  const body = await request.json();

  const parsed = workoutInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const workout = await createWorkout(user.id, parsed.data, { source: "MANUAL" });
  return NextResponse.json({ workout }, { status: 201 });
}
