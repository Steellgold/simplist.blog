"use client";

import { type ProjectSubscription } from "@/lib/subscription/quota-check";
import { cn } from "@/lib/utils";
import { SparklesFill, Xmark } from "@gravity-ui/icons";
import { type Tag } from "@simplist/db";
import { Button } from "@simplist/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@simplist/ui/components/card";
import { IconRender } from "@simplist/ui/components/icon-renderer";
import { Kbd } from "@simplist/ui/components/kbd";
import { Spinner } from "@simplist/ui/components/spinner";
import { getTagColorClasses } from "@simplist/ui/lib/color";
import { IconsEnumType } from "@simplist/ui/lib/icons.enum";
import { Plus } from "lucide-react";
import { type FC } from "react";
import { ArticleTagsInput } from "./article-tags-input";
import { useAISmartTagSuggestions } from "./hooks/use-ai-smart-tag-suggestions";

type ArticleTagsCardProps = {
  tags: Tag[];
  availableTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  onCreateTag: (name: string) => Promise<Tag | null>;
  // AI-related props
  projectId?: string;
  articleContent?: string;
  subscription?: ProjectSubscription;
};

export const ArticleTagsCard: FC<ArticleTagsCardProps> = ({
  tags,
  availableTags,
  projectId,
  articleContent,
  subscription,
  onTagsChange,
  onCreateTag,
}) => {
  const { isSuggesting, applySuggestion, suggestions, clearSuggestions } =
    useAISmartTagSuggestions({
      projectId,
      content: articleContent,
      tags,
      onTagsChange,
      availableTags,
      subscription,
    });

  const handleApplySuggestion = async (suggestion: (typeof suggestions)[0]) => {
    await applySuggestion(suggestion);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tags</CardTitle>
        <CardDescription>
          Add tags to help organize and categorize your content.
        </CardDescription>

        <CardAction>
          {isSuggesting && (
            <Button variant="outline" size="xs" disabled>
              <Spinner />
              Suggesting tags...
            </Button>
          )}

          {suggestions.length > 0 && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => clearSuggestions()}
            >
              <Xmark className="size-4" />
              Clear
            </Button>
          )}
        </CardAction>
      </CardHeader>

      <CardContent>
        {suggestions.length > 0 && (
          <div className="mt-1.5 mb-2 rounded-md border p-2">
            <span className="text-muted-foreground bg-accent -mt-5 mb-1.5 flex w-fit items-center gap-1.5 rounded-md p-0.5 pr-1.5 text-sm font-medium">
              <Kbd className="size-5">
                <SparklesFill className="size-4" />
              </Kbd>
              Smart Suggestions
            </span>

            <div className="flex flex-wrap gap-1">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={`${suggestion.word}-${idx}`}
                  type="button"
                  onClick={() => handleApplySuggestion(suggestion)}
                  className={cn(
                    "group flex items-center gap-1 rounded border px-1.5 py-0.5 text-sm transition-colors",
                    suggestion.color
                      ? getTagColorClasses(suggestion.color)
                      : "",
                  )}
                >
                  <IconRender
                    name={(suggestion.icon || "tag") as IconsEnumType}
                    className="group-hover:hidden"
                    size={12}
                  />

                  <Plus className="hidden size-3.5 group-hover:block" />

                  <span>{suggestion.word}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <ArticleTagsInput
          value={tags}
          onChange={onTagsChange}
          availableTags={availableTags}
          placeholder="Add tag..."
          onCreateTag={onCreateTag}
        />
      </CardContent>
    </Card>
  );
};
