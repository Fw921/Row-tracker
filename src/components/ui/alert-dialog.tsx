"use client";

// Adapted from shadcn/ui's alert-dialog (via 21st.dev), restyled onto this
// app's own design tokens and Button system instead of shadcn's separate
// palette/button — see AlertDialogAction/Cancel below.
import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import clsx from "clsx";
import { buttonClassName } from "@/components/ui";

function AlertDialog({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogPortal({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
}

function AlertDialogOverlay({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={clsx(
        "fixed inset-0 z-50 bg-foreground/30 backdrop-blur-[2px] duration-150 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogContent({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={clsx(
          "fixed top-1/2 left-1/2 z-50 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-0 text-foreground shadow-[var(--shadow-raised)] outline-none duration-150 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-header" className={clsx("p-5", className)} {...props} />;
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={clsx("flex justify-end gap-2 border-t border-border px-5 py-3", className)}
      {...props}
    />
  );
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={clsx("font-display text-base font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={clsx("mt-1.5 text-sm leading-relaxed text-muted", className)}
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  variant = "primary",
  size = "sm",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> &
  Parameters<typeof buttonClassName>[0]) {
  return (
    <AlertDialogPrimitive.Action
      data-slot="alert-dialog-action"
      className={buttonClassName({ variant, size, className })}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  variant = "secondary",
  size = "sm",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> &
  Parameters<typeof buttonClassName>[0]) {
  return (
    <AlertDialogPrimitive.Cancel
      data-slot="alert-dialog-cancel"
      className={buttonClassName({ variant, size, className })}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
};
