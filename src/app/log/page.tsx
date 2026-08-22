import { WorkoutForm } from "@/components/WorkoutForm";

export default function LogPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-xl font-semibold">Log a workout</h1>
      <p className="mb-6 text-sm text-muted">
        Enter a 2k/5k test piece, a training row, or anything else off the erg monitor.
      </p>
      <WorkoutForm />
    </div>
  );
}
