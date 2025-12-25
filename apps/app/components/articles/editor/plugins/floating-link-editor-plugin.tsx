"use client";

import type { JSX } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  $isLinkNode,
  $isAutoLinkNode,
  TOGGLE_LINK_COMMAND,
  type LinkNode,
} from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isLineBreakNode,
  $isRangeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
  type BaseSelection,
  type LexicalEditor,
} from "lexical";
import { Check, ExternalLink, Pencil, Trash2, X } from "lucide-react";
import { createPortal } from "react-dom";

import { getSelectedNode } from "../utils/get-selected-node";
import { setFloatingElemPositionForLinkEditor } from "../utils/set-floating-elem-position";
import { Button } from "@simplist/ui/components/button";
import { Input } from "@simplist/ui/components/input";

const FloatingLinkEditor = ({
  editor,
  isLink,
  setIsLink,
  anchorElem,
  isLinkEditMode,
  setIsLinkEditMode,
}: {
  editor: LexicalEditor;
  isLink: boolean;
  setIsLink: (isLink: boolean) => void;
  anchorElem: HTMLElement;
  isLinkEditMode: boolean;
  setIsLinkEditMode: (isEditMode: boolean) => void;
}): JSX.Element => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [editedLinkUrl, setEditedLinkUrl] = useState("https://");
  const [lastSelection, setLastSelection] = useState<BaseSelection | null>(
    null,
  );

  const $updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const linkParent = $findMatchingParent(node, $isLinkNode);

      if (linkParent) {
        setLinkUrl(linkParent.getURL());
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
      } else {
        setLinkUrl("");
      }

      if (isLinkEditMode) {
        setEditedLinkUrl(linkUrl);
      }
    }

    const editorElem = editorRef.current;
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (editorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();

    if (
      selection !== null &&
      nativeSelection !== null &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode) &&
      editor.isEditable()
    ) {
      const domRect: DOMRect | undefined =
        nativeSelection.focusNode?.parentElement?.getBoundingClientRect();
      if (domRect) {
        domRect.y += 40;
        setFloatingElemPositionForLinkEditor(domRect, editorElem, anchorElem);
      }
      setLastSelection(selection);
    } else if (!activeElement || activeElement.className !== "link-input") {
      if (rootElement !== null) {
        setFloatingElemPositionForLinkEditor(null, editorElem, anchorElem);
      }
      setLastSelection(null);
      setIsLinkEditMode(false);
      setLinkUrl("");
    }

    return true;
  }, [anchorElem, editor, setIsLinkEditMode, isLinkEditMode, linkUrl]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        $updateLinkEditor();
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
  }, [anchorElem.parentElement, editor, $updateLinkEditor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateLinkEditor();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateLinkEditor();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isLink) {
            setIsLink(false);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [editor, $updateLinkEditor, setIsLink, isLink]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      $updateLinkEditor();
    });
  }, [editor, $updateLinkEditor]);

  useEffect(() => {
    if (isLinkEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLinkEditMode, isLink]);

  const monitorInputInteraction = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleLinkSubmission();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsLinkEditMode(false);
    }
  };

  const handleLinkSubmission = () => {
    if (lastSelection !== null) {
      if (linkUrl !== "") {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, editedLinkUrl);
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const parent = getSelectedNode(selection).getParent();
            if ($isLinkNode(parent)) {
              const linkNode = parent as LinkNode;
              linkNode.setURL(editedLinkUrl);
            }
          }
        });
      }
      setIsLinkEditMode(false);
    }
  };

  const deleteLink = () => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
  };

  // Don't render if not showing link or edit mode
  if (!isLink && !isLinkEditMode) {
    return <div ref={editorRef} style={{ display: "none" }} />;
  }

  return (
    <div
      ref={editorRef}
      className="bg-popover absolute top-0 left-0 z-50 flex w-full max-w-xs items-center gap-1 rounded-md border p-1.5 opacity-0 shadow-md transition-opacity will-change-transform"
    >
      {!isLinkEditMode && isLink ? (
        <>
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 flex-1 truncate px-2 text-sm underline"
          >
            {linkUrl}
          </a>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => {
              setEditedLinkUrl(linkUrl);
              setIsLinkEditMode(true);
            }}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            asChild
          >
            <a href={linkUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive size-7"
            onClick={deleteLink}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </>
      ) : isLinkEditMode ? (
        <>
          <Input
            ref={inputRef}
            className="link-input h-7 flex-1 text-sm"
            value={editedLinkUrl}
            onChange={(event) => {
              setEditedLinkUrl(event.target.value);
            }}
            onKeyDown={monitorInputInteraction}
            placeholder="https://example.com"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => {
              setIsLinkEditMode(false);
            }}
          >
            <X className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={handleLinkSubmission}
          >
            <Check className="size-3.5" />
          </Button>
        </>
      ) : null}
    </div>
  );
};

const useFloatingLinkEditorToolbar = (
  editor: LexicalEditor,
  anchorElem: HTMLElement | null,
  isLinkEditMode: boolean,
  setIsLinkEditMode: (isEditMode: boolean) => void,
): JSX.Element | null => {
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLink, setIsLink] = useState(false);

  useEffect(() => {
    function $updateToolbar() {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const focusNode = getSelectedNode(selection);
        const focusLinkNode = $findMatchingParent(focusNode, $isLinkNode);
        const focusAutoLinkNode = $findMatchingParent(
          focusNode,
          $isAutoLinkNode,
        );
        if (!(focusLinkNode || focusAutoLinkNode)) {
          setIsLink(false);
          return;
        }
        const badNode = selection
          .getNodes()
          .filter((node) => !$isLineBreakNode(node))
          .find((node) => {
            const linkNode = $findMatchingParent(node, $isLinkNode);
            const autoLinkNode = $findMatchingParent(node, $isAutoLinkNode);
            return (
              (focusLinkNode && !focusLinkNode.is(linkNode)) ||
              (focusAutoLinkNode && !focusAutoLinkNode.is(autoLinkNode))
            );
          });
        if (!badNode) {
          setIsLink(true);
        } else {
          setIsLink(false);
        }
      }
    }
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          $updateToolbar();
          setActiveEditor(newEditor);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        CLICK_COMMAND,
        (payload) => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection);
            const linkNode = $findMatchingParent(node, $isLinkNode);
            if ($isLinkNode(linkNode) && (payload.metaKey || payload.ctrlKey)) {
              window.open(linkNode.getURL(), "_blank");
              return true;
            }
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor]);

  if (!anchorElem) {
    return null;
  }

  return createPortal(
    <FloatingLinkEditor
      editor={activeEditor}
      isLink={isLink}
      setIsLink={setIsLink}
      anchorElem={anchorElem}
      isLinkEditMode={isLinkEditMode}
      setIsLinkEditMode={setIsLinkEditMode}
    />,
    anchorElem,
  );
};

export const FloatingLinkEditorPlugin = ({
  anchorElem,
  isLinkEditMode,
  setIsLinkEditMode,
}: {
  anchorElem: HTMLDivElement | null;
  isLinkEditMode: boolean;
  setIsLinkEditMode: (isEditMode: boolean) => void;
}): JSX.Element | null => {
  const [editor] = useLexicalComposerContext();
  return useFloatingLinkEditorToolbar(
    editor,
    anchorElem,
    isLinkEditMode,
    setIsLinkEditMode,
  );
};
