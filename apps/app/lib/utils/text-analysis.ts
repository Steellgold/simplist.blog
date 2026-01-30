import {
  afr,
  ara,
  ben,
  bre,
  bul,
  cat,
  ces,
  dan,
  deu,
  ell,
  eng,
  epo,
  est,
  eus,
  fas,
  fin,
  fra,
  gle,
  glg,
  guj,
  hau,
  heb,
  hin,
  hrv,
  hun,
  hye,
  ind,
  ita,
  jpn,
  kor,
  kur,
  lat,
  lav,
  lgg,
  lggNd,
  lit,
  mar,
  msa,
  mya,
  nld,
  nob,
  panGu,
  pol,
  por,
  porBr,
  removeStopwords,
  ron,
  rus,
  slk,
  slv,
  som,
  sot,
  spa,
  swa,
  swe,
  tgl,
  tha,
  tur,
  ukr,
  urd,
  vie,
  yor,
  zho,
  zul,
} from "stopword";

const MULTILANG_STOPWORDS = [
  ...afr,
  ...ara,
  ...ben,
  ...bre,
  ...bul,
  ...cat,
  ...ces,
  ...dan,
  ...deu,
  ...ell,
  ...eng,
  ...epo,
  ...est,
  ...eus,
  ...fas,
  ...fin,
  ...fra,
  ...gle,
  ...glg,
  ...guj,
  ...hau,
  ...heb,
  ...hin,
  ...hrv,
  ...hun,
  ...hye,
  ...ind,
  ...ita,
  ...jpn,
  ...kor,
  ...kur,
  ...lat,
  ...lav,
  ...lgg,
  ...lggNd,
  ...lit,
  ...mar,
  ...msa,
  ...mya,
  ...nld,
  ...nob,
  ...panGu,
  ...pol,
  ...por,
  ...porBr,
  ...ron,
  ...rus,
  ...slk,
  ...slv,
  ...som,
  ...sot,
  ...spa,
  ...swa,
  ...swe,
  ...tgl,
  ...tha,
  ...tur,
  ...ukr,
  ...urd,
  ...vie,
  ...yor,
  ...zho,
  ...zul,
];

type ContentType = "tutorial" | "guide" | "reference" | "opinion" | "unknown";

export type AIArticleContext = {
  title: string | null;
  intro: string | null;
  headings: string[];
  codeLanguages: string[];
  keywords: string[];
  contentType: ContentType;
};

/**
 * Extract the first meaningful paragraph (not a heading)
 */
function extractIntroParagraph(
  content: string,
  maxChars: number,
): string | null {
  const paragraphs = content
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  for (const p of paragraphs) {
    // Skip headings, code blocks, and very short paragraphs
    if (!p.startsWith("#") && !p.startsWith("```") && p.length >= 80) {
      return p.slice(0, maxChars);
    }
  }

  return null;
}

/**
 * Extract code languages from code blocks
 */
function extractCodeLanguages(content: string): string[] {
  const regex = /```(\w+)/g;
  const langs = new Set<string>();
  let match;

  while ((match = regex.exec(content))) {
    langs.add(match[1].toLowerCase());
  }

  return [...langs];
}

/**
 * Extract keywords using TF-IDF-like approach
 */
function extractKeywordsTFIDF(content: string): string[] {
  // Tokenize and clean
  const words = content
    .toLowerCase()
    .replace(/[^\w\sàâäéèêëïîôöùûüÿçñáíóúü]/g, "")
    .split(/\s+/)
    .filter((word) => word.length >= 4);

  // Remove stopwords
  const filteredWords = removeStopwords(words, MULTILANG_STOPWORDS);

  // Count frequency
  const frequency: Record<string, number> = {};
  filteredWords.forEach((word) => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Sort by frequency and take top keywords
  return Object.entries(frequency)
    .filter(([, count]) => count >= 2) // Lower threshold than before
    .sort(([, a], [, b]) => b - a)
    .map(([word]) => word)
    .slice(0, 8);
}

/**
 * Infer content type based on structure
 */
function inferContentType({
  headings,
  codeLanguages,
  intro,
}: {
  headings: string[];
  codeLanguages: string[];
  intro: string | null;
}): ContentType {
  // Tutorial: has code + step-by-step headings
  if (
    codeLanguages.length > 0 &&
    headings.some((h) => /step|étape|partie|phase/i.test(h))
  ) {
    return "tutorial";
  }

  // Reference: many sections
  if (headings.length > 6) {
    return "reference";
  }

  // Opinion: personal language
  if (intro && /opinion|avis|je pense|i think|my view/i.test(intro)) {
    return "opinion";
  }

  // Default: guide
  return "guide";
}

/**
 * Extract structured context from article content
 */
export function extractStructuredContext(
  content: string,
): AIArticleContext | null {
  // Minimum length check
  if (content.length < 600) return null;

  const lines = content.split("\n");

  // Extract title (H1)
  const title =
    lines.find((l) => l.startsWith("# "))?.replace(/^# /, "") ?? null;

  // Extract headings (H2 only, limit to 6)
  const headings = lines
    .filter((l) => l.startsWith("## "))
    .map((l) => l.replace(/^## /, ""))
    .slice(0, 6);

  // Extract intro paragraph
  const intro = extractIntroParagraph(content, 300);

  // Extract code languages
  const codeLanguages = extractCodeLanguages(content);

  // Extract keywords
  const keywords = extractKeywordsTFIDF(content);

  // Infer content type
  const contentType = inferContentType({
    headings,
    codeLanguages,
    intro,
  });

  // Validation: must have at least some structure
  if (!title && headings.length === 0 && keywords.length < 3) {
    return null;
  }

  return {
    title,
    intro,
    headings,
    codeLanguages,
    keywords,
    contentType,
  };
}

/**
 * Format structured context for AI prompt
 */
export function formatContextForAI(context: AIArticleContext): string {
  const parts: string[] = [];

  if (context.title) {
    parts.push(`Title: ${context.title}`);
  }

  if (context.intro) {
    parts.push(`\nIntro:\n${context.intro}`);
  }

  if (context.headings.length > 0) {
    parts.push(
      `\nSection headings:\n${context.headings.map((h) => `- ${h}`).join("\n")}`,
    );
  }

  if (context.codeLanguages.length > 0) {
    parts.push(
      `\nDetected code languages: ${context.codeLanguages.join(", ")}`,
    );
  }

  if (context.keywords.length > 0) {
    parts.push(`\nExtracted keywords: ${context.keywords.join(", ")}`);
  }

  parts.push(`\nContent type: ${context.contentType}`);

  return parts.join("\n");
}

/**
 * Determine if content should trigger AI analysis
 */
export function shouldAnalyzeWithAI(content: string): boolean {
  if (content.length < 600) return false;

  const context = extractStructuredContext(content);
  if (!context) return false;

  // Strong signals: has structure
  return (
    context.headings.length > 0 ||
    context.codeLanguages.length > 0 ||
    !!(context.intro && context.intro.length >= 150)
  );
}

/**
 * Main entry point: analyze content and return formatted context for AI
 */
export function analyzeContentForAI(content: string): string | null {
  if (!shouldAnalyzeWithAI(content)) return null;

  const context = extractStructuredContext(content);
  if (!context) return null;

  return formatContextForAI(context);
}
