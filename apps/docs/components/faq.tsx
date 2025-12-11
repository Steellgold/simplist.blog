"use client"

import { FC, ReactNode } from "react"
import { useState } from "react"
import { cn } from "@simplist/ui/lib/utils"
import { ChevronDown, HelpCircle } from "lucide-react"
import { Card } from "@simplist/ui/components/card"

type FaqItem = {
  question: string
  answer: string | ReactNode
}

type FaqProps = {
  title?: string
  description?: string
  items: FaqItem[]
  className?: string
  allowMultiple?: boolean
}

type FaqItemProps = {
  item: FaqItem
  isOpen: boolean
  onToggle: () => void
}

const FaqItemComponent: FC<FaqItemProps> = ({ item, isOpen, onToggle }) => {
  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-4 text-left group"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {item.question}
        </span>

        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-all duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100 pb-4" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none dark:prose-invert">
            {item.answer}
          </div>
        </div>
      </div>
    </div>
  )
}

export const Faq: FC<FaqProps> = ({ title, description, items, className, allowMultiple = false }) => {
  const [openIndexes, setOpenIndexes] = useState<number[]>([])

  const handleToggle = (index: number) => {
    if (allowMultiple) {
      setOpenIndexes((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
    } else {
      setOpenIndexes((prev) => (prev.includes(index) ? [] : [index]))
    }
  }

  return (
    <Card className="p-[2.5px] rounded-2xl">
      <Card className={cn("overflow-hidden p-0 gap-0 max-w-full", className)}>
        {title && (
          <div className="bg-muted/50 px-4 py-3 border-b border-border/50">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              {title}
            </h3>

            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
        )}

        <div className="px-4 bg-card">
          {items.map((item, index) => (
            <FaqItemComponent
              key={index}
              item={item}
              isOpen={openIndexes.includes(index)}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>
      </Card>
    </Card>
  )
}