import { ImportForm } from "@/components/ImportForm";
import { PageHeader } from "@/components/ui";

export default function ImportPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader
        eyebrow="Bulk import"
        title="Import from Concept2 Logbook"
        description={
          <>
            From{" "}
            <a
              href="https://log.concept2.com"
              className="text-accent underline"
              target="_blank"
              rel="noreferrer"
            >
              log.concept2.com
            </a>
            , open a season and use &quot;Download&quot; to export a CSV, then upload it
            here. Each row becomes one workout. Concept2&apos;s bulk export doesn&apos;t
            include per-500m splits, so imported pieces won&apos;t have a pacing
            breakdown — add splits by hand on the log page if you want that for a given
            piece.
          </>
        }
      />
      <ImportForm />
    </div>
  );
}
