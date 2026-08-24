import { CardListSkeleton, PageHeaderSkeleton } from "@/components/ui";

export default function TeamLoading() {
  return (
    <div>
      <PageHeaderSkeleton withAction withIcon />
      <CardListSkeleton rows={5} />
    </div>
  );
}
