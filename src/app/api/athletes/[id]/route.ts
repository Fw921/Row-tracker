import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { athleteSideSchema } from "@/lib/validation";

// Only `side` is editable here — renaming/archiving have their own flows
// (RosterManager's remove button, which archives rather than deletes).
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  const { id } = await params;

  const existing = await prisma.athlete.findFirst({ where: { id, userId: user.id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = athleteSideSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const athlete = await prisma.athlete.update({ where: { id }, data: { side: parsed.data.side } });
  return NextResponse.json({ athlete });
}

// Archives rather than hard-deletes, so past workouts logged under this
// athlete keep their name instead of losing the association.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  const { id } = await params;

  const existing = await prisma.athlete.findFirst({ where: { id, userId: user.id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.athlete.update({ where: { id }, data: { archived: true } });
  return NextResponse.json({ ok: true });
}
