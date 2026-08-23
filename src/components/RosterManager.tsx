"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Button, Card, EmptyState } from "@/components/ui";

type Athlete = { id: string; name: string };

export function RosterManager({ athletes }: { athletes: Athlete[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

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
      setName("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    try {
      await fetch(`/api/athletes/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <Card className="p-4">
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Add a teammate, e.g. Jordan"
            className="flex-1 rounded-md border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent"
          />
          <Button type="submit" disabled={submitting || !name.trim()}>
            {submitting ? "Adding…" : "Add"}
          </Button>
        </form>
        {error && <p className="mt-2 text-sm text-positive">{error}</p>}
      </Card>

      {athletes.length === 0 ? (
        <EmptyState
          icon="🚣"
          title="No teammates yet"
          description="Add everyone in the boat here, then you can log a piece for the whole crew at once."
        />
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {athletes.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={a.name} />
                  <span className="text-sm font-medium">{a.name}</span>
                </div>
                <button
                  onClick={() => handleRemove(a.id)}
                  disabled={removingId === a.id}
                  className="text-xs text-muted hover:text-positive disabled:opacity-50"
                >
                  {removingId === a.id ? "…" : "Remove"}
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
