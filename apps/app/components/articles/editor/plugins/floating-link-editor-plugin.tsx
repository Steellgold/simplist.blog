"use client";

import { cn } from "@/lib/utils";
import { Check, Pencil, TrashBin, Xmark } from "@gravity-ui/icons";
import {
  $createLinkNode,
  $isAutoLinkNode,
  $isLinkNode,
  TOGGLE_LINK_COMMAND,
} from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { Button } from "@simplist/ui/components/button";
import { ButtonGroup } from "@simplist/ui/components/button-group";
import { Card, CardContent, CardFooter } from "@simplist/ui/components/card";
import {
  InputGroup,
  InputGroupInput,
  InputGroupSeparator,
} from "@simplist/ui/components/input-group";
import {
  $createTextNode,
  $findMatchingParent,
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
import { ArrowUpRightFromSquare } from "lucide-react";
import Link from "next/link";
import type { JSX, KeyboardEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getSelectedNode } from "../utils/get-selected-node";
import { setFloatingElemPositionForLinkEditor } from "../utils/set-floating-elem-position";

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
  const textInputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [editedLinkUrl, setEditedLinkUrl] = useState("https://example.com");
  const [editedLinkText, setEditedLinkText] = useState("");
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
        setEditedLinkText(linkParent.getTextContent());
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
        setEditedLinkText(node.getTextContent());
      } else {
        setLinkUrl("");
        setEditedLinkText("");
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

      // Only reset edit mode if we're not in edit mode or if we've moved away from link
      if (isLinkEditMode) {
        setIsLinkEditMode(false);
        setEditedLinkText("");
        setEditedLinkUrl("https://example.com");
      }
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
    if (isLinkEditMode && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [isLinkEditMode, isLink]);

  const monitorInputInteraction = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleLinkSubmission();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsLinkEditMode(false);
    }
  };

  const handleLinkSubmission = () => {
    if (lastSelection !== null && editedLinkUrl) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const node = getSelectedNode(selection);
          const linkParent = $findMatchingParent(node, $isLinkNode);

          // Find the link node
          const linkNode = linkParent || ($isLinkNode(node) ? node : null);

          if (linkNode && $isLinkNode(linkNode)) {
            // Only update URL if text hasn't changed
            if (
              !editedLinkText ||
              editedLinkText === linkNode.getTextContent()
            ) {
              linkNode.setURL(editedLinkUrl);
            } else {
              // Replace with a new link node (atomic operation)
              const newLinkNode = $createLinkNode(editedLinkUrl);
              const textNode = $createTextNode(editedLinkText);
              newLinkNode.append(textNode);
              linkNode.replace(newLinkNode);
              // Move selection after the new link
              newLinkNode.selectEnd();
            }
          }

          // If no link exists, create new one
          else if (linkUrl === "") {
            const newLinkNode = $createLinkNode(editedLinkUrl);
            const textNode = $createTextNode(editedLinkText || editedLinkUrl);
            newLinkNode.append(textNode);
            selection.insertNodes([newLinkNode]);
          }
        }
      });
      setIsLinkEditMode(false);
    }
  };

  const deleteLink = () => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
  };

  // Close edit mode if we're in edit mode but not on a link anymore
  useEffect(() => {
    if (isLinkEditMode && !isLink && !linkUrl) {
      setIsLinkEditMode(false);
    }
  }, [isLinkEditMode, isLink, linkUrl, setIsLinkEditMode]);

  // Don't render if not showing link or edit mode
  if (!isLink && !isLinkEditMode) {
    return <div ref={editorRef} style={{ display: "none" }} />;
  }

  return (
    <Card
      ref={editorRef}
      className={cn(
        "absolute -top-7.5 left-0 z-50",
        "opacity-0 shadow-md transition-opacity will-change-transform",
        {
          "max-w-sm": isLinkEditMode,
          "max-w-[250px]": !isLinkEditMode,
        },
        "p-0",
      )}
    >
      <CardContent className="flex items-center gap-1 p-1.5">
        {!isLinkEditMode ? (
          <Link
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 flex-1 truncate px-2 text-sm underline"
          >
            {linkUrl}
          </Link>
        ) : (
          <InputGroup orientation="vertical">
            <InputGroupInput
              ref={textInputRef}
              className="link-input text-sm"
              placeholder="Link text"
              value={editedLinkText}
              onChange={(event) => {
                setEditedLinkText(event.target.value);
              }}
            />

            <InputGroupSeparator />

            <InputGroupInput
              ref={inputRef}
              className="link-input text-sm"
              placeholder="https://example.com"
              value={editedLinkUrl}
              onChange={(event) => {
                setEditedLinkUrl(event.target.value);
              }}
            />
          </InputGroup>
        )}
      </CardContent>

      <CardFooter
        className={cn("-mt-4.5 flex items-center justify-end gap-1 p-1.5")}
      >
        <ButtonGroup>
          {isLinkEditMode ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                handleLinkSubmission();
              }}
            >
              <Check />
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                setIsLinkEditMode(true);
              }}
            >
              <Pencil />
            </Button>
          )}

          {isLinkEditMode ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                setIsLinkEditMode(false);
              }}
            >
              <Xmark />
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                if (linkUrl) window.open(linkUrl, "_blank");
              }}
            >
              <ArrowUpRightFromSquare />
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => {
              deleteLink();
            }}
          >
            <TrashBin />
          </Button>
        </ButtonGroup>
      </CardFooter>
    </Card>
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
