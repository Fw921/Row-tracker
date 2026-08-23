import { Card, PageHeaderSkeleton, Skeleton, StatGridSkeleton } from "@/components/ui";

export default function WorkoutDetailLoading() {
  return (
    <div className="max-w-3xl">
      <Skeleton className="mb-2 h-4 w-20" />
      <PageHeaderSkeleton withAction />
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="mb-8">
        <StatGridSkeleton count={8} />
      </div>
      <Card className="p-4">
        <Skeleton className="h-52 w-full" />
      </Card>
    </div>
  );
}
