"use client";

import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ArrowLeftIcon, File, RotateCcwIcon } from "lucide-react"
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { restoreArticle } from "@/lib/actions/articles";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  slug: string
  articleId: string
}

export const ArticleRestore = ({ slug, articleId }: Props) => {
  const router = useRouter();
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    setIsRestoring(true);

    try {
      toast.promise(restoreArticle(articleId), {
        loading: "Restoring article...",
        success: "Article restored successfully",
        error: () => {
          setIsRestoring(false);
          return "Failed to restore article";
        },
      });

      // Redirect to the articles list after successful restoration
      router.push(`/${slug}/articles`);
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
            <File />
          </EmptyMedia>
          <EmptyTitle>Article is in trash</EmptyTitle>
          <EmptyDescription>
            This article is in trash and is not accessible. You can restore it to make it available again.
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
                <RotateCcwIcon />
                Restore Article
              </>
            )}
          </Button>
        </EmptyContent>

        <Button
          variant="link"
          className="text-muted-foreground"
          size="sm"
          asChild
        >
          <Link href={`/${slug}/articles`}>
            <ArrowLeftIcon />
            Back to Articles
          </Link>
        </Button>
      </Empty>
    </div>
  )
}
