import { CardListSkeleton, PageHeaderSkeleton } from "@/components/ui";

export default function TeamLoading() {
  return (
    <div>
      <PageHeaderSkeleton withAction />
      <CardListSkeleton rows={5} />
    </div>
  );
}
