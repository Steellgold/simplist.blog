import { marked } from "marked";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

// Configure marked options
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert \n to <br>
});

export function MarkdownContent({
  content,
  className = "",
}: MarkdownContentProps) {
  const htmlContent = marked.parse(content) as string;

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
