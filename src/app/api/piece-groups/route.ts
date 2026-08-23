import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { teamPieceInputSchema } from "@/lib/validation";
import { createTeamPiece } from "@/lib/workouts";

export async function GET() {
  const user = await getCurrentUser();
  const pieceGroups = await prisma.pieceGroup.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    include: { _count: { select: { workouts: true } } },
  });
  return NextResponse.json({ pieceGroups });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  const body = await request.json();

  const parsed = teamPieceInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Make sure every athleteId actually belongs to this user before writing
  // anything — otherwise a stale/tampered id would silently no-op the FK.
  const athleteIds = [...new Set(parsed.data.entries.map((e) => e.athleteId))];
  const owned = await prisma.athlete.findMany({
    where: { id: { in: athleteIds }, userId: user.id },
    select: { id: true },
  });
  if (owned.length !== athleteIds.length) {
    return NextResponse.json({ error: "One or more rowers weren't found on your roster" }, {
      status: 400,
    });
  }

  const result = await createTeamPiece(user.id, parsed.data);
  return NextResponse.json(result, { status: 201 });
}
