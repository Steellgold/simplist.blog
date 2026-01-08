"use client";

import { createDraft } from "@/lib/actions/articles";
import { Plus } from "@gravity-ui/icons";
import { Button } from "@simplist/ui/components/button";
import { Kbd } from "@simplist/ui/components/kbd";
import { ProgressButton } from "@simplist/ui/components/progress-button";
import { toast } from "@simplist/ui/components/sonner";
import { Spinner } from "@simplist/ui/components/spinner";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CreateArticleButtonProps = {
  projectId: string;
  projectSlug: string;
  variant?: "default" | "ghost" | "outline";
  disabled?: boolean;
  // Progress props (optional - for plans with article limits)
  showProgress?: boolean;
  currentCount?: number;
  maxCount?: number;
};

export const CreateArticleButton = ({
  projectId,
  projectSlug,
  variant = "default",
  disabled = false,
  showProgress = false,
  currentCount = 0,
  maxCount = -1,
}: CreateArticleButtonProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    setIsCreating(true);
    const toastId = toast.loading("Creating new article...");

    try {
      const result = await createDraft(projectId);

      if ("error" in result) {
        toast.error(result.error, { id: toastId });
        setIsCreating(false);
        return;
      }

      toast.success("Article created!", { id: toastId });
      router.push(`/${projectSlug}/articles/${result.slug}`);
    } catch (error) {
      console.error("Error creating article:", error);
      toast.error("Failed to create article", { id: toastId });
      setIsCreating(false);
    }
  };

  // If showProgress and maxCount is set, use ProgressButton
  if (showProgress && maxCount !== -1) {
    return (
      <ProgressButton
        variant={variant}
        onClick={handleCreate}
        disabled={disabled || isCreating}
        value={currentCount}
        min={0}
        max={maxCount === currentCount ? -1 : maxCount}
      >
        {isCreating ? <Spinner /> : <Plus />}
        Article <Kbd>{currentCount}/{maxCount}</Kbd>
      </ProgressButton>
    );
  }

  // Otherwise, use regular Button
  return (
    <Button
      variant={variant}
      onClick={handleCreate}
      disabled={disabled || isCreating}
    >
      {isCreating ? <Spinner /> : <Plus />}
      Article
    </Button>
  );
};
