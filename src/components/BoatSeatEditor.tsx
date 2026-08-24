"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, EyeOff, Save, Users } from "lucide-react";
import { toast } from "sonner";
import { Alert, Avatar, Button, Card, Chip, EmptyState, Field, Select, inputClass } from "@/components/ui";
import { AthleteSheet } from "@/components/AthleteSheet";
import { BOAT_CLASS_INFO, COX_SEAT_INDEX, SIDE_INFO, seatIndexesForClass, seatLabel } from "@/lib/boats";
import type { BoatClass, RowingSide } from "@/generated/prisma/enums";

type Athlete = { id: string; name: string; side?: RowingSide | null };
type Seat = { seatIndex: number; athleteId: string | null; guestName: string | null };
type Boat = { id: string; name: string | null; boatClass: BoatClass; seats: Seat[] };

type SeatValue = { athleteId: string | null; guestName: string | null };

const GUEST_OPTION = "__guest__";
// Where a Team Profile setting would live if this app had one — one
// preference, shared across every boat you open, so it's not something
// worth a schema field for a single-user app.
const ORIENTATION_KEY = "row-tracker:boat-cox-on-top";

export function BoatSeatEditor({ boat, athletes }: { boat: Boat; athletes: Athlete[] }) {
  const router = useRouter();
  const [name, setName] = useState(boat.name ?? "");
  const [seatValues, setSeatValues] = useState<Record<number, SeatValue>>(() =>
    Object.fromEntries(boat.seats.map((s) => [s.seatIndex, { athleteId: s.athleteId, guestName: s.guestName }])),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hideEmpty, setHideEmpty] = useState(false);
  const [coxOnTop, setCoxOnTop] = useState(true);
  const [openAthlete, setOpenAthlete] = useState<{ id: string; name: string } | null>(null);

  // Read the saved orientation preference after mount, not in useState's
  // initializer — localStorage doesn't exist during server rendering, and
  // reading it there would make the client's first render disagree with
  // what the server already sent down (a hydration mismatch).
  useEffect(() => {
    // The .then() continuation (not a bare synchronous call in the effect
    // body) is deliberate — see CountUp.tsx for the same pattern and why:
    // it keeps this from being a synchronous setState-in-effect, which
    // React's lint rule flags as a cascading-render risk.
    Promise.resolve().then(() => {
      try {
        const stored = localStorage.getItem(ORIENTATION_KEY);
        if (stored !== null) setCoxOnTop(stored === "true");
      } catch {
        // Private browsing / storage disabled — just keep the default.
      }
    });
  }, []);

  function toggleOrientation() {
    setCoxOnTop((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(ORIENTATION_KEY, String(next));
      } catch {
        // Fine to not persist — the toggle still works for this visit.
      }
      return next;
    });
  }

  const info = BOAT_CLASS_INFO[boat.boatClass];
  const allSeats = seatIndexesForClass(boat.boatClass);
  const hasCox = allSeats.includes(COX_SEAT_INDEX);
  const rowingSeats = allSeats.filter((i) => i !== COX_SEAT_INDEX);
  const orderedSeats = hasCox
    ? coxOnTop
      ? [COX_SEAT_INDEX, ...rowingSeats]
      : [...rowingSeats, COX_SEAT_INDEX]
    : rowingSeats;

  // guestName === "" (not null) means the seat is mid-edit as a guest
  // tile — still "occupied" for hide-empty purposes, or the row would
  // vanish out from under you the moment you pick "+ Guest…" and before
  // you've had a chance to type a name.
  const isEmpty = (seatIndex: number) => {
    const v = seatValues[seatIndex];
    return !v || (!v.athleteId && v.guestName === null);
  };
  const visibleSeats = hideEmpty ? orderedSeats.filter((i) => !isEmpty(i)) : orderedSeats;

  function assignedElsewhere(athleteId: string, seatIndex: number) {
    return Object.entries(seatValues).some(
      ([idx, v]) => Number(idx) !== seatIndex && v.athleteId === athleteId,
    );
  }

  function setSeat(seatIndex: number, value: SeatValue) {
    setSeatValues((prev) => ({ ...prev, [seatIndex]: value }));
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
          seats: allSeats.map((seatIndex) => ({
            seatIndex,
            athleteId: seatValues[seatIndex]?.athleteId ?? null,
            guestName: seatValues[seatIndex]?.guestName || null,
          })),
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
    <>
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

        <div className="flex flex-wrap gap-2">
          <Chip type="button" active={hideEmpty} onClick={() => setHideEmpty((v) => !v)}>
            <EyeOff className="mr-1 inline h-3 w-3" aria-hidden />
            Hide empty seats
          </Chip>
          {hasCox && (
            <Chip type="button" active={false} onClick={toggleOrientation}>
              <ArrowUpDown className="mr-1 inline h-3 w-3" aria-hidden />
              {coxOnTop ? "Coxswain on top" : "Coxswain on bottom"}
            </Chip>
          )}
        </div>

        <Card className="overflow-hidden">
          <ul className="divide-y divide-border">
            {visibleSeats.map((seatIndex) => {
              const value = seatValues[seatIndex] ?? { athleteId: null, guestName: null };
              const isGuest = value.guestName !== null;
              const selectValue = isGuest ? GUEST_OPTION : (value.athleteId ?? "");
              const assignedAthlete = value.athleteId
                ? athletes.find((a) => a.id === value.athleteId)
                : null;

              return (
                <li key={seatIndex} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                  <span
                    className={`w-20 shrink-0 text-xs font-medium ${
                      seatIndex === COX_SEAT_INDEX ? "text-highlight-strong" : "text-muted"
                    }`}
                  >
                    {seatLabel(seatIndex, info.seatCount)}
                  </span>

                  {assignedAthlete && (
                    <button
                      type="button"
                      onClick={() => setOpenAthlete({ id: assignedAthlete.id, name: assignedAthlete.name })}
                      className="relative shrink-0 cursor-pointer transition-transform duration-150 active:scale-95"
                      aria-label={`View ${assignedAthlete.name}'s profile`}
                    >
                      <Avatar name={assignedAthlete.name} />
                      {assignedAthlete.side && (
                        <span
                          aria-hidden
                          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface ${SIDE_INFO[assignedAthlete.side].dotClassName}`}
                        />
                      )}
                    </button>
                  )}

                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Select
                      value={selectValue}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === GUEST_OPTION) setSeat(seatIndex, { athleteId: null, guestName: "" });
                        else if (v === "") setSeat(seatIndex, { athleteId: null, guestName: null });
                        else setSeat(seatIndex, { athleteId: v, guestName: null });
                      }}
                      className="min-w-0 flex-[2]"
                    >
                      <option value="">— Empty —</option>
                      <option value={GUEST_OPTION}>+ Guest…</option>
                      {athletes.map((a) => (
                        <option key={a.id} value={a.id} disabled={assignedElsewhere(a.id, seatIndex)}>
                          {a.name}
                          {assignedElsewhere(a.id, seatIndex) ? " (already seated)" : ""}
                        </option>
                      ))}
                    </Select>
                    {isGuest && (
                      <input
                        type="text"
                        autoFocus
                        value={value.guestName ?? ""}
                        onChange={(e) => setSeat(seatIndex, { athleteId: null, guestName: e.target.value })}
                        placeholder="Guest's name"
                        maxLength={60}
                        className={`${inputClass} min-w-0 flex-1`}
                      />
                    )}
                  </div>
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

      <AthleteSheet
        athleteId={openAthlete?.id ?? null}
        athleteName={openAthlete?.name ?? ""}
        open={openAthlete !== null}
        onOpenChange={(open) => !open && setOpenAthlete(null)}
      />
    </>
  );
}
