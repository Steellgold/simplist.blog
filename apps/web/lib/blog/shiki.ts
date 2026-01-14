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

export function disposeHighlighter() {
  if (globalForHighlighter.highlighter) {
    globalForHighlighter.highlighter.dispose();
    globalForHighlighter.highlighter = undefined;
  }
}

export async function highlightCode(
  code: string,
  language: BundledLanguage,
): Promise<string> {
  const highlighter = await getHighlighter();

  return highlighter.codeToHtml(code, {
    lang: language,
    themes: {
      light: "github-light-default",
      dark: "github-dark-default",
    },
    defaultColor: "light-dark()",
    rootStyle: "background-color: transparent;",
  });
}
