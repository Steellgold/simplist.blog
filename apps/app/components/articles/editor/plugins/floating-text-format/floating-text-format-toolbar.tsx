"use client";

import { useCallback, useEffect, useRef } from "react";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  $getSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
} from "lexical";
import { mergeRegister } from "@lexical/utils";
import {
  Bold,
  Code,
  Italic,
  Link as LinkIcon,
  SparklesFill,
  Strikethrough,
  Underline,
  CircleCheck,
  LayoutHeaderCellsLarge,
  ArrowsOppositeToDots,
} from "@gravity-ui/icons";
import { Toggle } from "@simplist/ui/components/toggle";
import { Separator } from "@simplist/ui/components/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@simplist/ui/components/dropdown-menu";
import { Button } from "@simplist/ui/components/button";
import { Spinner } from "@simplist/ui/components/spinner";
import {
  STYLE_OPTIONS,
  LENGTH_OPTIONS,
  IMPROVE_OPTIONS,
} from "@/lib/ai/constants";
import { canExecuteAiAction } from "@/lib/ai/validators";
import { getDOMRangeRect } from "../../utils/get-dom-range-rect";
import { setFloatingElemPosition } from "../../utils/set-floating-elem-position";
import type { FloatingTextFormatToolbarProps } from "./types";

export const FloatingTextFormatToolbar = ({
  editor,
  anchorElem,
  isLink,
  isBold,
  isItalic,
  isUnderline,
  isCode,
  isStrikethrough,
  setIsLinkEditMode,
  projectId,
  subscription,
  isAiLoading,
  onAiAction,
}: FloatingTextFormatToolbarProps) => {
  const popupRef = useRef<HTMLDivElement | null>(null);

  const insertLink = useCallback(() => {
    if (!isLink) {
      setIsLinkEditMode(true);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://example.com");
    } else {
      setIsLinkEditMode(false);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink, setIsLinkEditMode]);

  const updatePosition = useCallback(() => {
    const selection = $getSelection();
    const popupElem = popupRef.current;
    const nativeSelection = window.getSelection();

    if (popupElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement);
      setFloatingElemPosition(rangeRect, popupElem, anchorElem, isLink);
    }
  }, [editor, anchorElem, isLink]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        updatePosition();
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
  }, [editor, updatePosition, anchorElem]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updatePosition();
    });

    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updatePosition();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updatePosition();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, updatePosition]);

  const aiCheck = canExecuteAiAction(subscription);
  const aiEnabled = !!projectId && aiCheck.allowed;

  return (
    <div
      ref={popupRef}
      className="bg-popover absolute top-0 left-0 z-50 flex h-10 items-center gap-0.5 rounded-md border p-1 opacity-0 shadow-md transition-opacity will-change-transform"
    >
      <Toggle
        size="sm"
        pressed={isBold}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        aria-label="Bold"
        disabled={isAiLoading}
      >
        <Bold className="size-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={isItalic}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        aria-label="Italic"
        disabled={isAiLoading}
      >
        <Italic className="size-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={isUnderline}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        aria-label="Underline"
        disabled={isAiLoading}
      >
        <Underline className="size-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={isStrikethrough}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
        aria-label="Strikethrough"
        disabled={isAiLoading}
      >
        <Strikethrough className="size-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Toggle
        size="sm"
        pressed={isCode}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
        }}
        aria-label="Code"
        disabled={isAiLoading}
      >
        <Code className="size-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={isLink}
        onPressedChange={insertLink}
        aria-label="Link"
        disabled={isAiLoading}
      >
        <LinkIcon className="size-4" />
      </Toggle>

      {/* AI Button */}
      <Separator orientation="vertical" className="mx-1 h-6" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!aiEnabled || isAiLoading}
            aria-label={
              aiEnabled ? "AI Actions" : aiCheck.reason || "AI unavailable"
            }
            title={
              aiEnabled ? "AI Actions" : aiCheck.reason || "AI unavailable"
            }
          >
            {isAiLoading ? <Spinner /> : <SparklesFill />}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <CircleCheck />
              Improve
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent>
              {IMPROVE_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => onAiAction(option.id)}
                >
                  <div className="flex flex-col">
                    <span>{option.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {option.description}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <LayoutHeaderCellsLarge />
              Style
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {STYLE_OPTIONS.map((style) => (
                <DropdownMenuItem
                  key={style.id}
                  onClick={() => onAiAction("rewrite", style.id)}
                >
                  <div className="flex flex-col">
                    <span>{style.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {style.description}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ArrowsOppositeToDots />
              Length
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {LENGTH_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => onAiAction("rewrite", option.id)}
                >
                  <div className="flex flex-col">
                    <span>{option.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {option.description}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
