import { Card, PageHeaderSkeleton, Skeleton } from "@/components/ui";

export default function LogTeamLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <div className="max-w-3xl space-y-6">
        <Card className="p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
            ))}
          </div>
        </Card>
        <Card className="overflow-hidden">
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
