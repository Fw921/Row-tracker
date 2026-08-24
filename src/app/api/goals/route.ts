import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { goalInputSchema } from "@/lib/validation";

export async function GET() {
  const user = await getCurrentUser();
  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ goals });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  const body = await request.json();

  const parsed = goalInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      type: input.type,
      label: input.label,
      targetDistanceMeters: input.type === "SPLIT_TARGET" ? input.targetDistanceMeters : undefined,
      targetSplitSeconds500m:
        input.type === "SPLIT_TARGET" ? input.targetSplitSeconds500m : undefined,
      targetMeters: input.type === "TOTAL_METERS" ? input.targetMeters : undefined,
      targetWorkoutsPerMonth:
        input.type === "MONTHLY_WORKOUTS" ? input.targetWorkoutsPerMonth : undefined,
    },
  });
  return NextResponse.json({ goal }, { status: 201 });
}
