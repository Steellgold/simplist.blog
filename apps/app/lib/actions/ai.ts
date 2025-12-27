"use server";

import { generateText, Output } from "ai";
import { prisma } from "@simplist/db";
import { getAiModelForProject } from "@/lib/ai/client";
import {
  checkAiRequestQuota,
  incrementAiRequestCounter,
} from "@/lib/subscription/quota-check";
import { requirePermission } from "@/lib/auth/permissions";
import {
  TRANSLATION_PROMPT,
  getCorrectionPrompt,
  getRewritePrompt,
  getCustomPrompt,
  TAG_SUGGESTION_PROMPT,
  EXCERPT_PROMPT,
  TITLE_SUGGESTION_PROMPT,
  REWRITE_STYLES,
  FIELD_CONSTRAINTS,
  type RewriteStyle,
  type FieldType,
} from "@/lib/ai/prompts";
import {
  translationSchema,
  getCorrectionSchema,
  getRewriteSchema,
  tagSuggestionSchema,
  excerptSchema,
  titleSuggestionsSchema,
  type TranslationOutput,
  type CorrectionOutput,
  type RewriteOutput,
  type TagSuggestionOutput,
  type ExcerptOutput,
  type TitleSuggestionsOutput,
} from "@/lib/ai/schemas";

// Re-export types for convenience
export type { RewriteStyle } from "@/lib/ai/prompts";
export type {
  TranslationOutput,
  CorrectionOutput,
  RewriteOutput,
  TagSuggestionOutput,
  ExcerptOutput,
  TitleSuggestionsOutput,
} from "@/lib/ai/schemas";

/**
 * Common result type for AI actions
 */
export type AiActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Helper to wrap AI action execution with quota check and error handling
 */
const executeAiAction = async <T>(
  projectId: string,
  action: () => Promise<T>,
): Promise<AiActionResult<T>> => {
  try {
    // Check quota before executing
    const quotaCheck = await checkAiRequestQuota(projectId);

    if (!quotaCheck.allowed) {
      return { success: false, error: quotaCheck.reason || "Quota exceeded" };
    }

    // Execute the AI action
    const result = await action();

    // Increment counter after successful execution
    await incrementAiRequestCounter(projectId);

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
};

/**
 * Translate article content to another language
 */
export const translateVariant = async (
  projectId: string,
  content: {
    title: string;
    content: string;
    excerpt?: string;
  },
  sourceLanguage: string,
  targetLanguage: string,
): Promise<AiActionResult<TranslationOutput>> => {
  await requirePermission(projectId, "canManageArticles");

  return executeAiAction(projectId, async () => {
    const model = await getAiModelForProject(projectId);

    const { output } = await generateText({
      model,
      output: Output.object({ schema: translationSchema }),
      system: TRANSLATION_PROMPT,
      prompt: `Translate the following content from ${sourceLanguage} to ${targetLanguage}.

Input content:
Title: ${content.title}
${content.excerpt ? `Excerpt: ${content.excerpt}` : ""}
Content:
${content.content}`,
    });

    if (!output) {
      throw new Error("Failed to generate translation");
    }

    return output;
  });
};

/**
 * Correct spelling and grammar in content
 */
export const correctContent = async (
  projectId: string,
  content: string,
  language: string,
  fieldType: FieldType = "content",
): Promise<AiActionResult<CorrectionOutput>> => {
  await requirePermission(projectId, "canManageArticles");

  const constraints = FIELD_CONSTRAINTS[fieldType];

  return executeAiAction(projectId, async () => {
    const model = await getAiModelForProject(projectId);

    const systemPrompt = getCorrectionPrompt(fieldType);
    const userPrompt = `Correct the following ${constraints.description} written in ${language}. 
The original is ${content.length} characters - keep similar length.

${constraints.description.charAt(0).toUpperCase() + constraints.description.slice(1)} to correct:
${content}`;

    const { output } = await generateText({
      model,
      output: Output.object({ schema: getCorrectionSchema(fieldType) }),
      system: systemPrompt,
      prompt: userPrompt,
    });

    if (!output) {
      throw new Error("Failed to generate corrections");
    }

    return output;
  });
};

/**
 * Rewrite content in a different style
 */
export const rewriteContent = async (
  projectId: string,
  content: string,
  style: RewriteStyle,
  fieldType: FieldType = "content",
): Promise<AiActionResult<RewriteOutput>> => {
  await requirePermission(projectId, "canManageArticles");

  const styleInstructions = REWRITE_STYLES[style];
  const constraints = FIELD_CONSTRAINTS[fieldType];

  return executeAiAction(projectId, async () => {
    const model = await getAiModelForProject(projectId);

    const systemPrompt = `${getRewritePrompt(fieldType)}

${styleInstructions}`;
    const userPrompt = `Rewrite the following ${constraints.description} in a ${style} style.
The original is ${content.length} characters - output must be similar length (not longer).
${constraints.maxLength > 0 ? `Maximum allowed: ${constraints.maxLength} characters.` : ""}

Original ${fieldType}:
${content}`;

    const { output } = await generateText({
      model,
      output: Output.object({ schema: getRewriteSchema(fieldType) }),
      system: systemPrompt,
      prompt: userPrompt,
    });

    if (!output) {
      throw new Error("Failed to rewrite content");
    }

    return output;
  });
};

/**
 * Edit content with custom instructions from the user
 */
export const customEditContent = async (
  projectId: string,
  content: string,
  customInstruction: string,
  fieldType: FieldType = "content",
): Promise<AiActionResult<RewriteOutput>> => {
  await requirePermission(projectId, "canManageArticles");

  if (!customInstruction.trim()) {
    return { success: false, error: "Custom instruction is required" };
  }

  const constraints = FIELD_CONSTRAINTS[fieldType];

  return executeAiAction(projectId, async () => {
    const model = await getAiModelForProject(projectId);

    const systemPrompt = getCustomPrompt(fieldType, customInstruction);
    const userPrompt = `Apply the following instruction to this ${constraints.description}:

Instruction: "${customInstruction}"

Original ${fieldType}:
${content}`;

    const result = await Promise.race([
      generateText({
        model,
        output: Output.object({ schema: getRewriteSchema(fieldType) }),
        system: systemPrompt,
        prompt: userPrompt,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("AI request timed out after 30 seconds")),
          30000,
        ),
      ),
    ]);

    const { output } = result;

    if (!output) {
      throw new Error("Failed to edit content with custom instruction");
    }

    return output;
  });
};

/**
 * Suggest tags for an article based on its content
 */
export const suggestTags = async (
  projectId: string,
  articleContent: string,
): Promise<AiActionResult<TagSuggestionOutput>> => {
  await requirePermission(projectId, "canManageArticles");

  // Get existing tags for the project
  const existingTags = await prisma.tag.findMany({
    where: { projectId },
    select: { id: true, name: true },
  });

  const existingTagsList = existingTags
    .map((tag) => `- ${tag.name} (id: ${tag.id})`)
    .join("\n");

  return executeAiAction(projectId, async () => {
    const model = await getAiModelForProject(projectId);

    const { output } = await generateText({
      model,
      output: Output.object({ schema: tagSuggestionSchema }),
      system: TAG_SUGGESTION_PROMPT,
      prompt: `Analyze the following article and suggest relevant tags.

Existing tags in this project:
${existingTagsList || "(No existing tags)"}

Article content:
${articleContent}

Return suggested tag IDs from the existing list, and/or suggest new tags that could be created.`,
    });

    if (!output) {
      throw new Error("Failed to suggest tags");
    }

    return output;
  });
};

/**
 * Generate an SEO-optimized excerpt for an article
 */
export const generateExcerpt = async (
  projectId: string,
  content: string,
  maxLength: number = 160,
): Promise<AiActionResult<ExcerptOutput>> => {
  await requirePermission(projectId, "canManageArticles");

  return executeAiAction(projectId, async () => {
    const model = await getAiModelForProject(projectId);

    const { output } = await generateText({
      model,
      output: Output.object({ schema: excerptSchema }),
      system: EXCERPT_PROMPT,
      prompt: `Generate an SEO-optimized excerpt (max ${maxLength} characters) for the following article:

${content}`,
    });

    if (!output) {
      throw new Error("Failed to generate excerpt");
    }

    return output;
  });
};

/**
 * Generate SEO-optimized title suggestions
 */
export const generateTitleSuggestions = async (
  projectId: string,
  content: string,
  currentTitle?: string,
): Promise<AiActionResult<TitleSuggestionsOutput>> => {
  await requirePermission(projectId, "canManageArticles");

  return executeAiAction(projectId, async () => {
    const model = await getAiModelForProject(projectId);

    const { output } = await generateText({
      model,
      output: Output.object({ schema: titleSuggestionsSchema }),
      system: TITLE_SUGGESTION_PROMPT,
      prompt: `Generate 5 SEO-optimized title suggestions for the following article.
${currentTitle ? `Current title: "${currentTitle}"` : ""}

Article content:
${content}`,
    });

    if (!output) {
      throw new Error("Failed to generate title suggestions");
    }

    return output;
  });
};

/**
 * Get available rewrite styles
 */
export const getAvailableRewriteStyles = async (): Promise<
  Array<{ id: RewriteStyle; name: string; description: string }>
> => {
  return [
    {
      id: "formal",
      name: "Formal",
      description: "Professional and authoritative tone",
    },
    {
      id: "casual",
      name: "Casual",
      description: "Friendly and conversational tone",
    },
    {
      id: "technical",
      name: "Technical",
      description: "Precise and detailed language",
    },
    {
      id: "simplified",
      name: "Simplified",
      description: "Easy to understand for all audiences",
    },
    {
      id: "engaging",
      name: "Engaging",
      description: "Dynamic and compelling style",
    },
  ];
};
