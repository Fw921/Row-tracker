import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

const createAthleteSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
});

export async function GET() {
  const user = await getCurrentUser();
  const athletes = await prisma.athlete.findMany({
    where: { userId: user.id, archived: false },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ athletes });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  const body = await request.json();

  const parsed = createAthleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const athlete = await prisma.athlete.create({
      data: { userId: user.id, name: parsed.data.name },
    });
    return NextResponse.json({ athlete }, { status: 201 });
  } catch {
    // Most likely the @@unique([userId, name]) constraint.
    return NextResponse.json(
      { error: `"${parsed.data.name}" is already on your roster` },
      { status: 409 },
    );
  }
}
