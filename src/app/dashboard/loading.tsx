import { Card, PageHeaderSkeleton, Skeleton, StatGridSkeleton } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <div>
      <PageHeaderSkeleton withAction />
      <div className="space-y-8">
        <StatGridSkeleton count={4} />
        <Card className="p-4 sm:p-5">
          <Skeleton className="mb-3 h-4 w-40" />
          <Skeleton className="h-60 w-full" />
        </Card>
      </div>
    </div>
  );
}
