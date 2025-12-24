"use client";

import { restoreArticle } from "@/lib/actions/articles";
import { ArrowLeft, ArrowsRotateLeft, FileXmark } from "@gravity-ui/icons";
import { Button, buttonVariants } from "@simplist/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@simplist/ui/components/empty";
import { Spinner } from "@simplist/ui/components/spinner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  slug: string;
  articleId: string;
};

export const ArticleRestore = ({ slug, articleId }: Props) => {
  const router = useRouter();
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    setIsRestoring(true);

    try {
      toast.promise(restoreArticle(articleId, slug), {
        loading: "Restoring article...",
        success: () => {
          setIsRestoring(false);
          // Refresh the router to show updated data
          router.refresh();
          // Redirect to the articles list after successful restoration
          router.push(`/${slug}/articles`);
          return "Article restored successfully";
        },
        error: () => {
          setIsRestoring(false);
          return "Failed to restore article";
        },
      });
    } catch (error) {
      // Error is already handled by toast.promise
      console.error("Failed to restore article:", error);
    }
  };

  return (
    <div className="flex min-h-[calc(90vh-4rem)] items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileXmark />
          </EmptyMedia>
          <EmptyTitle>Article is in trash</EmptyTitle>
          <EmptyDescription>
            This article is in trash and is not accessible. You can restore it
            to make it available again.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent>
          <Button onClick={handleRestore} disabled={isRestoring}>
            {isRestoring ? (
              <>
                <Spinner />
                Restoring...
              </>
            ) : (
              <>
                <ArrowsRotateLeft />
                Restore Article
              </>
            )}
          </Button>
        </EmptyContent>

        <Link
          className={buttonVariants({ variant: "link" })}
          href={`/${slug}/articles`}
        >
          <ArrowLeft />
          Back to Articles
        </Link>
      </Empty>
    </div>
  );
};
