import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Reuse a single PrismaClient across hot reloads in dev so we don't
// exhaust Postgres connections; a fresh instance per lambda in prod.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Driver adapter (see prisma/schema.prisma's `engineType = "client"`):
// queries run through the plain JS `pg` driver instead of a native,
// OS-specific query-engine binary, so there's nothing for Vercel's
// build machine to generate for the wrong platform.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
