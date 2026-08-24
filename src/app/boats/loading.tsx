import { Card, CardListSkeleton, PageHeaderSkeleton, Skeleton } from "@/components/ui";

export default function BoatsLoading() {
  return (
    <div>
      <PageHeaderSkeleton withIcon />
      <div className="max-w-2xl space-y-6">
        <Card className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <Skeleton className="h-8 flex-1 min-w-[10rem] rounded-md" />
            <Skeleton className="h-8 w-40 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </Card>
        <CardListSkeleton rows={4} />
      </div>
    </div>
  );
}
