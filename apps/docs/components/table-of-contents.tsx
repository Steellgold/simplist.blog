"use client"

import { useState, useEffect, useCallback, useRef, FC } from "react"
import { Card, CardContent } from "@simplist/ui/components/card"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@simplist/ui/components/button"
import { LineSquiggle } from "lucide-react"

export type TocHeading = {
  id: string
  text: string
  level: 1 | 2
}

type TableOfContentsProps = {
  headings: TocHeading[]
}

export const TableOfContents: FC<TableOfContentsProps> = ({ headings }) => {
  const [activeId, setActiveId] = useState<string>("")
  const [isOpen, setIsOpen] = useState(false)
  const headingElementsRef = useRef<Map<string, HTMLElement>>(new Map())

  const cacheHeadingElements = useCallback(() => {
    const map = new Map<string, HTMLElement>()
    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) map.set(id, el)
    })
    headingElementsRef.current = map
    return map.size > 0
  }, [headings])

  const updateActiveHeading = useCallback(() => {
    const elements = headingElementsRef.current
    if (elements.size === 0) return

    const threshold = 120
    let activeHeading = ""

    for (const { id } of headings) {
      const el = elements.get(id)
      if (el && el.getBoundingClientRect().top < threshold) {
        activeHeading = id
      }
    }

    setActiveId(activeHeading || headings[0]?.id || "")
  }, [headings])

  useEffect(() => {
    if (headings.length === 0) return

    let retryCount = 0
    const maxRetries = 10
    let timeoutId: NodeJS.Timeout

    const trySetup = () => {
      if (cacheHeadingElements()) {
        updateActiveHeading()
      } else if (retryCount++ < maxRetries) {
        timeoutId = setTimeout(trySetup, 100 * retryCount)
      }
    }

    trySetup()

    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        updateActiveHeading()
        ticking = false
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [headings, cacheHeadingElements, updateActiveHeading])

  if (headings.length === 0) return null

  const activeHeading = headings.find((h) => h.id === activeId)

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="fixed top-24 right-8 w-64 max-h-[calc(100vh-8rem)] overflow-y-auto bg-card/45 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-muted p-1.5 rounded-md">
              <LineSquiggle className="size-3" />
            </div>
            <h3 className="text-sm font-semibold">On This Page</h3>
          </div>

          <nav className="space-y-1">
            {headings.map((heading) => (
              <Link
                key={heading.id}
                href={`#${heading.id}`}
                className={cn(
                  "block text-sm py-1 transition-colors",
                  heading.level === 2 && "pl-3",
                  activeId === heading.id
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {heading.text}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile */}
      <div className="lg:hidden fixed bottom-4 right-4">
        <Button variant="secondary" onClick={() => setIsOpen((v) => !v)}>
          <LineSquiggle />
          {activeHeading?.text}
        </Button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm -z-10"
              onClick={() => setIsOpen(false)}
            />

            <Card className="absolute bottom-12 right-0 w-64 max-h-96 overflow-auto">
              <CardContent className="space-y-2">
                <h3 className="text-sm font-semibold mb-2">On This Page</h3>

                {headings.map((heading) => (
                  <Link
                    key={heading.id}
                    href={`#${heading.id}`}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block text-sm py-1 border-l-2",
                      heading.level === 2 && "pl-4",
                      activeId === heading.id
                        ? "text-primary font-medium border-primary"
                        : "text-muted-foreground hover:text-foreground border-transparent"
                    )}
                  >
                    {heading.text}
                  </Link>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  )
}