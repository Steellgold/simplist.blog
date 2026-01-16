import { Skeleton } from "@simplist/ui/components/skeleton";
import { SectionWrapper } from "@/components/layout/section-wrapper";

const ArticleLoading = () => {
  return (
    <article className="space-y-12 py-8">
      <SectionWrapper>
        <header className="px-4">
          <div className="mx-auto max-w-4xl space-y-2 py-8">
            <div className="mb-5.5">
              <div className="mb-5.5 flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-md" />
              </div>

              <div className="mb-4 space-y-3">
                <Skeleton className="h-12 w-full md:h-14" />
                <Skeleton className="h-12 w-4/5 md:h-14" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </div>

            <div className="border-border/50 bg-secondary/10 flex flex-wrap items-center gap-2.5 rounded-xl border px-4 py-3 text-sm backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Skeleton className="size-6 rounded-md" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="size-3.5" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="size-3.5" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </header>
      </SectionWrapper>

      <SectionWrapper>
        <div className="space-y-12 px-4">
          <div className="mx-auto max-w-4xl">
            <div className="relative h-96 w-full overflow-hidden rounded-2xl">
              <Skeleton className="h-full w-full" />
            </div>

            <div className="mt-12 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />

              <div className="py-4">
                <Skeleton className="h-8 w-2/3" />
              </div>

              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />

              <div className="py-4">
                <Skeleton className="h-8 w-1/2" />
              </div>

              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <footer className="px-4">
          <div className="mx-auto max-w-4xl border-t pt-8">
            <div className="flex items-center gap-4">
              <Skeleton className="size-[42px] rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>
        </footer>
      </SectionWrapper>
    </article>
  );
};

export default ArticleLoading;
