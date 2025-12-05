import { createHighlighter, Highlighter, BundledLanguage } from "shiki"

let highlighter: Highlighter | null = null

export async function getHighlighter() {
  if (!highlighter) {
    highlighter = await createHighlighter({
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
      ]
    })
  }

  return highlighter
}

export async function highlightCode(code: string, language: BundledLanguage): Promise<string> {
  const highlighter = await getHighlighter()

  return highlighter.codeToHtml(code, {
    lang: language,
    theme: "github-dark-default"
  })
}
