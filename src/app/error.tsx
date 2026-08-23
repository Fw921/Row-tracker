"use client";

import { useEffect } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button, Card } from "@/components/ui";

/** Catches any error thrown while rendering a route (this app has no
 * per-route error.tsx, so this one boundary covers every page). */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-positive/10 text-positive-strong">
        <TriangleAlert className="h-6 w-6" aria-hidden />
      </div>
      <h1 className="font-display text-lg font-semibold text-foreground">Something went wrong</h1>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        This page hit an error loading your data. It&apos;s usually temporary — try again, and if it
        keeps happening the details below can help track it down.
      </p>
      <Button onClick={reset} className="mt-5">
        <RefreshCw className="h-4 w-4" aria-hidden />
        Try again
      </Button>
      {error.message && (
        <Card className="mt-6 w-full overflow-x-auto p-3 text-left">
          <code className="text-xs text-muted">{error.message}</code>
        </Card>
      )}
    </div>
  );
}
