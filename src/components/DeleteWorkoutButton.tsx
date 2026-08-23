"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { IconButton } from "@/components/ui";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export function DeleteWorkoutButton({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    try {
      await fetch(`/api/workouts/${id}`, { method: "DELETE" });
      toast.success("Workout deleted");
      setOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <IconButton label="Delete workout" tone="danger" onClick={() => setOpen(true)}>
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
      </IconButton>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleDelete}
        pending={pending}
        title="Delete this workout?"
        description="This can't be undone."
        confirmLabel="Delete workout"
      />
    </>
  );
}
