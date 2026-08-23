"use client";

import { TriangleAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/** Themed replacement for window.confirm(), built on Radix's AlertDialog
 * (via shadcn/21st.dev, restyled onto this app's own tokens — see
 * src/components/ui/alert-dialog.tsx) instead of a hand-rolled one: real
 * focus-trapping, portal rendering, and Escape/outside-click handling. */
export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  pending?: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-positive/10 text-positive-strong">
            <TriangleAlert className="h-5 w-5" aria-hidden />
          </div>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="dangerSolid"
            disabled={pending}
            onClick={(e) => {
              // Keep the dialog open (with a pending label) until the async
              // delete actually finishes, instead of Radix's default
              // close-on-click.
              e.preventDefault();
              onConfirm();
            }}
          >
            {pending ? "Working…" : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
