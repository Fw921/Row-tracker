"use client";

// Adapted from shadcn/ui's sheet (via 21st.dev), restyled onto this app's
// own design tokens instead of shadcn's separate palette — same pattern as
// alert-dialog.tsx and tabs.tsx. A slide-over panel, built on Radix Dialog
// (there's no separate Radix "Sheet" primitive; shadcn's Sheet is just a
// Dialog with side-anchored positioning and slide animation).
import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";
import clsx from "clsx";

function Sheet({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="sheet-overlay"
      className={clsx(
        "fixed inset-0 z-50 bg-foreground/30 backdrop-blur-[2px] duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        className={clsx(
          "fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-[var(--shadow-raised)] outline-none duration-200 data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-4 right-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
          <X className="h-4 w-4" aria-hidden />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={clsx("flex flex-col gap-1.5 border-b border-border p-5", className)}
      {...props}
    />
  );
}

function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-body"
      className={clsx("flex-1 overflow-y-auto p-5", className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={clsx("font-display text-base font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={clsx("text-sm text-muted", className)}
      {...props}
    />
  );
}

export { Sheet, SheetContent, SheetHeader, SheetBody, SheetTitle, SheetDescription };
