"use client";

import { deleteArticle } from "@/lib/actions/articles";
import { TrashBin } from "@gravity-ui/icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@simplist/ui/components/alert-dialog";
import { buttonVariants } from "@simplist/ui/components/button";
import { toast } from "@simplist/ui/components/sonner";
import { Spinner } from "@simplist/ui/components/spinner";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteArticleButtonProps = {
  articleId: string;
  articleTitle: string;
  projectSlug: string;
  variant?: "default" | "ghost" | "outline" | "destructive";
  size?: "sm" | "default" | "lg";
  className?: string;
};

export const DeleteArticleButton = ({
  articleId,
  articleTitle,
  projectSlug,
  variant = "outline",
  size = "sm",
  className,
}: DeleteArticleButtonProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting article...");

    try {
      await deleteArticle(articleId, projectSlug);

      toast.success("Article deleted successfully", { id: toastId });
      setIsOpen(false);
      router.push(`/${projectSlug}/articles`);
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Failed to delete article", { id: toastId });
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger
        className={buttonVariants({ variant, size, className })}
      >
        <TrashBin />
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the article{" "}
            <span className="text-foreground font-semibold">
              &quot;{articleTitle}&quot;
            </span>
            . This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className={buttonVariants({ variant: "destructive" })}
          >
            {isDeleting ? (
              <>
                <Spinner />
                Deleting...
              </>
            ) : (
              <>
                <TrashBin />
                Delete Article
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
