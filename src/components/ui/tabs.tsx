"use client";

// Adapted from shadcn/ui's tabs (via 21st.dev), restyled onto this app's own
// tokens and simplified to the one shape this app actually uses (a
// horizontal pill switcher) — replaces the hand-rolled SegmentedControl in
// ui.tsx with a real Radix Tabs.Root underneath: roving-tabindex arrow-key
// navigation and ARIA tablist semantics for free, instead of a button group
// that only approximated them.
import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import clsx from "clsx";

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={clsx("flex flex-col gap-2", className)} {...props} />;
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={clsx(
        "inline-flex w-fit items-center rounded-lg border border-border bg-background p-0.5 text-sm",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={clsx(
        "cursor-pointer rounded-md px-3 py-1.5 font-medium text-muted transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-surface data-[state=active]:text-accent data-[state=active]:shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={clsx("outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
