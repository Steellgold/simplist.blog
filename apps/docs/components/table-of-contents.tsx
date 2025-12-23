"use client";

import { useState, useEffect, useCallback, useRef, FC } from "react";
import { Card, CardContent } from "@simplist/ui/components/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@simplist/ui/components/button";
import { LineSquiggle } from "lucide-react";

export type TocHeading = {
  id: string;
  text: string;
  level: 1 | 2;
};

type TableOfContentsProps = {
  headings: TocHeading[];
};

export const TableOfContents: FC<TableOfContentsProps> = ({ headings }) => {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const headingElementsRef = useRef<Map<string, HTMLElement>>(new Map());

  const cacheHeadingElements = useCallback(() => {
    const map = new Map<string, HTMLElement>();
    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) map.set(id, el);
    });
    headingElementsRef.current = map;
    return map.size > 0;
  }, [headings]);

  const updateActiveHeading = useCallback(() => {
    const elements = headingElementsRef.current;
    if (elements.size === 0) return;

    const threshold = 120;
    let activeHeading = "";

    for (const { id } of headings) {
      const el = elements.get(id);
      if (el && el.getBoundingClientRect().top < threshold) {
        activeHeading = id;
      }
    }

    setActiveId(activeHeading || headings[0]?.id || "");
  }, [headings]);

  useEffect(() => {
    if (headings.length === 0) return;

    let retryCount = 0;
    const maxRetries = 10;
    let timeoutId: NodeJS.Timeout;

    const trySetup = () => {
      if (cacheHeadingElements()) {
        updateActiveHeading();
      } else if (retryCount++ < maxRetries) {
        timeoutId = setTimeout(trySetup, 100 * retryCount);
      }
    };

    trySetup();

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateActiveHeading();
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [headings, cacheHeadingElements, updateActiveHeading]);

  if (headings.length === 0) return null;

  const activeHeading = headings.find((h) => h.id === activeId);

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <Card className="fixed top-24 right-8 max-h-[calc(100vh-8rem)] w-64 overflow-y-auto rounded-2xl p-[2.5px]">
          <Card className="overflow-hidden p-0">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="bg-muted rounded-md p-1.5">
                  <LineSquiggle className="size-3" />
                </div>

                <h3 className="text-sm font-semibold">On This Page</h3>
              </div>

              <div className="space-y-1">
                {headings.map((heading) => (
                  <Link
                    key={heading.id}
                    href={`#${heading.id}`}
                    className={cn(
                      "block py-1 text-sm transition-colors",
                      heading.level === 2 && "pl-3",
                      activeId === heading.id
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {heading.text}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </Card>
      </aside>

      {/* Mobile */}
      <div className="fixed right-4 bottom-4 lg:hidden">
        <Button variant="secondary" onClick={() => setIsOpen((v) => !v)}>
          <LineSquiggle />
          {activeHeading?.text}
        </Button>

        {isOpen && (
          <>
            <div
              className="bg-background/80 fixed inset-0 -z-10 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            <Card className="absolute right-0 bottom-12 max-h-96 w-64 rounded-2xl p-[2.5px]">
              <Card className="overflow-auto">
                <CardContent className="space-y-2 p-4">
                  <h3 className="mb-2 text-sm font-semibold">On This Page</h3>

                  {headings.map((heading) => (
                    <Link
                      key={heading.id}
                      href={`#${heading.id}`}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "block border-l-2 py-1 text-sm",
                        heading.level === 2 && "pl-4",
                        activeId === heading.id
                          ? "text-primary border-primary font-medium"
                          : "text-muted-foreground hover:text-foreground border-transparent",
                      )}
                    >
                      {heading.text}
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </Card>
          </>
        )}
      </div>
    </>
  );
};
