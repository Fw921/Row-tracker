"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";

export function DeletePieceGroupButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this team piece and everyone's results for it? This can't be undone."))
      return;
    setPending(true);
    try {
      await fetch(`/api/piece-groups/${id}`, { method: "DELETE" });
      router.push("/team");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button variant="danger" size="sm" onClick={handleDelete} disabled={pending}>
      {pending ? "Deleting…" : "Delete piece"}
    </Button>
  );
}
