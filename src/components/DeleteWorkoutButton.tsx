"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { IconButton } from "@/components/ui";

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
    <IconButton label="Delete workout" tone="danger" onClick={handleDelete} disabled={pending}>
      <Trash2 className="h-3.5 w-3.5" aria-hidden />
    </IconButton>
  );
}
