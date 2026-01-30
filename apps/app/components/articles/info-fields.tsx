"use client";

import { Lock, LockOpen } from "@gravity-ui/icons";
import {
  correctContent,
  generateExcerpt,
  generateTitleSuggestions,
  rewriteContent,
} from "@/lib/actions/ai";
import { REWRITE_STYLES, type RewriteStyle } from "@/lib/ai/constants";
import {
  canExecuteAiAction,
  hasMinimumContentLength,
} from "@/lib/ai/validators";
import { type ProjectSubscription } from "@/lib/subscription/quota-check";
import { getLanguageName, type LanguageCode } from "@/lib/types/languages";
import {
  ArrowUturnCcwLeft,
  FontCursor,
  SparklesFill,
  SquareDashedText,
  SquareHashtag,
  TextAlignCenter,
} from "@gravity-ui/icons";
import { Button } from "@simplist/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@simplist/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@simplist/ui/components/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "@simplist/ui/components/input-group";
import { Label } from "@simplist/ui/components/label";
import { toast } from "@simplist/ui/components/sonner";
import { Spinner } from "@simplist/ui/components/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@simplist/ui/components/tooltip";
import { useCallback, useState } from "react";

type ArticleInfoFieldsProps = {
  title: string;
  excerpt: string;
  onTitleChange: (value: string) => void;
  onExcerptChange: (value: string) => void;
  cardDescription?: string;
  // AI-related props
  projectId?: string;
  articleContent?: string;
  subscription?: ProjectSubscription;
  activeVariant?: LanguageCode;
  defaultLanguage?: LanguageCode;
};

export const ArticleInfoFields = ({
  title,
  excerpt,
  onTitleChange,
  onExcerptChange,
  cardDescription = "This is the main information of the post.",
  projectId,
  articleContent,
  subscription,
  activeVariant,
  defaultLanguage = "en",
}: ArticleInfoFieldsProps) => {
  // AI loading states
  const [isLoadingTitle, setIsLoadingTitle] = useState(false);
  const [isLoadingExcerpt, setIsLoadingExcerpt] = useState(false);

  // Undo states (for title suggestions)
  const [previousTitle, setPreviousTitle] = useState<string | null>(null);
  const [previousExcerpt, setPreviousExcerpt] = useState<string | null>(null);

  // Check if AI is available
  const aiCheck = canExecuteAiAction(subscription);
  const aiEnabled = !!projectId && aiCheck.allowed;

  // Get the language to use for AI (active variant or default)
  const getLanguageForAi = useCallback(() => {
    // If there's an active variant different from default, use it
    if (activeVariant && activeVariant !== defaultLanguage) {
      return getLanguageName(activeVariant);
    }

    // Otherwise use the project's default language
    return getLanguageName(defaultLanguage);
  }, [activeVariant, defaultLanguage]);

  // Handle title correction
  const handleCorrectTitle = useCallback(async () => {
    if (!projectId || !hasMinimumContentLength(title, 3)) {
      toast.error("Title is too short to correct");
      return;
    }

    setIsLoadingTitle(true);
    setPreviousTitle(title);

    try {
      const language = getLanguageForAi();
      const result = await correctContent(projectId, title, language, "title");

      if (result.success) {
        onTitleChange(result.data.correctedContent);
        if (result.data.corrections.length > 0) {
          toast.success(`Fixed ${result.data.corrections.length} issue(s)`);
        } else {
          toast.info("No corrections needed");
          setPreviousTitle(null);
        }
      } else {
        toast.error(result.error);
        setPreviousTitle(null);
      }
    } catch (error) {
      toast.error("Failed to correct title");
      setPreviousTitle(null);
    } finally {
      setIsLoadingTitle(false);
    }
  }, [projectId, title, onTitleChange, getLanguageForAi]);

  // Handle title rewrite
  const handleRewriteTitle = useCallback(
    async (style: RewriteStyle) => {
      if (!projectId || !hasMinimumContentLength(title, 3)) {
        toast.error("Title is too short to rewrite");
        return;
      }

      setIsLoadingTitle(true);
      setPreviousTitle(title);

      try {
        const result = await rewriteContent(projectId, title, style, "title");

        if (result.success) {
          onTitleChange(result.data.rewrittenContent);
          toast.success(`Title rewritten in ${style} style`);
        } else {
          toast.error(result.error);
          setPreviousTitle(null);
        }
      } catch (error) {
        toast.error("Failed to rewrite title");
        setPreviousTitle(null);
      } finally {
        setIsLoadingTitle(false);
      }
    },
    [projectId, title, onTitleChange],
  );

  // Handle SEO title suggestions
  const handleSeoTitle = useCallback(async () => {
    if (!projectId) {
      toast.error("Project not configured");
      return;
    }

    // Use article content if available, otherwise use the title
    const contentForAnalysis = articleContent || title;
    if (!hasMinimumContentLength(contentForAnalysis, 10)) {
      toast.error("Need more content to generate SEO suggestions");
      return;
    }

    setIsLoadingTitle(true);
    setPreviousTitle(title);

    try {
      const result = await generateTitleSuggestions(
        projectId,
        contentForAnalysis,
        title || undefined,
      );

      if (result.success && result.data.titles.length > 0) {
        // Pick the first suggestion and apply it directly
        const bestSuggestion = result.data.titles[0];
        if (bestSuggestion) {
          onTitleChange(bestSuggestion.title);
          toast.success("SEO-optimized title applied", {
            description: bestSuggestion.reason,
          });
        }
      } else {
        toast.error(result.success ? "No suggestions generated" : result.error);
        setPreviousTitle(null);
      }
    } catch (error) {
      toast.error("Failed to generate SEO title");
      setPreviousTitle(null);
    } finally {
      setIsLoadingTitle(false);
    }
  }, [projectId, title, articleContent, onTitleChange]);

  // Handle undo title
  const handleUndoTitle = useCallback(() => {
    if (previousTitle !== null) {
      onTitleChange(previousTitle);
      setPreviousTitle(null);
      toast.info("Title restored");
    }
  }, [previousTitle, onTitleChange]);

  // Handle excerpt correction
  const handleCorrectExcerpt = useCallback(async () => {
    if (!projectId || !hasMinimumContentLength(excerpt, 5)) {
      toast.error("Excerpt is too short to correct");
      return;
    }

    setIsLoadingExcerpt(true);
    setPreviousExcerpt(excerpt);

    try {
      const language = getLanguageForAi();
      const result = await correctContent(
        projectId,
        excerpt,
        language,
        "excerpt",
      );

      if (result.success) {
        onExcerptChange(result.data.correctedContent);
        if (result.data.corrections.length > 0) {
          toast.success(`Fixed ${result.data.corrections.length} issue(s)`);
        } else {
          toast.info("No corrections needed");
          setPreviousExcerpt(null);
        }
      } else {
        toast.error(result.error);
        setPreviousExcerpt(null);
      }
    } catch (error) {
      toast.error("Failed to correct excerpt");
      setPreviousExcerpt(null);
    } finally {
      setIsLoadingExcerpt(false);
    }
  }, [projectId, excerpt, onExcerptChange, getLanguageForAi]);

  // Handle excerpt rewrite
  const handleRewriteExcerpt = useCallback(
    async (style: RewriteStyle) => {
      if (!projectId || !hasMinimumContentLength(excerpt, 5)) {
        toast.error("Excerpt is too short to rewrite");
        return;
      }

      setIsLoadingExcerpt(true);
      setPreviousExcerpt(excerpt);

      try {
        const result = await rewriteContent(
          projectId,
          excerpt,
          style,
          "excerpt",
        );

        if (result.success) {
          onExcerptChange(result.data.rewrittenContent);
          toast.success(`Excerpt rewritten in ${style} style`);
        } else {
          toast.error(result.error);
          setPreviousExcerpt(null);
        }
      } catch (error) {
        toast.error("Failed to rewrite excerpt");
        setPreviousExcerpt(null);
      } finally {
        setIsLoadingExcerpt(false);
      }
    },
    [projectId, excerpt, onExcerptChange],
  );

  // Handle generate excerpt from content
  const handleGenerateExcerpt = useCallback(async () => {
    if (!projectId) {
      toast.error("Project not configured");
      return;
    }

    // Need article content to generate excerpt
    const contentForAnalysis = articleContent || title;
    if (!hasMinimumContentLength(contentForAnalysis, 20)) {
      toast.error("Need more article content to generate an excerpt");
      return;
    }

    setIsLoadingExcerpt(true);
    if (excerpt) {
      setPreviousExcerpt(excerpt);
    }

    try {
      const result = await generateExcerpt(projectId, contentForAnalysis, 160);

      if (result.success) {
        onExcerptChange(result.data.excerpt);
        toast.success("SEO-optimized excerpt generated", {
          description: `${result.data.excerpt.length} characters`,
        });
      } else {
        toast.error(result.error);
        setPreviousExcerpt(null);
      }
    } catch (error) {
      toast.error("Failed to generate excerpt");
      setPreviousExcerpt(null);
    } finally {
      setIsLoadingExcerpt(false);
    }
  }, [projectId, articleContent, title, excerpt, onExcerptChange]);

  // Handle undo excerpt
  const handleUndoExcerpt = useCallback(() => {
    if (previousExcerpt !== null) {
      onExcerptChange(previousExcerpt);
      setPreviousExcerpt(null);
      toast.info("Excerpt restored");
    }
  }, [previousExcerpt, onExcerptChange]);

  // AI button component for title
  const TitleAiButton = () => {
    if (!projectId) return null;

    if (isLoadingTitle) {
      return (
        <Button type="button" variant="outline" size="icon-xs" disabled>
          <Spinner className="size-3" />
        </Button>
      );
    }

    if (previousTitle !== null) {
      return (
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          className="size-6"
          onClick={handleUndoTitle}
        >
          <ArrowUturnCcwLeft />
        </Button>
      );
    }

    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <InputGroupButton
                type="button"
                variant="outline"
                size="icon-xs"
                disabled={!aiEnabled}
              >
                <SparklesFill className="size-3" />
              </InputGroupButton>
            </DropdownMenuTrigger>
          </TooltipTrigger>

          <TooltipContent>
            {aiEnabled ? "AI Actions" : aiCheck.reason || "AI unavailable"}
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCorrectTitle}>
            <FontCursor />
            Correct
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <TextAlignCenter />
              Rewrite
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent>
              {REWRITE_STYLES.map((style) => (
                <DropdownMenuItem
                  key={style.id}
                  onClick={() => handleRewriteTitle(style.id)}
                >
                  <div className="flex flex-col">
                    <span>{style.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {style.description}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleSeoTitle}>
            <SquareHashtag />
            SEO Optimizer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // AI button component for excerpt
  const ExcerptAiButton = () => {
    if (!projectId) return null;

    if (isLoadingExcerpt) {
      return (
        <Button type="button" variant="outline" size="icon-xs" disabled>
          <Spinner className="size-3" />
        </Button>
      );
    }

    if (previousExcerpt !== null) {
      return (
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          className="size-6"
          onClick={handleUndoExcerpt}
        >
          <ArrowUturnCcwLeft />
        </Button>
      );
    }

    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-xs"
                disabled={!aiEnabled}
              >
                <SparklesFill className="size-3" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>

          <TooltipContent>
            {aiEnabled ? "AI Actions" : aiCheck.reason || "AI unavailable"}
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="center">
          <DropdownMenuItem onClick={handleCorrectExcerpt}>
            <SquareDashedText />
            Correct
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <TextAlignCenter />
              Rewrite
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent>
              {REWRITE_STYLES.map((style) => (
                <DropdownMenuItem
                  key={style.id}
                  onClick={() => handleRewriteExcerpt(style.id)}
                >
                  <div className="flex flex-col">
                    <span>{style.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {style.description}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleGenerateExcerpt}>
            <SquareHashtag />
            Generate from content
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <InputGroup>
            <InputGroupInput
              id="title"
              placeholder="My Recent Project"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              required
            />

            <InputGroupAddon align="inline-end">
              <TitleAiButton />
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <p className="text-muted-foreground text-sm">
            A brief description of the article.
          </p>

          <InputGroup>
            <InputGroupTextarea
              id="excerpt"
              placeholder="Since last week, I've been working on a new project..."
              value={excerpt}
              onChange={(e) => onExcerptChange(e.target.value)}
              rows={3}
              required
            />

            <InputGroupAddon align="block-start">
              <ExcerptAiButton />
            </InputGroupAddon>
          </InputGroup>
        </div>
      </CardContent>
    </Card>
  );
};
