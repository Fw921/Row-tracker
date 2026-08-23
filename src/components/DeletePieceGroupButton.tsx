"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export function DeletePieceGroupButton({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    try {
      await fetch(`/api/piece-groups/${id}`, { method: "DELETE" });
      toast.success("Team piece deleted");
      router.push("/team");
      router.refresh();
    } finally {
      setPending(false);
      setOpen(false);
    }
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        Delete piece
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleDelete}
        pending={pending}
        title="Delete this team piece?"
        description="Everyone's results for it will be deleted too. This can't be undone."
        confirmLabel="Delete piece"
      />
    </>
  );
}
