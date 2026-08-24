import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { boatInputSchema } from "@/lib/validation";
import { seatIndexesForClass } from "@/lib/boats";

export async function GET() {
  const user = await getCurrentUser();
  const boats = await prisma.boat.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { seats: { include: { athlete: { select: { id: true, name: true } } } } },
  });
  return NextResponse.json({ boats });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  const body = await request.json();

  const parsed = boatInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  // "Copy previous lineup": carry over who's in each seat from an existing
  // boat, keyed by seatIndex so it only makes sense between boats of the
  // same class (a pair has no seat 6 to copy into). Silently ignored for a
  // boat you don't own or a different class, rather than erroring — the
  // fallback (empty seats) is a perfectly normal boat either way.
  let sourceSeats: { seatIndex: number; athleteId: string | null; guestName: string | null }[] = [];
  if (input.copyFromBoatId) {
    const source = await prisma.boat.findFirst({
      where: { id: input.copyFromBoatId, userId: user.id, boatClass: input.boatClass },
      include: { seats: true },
    });
    if (source) sourceSeats = source.seats;
  }
  const seatAssignment = new Map(sourceSeats.map((s) => [s.seatIndex, s]));

  // Every seat starts open (or copied) — seatIndexesForClass is the same
  // source of truth the seat-assignment PATCH validates against, so a
  // boat's seat set can never drift from what its class actually has.
  const boat = await prisma.boat.create({
    data: {
      userId: user.id,
      name: input.name || undefined,
      boatClass: input.boatClass,
      seats: {
        create: seatIndexesForClass(input.boatClass).map((seatIndex) => ({
          seatIndex,
          athleteId: seatAssignment.get(seatIndex)?.athleteId ?? null,
          guestName: seatAssignment.get(seatIndex)?.guestName ?? null,
        })),
      },
    },
    include: { seats: { include: { athlete: { select: { id: true, name: true } } } } },
  });

  return NextResponse.json({ boat }, { status: 201 });
}
