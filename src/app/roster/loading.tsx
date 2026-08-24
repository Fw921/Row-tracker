import { Card, CardListSkeleton, PageHeaderSkeleton, Skeleton } from "@/components/ui";

export default function RosterLoading() {
  return (
    <div>
      <PageHeaderSkeleton withIcon />
      <div className="max-w-lg space-y-6">
        <Card className="p-4">
          <div className="flex gap-2">
            <Skeleton className="h-8 flex-1 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        </Card>
        <CardListSkeleton rows={5} />
      </div>
    </div>
  );
}
