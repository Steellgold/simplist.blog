"use client";

import { useCallback, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_CRITICAL,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  type HeadingTagType,
} from "@lexical/rich-text";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  $isListNode,
  ListNode,
} from "@lexical/list";
import { $createCodeNode } from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  Bold,
  ChevronDown,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Picture,
  Italic,
  Link as LinkIcon,
  ListUl,
  ListCheck,
  ListOl,
  ChevronsExpandUpRight,
  ChevronsCollapseUpRight,
  QuoteOpen,
  Strikethrough,
  Underline,
} from "@gravity-ui/icons";
import { Pilcrow } from "@simplist/ui/components/icons";

import { useEditorFullscreenOptional } from "@/hooks/use-editor-fullscreen";
import { getSelectedNode } from "./utils/get-selected-node";
import { Button } from "@simplist/ui/components/button";
import { Toggle } from "@simplist/ui/components/toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@simplist/ui/components/dropdown-menu";
import { ButtonGroup } from "@simplist/ui/components/button-group";

const blockTypeToBlockName: Record<string, string> = {
  paragraph: "Paragraph",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  bullet: "Bulleted List",
  number: "Numbered List",
  check: "Check List",
  quote: "Quote",
  code: "Code Block",
};

const blockTypeToIcon: Record<string, React.ComponentType> = {
  paragraph: Pilcrow,
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  bullet: ListUl,
  number: ListOl,
  check: ListCheck,
  quote: QuoteOpen,
  code: Code,
};

type EditorToolbarProps = {
  onInsertImage?: () => void;
  onInsertLink?: () => void;
  setIsLinkEditMode: (isEditMode: boolean) => void;
  /** Hide formatting tools (for markdown mode) */
  isMarkdownMode?: boolean;
};

export const EditorToolbar = ({
  onInsertImage,
  onInsertLink,
  setIsLinkEditMode,
  isMarkdownMode = false,
}: EditorToolbarProps) => {
  const fullscreenContext = useEditorFullscreenOptional();
  const isFullscreen = fullscreenContext?.isFullscreen ?? false;
  const toggleFullscreen = fullscreenContext?.toggleFullscreen ?? (() => {});

  // In markdown mode, only show fullscreen button
  if (isMarkdownMode) {
    return (
      <div className="bg-muted/30 flex items-center justify-end gap-1 px-2 py-1.5">
        <Toggle
          variant="outline"
          pressed={isFullscreen}
          onPressedChange={toggleFullscreen}
          aria-label="Fullscreen"
          title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
        >
          {isFullscreen ? (
            <ChevronsCollapseUpRight />
          ) : (
            <ChevronsExpandUpRight />
          )}
        </Toggle>
      </div>
    );
  }

  return (
    <EditorToolbarWithLexical
      onInsertImage={onInsertImage}
      onInsertLink={onInsertLink}
      setIsLinkEditMode={setIsLinkEditMode}
    />
  );
};

const EditorToolbarWithLexical = ({
  onInsertImage,
  onInsertLink,
  setIsLinkEditMode,
}: {
  onInsertImage?: () => void;
  onInsertLink?: () => void;
  setIsLinkEditMode: (isEditMode: boolean) => void;
}) => {
  const [editor] = useLexicalComposerContext();
  const fullscreenContext = useEditorFullscreenOptional();
  const isFullscreen = fullscreenContext?.isFullscreen ?? false;
  const toggleFullscreen = fullscreenContext?.toggleFullscreen ?? (() => {});
  const [blockType, setBlockType] = useState<string>("paragraph");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Get block type
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $findMatchingParent(anchorNode, (e) =>
            $isListNode(e),
          );
          const type = parentList
            ? (parentList as ListNode).getListType()
            : (element as ListNode).getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type);
          } else {
            setBlockType("paragraph");
          }
        }
      }

      // Text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));

      // Link
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
    );
  }, [editor, $updateToolbar]);

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    }
  };

  const formatCode = () => {
    if (blockType !== "code") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          if (selection.isCollapsed()) {
            $setBlocksType(selection, () => $createCodeNode());
          } else {
            const textContent = selection.getTextContent();
            const codeNode = $createCodeNode();
            selection.insertNodes([codeNode]);
            const newSelection = $getSelection();
            if ($isRangeSelection(newSelection)) {
              newSelection.insertRawText(textContent);
            }
          }
        }
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      formatParagraph();
    }
  };

  const formatNumberedList = () => {
    if (blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      formatParagraph();
    }
  };

  const formatCheckList = () => {
    if (blockType !== "check") {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    } else {
      formatParagraph();
    }
  };

  const insertLink = () => {
    if (isLink) {
      // Remove existing link
      setIsLinkEditMode(false);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      return;
    }

    // Check if there's selected text
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) && !selection.isCollapsed()) {
        // Text is selected - use the floating link editor
        setIsLinkEditMode(true);
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
      } else if (onInsertLink) {
        // No text selected - open the dialog to input text + URL
        onInsertLink();
      }
    });
  };

  const BlockIcon = blockTypeToIcon[blockType] || Pilcrow;

  return (
    <div className="bg-muted/30 flex items-center justify-between border-b px-2 py-1.5">
      {/* LEFT TOOLBAR */}
      <div className="flex flex-wrap items-center gap-2">
        {/* BLOCK TYPE */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" className="gap-2">
              <BlockIcon />
              <span className="text-sm">{blockTypeToBlockName[blockType]}</span>
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={formatParagraph}>
              <Pilcrow /> Paragraph
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => formatHeading("h1")}>
              <Heading1 /> Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => formatHeading("h2")}>
              <Heading2 /> Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => formatHeading("h3")}>
              <Heading3 /> Heading 3
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => formatHeading("h4")}>
              <Heading4 /> Heading 4
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => formatHeading("h5")}>
              <Heading5 /> Heading 5
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => formatHeading("h6")}>
              <Heading6 /> Heading 6
            </DropdownMenuItem>

            <DropdownMenuItem onClick={formatBulletList}>
              <ListUl /> Bulleted List
            </DropdownMenuItem>

            <DropdownMenuItem onClick={formatNumberedList}>
              <ListOl /> Numbered List
            </DropdownMenuItem>

            <DropdownMenuItem onClick={formatCheckList}>
              <ListCheck /> Check List
            </DropdownMenuItem>

            <DropdownMenuItem onClick={formatQuote}>
              <QuoteOpen /> Quote
            </DropdownMenuItem>

            <DropdownMenuItem onClick={formatCode}>
              <Code /> Code Block
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* TEXT FORMATTING */}
        <div className="flex items-center gap-1">
          <ButtonGroup>
            <Toggle
              variant="outline"
              pressed={isBold}
              onPressedChange={() =>
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")
              }
            >
              <Bold />
            </Toggle>

            <Toggle
              variant="outline"
              pressed={isItalic}
              onPressedChange={() =>
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")
              }
            >
              <Italic />
            </Toggle>

            <Toggle
              variant="outline"
              pressed={isUnderline}
              onPressedChange={() =>
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
              }
            >
              <Underline />
            </Toggle>

            <Toggle
              variant="outline"
              pressed={isStrikethrough}
              onPressedChange={() =>
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
              }
            >
              <Strikethrough />
            </Toggle>
          </ButtonGroup>
        </div>

        {/* INLINE ACTIONS */}
        <ButtonGroup>
          <Toggle
            variant="outline"
            pressed={isCode}
            onPressedChange={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")
            }
          >
            <Code />
          </Toggle>

          <Toggle
            variant="outline"
            pressed={isLink}
            onPressedChange={insertLink}
          >
            <LinkIcon />
          </Toggle>
        </ButtonGroup>

        {onInsertImage && (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={onInsertImage}
          >
            <Picture />
          </Button>
        )}
      </div>

      {/* RIGHT TOOLBAR */}
      <Toggle
        variant="outline"
        pressed={isFullscreen}
        onPressedChange={toggleFullscreen}
        title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
      >
        {isFullscreen ? <ChevronsCollapseUpRight /> : <ChevronsExpandUpRight />}
      </Toggle>
    </div>
  );
};
