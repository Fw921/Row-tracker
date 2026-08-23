import Link from "next/link";
import { WorkoutForm } from "@/components/WorkoutForm";
import { PageHeader } from "@/components/ui";

export default function LogPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Log a workout"
        description="Enter a 2k/5k test piece, a training row, or anything else off the erg monitor."
        action={
          <Link href="/log/team" className="text-sm text-accent underline underline-offset-2">
            Logging for the whole boat? →
          </Link>
        }
      />
      <WorkoutForm />
    </div>
  );
}
