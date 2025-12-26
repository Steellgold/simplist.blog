"use client";

import { ContentEditable as LexicalContentEditable } from "@lexical/react/LexicalContentEditable";
import { cn } from "@simplist/ui/lib/utils";

type ContentEditableProps = {
  placeholder?: string;
  className?: string;
};

export const ContentEditable = ({
  placeholder = "Start writing...",
  className,
}: ContentEditableProps) => {
  return (
    <LexicalContentEditable
      className={cn(
        "relative min-h-[450px] resize-none outline-none",
        "px-4 py-3 text-sm leading-relaxed",
        "caret-foreground",
        className,
      )}
      aria-placeholder={placeholder}
      placeholder={
        <div className="text-muted-foreground pointer-events-none absolute top-3 left-4 text-sm select-none">
          {placeholder}
        </div>
      }
    />
  );
};
