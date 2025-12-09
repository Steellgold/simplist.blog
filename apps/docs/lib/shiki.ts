import { createHighlighter, Highlighter, BundledLanguage } from "shiki"

const globalForHighlighter = globalThis as unknown as {
  highlighter: Highlighter | undefined
}

export async function getHighlighter() {
  if (!globalForHighlighter.highlighter) {
    globalForHighlighter.highlighter = await createHighlighter({
      themes: ["github-dark-default", "github-light-default"],
      langs: [
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
        "css",
        "python",
        "xml",
        "http"
      ]
    })
  }

  return globalForHighlighter.highlighter
}

/**
 * Dispose of the highlighter instance (useful for cleanup in tests or when needed)
 */
export function disposeHighlighter() {
  if (globalForHighlighter.highlighter) {
    globalForHighlighter.highlighter.dispose()
    globalForHighlighter.highlighter = undefined
  }
}

export async function highlightCode(code: string, language: BundledLanguage): Promise<string> {
  const highlighter = await getHighlighter()

  return highlighter.codeToHtml(code, {
    lang: language,
    themes: {
      light: "github-light-default",
      dark: "github-dark-default"
    },
    defaultColor: "light-dark()",
    rootStyle: "background-color: transparent;",
  })
}
