"use client";

import {
  applyMediaAsBanner,
  getProjectArticles,
  type MediaItem,
} from "@/lib/actions/media";
import { Check, FileText } from "@gravity-ui/icons";
import { Button } from "@simplist/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@simplist/ui/components/dialog";
import {
  SelectListContent,
  SelectListItem,
  SelectListItemSubtitle,
  SelectListItemThumbnail,
  SelectListItemTitle,
  SelectListSearch,
} from "@simplist/ui/components/select-list";
import { Spinner } from "@simplist/ui/components/spinner";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ApplyBannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: MediaItem;
  projectId: string;
}

type Article = {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
};

export const ApplyBannerDialog = ({
  open,
  onOpenChange,
  media,
  projectId,
}: ApplyBannerDialogProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      setSelectedArticleId(null);
      setSearchQuery("");

      getProjectArticles(projectId)
        .then(setArticles)
        .catch(() => {
          toast.error("Failed to load articles");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, projectId]);

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelectArticle = (articleId: string) => {
    setSelectedArticleId((prev) => (prev === articleId ? null : articleId));
  };

  const handleApply = async () => {
    if (!selectedArticleId) return;

    setIsApplying(true);

    try {
      const result = await applyMediaAsBanner(media.id, selectedArticleId);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Banner applied successfully");
      onOpenChange(false);
    } catch {
      toast.error("Failed to apply banner");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply as banner</DialogTitle>
          <DialogDescription>
            Select an article to use this image as its banner.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="bg-muted relative h-32 w-full shrink-0 overflow-hidden rounded-md">
            <Image
              src={media.url}
              alt={media.filename}
              fill
              className="object-cover"
              sizes="(max-width: 448px) 100vw, 448px"
            />
          </div>

          <SelectListSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search articles..."
          />

          <SelectListContent
            isLoading={isLoading}
            isEmpty={filteredArticles.length === 0}
            emptyMessage={
              searchQuery ? "No articles found" : "No articles in project"
            }
          >
            {filteredArticles.map((article) => (
              <SelectListItem
                key={article.id}
                id={article.id}
                checked={selectedArticleId === article.id}
                onCheckedChange={() => handleSelectArticle(article.id)}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <SelectListItemThumbnail
                    src={article.coverImage || undefined}
                    alt={article.title}
                    variant="landscape"
                    fallback={
                      <FileText className="text-muted-foreground h-4 w-4" />
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <SelectListItemTitle>{article.title}</SelectListItemTitle>
                    <SelectListItemSubtitle>
                      /{article.slug}
                    </SelectListItemSubtitle>
                  </div>
                  {selectedArticleId === article.id && (
                    <Check className="text-primary h-4 w-4 shrink-0" />
                  )}
                </div>
              </SelectListItem>
            ))}
          </SelectListContent>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isApplying}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!selectedArticleId || isApplying}
          >
            {isApplying ? <Spinner /> : "Apply banner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
