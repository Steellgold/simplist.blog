import { suggestTags } from "@/lib/actions/ai";
import { canExecuteAiAction } from "@/lib/ai/validators";
import { type ProjectSubscription } from "@/lib/subscription/quota-check";
import { analyzeContentForAI } from "@/lib/utils/text-analysis";
import { type Color, type Tag } from "@simplist/db";
import { toast } from "@simplist/ui/components/sonner";
import { useCallback, useEffect, useRef, useState } from "react";

type AISmartTagSuggestionsProps = {
  projectId?: string;
  content?: string;
  tags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  availableTags: Tag[];
  subscription?: ProjectSubscription;
};

type SuggestionData = {
  word: string;
  type: "existing" | "new";
  tagId?: string;
  icon?: string;
  color?: Color | null;
  confidence?: number;
};

export const useAISmartTagSuggestions = ({
  projectId,
  content,
  tags,
  onTagsChange,
  availableTags,
  subscription,
}: AISmartTagSuggestionsProps) => {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionData[]>([]);
  const requestIdRef = useRef(0);

  // Track all suggestions ever made by AI (to restore them if user removes tag)
  const allAISuggestionsRef = useRef<SuggestionData[]>([]);

  // Analyze content
  const analyzeContent = useCallback(
    async (text: string, requestId: number) => {
      if (!projectId || !text) return;

      // Check if we can use AI
      const validation = canExecuteAiAction(subscription);
      if (!validation.allowed) {
        toast.error(validation.reason || "AI unavailable");
        return;
      }

      setIsSuggesting(true);

      try {
        // Analyze content to see if it justifies an AI call
        const smartContext = analyzeContentForAI(text);

        if (smartContext) {
          // Call AI with smart context
          const result = await suggestTags(projectId, smartContext);

          // If this is not the last request, ignore the result
          if (requestId !== requestIdRef.current) {
            return;
          }

          if (result.success && result.data) {
            const { suggestedTagIds, newTagSuggestions } = result.data;

            // Map suggestions to unified format
            const mappedSuggestions: SuggestionData[] = [];

            // Existing tags
            suggestedTagIds.forEach((tagId) => {
              const tag = availableTags.find((t) => t.id === tagId);
              if (tag) {
                // Don't suggest already added tags
                const alreadyAdded = tags.some((t) => t.id === tag.id);
                if (!alreadyAdded) {
                  mappedSuggestions.push({
                    word: tag.name,
                    type: "existing",
                    tagId: tag.id,
                    icon: tag.icon || "tag",
                    color: tag.color || undefined,
                  });
                }
              }
            });

            // New tags with AI-suggested icons and colors
            newTagSuggestions.forEach((suggestion) => {
              // Don't suggest new tags with same name as already added tags
              const alreadyAdded = tags.some(
                (t) => t.name.toLowerCase() === suggestion.name.toLowerCase(),
              );
              if (!alreadyAdded) {
                mappedSuggestions.push({
                  word: suggestion.name,
                  type: "new",
                  icon: suggestion.icon,
                  color: suggestion.color,
                  confidence: suggestion.confidence,
                });
              }
            });

            // Sort by confidence (highest first)
            mappedSuggestions.sort((a, b) => {
              const confA = a.confidence ?? 0.5;
              const confB = b.confidence ?? 0.5;
              return confB - confA;
            });

            setSuggestions(mappedSuggestions);
            // Store all AI suggestions for potential restoration
            allAISuggestionsRef.current = mappedSuggestions;

            if (mappedSuggestions.length > 0) {
              toast.success(
                `Found ${mappedSuggestions.length} tag suggestions`,
              );
            }
          } else if (!result.success) {
            // Only show error if it's something the user needs to know about
            if (result.error && !result.error.includes("Quota")) {
              toast.error(result.error);
            }
          }
        } else {
          // Not enough relevant content
          setSuggestions([]);
        }
      } catch (error) {
        console.error("AI tag suggestion error:", error);
        toast.error("Failed to analyze content for tags");
      } finally {
        // Only set to false if this is still the latest request
        if (requestId === requestIdRef.current) {
          setIsSuggesting(false);
        }
      }
    },
    [projectId, availableTags, subscription, tags],
  );

  // Restore AI suggestions if user removes a tag that was suggested
  useEffect(() => {
    if (allAISuggestionsRef.current.length === 0) return;

    // Find suggestions that should be restored (were suggested but not in current tags)
    const suggestionsToRestore = allAISuggestionsRef.current.filter(
      (suggestion) => {
        if (suggestion.type === "existing" && suggestion.tagId) {
          // Check if this existing tag is still in the tags list
          return !tags.some((t) => t.id === suggestion.tagId);
        } else if (suggestion.type === "new") {
          // Check if a tag with this name exists in tags
          return !tags.some(
            (t) => t.name.toLowerCase() === suggestion.word.toLowerCase(),
          );
        }
        return false;
      },
    );

    // Update suggestions to show only non-added tags
    setSuggestions(suggestionsToRestore);
  }, [tags]);

  // Manual trigger function for the button
  const triggerSuggestions = useCallback(() => {
    if (!content) {
      toast.error("Add some content first to get tag suggestions");
      return;
    }

    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;
    analyzeContent(content, currentRequestId);
  }, [content, analyzeContent]);

  const applySuggestion = useCallback(
    async (suggestion: SuggestionData) => {
      try {
        if (suggestion.type === "existing" && suggestion.tagId) {
          // Add existing tag
          const existingTag = availableTags.find(
            (t) => t.id === suggestion.tagId,
          );
          if (existingTag) {
            const alreadyAdded = tags.some((t) => t.id === existingTag.id);
            if (!alreadyAdded) {
              onTagsChange([...tags, existingTag]);
              setSuggestions((prev) => prev.filter((s) => s !== suggestion));
              toast.success(`Tag "${existingTag.name}" added`);
            }
          }
        } else if (suggestion.type === "new") {
          // Create temporary tag (will be saved when article is submitted)
          const tempTag: Tag = {
            id: `temp-${Date.now()}`,
            name: suggestion.word,
            slug: null,
            description: null,
            icon: suggestion.icon || "tag",
            color: suggestion.color || null,
            projectId: projectId!,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          onTagsChange([...tags, tempTag]);
          setSuggestions((prev) => prev.filter((s) => s !== suggestion));
        }
      } catch (error) {
        console.error("Failed to apply suggestion:", error);
        toast.error(`Failed to add tag "${suggestion.word}"`);
      }
    },
    [tags, availableTags, projectId, onTagsChange],
  );

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    allAISuggestionsRef.current = [];
  }, []);

  return {
    isSuggesting,
    triggerSuggestions,
    applySuggestion,
    clearSuggestions,
    hasSuggestions: suggestions.length > 0,
    suggestions,
  };
};
