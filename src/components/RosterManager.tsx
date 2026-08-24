"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { Alert, Avatar, Button, Card, EmptyState, IconButton, Select, inputClass } from "@/components/ui";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { RevealList, RevealListItem } from "@/components/motion/Reveal";
import { SIDE_INFO } from "@/lib/boats";
import type { RowingSide } from "@/generated/prisma/enums";

type Athlete = { id: string; name: string; side?: RowingSide | null };

export function RosterManager({ athletes }: { athletes: Athlete[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/athletes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Couldn't add that person");
      }
      toast.success(`Added ${name.trim()} to the roster`);
      setName("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: string, name: string) {
    setRemovingId(id);
    try {
      await fetch(`/api/athletes/${id}`, { method: "DELETE" });
      toast.success(`Removed ${name}`);
      router.refresh();
    } finally {
      setRemovingId(null);
      setConfirmingId(null);
    }
  }

  // Rigging-side preference — shown as a color cue in the boat builder
  // (src/components/BoatSeatEditor.tsx), set here since the roster is where
  // an athlete's standing details live.
  async function handleSideChange(id: string, side: RowingSide | "") {
    const res = await fetch(`/api/athletes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ side: side || null }),
    });
    if (res.ok) router.refresh();
  }

  const confirmingAthlete = athletes.find((a) => a.id === confirmingId);

  return (
    <div className="max-w-lg space-y-6">
      <Card className="p-4">
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Add a teammate, e.g. Jordan"
            className={inputClass}
          />
          <Button type="submit" disabled={submitting || !name.trim()} className="shrink-0">
            <UserPlus className="h-4 w-4" aria-hidden />
            {submitting ? "Adding…" : "Add"}
          </Button>
        </form>
        {error && (
          <Alert className="mt-2">{error}</Alert>
        )}
      </Card>

      {athletes.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" aria-hidden />}
          title="No teammates yet"
          description="Add everyone in the boat here, then you can log a piece for the whole crew at once."
        />
      ) : (
        <Card>
          <RevealList className="divide-y divide-border">
            {athletes.map((a) => (
              <RevealListItem key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="relative shrink-0">
                    <Avatar name={a.name} />
                    {a.side && (
                      <span
                        aria-hidden
                        className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface ${SIDE_INFO[a.side].dotClassName}`}
                      />
                    )}
                  </span>
                  <span className="truncate text-sm font-medium">{a.name}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Select
                    aria-label={`${a.name}'s rigging side`}
                    value={a.side ?? ""}
                    onChange={(e) => handleSideChange(a.id, e.target.value as RowingSide | "")}
                    className="w-32 text-xs"
                  >
                    <option value="">No preference</option>
                    <option value="PORT">Port</option>
                    <option value="STARBOARD">Starboard</option>
                    <option value="EITHER">Either side</option>
                  </Select>
                  <IconButton
                    label={`Remove ${a.name}`}
                    tone="danger"
                    onClick={() => setConfirmingId(a.id)}
                    disabled={removingId === a.id}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </IconButton>
                </div>
              </RevealListItem>
            ))}
          </RevealList>
        </Card>
      )}

      <ConfirmDialog
        open={confirmingId !== null}
        onOpenChange={(open) => !open && setConfirmingId(null)}
        onConfirm={() => confirmingAthlete && handleRemove(confirmingAthlete.id, confirmingAthlete.name)}
        pending={removingId !== null}
        title={`Remove ${confirmingAthlete?.name ?? "this teammate"}?`}
        description="They'll no longer show up when logging a team piece. Their past results stay on the record."
        confirmLabel="Remove"
      />
    </div>
  );
}
