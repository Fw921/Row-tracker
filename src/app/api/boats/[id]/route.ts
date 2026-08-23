import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { boatUpdateSchema } from "@/lib/validation";
import { seatIndexesForClass } from "@/lib/boats";

const boatInclude = {
  seats: { include: { athlete: { select: { id: true, name: true } } } },
} as const;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  const { id } = await params;

  const boat = await prisma.boat.findFirst({
    where: { id, userId: user.id },
    include: boatInclude,
  });
  if (!boat) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ boat });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  const { id } = await params;

  const boat = await prisma.boat.findFirst({ where: { id, userId: user.id } });
  if (!boat) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = boatUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  // The seat set a PATCH sends must be exactly the seats this boat's class
  // actually has (the class itself isn't editable after creation) — not a
  // client-supplied list, so a bad payload can't add/drop seats.
  const expected = new Set(seatIndexesForClass(boat.boatClass));
  const sentIndexes = input.seats.map((s) => s.seatIndex);
  const sentSet = new Set(sentIndexes);
  if (sentSet.size !== expected.size || [...expected].some((i) => !sentSet.has(i))) {
    return NextResponse.json(
      { error: `Seats must match this boat's class exactly.` },
      { status: 400 },
    );
  }

  const assignedAthleteIds = input.seats
    .map((s) => s.athleteId)
    .filter((id): id is string => id !== null);
  const uniqueAthleteIds = new Set(assignedAthleteIds);
  if (uniqueAthleteIds.size !== assignedAthleteIds.length) {
    return NextResponse.json(
      { error: "The same rower can't be in two seats at once." },
      { status: 400 },
    );
  }

  if (uniqueAthleteIds.size > 0) {
    const owned = await prisma.athlete.count({
      where: { id: { in: [...uniqueAthleteIds] }, userId: user.id },
    });
    if (owned !== uniqueAthleteIds.size) {
      return NextResponse.json({ error: "One of those rowers isn't on your roster." }, { status: 400 });
    }
  }

  await prisma.$transaction([
    ...(input.name !== undefined
      ? [prisma.boat.update({ where: { id }, data: { name: input.name || null } })]
      : []),
    ...input.seats.map((seat) =>
      prisma.boatSeat.update({
        where: { boatId_seatIndex: { boatId: id, seatIndex: seat.seatIndex } },
        data: { athleteId: seat.athleteId },
      }),
    ),
  ]);

  const updated = await prisma.boat.findFirst({ where: { id, userId: user.id }, include: boatInclude });
  return NextResponse.json({ boat: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  const { id } = await params;

  const existing = await prisma.boat.findFirst({ where: { id, userId: user.id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.boat.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
