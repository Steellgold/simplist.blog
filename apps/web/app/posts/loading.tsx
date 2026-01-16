import { Skeleton } from "@simplist/ui/components/skeleton";
import { ArticleCardSkeleton } from "@/components/blog/article-card-skeleton";
import { SectionWrapper } from "@/components/layout/section-wrapper";

export default function PostsLoading() {
  return (
    <>
      <SectionWrapper>
        <section className="px-4 py-4">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-16 rounded-full" />
              <Skeleton className="h-9 w-24 rounded-full" />
              <Skeleton className="h-9 w-20 rounded-full" />
            </div>
          </div>
        </section>

        <section className="space-y-8 px-4">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <ArticleCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
      </SectionWrapper>
    </>
  );
}
