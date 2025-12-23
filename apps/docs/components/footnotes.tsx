"use client";

import { cn } from "@simplist/ui/lib/utils";
import { Card } from "@simplist/ui/components/card";
import { Info } from "lucide-react";
import { FC } from "react";

type FootNote = {
  label: string;
  content: string;
};

type FootNotesProps = {
  notes: FootNote[];
  className?: string;
  title?: string;
};

export const FootNotes: FC<FootNotesProps> = ({
  notes,
  className,
  title = "Notes",
}) => {
  return (
    <Card className="rounded-2xl p-[2.5px]">
      <Card className={cn("max-w-full gap-0 overflow-hidden p-0", className)}>
        <div className="bg-muted/50 border-border/50 border-b px-4 py-3">
          <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
            <Info className="text-primary h-4 w-4" />
            {title}
          </h3>
        </div>

        <div className="bg-card space-y-3 px-4 py-4">
          {notes.map((note, index) => (
            <div key={index} className="flex gap-3">
              <span className="text-foreground min-w-[100px] shrink-0 text-sm font-semibold">
                {note.label}:
              </span>
              <span className="text-muted-foreground text-sm leading-relaxed">
                {note.content}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </Card>
  );
};
