"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Users } from "lucide-react";
import { toast } from "sonner";
import { Alert, Avatar, Button, Card, EmptyState, Field, Select, inputClass } from "@/components/ui";
import { BOAT_CLASS_INFO, COX_SEAT_INDEX, seatIndexesForClass, seatLabel } from "@/lib/boats";
import type { BoatClass } from "@/generated/prisma/enums";

type Athlete = { id: string; name: string };
type Seat = { seatIndex: number; athleteId: string | null };
type Boat = { id: string; name: string | null; boatClass: BoatClass; seats: Seat[] };

export function BoatSeatEditor({ boat, athletes }: { boat: Boat; athletes: Athlete[] }) {
  const router = useRouter();
  const [name, setName] = useState(boat.name ?? "");
  const [assignments, setAssignments] = useState<Record<number, string | null>>(() =>
    Object.fromEntries(boat.seats.map((s) => [s.seatIndex, s.athleteId])),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const info = BOAT_CLASS_INFO[boat.boatClass];
  const seatOrder = seatIndexesForClass(boat.boatClass);

  function assignedElsewhere(athleteId: string, seatIndex: number) {
    return Object.entries(assignments).some(
      ([idx, id]) => Number(idx) !== seatIndex && id === athleteId,
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/boats/${boat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          seats: seatOrder.map((seatIndex) => ({ seatIndex, athleteId: assignments[seatIndex] ?? null })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(typeof body?.error === "string" ? body.error : "Couldn't save the lineup");
      }
      toast.success("Lineup saved");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (athletes.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-6 w-6" aria-hidden />}
        title="No one on your roster yet"
        description="Add teammates to the roster first, then come back to fill this boat's seats."
        action={<Button href="/roster">Go to roster</Button>}
      />
    );
  }

  return (
    <form onSubmit={handleSave} className="max-w-lg space-y-6">
      <Card className="p-4 sm:p-5">
        <Field label="Name" hint="optional">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={info.label}
            className={inputClass}
          />
        </Field>
      </Card>

      <Card className="overflow-hidden">
        <ul className="divide-y divide-border">
          {seatOrder.map((seatIndex) => {
            const current = assignments[seatIndex] ?? "";
            return (
              <li key={seatIndex} className="flex items-center gap-3 px-4 py-2.5">
                <span
                  className={`w-20 shrink-0 text-xs font-medium ${
                    seatIndex === COX_SEAT_INDEX ? "text-highlight-strong" : "text-muted"
                  }`}
                >
                  {seatLabel(seatIndex, info.seatCount)}
                </span>
                {current && <Avatar name={athletes.find((a) => a.id === current)?.name ?? "?"} />}
                <Select
                  value={current}
                  onChange={(e) =>
                    setAssignments((prev) => ({ ...prev, [seatIndex]: e.target.value || null }))
                  }
                  className="flex-1"
                >
                  <option value="">— Empty —</option>
                  {athletes.map((a) => (
                    <option key={a.id} value={a.id} disabled={assignedElsewhere(a.id, seatIndex)}>
                      {a.name}
                      {assignedElsewhere(a.id, seatIndex) ? " (already seated)" : ""}
                    </option>
                  ))}
                </Select>
              </li>
            );
          })}
        </ul>
      </Card>

      {error && <Alert>{error}</Alert>}

      <Button type="submit" disabled={saving}>
        <Save className="h-4 w-4" aria-hidden />
        {saving ? "Saving…" : "Save lineup"}
      </Button>
    </form>
  );
}
