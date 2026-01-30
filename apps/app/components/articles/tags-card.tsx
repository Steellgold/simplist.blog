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
import { canExecuteAiAction } from "@/lib/ai/validators";

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
  const {
    isSuggesting,
    triggerSuggestions,
    applySuggestion,
    suggestions,
    clearSuggestions,
  } = useAISmartTagSuggestions({
    projectId,
    content: articleContent,
    tags,
    onTagsChange,
    availableTags,
    subscription,
  });

  // Check if AI is available
  const aiCheck = canExecuteAiAction(subscription);
  const aiEnabled = !!projectId && aiCheck.allowed;

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

        <div className="relative">
          <ArticleTagsInput
            value={tags}
            onChange={onTagsChange}
            availableTags={availableTags}
            placeholder="Add tag..."
            onCreateTag={onCreateTag}
          />

          {projectId && (
            <div className="absolute top-1.5 right-1.5">
              {isSuggesting ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon-xs"
                  disabled
                  className="size-6"
                >
                  <Spinner className="size-3" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="icon-xs"
                  onClick={triggerSuggestions}
                  disabled={!aiEnabled}
                  className="size-6"
                >
                  <SparklesFill className="size-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
