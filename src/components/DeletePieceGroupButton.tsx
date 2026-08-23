"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
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
      <Trash2 className="h-3.5 w-3.5" aria-hidden />
      {pending ? "Deleting…" : "Delete piece"}
    </Button>
  );
}
