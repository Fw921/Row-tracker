import { prisma } from "@/lib/prisma";

/**
 * Row Tracker is single-user for now: every request acts as the one
 * seeded account (see prisma/seed.ts). This is the single place that
 * assumption lives, so swapping in real auth later means changing this
 * function's body, not every call site.
 */
export async function getCurrentUser() {
  const email = process.env.DEFAULT_USER_EMAIL ?? "you@example.com";

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Me" },
  });

  return user;
}
