"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { IconButton } from "@/components/ui";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export function DeleteBoatButton({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    try {
      await fetch(`/api/boats/${id}`, { method: "DELETE" });
      toast.success("Boat deleted");
      router.push("/boats");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <IconButton label="Delete boat" tone="danger" onClick={() => setOpen(true)}>
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
      </IconButton>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleDelete}
        pending={pending}
        title="Delete this boat?"
        description="This can't be undone. It only removes the lineup — nothing about logged workouts changes."
        confirmLabel="Delete boat"
      />
    </>
  );
}
