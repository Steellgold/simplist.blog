import { BundledLanguage, createHighlighter, Highlighter } from "shiki";

const SUPPORTED_LANGS: BundledLanguage[] = [
  "typescript",
  "javascript",
  "tsx",
  "jsx",
  "json",
  "bash",
  "shell",
  "yaml",
  "markdown",
  "html",
  "astro",
  "css",
  "python",
  "xml",
  "http",
];

const globalForHighlighter = globalThis as unknown as {
  highlighter: Highlighter | undefined;
  highlightCache: Map<string, string> | undefined;
};

export async function getHighlighter() {
  if (!globalForHighlighter.highlighter) {
    globalForHighlighter.highlighter = await createHighlighter({
      themes: ["github-dark-default", "github-light-default"],
      langs: SUPPORTED_LANGS,
    });
  }

  return globalForHighlighter.highlighter;
}

function getHighlightCache(): Map<string, string> {
  if (!globalForHighlighter.highlightCache) {
    globalForHighlighter.highlightCache = new Map();
  }
  return globalForHighlighter.highlightCache;
}

/**
 * Dispose of the highlighter instance (useful for cleanup in tests or when needed)
 */
export function disposeHighlighter() {
  if (globalForHighlighter.highlighter) {
    globalForHighlighter.highlighter.dispose();
    globalForHighlighter.highlighter = undefined;
  }
  if (globalForHighlighter.highlightCache) {
    globalForHighlighter.highlightCache.clear();
    globalForHighlighter.highlightCache = undefined;
  }
}

export async function highlightCode(
  code: string,
  language: BundledLanguage,
): Promise<string> {
  // Check cache first
  const cacheKey = `${language}:${code}`;
  const cache = getHighlightCache();
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const highlighter = await getHighlighter();

  const result = highlighter.codeToHtml(code, {
    lang: language,
    themes: {
      light: "github-light-default",
      dark: "github-dark-default",
    },
    defaultColor: "light-dark()",
    rootStyle: "background-color: transparent;",
  });

  // Store in cache
  cache.set(cacheKey, result);

  return result;
}
