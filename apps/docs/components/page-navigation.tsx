import { getDocsNavItems } from "@/lib/content";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

interface PageNavigationProps {
  currentHref: string;
}

export const PageNavigation: FC<PageNavigationProps> = async ({
  currentHref,
}) => {
  const allPages = await getDocsNavItems();

  const currentIndex = allPages.findIndex((page) => page.href === currentHref);

  const previousPage = currentIndex > 0 ? allPages[currentIndex - 1] : null;
  const nextPage =
    currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;

  if (!previousPage && !nextPage) {
    return null;
  }

  return (
    <div className="flex flex-row items-center justify-between gap-4">
      {previousPage ? (
        <Link
          href={previousPage.href}
          className={cn(
            "group hover:bg-accent/50 flex flex-1 flex-col gap-1 rounded-lg border p-4 transition-colors",
            "items-start text-left",
          )}
        >
          <div className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
            <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            Previous
          </div>
          <div className="text-base font-semibold">{previousPage.title}</div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {nextPage ? (
        <Link
          href={nextPage.href}
          className={cn(
            "group hover:bg-accent/50 flex flex-1 flex-col gap-1 rounded-lg border p-4 transition-colors",
            "items-end text-right",
          )}
        >
          <div className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
            Next
            <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </div>
          <div className="text-base font-semibold">{nextPage.title}</div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  );
};
