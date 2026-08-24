import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

// TEMPORARY diagnostic route — not part of the app's feature set.
// Reports exactly what's on disk, at runtime, in every location Prisma's
// own error message says it searched for the query engine. Lets us see
// directly whether the engine binary made it into the deployed function
// instead of guessing from build logs. Safe to delete once the Prisma
// engine issue is resolved.
export const dynamic = "force-dynamic";

function listDir(dir: string) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true }).map((entry) => {
      let size: number | null = null;
      try {
        size = fs.statSync(path.join(dir, entry.name)).size;
      } catch {
        // ignore
      }
      return { name: entry.name, isDir: entry.isDirectory(), size };
    });
  } catch (err) {
    return { error: String(err) };
  }
}

export async function GET() {
  const candidates = [
    "/ROOT/src/generated/prisma",
    "/var/task/src/generated",
    "/var/task/src/generated/prisma",
    "/vercel/path0/src/generated/prisma",
    "/var/task/.prisma/client",
    "/tmp/prisma-engines",
    process.cwd(),
    path.join(process.cwd(), "src/generated/prisma"),
    path.join(__dirname),
  ];

  const results: Record<string, unknown> = {};
  for (const dir of candidates) {
    results[dir] = listDir(dir);
  }

  return NextResponse.json({
    cwd: process.cwd(),
    dirname: __dirname,
    platform: process.platform,
    arch: process.arch,
    results,
  });
}
