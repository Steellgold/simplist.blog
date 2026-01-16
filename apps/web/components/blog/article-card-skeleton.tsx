import { Skeleton } from "@simplist/ui/components/skeleton";
import { cn } from "@simplist/ui/lib/utils";

type Props = {
  className?: string;
};

export function ArticleCardSkeleton({ className }: Props) {
  return <Skeleton className="h-[550px] w-full rounded-2xl" />;
}
