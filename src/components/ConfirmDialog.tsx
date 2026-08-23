"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui";

/** Themed replacement for window.confirm(), built on the native <dialog>
 * element — gets focus-trapping, Escape-to-close, and the ::backdrop for
 * free, styled to match the rest of the app instead of the browser chrome. */
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
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onOpenChange(false);
      }}
      onClose={() => onOpenChange(false)}
      onClick={(e) => {
        // Click landed on the dialog element itself, not its content — that
        // only happens via the ::backdrop area (light-dismiss).
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
      className="m-auto w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-border bg-surface p-0 text-foreground shadow-[var(--shadow-raised)] backdrop:bg-foreground/30 backdrop:backdrop-blur-[2px]"
    >
      <div className="p-5">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-positive/10 text-positive-strong">
          <AlertTriangle className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="font-display text-base font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>}
      </div>
      <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
        <Button type="button" variant="secondary" size="sm" onClick={() => onOpenChange(false)} disabled={pending}>
          Cancel
        </Button>
        <Button type="button" variant="dangerSolid" size="sm" onClick={onConfirm} disabled={pending}>
          {pending ? "Working…" : confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
