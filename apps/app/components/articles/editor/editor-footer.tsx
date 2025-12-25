"use client";

import { useMemo } from "react";
import { Code, FileText } from "@gravity-ui/icons";
import { Toggle } from "@simplist/ui/components/toggle";
import { CardFooter } from "@simplist/ui/components/card";

type EditorFooterProps = {
  content: string;
  isMarkdownMode: boolean;
  onToggleMarkdownMode: () => void;
};

const calculateStats = (content: string) => {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    return {
      words: 0,
      characters: 0,
      lines: 0,
      readingTime: "0 min",
    };
  }

  const words = trimmedContent.split(/\s+/).filter(Boolean).length;
  const characters = trimmedContent.length;
  const lines = trimmedContent.split("\n").length;

  // Average reading speed: 200 words per minute
  const minutes = Math.ceil(words / 200);
  const readingTime = minutes <= 1 ? "1 min" : `${minutes} min`;

  return {
    words,
    characters,
    lines,
    readingTime,
  };
};

export const EditorFooter = ({
  content,
  isMarkdownMode,
  onToggleMarkdownMode,
}: EditorFooterProps) => {
  const stats = useMemo(() => calculateStats(content), [content]);

  return (
    <CardFooter className="bg-muted/30 text-muted-foreground flex items-center justify-between border-t px-3 py-1.5 text-xs">
      <div className="flex items-center gap-4">
        <span>{stats.words} words</span>
        <span>{stats.characters} chars</span>
        <span>{stats.lines} lines</span>
        <span>{stats.readingTime} read</span>
      </div>

      <div className="flex items-center gap-2">
        <Toggle
          size="sm"
          pressed={isMarkdownMode}
          onPressedChange={onToggleMarkdownMode}
          aria-label="Toggle Markdown Mode"
          className="h-6 gap-1.5 px-2 text-xs"
        >
          {isMarkdownMode ? (
            <>
              <Code className="size-3" />
              <span>Markdown</span>
            </>
          ) : (
            <>
              <FileText className="size-3" />
              <span>Rich Text</span>
            </>
          )}
        </Toggle>
      </div>
    </CardFooter>
  );
};
