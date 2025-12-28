"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  SparklesFill,
  ArrowUturnCcwLeft,
  Check,
  ArrowUpArrowDown,
} from "@gravity-ui/icons";
import { Button } from "@simplist/ui/components/button";
import { Spinner } from "@simplist/ui/components/spinner";
import { Separator } from "@simplist/ui/components/separator";
import { Kbd } from "@simplist/ui/components/kbd";
import type { AiVersionControlPanelProps } from "./types";

export const AiVersionControlPanel = ({
  versions,
  currentIndex,
  isLoading,
  onVersionChange,
  onCancel,
  onApply,
  anchorElem,
  editor,
}: AiVersionControlPanelProps) => {
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Position panel next to the modified text
  const updatePanelPosition = useCallback(() => {
    const panelElem = panelRef.current;
    if (!panelElem) return;

    editor.getEditorState().read(() => {
      const nativeSelection = window.getSelection();
      const rootElement = editor.getRootElement();

      if (
        nativeSelection &&
        nativeSelection.rangeCount > 0 &&
        rootElement &&
        rootElement.contains(nativeSelection.anchorNode)
      ) {
        const range = nativeSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Position to the right of the selection (fixed positioning relative to viewport)
        const top = rect.top;
        const left = rect.right + 10; // 10px spacing

        panelElem.style.top = `${top}px`;
        panelElem.style.left = `${left}px`;
        panelElem.style.opacity = "1";
      }
    });
  }, [editor]);

  useEffect(() => {
    updatePanelPosition();

    const scrollerElem = anchorElem.parentElement;
    const update = () => {
      editor.getEditorState().read(() => {
        updatePanelPosition();
      });
    };

    window.addEventListener("resize", update);
    if (scrollerElem) {
      scrollerElem.addEventListener("scroll", update);
    }

    return () => {
      window.removeEventListener("resize", update);
      if (scrollerElem) {
        scrollerElem.removeEventListener("scroll", update);
      }
    };
  }, [updatePanelPosition, anchorElem, editor]);

  // Keyboard navigation
  useEffect(() => {
    if (versions.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        onVersionChange(
          currentIndex > 0 ? currentIndex - 1 : versions.length - 1,
        );
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        onVersionChange(
          currentIndex < versions.length - 1 ? currentIndex + 1 : 0,
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        onApply();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [versions.length, currentIndex, onVersionChange, onApply, onCancel]);

  return (
    <div
      ref={panelRef}
      className="bg-popover fixed z-9999 w-60 rounded-md border opacity-0 shadow-md transition-opacity"
    >
      {isLoading ? (
        <div className="flex items-center gap-2 p-3">
          <Spinner className="size-4" />
          <span className="text-muted-foreground text-xs">Generating...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 p-1.5">
          <div className="flex items-center justify-between gap-2 px-2 py-1">
            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
              <div className="bg-muted rounded-sm p-1">
                <SparklesFill className="size-3" />
              </div>
              AI Suggestion
            </span>

            <div className="inline-flex items-center gap-1">
              <Kbd>
                {currentIndex + 1}/{versions.length}
              </Kbd>

              {versions.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="size-6 p-0"
                  onClick={() => {
                    const nextIndex =
                      currentIndex < versions.length - 1 ? currentIndex + 1 : 0;
                    onVersionChange(nextIndex);
                  }}
                  aria-label="Navigate versions (use arrow keys)"
                >
                  <ArrowUpArrowDown className="size-4" />
                </Button>
              )}
            </div>
          </div>

          {versions.length > 0 && <Separator orientation="horizontal" />}

          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="flex-1"
              onClick={onCancel}
            >
              <ArrowUturnCcwLeft />
              Undo
            </Button>
            <Button
              type="button"
              size="xs"
              className="flex-1"
              onClick={onApply}
            >
              <Check />
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
