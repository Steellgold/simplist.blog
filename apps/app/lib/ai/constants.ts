import type { RewriteStyle } from "./prompts";

export type { RewriteStyle } from "./prompts";

/**
 * Rewrite styles available for AI text transformation
 * Used in editor floating toolbar, info fields (title/excerpt), etc.
 */
export const REWRITE_STYLES: Array<{
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
 * Minimum content length required for AI actions
 */
export const AI_MIN_CONTENT_LENGTH = {
  title: 3,
  excerpt: 5,
  content: 3,
} as const;
