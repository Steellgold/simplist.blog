"use client"

import { cn } from "@simplist/ui/lib/utils"
import { Card } from "@simplist/ui/components/card"
import { Info } from "lucide-react"
import { FC } from "react"

type FootNote = {
  label: string
  content: string
}

type FootNotesProps = {
  notes: FootNote[]
  className?: string
  title?: string
}

export const FootNotes: FC<FootNotesProps> = ({ notes, className, title = "Notes" }) => {
  return (
    <Card className="p-[2.5px] rounded-2xl">
      <Card className={cn("overflow-hidden p-0 gap-0 max-w-full", className)}>
        <div className="bg-muted/50 px-4 py-3 border-b border-border/50">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            {title}
          </h3>
        </div>

        <div className="px-4 py-4 bg-card space-y-3">
          {notes.map((note, index) => (
            <div key={index} className="flex gap-3">
              <span className="font-semibold text-sm text-foreground shrink-0 min-w-[100px]">
                {note.label}:
              </span>
              <span className="text-sm text-muted-foreground leading-relaxed">
                {note.content}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </Card>
  )
}
