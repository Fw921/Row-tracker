import { describe, expect, it } from "vitest";
import { parseConcept2Csv } from "@/lib/import/concept2";

const HEADER =
  "Log ID,Date,Description,Work Time (Formatted),Work Time (Seconds),Rest Time (Formatted),Rest Time (Seconds),Work Distance,Rest Distance,Stroke Rate/Cadence,Stroke Count,Pace,Avg Watts,Cal/Hour,Total Cal,Avg Heart Rate,Drag Factor,Age,Weight,Type,Ranked,Comments,Date Entered";

function row(fields: Record<string, string>): string {
  const headers = HEADER.split(",");
  return headers.map((h) => fields[h] ?? "").join(",");
}

describe("parseConcept2Csv", () => {
  it("parses a fixed-distance 2k row", () => {
    const csv = [
      HEADER,
      row({
        "Log ID": "1001",
        Date: "2024-06-01 07:32:00",
        Description: "2000meters",
        "Work Time (Formatted)": "7:12.4",
        "Work Time (Seconds)": "432.4",
        "Rest Time (Seconds)": "0",
        "Work Distance": "2000",
        "Rest Distance": "0",
        "Stroke Rate/Cadence": "28",
        Pace: "1:48.1",
        "Avg Watts": "205",
        "Total Cal": "102",
        "Avg Heart Rate": "172",
        "Drag Factor": "128",
        Type: "Standard",
        Comments: "Felt good",
      }),
    ].join("\n");

    const result = parseConcept2Csv(csv);
    expect(result.skipped).toHaveLength(0);
    expect(result.rows).toHaveLength(1);

    const w = result.rows[0].workout;
    expect(w.totalDistanceMeters).toBe(2000);
    expect(w.totalTimeSeconds).toBe(432.4);
    expect(w.type).toBe("SINGLE_DISTANCE");
    expect(w.avgHeartRate).toBe(172);
    expect(w.avgWatts).toBe(205);
    expect(w.dragFactor).toBe(128);
    expect(w.notes).toBe("Felt good");
    expect(new Date(w.date).getUTCFullYear()).toBe(2024);
  });

  it("infers INTERVALS from rest time", () => {
    const csv = [
      HEADER,
      row({
        Date: "2024-06-02 07:00:00",
        Description: "6 x 500meters/3:00r",
        "Work Time (Seconds)": "630",
        "Rest Time (Seconds)": "540",
        "Work Distance": "3000",
      }),
    ].join("\n");

    const result = parseConcept2Csv(csv);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].workout.type).toBe("INTERVALS");
  });

  it("falls back to Work Time (Formatted) when seconds column is blank", () => {
    const csv = [
      HEADER,
      row({
        Date: "2024-06-03 07:00:00",
        Description: "5000meters",
        "Work Time (Formatted)": "20:15.0",
        "Work Distance": "5000",
      }),
    ].join("\n");

    const result = parseConcept2Csv(csv);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].workout.totalTimeSeconds).toBeCloseTo(1215);
  });

  it("infers SINGLE_TIME from a duration-only description", () => {
    const csv = [
      HEADER,
      row({
        Date: "2024-06-06 07:00:00",
        Description: "30:00.0",
        "Work Time (Seconds)": "1800",
        "Work Distance": "7100",
      }),
    ].join("\n");

    const result = parseConcept2Csv(csv);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].workout.type).toBe("SINGLE_TIME");
  });

  it("skips rows missing date or work data", () => {
    const csv = [
      HEADER,
      row({ Description: "2000meters", "Work Time (Seconds)": "420", "Work Distance": "2000" }), // no date
      row({ Date: "2024-06-04 07:00:00", Description: "no work data" }), // no time/distance
    ].join("\n");

    const result = parseConcept2Csv(csv);
    expect(result.rows).toHaveLength(0);
    expect(result.skipped).toHaveLength(2);
  });

  it("handles alternate header casing/spacing", () => {
    const altHeader = "date,description,work distance,work time seconds";
    const csv = [altHeader, "2024-06-05,1000meters,1000,180"].join("\n");

    const result = parseConcept2Csv(csv);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].workout.totalDistanceMeters).toBe(1000);
  });
});
