"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sailboat } from "lucide-react";
import { toast } from "sonner";
import { Alert, Badge, Button, Card, EmptyState, Field, Select, inputClass } from "@/components/ui";
import { RevealList, RevealListItem } from "@/components/motion/Reveal";
import { BOAT_CLASS_INFO, BOAT_CLASSES, COX_SEAT_INDEX } from "@/lib/boats";
import type { BoatClass } from "@/generated/prisma/enums";

type Seat = { seatIndex: number; athleteId: string | null; athlete: { id: string; name: string } | null };
type Boat = { id: string; name: string | null; boatClass: BoatClass; seats: Seat[] };

export function BoatsManager({ boats }: { boats: Boat[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [boatClass, setBoatClass] = useState<BoatClass>("EIGHT_PLUS");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/boats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || undefined, boatClass }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ? JSON.stringify(body.error) : "Couldn't create that boat");
      }
      const body = await res.json();
      toast.success(`${BOAT_CLASS_INFO[boatClass].shortLabel} boat created`);
      setName("");
      router.push(`/boats/${body.boat.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="p-4">
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[10rem] flex-1">
            <Field label="Name" hint="optional">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Varsity 8 - Sat lineup"
                className={inputClass}
              />
            </Field>
          </div>
          <div className="w-40">
            <Field label="Class">
              <Select value={boatClass} onChange={(e) => setBoatClass(e.target.value as BoatClass)}>
                {BOAT_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {BOAT_CLASS_INFO[c].shortLabel}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Button type="submit" disabled={submitting} className="shrink-0">
            <Sailboat className="h-4 w-4" aria-hidden />
            {submitting ? "Creating…" : "New boat"}
          </Button>
        </form>
        {error && <Alert className="mt-2">{error}</Alert>}
      </Card>

      {boats.length === 0 ? (
        <EmptyState
          icon={<Sailboat className="h-6 w-6" aria-hidden />}
          title="No boats yet"
          description="Build a lineup: pick a class, then assign your roster to seats."
        />
      ) : (
        <RevealList className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {boats.map((boat) => {
            const info = BOAT_CLASS_INFO[boat.boatClass];
            const filled = boat.seats.filter((s) => s.athleteId).length;
            const crew = boat.seats
              .filter((s) => s.seatIndex !== COX_SEAT_INDEX && s.athlete)
              .sort((a, b) => a.seatIndex - b.seatIndex)
              .map((s) => s.athlete!.name);
            return (
              <RevealListItem key={boat.id}>
                <Card interactive className="h-full p-4">
                  <Link href={`/boats/${boat.id}`} className="block">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-semibold tracking-tight text-foreground">
                        {boat.name || info.label}
                      </span>
                      <Badge tone="accent">{info.shortLabel}</Badge>
                    </div>
                    <p className="mt-1.5 text-xs text-muted">
                      {filled}/{boat.seats.length} seat{boat.seats.length === 1 ? "" : "s"} filled
                    </p>
                    {crew.length > 0 && (
                      <p className="mt-1 truncate text-sm text-muted">{crew.join(" · ")}</p>
                    )}
                  </Link>
                </Card>
              </RevealListItem>
            );
          })}
        </RevealList>
      )}
    </div>
  );
}
