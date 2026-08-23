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

  // Every seat starts open — seatIndexesForClass is the same source of truth
  // the seat-assignment PATCH validates against, so a boat's seat set can
  // never drift from what its class actually has.
  const boat = await prisma.boat.create({
    data: {
      userId: user.id,
      name: input.name || undefined,
      boatClass: input.boatClass,
      seats: {
        create: seatIndexesForClass(input.boatClass).map((seatIndex) => ({ seatIndex })),
      },
    },
    include: { seats: { include: { athlete: { select: { id: true, name: true } } } } },
  });

  return NextResponse.json({ boat }, { status: 201 });
}
