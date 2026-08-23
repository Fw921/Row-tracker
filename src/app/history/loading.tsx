import { Card, CardListSkeleton, PageHeaderSkeleton, Skeleton } from "@/components/ui";

export default function HistoryLoading() {
  return (
    <div>
      <PageHeaderSkeleton withAction />
      <Card className="mb-4 p-3 sm:p-4">
        <div className="flex flex-wrap items-end gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-8 w-36 rounded-md" />
            </div>
          ))}
        </div>
      </Card>
      <CardListSkeleton rows={8} />
    </div>
  );
}
