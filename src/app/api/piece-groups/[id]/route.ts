import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  const { id } = await params;

  const pieceGroup = await prisma.pieceGroup.findFirst({
    where: { id, userId: user.id },
    include: {
      workouts: {
        include: { athlete: true },
        orderBy: { avgSplitSeconds500m: "asc" },
      },
    },
  });

  if (!pieceGroup) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ pieceGroup });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  const { id } = await params;

  const existing = await prisma.pieceGroup.findFirst({ where: { id, userId: user.id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete the group's workouts explicitly — the FK is onDelete: SetNull
  // (so standalone workouts survive their group being deleted elsewhere),
  // but deleting the group itself should take its whole team piece with it.
  await prisma.$transaction([
    prisma.workout.deleteMany({ where: { pieceGroupId: id } }),
    prisma.pieceGroup.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
