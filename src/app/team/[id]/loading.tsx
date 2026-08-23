import { Card, CardListSkeleton, PageHeaderSkeleton, Skeleton } from "@/components/ui";

export default function TeamPieceLoading() {
  return (
    <div className="max-w-3xl">
      <Skeleton className="mb-2 h-4 w-24" />
      <PageHeaderSkeleton withAction />
      <Card className="mb-6 p-4 sm:p-5">
        <Skeleton className="mb-3 h-4 w-40" />
        <Skeleton className="h-40 w-full" />
      </Card>
      <CardListSkeleton rows={6} />
    </div>
  );
}
