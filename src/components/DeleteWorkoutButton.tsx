"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteWorkoutButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this workout? This can't be undone.")) return;
    setPending(true);
    try {
      await fetch(`/api/workouts/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="text-xs text-muted hover:text-positive disabled:opacity-50"
    >
      {pending ? "…" : "Delete"}
    </button>
  );
}
