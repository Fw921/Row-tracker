import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WorkoutForm } from "@/components/WorkoutForm";
import { PageHeader } from "@/components/ui";

export default function LogPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Log a workout"
        description="Enter a 2k/5k test piece, a training row, or anything else off the erg monitor."
        action={
          <Link
            href="/log/team"
            className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-strong"
          >
            Logging for the whole boat? <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        }
      />
      <WorkoutForm />
    </div>
  );
}
