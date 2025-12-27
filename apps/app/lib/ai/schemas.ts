import { z } from "zod";

import { FIELD_CONSTRAINTS, type FieldType } from "./prompts";

/**
 * Schema for translation output
 */
export const translationSchema = z.object({
  title: z.string().min(1).max(150).describe("Translated title"),
  content: z.string().describe("Translated content with preserved formatting"),
  excerpt: z
    .string()
    .max(300)
    .optional()
    .describe("Translated excerpt if provided"),
});

export type TranslationOutput = z.infer<typeof translationSchema>;

/**
 * Schema for content correction output
 */
export const correctionSchema = z.object({
  correctedContent: z.string().describe("The fully corrected content"),
  corrections: z
    .array(
      z.object({
        original: z.string().describe("The original text that was incorrect"),
        corrected: z.string().describe("The corrected version"),
        reason: z.string().describe("Brief explanation of why it was wrong"),
      }),
    )
    .describe("List of corrections made"),
  correctionCount: z.number().describe("Total number of corrections made"),
});

export type CorrectionOutput = z.infer<typeof correctionSchema>;

/**
 * Create a correction schema with field-specific constraints
 */
export const getCorrectionSchema = (fieldType: FieldType) => {
  const constraints = FIELD_CONSTRAINTS[fieldType];

  let contentSchema = z.string();
  if (constraints.minLength > 0) {
    contentSchema = contentSchema.min(constraints.minLength);
  }
  if (constraints.maxLength > 0) {
    contentSchema = contentSchema.max(constraints.maxLength);
  }

  return z.object({
    correctedContent: contentSchema.describe(
      `The fully corrected ${constraints.description}`,
    ),
    corrections: z
      .array(
        z.object({
          original: z.string().describe("The original text that was incorrect"),
          corrected: z.string().describe("The corrected version"),
          reason: z.string().describe("Brief explanation of why it was wrong"),
        }),
      )
      .describe("List of corrections made"),
    correctionCount: z.number().describe("Total number of corrections made"),
  });
};

/**
 * Schema for content rewriting output
 */
export const rewriteSchema = z.object({
  rewrittenContent: z
    .string()
    .describe("The rewritten content in the requested style"),
});

export type RewriteOutput = z.infer<typeof rewriteSchema>;

/**
 * Create a rewrite schema with field-specific constraints
 */
export const getRewriteSchema = (fieldType: FieldType) => {
  const constraints = FIELD_CONSTRAINTS[fieldType];

  let contentSchema = z.string();
  if (constraints.minLength > 0) {
    contentSchema = contentSchema.min(constraints.minLength);
  }
  if (constraints.maxLength > 0) {
    contentSchema = contentSchema.max(constraints.maxLength);
  }

  return z.object({
    rewrittenContent: contentSchema.describe(
      `The rewritten ${constraints.description} in the requested style (${constraints.minLength}-${constraints.maxLength} chars)`,
    ),
  });
};

/**
 * Schema for tag suggestion output
 */
export const tagSuggestionSchema = z.object({
  suggestedTagIds: z
    .array(z.string())
    .describe("IDs of existing tags that match the content"),
  newTagSuggestions: z
    .array(
      z.object({
        name: z.string().describe("Suggested tag name (1-3 words)"),
        reason: z.string().describe("Why this tag is relevant"),
      }),
    )
    .describe("New tags that could be created"),
});

export type TagSuggestionOutput = z.infer<typeof tagSuggestionSchema>;

/**
 * Schema for excerpt generation output
 */
export const excerptSchema = z.object({
  excerpt: z
    .string()
    .min(50)
    .max(200)
    .describe("SEO-optimized excerpt/meta description (50-200 chars)"),
});

export type ExcerptOutput = z.infer<typeof excerptSchema>;

/**
 * Schema for title suggestions output
 */
export const titleSuggestionsSchema = z.object({
  titles: z
    .array(
      z.object({
        title: z
          .string()
          .min(10)
          .max(100)
          .describe("Suggested title (10-100 chars)"),
        reason: z.string().describe("Why this title works well"),
      }),
    )
    .length(5)
    .describe("Exactly 5 title suggestions"),
});

export type TitleSuggestionsOutput = z.infer<typeof titleSuggestionsSchema>;
