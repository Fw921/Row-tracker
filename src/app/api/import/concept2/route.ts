import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { parseConcept2Csv } from "@/lib/import/concept2";
import { workoutInputSchema } from "@/lib/validation";
import { createWorkout } from "@/lib/workouts";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const csvText = await file.text();
  let parsed: ReturnType<typeof parseConcept2Csv>;
  try {
    parsed = parseConcept2Csv(csvText);
  } catch (err) {
    return NextResponse.json(
      { error: `Could not parse CSV: ${err instanceof Error ? err.message : "unknown error"}` },
      { status: 400 },
    );
  }

  const skipped = [...parsed.skipped];
  const valid: (typeof parsed.rows)[number][] = [];

  for (const row of parsed.rows) {
    const result = workoutInputSchema.safeParse(row.workout);
    if (result.success) {
      valid.push({ ...row, workout: result.data });
    } else {
      skipped.push({
        rowIndex: row.rawRowIndex,
        reason: result.error.issues.map((i) => i.message).join("; "),
      });
    }
  }

  if (valid.length === 0) {
    return NextResponse.json(
      { error: "No valid rows found in this file", skipped },
      { status: 400 },
    );
  }

  const batch = await prisma.importBatch.create({
    data: {
      userId: user.id,
      source: "CONCEPT2_CSV",
      filename: file.name,
      rowCount: valid.length,
    },
  });

  for (const row of valid) {
    await createWorkout(user.id, row.workout, {
      source: "CONCEPT2_CSV",
      importBatchId: batch.id,
    });
  }

  return NextResponse.json({
    imported: valid.length,
    skippedCount: skipped.length,
    skipped: skipped.slice(0, 50),
    batchId: batch.id,
  });
}
