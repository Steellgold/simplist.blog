import type { RewriteStyle } from "./prompts";

export type { RewriteStyle } from "./prompts";

/**
 * Improve (correction) options for AI text improvements
 * Used in editor floating toolbar
 */
export const IMPROVE_OPTIONS = [
  {
    id: "correct-global" as const,
    name: "All",
    description: "Fix spelling, grammar, and tone",
  },
  {
    id: "correct-ortho" as const,
    name: "Spelling",
    description: "Correct spelling errors only",
  },
  {
    id: "correct-gram" as const,
    name: "Grammar",
    description: "Fix grammatical mistakes",
  },
  {
    id: "correct-tone" as const,
    name: "Tone",
    description: "Improve clarity and tone",
  },
] as const;

/**
 * Style options for AI text transformation
 * Used in editor floating toolbar
 */
export const STYLE_OPTIONS: Array<{
  id: RewriteStyle;
  name: string;
  description: string;
}> = [
  {
    id: "formal",
    name: "Formal",
    description: "Professional and authoritative",
  },
  {
    id: "casual",
    name: "Casual",
    description: "Friendly and conversational",
  },
  {
    id: "technical",
    name: "Technical",
    description: "Precise and detailed",
  },
  {
    id: "simplified",
    name: "Simplified",
    description: "Easy to understand",
  },
  {
    id: "engaging",
    name: "Engaging",
    description: "Dynamic and compelling",
  },
];

/**
 * Length options for AI text transformation
 * Used in editor floating toolbar
 */
export const LENGTH_OPTIONS: Array<{
  id: RewriteStyle;
  name: string;
  description: string;
}> = [
  {
    id: "shorter",
    name: "Shorter",
    description: "More concise",
  },
  {
    id: "longer",
    name: "Longer",
    description: "More detailed",
  },
  {
    id: "concise",
    name: "Concise",
    description: "Straight to the point",
  },
];

/**
 * All rewrite styles combined (for backward compatibility)
 */
export const REWRITE_STYLES: Array<{
  id: RewriteStyle;
  name: string;
  description: string;
}> = [...STYLE_OPTIONS, ...LENGTH_OPTIONS];

/**
 * Minimum content length required for AI actions
 */
export const AI_MIN_CONTENT_LENGTH = {
  title: 3,
  excerpt: 5,
  content: 3,
} as const;
