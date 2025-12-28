"use client";

import type { JSX } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { $isLinkNode } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { $isCodeHighlightNode } from "@lexical/code";
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  type LexicalEditor,
  $getNodeByKey,
  type TextNode,
  $isElementNode,
  $createTextNode,
} from "lexical";
import { createPortal } from "react-dom";
import { getSelectedNode } from "../utils/get-selected-node";
import { toast } from "@simplist/ui/components/sonner";
import { correctContent, rewriteContent } from "@/lib/actions/ai";
import type { ProjectSubscription } from "@/lib/subscription/quota-check";
import type { RewriteStyle } from "@/lib/ai/constants";

// Import sub-modules
import type {
  AiActionKind,
  BlockReplacement,
  AiBlockState,
  BlockInfo,
} from "./floating-text-format/types";
import { AiVersionControlPanel } from "./floating-text-format/ai-version-control-panel";
import { FloatingTextFormatToolbar } from "./floating-text-format/floating-text-format-toolbar";
import {
  isSingleBlockSelection,
  extractBlocksFromSelection,
} from "./floating-text-format/block-utils";
import {
  parseMarkdownToTextNodes,
  parseMarkdownToNodes,
  textNodeToMarkdown,
} from "./floating-text-format/text-utils";

const useFloatingTextFormatToolbar = (
  editor: LexicalEditor,
  anchorElem: HTMLDivElement | null,
  setIsLinkEditMode: (isEditMode: boolean) => void,
  projectId?: string,
  subscription?: ProjectSubscription,
  language?: string,
): JSX.Element | null => {
  const [isText, setIsText] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiVersions, setAiVersions] = useState<string[]>([]);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
  const [originalText, setOriginalText] = useState("");
  const [isAiSessionActive, setIsAiSessionActive] = useState(false);
  const [isMultiBlock, setIsMultiBlock] = useState(false);

  // Store text node and positions for AI session
  const aiTextNodeKeyRef = useRef<string | null>(null);
  const aiStartOffsetRef = useRef(0);
  const aiCurrentLengthRef = useRef(0);

  // Store multiple blocks for multi-block AI sessions
  const aiBlocksRef = useRef<AiBlockState[]>([]);

  const updatePopup = useCallback(() => {
    editor.getEditorState().read(() => {
      if (editor.isComposing()) {
        return;
      }
      const selection = $getSelection();
      const nativeSelection = window.getSelection();
      const rootElement = editor.getRootElement();

      if (
        nativeSelection !== null &&
        (!$isRangeSelection(selection) ||
          rootElement === null ||
          !rootElement.contains(nativeSelection.anchorNode))
      ) {
        setIsText(false);
        return;
      }

      if (!$isRangeSelection(selection)) {
        return;
      }

      const node = getSelectedNode(selection);

      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));

      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (
        !$isCodeHighlightNode(selection.anchor.getNode()) &&
        selection.getTextContent() !== ""
      ) {
        const isSingleBlock = isSingleBlockSelection(selection);
        setIsMultiBlock(!isSingleBlock);
        // Show toolbar for any text selection, not just TextNode or ParagraphNode
        setIsText(true);
        const textContent = selection.getTextContent();
        setSelectedText(textContent);
      } else {
        setIsText(false);
        setIsMultiBlock(false);
      }

      const rawTextContent = selection.getTextContent().replace(/\n/g, "");
      if (!selection.isCollapsed() && rawTextContent === "") {
        setIsText(false);
        return;
      }
    });
  }, [editor]);

  // Replace text at stored position
  const replaceTextAtPosition = useCallback(
    (newText: string) => {
      if (!aiTextNodeKeyRef.current) return;

      editor.update(() => {
        try {
          const node = $getNodeByKey(aiTextNodeKeyRef.current!);
          if (!node || !$isTextNode(node)) return;

          const textNode = node as TextNode;
          const currentText = textNode.getTextContent();
          const startOffset = aiStartOffsetRef.current;
          const endOffset = startOffset + aiCurrentLengthRef.current;

          // Create new text: before + new + after
          const before = currentText.substring(0, startOffset);
          const after = currentText.substring(endOffset);
          const newFullText = before + newText + after;

          // Replace the entire text content
          textNode.setTextContent(newFullText);

          // Update current length for next replacement
          aiCurrentLengthRef.current = newText.length;
        } catch (error) {
          console.error("Error replacing text:", error);
        }
      });
    },
    [editor],
  );

  /**
   * Replace text in multiple blocks - ONLY replace the selected portion
   */
  const replaceTextInBlocks = useCallback(
    (blockReplacements: BlockReplacement[]) => {
      editor.update(() => {
        for (const {
          blockKey,
          newText,
          selectionStart,
          selectionEnd,
        } of blockReplacements) {
          try {
            const block = $getNodeByKey(blockKey);
            if (!block || !$isElementNode(block)) continue;

            // Get all text nodes in the block
            const allTextNodes: TextNode[] = [];
            block.getChildren().forEach((child) => {
              if ($isTextNode(child)) {
                allTextNodes.push(child);
              }
            });

            // Build two versions: plain text for offsets, markdown text for content
            let completeTextPlain = "";
            let completeTextMarkdown = "";

            for (const textNode of allTextNodes) {
              completeTextPlain += textNode.getTextContent();
              completeTextMarkdown += textNodeToMarkdown(textNode);
            }

            // We need to extract before/after WITH markdown formatting
            // Build a mapping of plain text positions to markdown text
            let markdownOffset = 0;
            let plainOffset = 0;
            const offsetMap: Array<{ plainPos: number; markdownPos: number }> =
              [];

            for (const textNode of allTextNodes) {
              const plainText = textNode.getTextContent();
              const markdownText = textNodeToMarkdown(textNode);

              // Map the start position
              offsetMap.push({
                plainPos: plainOffset,
                markdownPos: markdownOffset,
              });

              plainOffset += plainText.length;
              markdownOffset += markdownText.length;
            }
            // Add final position
            offsetMap.push({
              plainPos: plainOffset,
              markdownPos: markdownOffset,
            });

            // Find markdown positions for selection boundaries
            const findMarkdownPos = (plainPos: number): number => {
              for (let i = 0; i < offsetMap.length - 1; i++) {
                const curr = offsetMap[i];
                const next = offsetMap[i + 1];

                if (plainPos >= curr.plainPos && plainPos <= next.plainPos) {
                  const offsetInNode = plainPos - curr.plainPos;
                  return curr.markdownPos + offsetInNode;
                }
              }
              return markdownOffset;
            };

            const markdownSelectionStart = findMarkdownPos(selectionStart);
            const markdownSelectionEnd = findMarkdownPos(selectionEnd);

            // Extract before/after with markdown
            const beforeSelection = completeTextMarkdown.substring(
              0,
              markdownSelectionStart,
            );
            const afterSelection =
              completeTextMarkdown.substring(markdownSelectionEnd);

            // Clear the block
            block.clear();

            // Before selection: parse markdown to preserve formatting (including links)
            if (beforeSelection) {
              const nodesBefore = parseMarkdownToNodes(beforeSelection);
              for (const node of nodesBefore) {
                block.append(node);
              }
            }

            // New text: parse markdown to apply formatting (including links)
            if (newText) {
              const nodesNew = parseMarkdownToNodes(newText);
              for (const node of nodesNew) {
                block.append(node);
              }
            }

            // After selection: parse markdown to preserve formatting (including links)
            if (afterSelection) {
              const nodesAfter = parseMarkdownToNodes(afterSelection);
              for (const node of nodesAfter) {
                block.append(node);
              }
            }
          } catch (error) {
            console.error(`Error replacing text in block ${blockKey}:`, error);
          }
        }
      });
    },
    [editor],
  );

  // Handle version change with preview
  const handleVersionChange = useCallback(
    (newIndex: number) => {
      setSelectedVersionIndex(newIndex);
      replaceTextAtPosition(aiVersions[newIndex]);
    },
    [aiVersions, replaceTextAtPosition],
  );

  // Apply the selected version (finalize)
  const handleApplyVersion = useCallback(() => {
    setIsAiSessionActive(false);
    setAiVersions([]);
    setSelectedVersionIndex(0);
    setOriginalText("");
    aiTextNodeKeyRef.current = null;
    aiStartOffsetRef.current = 0;
    aiCurrentLengthRef.current = 0;
    toast.success("Version applied");
  }, []);

  // Cancel and restore original text
  const handleCancelAiSession = useCallback(() => {
    if (originalText && aiTextNodeKeyRef.current) {
      replaceTextAtPosition(originalText);
    }

    setIsAiSessionActive(false);
    setAiVersions([]);
    setSelectedVersionIndex(0);
    setOriginalText("");
    aiTextNodeKeyRef.current = null;
    aiStartOffsetRef.current = 0;
    aiCurrentLengthRef.current = 0;
    toast.info("Changes cancelled");
  }, [originalText, replaceTextAtPosition]);

  const handleAiAction = useCallback(
    async (action: AiActionKind, style?: RewriteStyle) => {
      if (!projectId || !language) {
        toast.error("Missing configuration");
        return;
      }

      const selectionLength = selectedText.length;
      if (selectionLength < 3) {
        toast.error("Selection too short for AI");
        return;
      }

      // ALWAYS use block-level replacement for all selections
      let blocks: BlockInfo[] = [];

      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          blocks = extractBlocksFromSelection(selection);
        }
      });

      if (blocks.length === 0) {
        toast.error("No blocks found in selection");
        return;
      }

      // Store original state for undo (store the selected text only)
      aiBlocksRef.current = blocks.map((b) => ({
        blockKey: b.blockKey,
        originalText: b.selectedText, // Store only selected text
        selectionStart: b.selectionStart,
        selectionEnd: b.selectionEnd,
      }));

      setIsAiLoading(true);
      setIsAiSessionActive(true);

      try {
        const blockReplacements: BlockReplacement[] = [];

        // Determine version count (only for single block)
        let versionCount = 1;
        if (blocks.length === 1) {
          const textLength = blocks[0].text.length;
          if (textLength > 800) {
            versionCount = 3;
          } else if (textLength > 300) {
            versionCount = 2;
          }
        }

        // Generate versions
        for (let versionIdx = 0; versionIdx < versionCount; versionIdx++) {
          // Process each block
          for (const block of blocks) {
            let result;

            // Send ONLY the selected text to AI, not the full block
            const textToEdit = block.selectedText;

            if (action === "rewrite" && style) {
              result = await rewriteContent(
                projectId,
                textToEdit,
                style,
                "content",
              );
            } else {
              result = await correctContent(
                projectId,
                textToEdit,
                language,
                "content",
              );
            }

            if (result.success) {
              const content =
                "correctedContent" in result.data
                  ? result.data.correctedContent
                  : result.data.rewrittenContent;

              // Only store first version
              if (versionIdx === 0) {
                blockReplacements.push({
                  blockKey: block.blockKey,
                  newText: content,
                  selectionStart: block.selectionStart,
                  selectionEnd: block.selectionEnd,
                });
              }
            } else {
              throw new Error(result.error);
            }
          }
        }

        // Apply replacements
        replaceTextInBlocks(blockReplacements);

        // For single block: show version control
        // For multi-block: auto-apply
        if (blocks.length === 1 && versionCount > 1) {
          setAiVersions(blockReplacements.map((r) => r.newText));
          setSelectedVersionIndex(0);
          setIsAiSessionActive(true);
        } else {
          setIsAiSessionActive(false);
          aiBlocksRef.current = [];
          toast.success(`${blocks.length} block(s) updated`);
        }
      } catch (error) {
        console.error("AI action error:", error);
        toast.error(
          error instanceof Error ? error.message : "Error during AI action",
        );
        // Restore original
        if (aiBlocksRef.current.length > 0) {
          const restores = aiBlocksRef.current.map((b) => ({
            blockKey: b.blockKey,
            newText: b.originalText,
            selectionStart: b.selectionStart,
            selectionEnd: b.selectionEnd,
          }));
          replaceTextInBlocks(restores);
        }
      } finally {
        setIsAiLoading(false);
      }
    },
    [projectId, language, selectedText, editor, replaceTextInBlocks],
  );

  useEffect(() => {
    document.addEventListener("selectionchange", updatePopup);
    return () => {
      document.removeEventListener("selectionchange", updatePopup);
    };
  }, [updatePopup]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updatePopup();
      }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setIsText(false);
        }
      }),
    );
  }, [editor, updatePopup]);

  if (!anchorElem) {
    return null;
  }

  return (
    <>
      {isText &&
        createPortal(
          <FloatingTextFormatToolbar
            editor={editor}
            anchorElem={anchorElem}
            isLink={isLink}
            isBold={isBold}
            isItalic={isItalic}
            isStrikethrough={isStrikethrough}
            isUnderline={isUnderline}
            isCode={isCode}
            setIsLinkEditMode={setIsLinkEditMode}
            projectId={projectId}
            subscription={subscription}
            isAiLoading={isAiLoading}
            onAiAction={handleAiAction}
            isMultiBlock={isMultiBlock}
          />,
          anchorElem,
        )}

      {/* AI Version Control Panel - positioned next to text */}
      {isAiSessionActive &&
        anchorElem &&
        createPortal(
          <AiVersionControlPanel
            versions={aiVersions}
            currentIndex={selectedVersionIndex}
            isLoading={isAiLoading}
            onVersionChange={handleVersionChange}
            onCancel={handleCancelAiSession}
            onApply={handleApplyVersion}
            anchorElem={anchorElem}
            editor={editor}
          />,
          document.body,
        )}
    </>
  );
};

export const FloatingTextFormatToolbarPlugin = ({
  anchorElem,
  setIsLinkEditMode,
  projectId,
  subscription,
  language,
}: {
  anchorElem: HTMLDivElement | null;
  setIsLinkEditMode: (isEditMode: boolean) => void;
  projectId?: string;
  subscription?: ProjectSubscription;
  language?: string;
}): JSX.Element | null => {
  const [editor] = useLexicalComposerContext();

  return useFloatingTextFormatToolbar(
    editor,
    anchorElem,
    setIsLinkEditMode,
    projectId,
    subscription,
    language,
  );
};
