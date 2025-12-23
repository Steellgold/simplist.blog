"use client";

import {
  applyTagToArticles,
  getArticlesForTagAssignment,
  removeTagFromArticles,
  type ArticleForTagAssignment,
  type TagWithMetadata,
} from "@/lib/actions/tags";
import { Badge } from "@simplist/ui/components/badge";
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
  SelectListItemMeta,
  SelectListItemSubtitle,
  SelectListItemTitle,
  SelectListSearch,
} from "@simplist/ui/components/select-list";
import { toast } from "@simplist/ui/components/sonner";
import { Spinner } from "@simplist/ui/components/spinner";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";

interface TagApplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: TagWithMetadata;
  projectId: string;
}

export const TagApplyDialog: FC<TagApplyDialogProps> = ({
  open,
  onOpenChange,
  tag,
  projectId,
}) => {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleForTagAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(
    new Set(),
  );
  const [deselectedArticles, setDeselectedArticles] = useState<Set<string>>(
    new Set(),
  );

  // Load articles when dialog opens
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      setSearchQuery("");
      setSelectedArticles(new Set());
      setDeselectedArticles(new Set());

      getArticlesForTagAssignment(projectId, tag.id)
        .then((data) => {
          setArticles(data);
        })
        .catch(() => {
          toast.error("Failed to load articles");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, projectId, tag.id]);

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const isArticleSelected = (article: ArticleForTagAssignment) => {
    if (selectedArticles.has(article.id)) return true;
    if (deselectedArticles.has(article.id)) return false;
    return article.hasTag;
  };

  const toggleArticle = (articleId: string, currentlyHasTag: boolean) => {
    if (currentlyHasTag) {
      // Article already has tag - toggle deselection
      setDeselectedArticles((prev) => {
        const next = new Set(prev);
        if (next.has(articleId)) {
          next.delete(articleId);
        } else {
          next.add(articleId);
        }
        return next;
      });
      setSelectedArticles((prev) => {
        const next = new Set(prev);
        next.delete(articleId);
        return next;
      });
    } else {
      // Article doesn't have tag - toggle selection
      setSelectedArticles((prev) => {
        const next = new Set(prev);
        if (next.has(articleId)) {
          next.delete(articleId);
        } else {
          next.add(articleId);
        }
        return next;
      });
      setDeselectedArticles((prev) => {
        const next = new Set(prev);
        next.delete(articleId);
        return next;
      });
    }
  };

  const handleApply = async () => {
    const toAdd = Array.from(selectedArticles);
    const toRemove = Array.from(deselectedArticles);

    if (toAdd.length === 0 && toRemove.length === 0) {
      onOpenChange(false);
      return;
    }

    setIsApplying(true);

    try {
      let addedCount = 0;
      let removedCount = 0;

      if (toAdd.length > 0) {
        const addResult = await applyTagToArticles(tag.id, projectId, toAdd);
        if (!addResult.success) {
          toast.error(addResult.error || "Failed to apply tag");
          setIsApplying(false);
          return;
        }
        addedCount = addResult.appliedCount || 0;
      }

      if (toRemove.length > 0) {
        const removeResult = await removeTagFromArticles(
          tag.id,
          projectId,
          toRemove,
        );
        if (!removeResult.success) {
          toast.error(removeResult.error || "Failed to remove tag");
          setIsApplying(false);
          return;
        }
        removedCount = removeResult.removedCount || 0;
      }

      const messages: string[] = [];
      if (addedCount > 0) {
        messages.push(`Added to ${addedCount} article(s)`);
      }
      if (removedCount > 0) {
        messages.push(`Removed from ${removedCount} article(s)`);
      }

      toast.success(messages.join(", "));
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Failed to update articles");
    } finally {
      setIsApplying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="default">Published</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "scheduled":
        return <Badge variant="outline">Scheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const hasChanges = selectedArticles.size > 0 || deselectedArticles.size > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply tag to articles</DialogTitle>
          <DialogDescription>
            Select which articles should have the tag "{tag.name}".
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
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
                checked={isArticleSelected(article)}
                onCheckedChange={() =>
                  toggleArticle(article.id, article.hasTag)
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <SelectListItemTitle>{article.title}</SelectListItemTitle>
                    <SelectListItemSubtitle>
                      /{article.slug}
                    </SelectListItemSubtitle>
                  </div>
                  <SelectListItemMeta>
                    {getStatusBadge(article.status)}
                  </SelectListItemMeta>
                </div>
              </SelectListItem>
            ))}
          </SelectListContent>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={isApplying || !hasChanges}>
            {isApplying ? (
              <Spinner />
            ) : !hasChanges ? (
              "Apply changes"
            ) : (
              `Apply to ${selectedArticles.size + deselectedArticles.size} article${selectedArticles.size + deselectedArticles.size > 1 ? "s" : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
