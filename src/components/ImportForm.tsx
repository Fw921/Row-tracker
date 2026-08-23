"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, Upload, X } from "lucide-react";
import { Alert, Button, Card } from "@/components/ui";

type ImportSummary = {
  imported: number;
  skippedCount: number;
  skipped: { rowIndex: number; reason: string }[];
};

export function ImportForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSummary(null);

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
      setFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          {...(!file && {
            role: "button",
            tabIndex: 0,
            onClick: () => inputRef.current?.click(),
            onKeyDown: (e: React.KeyboardEvent) =>
              (e.key === "Enter" || e.key === " ") && inputRef.current?.click(),
          })}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
            file ? "" : "cursor-pointer"
          } ${dragging ? "border-accent bg-accent-soft" : "border-border hover:border-border-strong hover:bg-background"}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <>
              <FileText className="h-6 w-6 text-accent" aria-hidden />
              <p className="text-sm font-medium text-foreground">{file.name}</p>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="flex cursor-pointer items-center gap-1 text-xs text-muted hover:text-positive"
              >
                <X className="h-3 w-3" aria-hidden /> remove
              </button>
            </>
          ) : (
            <>
              <Upload className="h-6 w-6 text-muted" aria-hidden />
              <p className="text-sm font-medium text-foreground">
                Drag and drop your CSV, or click to browse
              </p>
              <p className="text-xs text-muted">Exported from log.concept2.com</p>
            </>
          )}
        </div>
        <Button type="submit" disabled={submitting || !file}>
          <Upload className="h-4 w-4" aria-hidden />
          {submitting ? "Importing…" : "Import"}
        </Button>
      </form>

      {error && <Alert>{error}</Alert>}

      {summary && (
        <Card className="p-4 text-sm">
          <p className="flex items-center gap-1.5 font-medium text-foreground">
            <CheckCircle2 className="h-4 w-4 text-negative" aria-hidden />
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
          <a href="/history" className="mt-3 inline-block text-sm font-medium text-accent hover:text-accent-strong">
            View imported workouts →
          </a>
        </Card>
      )}
    </div>
  );
}
