import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { profileInputSchema } from "@/lib/validation";

// Only `name` is editable — `email` is the identity getCurrentUser() looks
// up by (DEFAULT_USER_EMAIL), so changing it here would just orphan the
// account rather than "rename" it.
export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  const body = await request.json();

  const parsed = profileInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name },
  });

  return NextResponse.json({ user: updated });
}
