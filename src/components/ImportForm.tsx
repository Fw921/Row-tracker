"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ImportSummary = {
  imported: number;
  skippedCount: number;
  skipped: { rowIndex: number; reason: string }[];
};

export function ImportForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSummary(null);

    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Choose a CSV file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setSubmitting(true);
    try {
      const res = await fetch("/api/import/concept2", { method: "POST", body: formData });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body?.error ?? "Import failed");
      }

      setSummary(body);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-accent-foreground"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-60"
        >
          {submitting ? "Importing…" : "Import"}
        </button>
      </form>

      {error && <p className="text-sm text-positive">{error}</p>}

      {summary && (
        <div className="rounded-md border border-border bg-surface p-4 text-sm">
          <p className="font-medium">
            Imported {summary.imported} workout{summary.imported === 1 ? "" : "s"}.
            {summary.skippedCount > 0 && ` Skipped ${summary.skippedCount}.`}
          </p>
          {summary.skipped.length > 0 && (
            <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-xs text-muted">
              {summary.skipped.map((s, i) => (
                <li key={i}>
                  Row {s.rowIndex}: {s.reason}
                </li>
              ))}
            </ul>
          )}
          <a href="/history" className="mt-3 inline-block text-accent underline">
            View imported workouts →
          </a>
        </div>
      )}
    </div>
  );
}
