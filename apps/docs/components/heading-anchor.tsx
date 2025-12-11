"use client"

import { cn } from "@/lib/utils"
import { Link } from "lucide-react"
import { FC, ReactElement } from "react"

type HeadingAnchorProps = {
  id?: string
  level: 1 | 2 | 3
  children: ReactElement
  className?: string
}

export const HeadingAnchor: FC<HeadingAnchorProps> = ({ id, level, children, className }) => {
  const handleClick = async () => {
    if (!id) return

    const url = `${window.location.origin}${window.location.pathname}#${id}`
    await navigator.clipboard.writeText(url)

    window.history.pushState({}, "", `#${id}`)
  }

  const Component = `h${level}` as "h1" | "h2" | "h3"

  return (
    <Component id={id} className={cn("group relative", className)}>
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-2 cursor-pointer transition-opacity"
        aria-label={`Copy link to ${children}`}
      >
        {children}
        {id && (
          <span className="opacity-0 group-hover:opacity-90 transition-opacity text-muted-foreground select-none">
            <Link className="size-4" />
          </span>
        )}
      </button>
    </Component>
  )
}
