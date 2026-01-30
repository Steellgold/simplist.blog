import {
  $isParagraphNode,
  $isTextNode,
  $isElementNode,
  type LexicalNode,
  type ElementNode,
  type RangeSelection,
  type TextNode,
} from "lexical";
import { $isLinkNode } from "@lexical/link";
import { $isHeadingNode, $isQuoteNode } from "@lexical/rich-text";
import { $isListItemNode } from "@lexical/list";
import type { BlockInfo } from "./types";
import { textNodeToMarkdown } from "./text-utils";

/**
 * Get the top-level block element containing a node
 * Returns HeadingNode, ParagraphNode, ListItemNode, QuoteNode, etc.
 */
export const getBlockParent = (node: LexicalNode): ElementNode | null => {
  let current: LexicalNode = node;

  while (current) {
    // Check if we've reached a block-level element
    if (
      $isHeadingNode(current) ||
      $isParagraphNode(current) ||
      $isListItemNode(current) ||
      $isQuoteNode(current)
    ) {
      return current as ElementNode;
    }

    // Move to parent
    const parent = current.getParent();
    if (!parent) return null;

    current = parent;
  }

  return null;
};

/**
 * Check if selection is within a single block element
 */
export const isSingleBlockSelection = (selection: RangeSelection): boolean => {
  const nodes = selection.getNodes();

  // Empty selection
  if (nodes.length === 0) return true;

  // Get block parent of first node
  const firstBlock = getBlockParent(nodes[0]);
  if (!firstBlock) return true; // Fallback to single-block

  const firstBlockKey = firstBlock.getKey();

  // Check if all nodes belong to the same block
  for (const node of nodes) {
    const blockParent = getBlockParent(node);
    if (!blockParent || blockParent.getKey() !== firstBlockKey) {
      return false; // Different block found
    }
  }

  return true;
};

/**
 * Extract blocks from selection with exact selection boundaries
 * Returns block text (context) + selected text + offsets
 */
export const extractBlocksFromSelection = (
  selection: RangeSelection,
): BlockInfo[] => {
  const nodes = selection.getNodes();
  const blockMap = new Map<
    string,
    {
      block: ElementNode;
      selectedNodes: Set<string>; // Track which text nodes are selected
    }
  >();

  // Identify all unique blocks and selected nodes
  for (const node of nodes) {
    if (!$isTextNode(node)) continue;

    const blockParent = getBlockParent(node);
    if (!blockParent) continue;

    const blockKey = blockParent.getKey();
    const nodeKey = node.getKey();

    if (!blockMap.has(blockKey)) {
      blockMap.set(blockKey, {
        block: blockParent,
        selectedNodes: new Set(),
      });
    }

    blockMap.get(blockKey)!.selectedNodes.add(nodeKey);
  }

  const blocks: BlockInfo[] = [];
  const anchor = selection.anchor;
  const focus = selection.focus;

  for (const [blockKey, { block, selectedNodes }] of blockMap.entries()) {
    // Build plain text and markdown text by walking through all children recursively
    let completeTextPlain = "";
    let completeTextMarkdown = "";

    // Walk through all children (including nested LinkNodes)
    const walkNode = (node: LexicalNode): void => {
      if ($isTextNode(node)) {
        completeTextPlain += node.getTextContent();
        completeTextMarkdown += textNodeToMarkdown(node);
      } else if ($isLinkNode(node)) {
        const url = node.getURL();
        const linkTextPlain: string[] = [];
        const linkTextMarkdown: string[] = [];

        // Get all text nodes inside the link
        node.getChildren().forEach((child) => {
          if ($isTextNode(child)) {
            linkTextPlain.push(child.getTextContent());
            linkTextMarkdown.push(textNodeToMarkdown(child));
          }
        });

        const plainText = linkTextPlain.join("");
        const markdownText = linkTextMarkdown.join("");

        completeTextPlain += plainText;
        completeTextMarkdown += `[${markdownText}](${url})`;
      } else if ($isElementNode(node)) {
        // Recursively walk other element nodes
        node.getChildren().forEach(walkNode);
      }
    };

    block.getChildren().forEach(walkNode);

    // Build selected text with markdown formatting
    let selectedText = "";
    let selectionStart = -1;
    let selectionEnd = -1;
    let currentOffset = 0;

    // Walk again to extract selected portion
    const extractSelected = (node: LexicalNode): void => {
      if ($isTextNode(node)) {
        const nodeKey = node.getKey();
        const nodeText = node.getTextContent();
        const nodeLength = nodeText.length;

        if (selectedNodes.has(nodeKey)) {
          let startOffset = 0;
          let endOffset = nodeLength;

          if (anchor.key === nodeKey) {
            startOffset = anchor.offset;
          }
          if (focus.key === nodeKey) {
            endOffset = focus.offset;
          }

          if (startOffset > endOffset) {
            [startOffset, endOffset] = [endOffset, startOffset];
          }

          if (selectionStart === -1) {
            selectionStart = currentOffset + startOffset;
          }

          const selectedPortion = nodeText.substring(startOffset, endOffset);
          let formattedPortion = selectedPortion;

          // Apply text formatting
          if (node.hasFormat("bold")) {
            formattedPortion = `**${formattedPortion}**`;
          }
          if (node.hasFormat("italic")) {
            formattedPortion = `*${formattedPortion}*`;
          }
          if (node.hasFormat("strikethrough")) {
            formattedPortion = `~~${formattedPortion}~~`;
          }
          if (node.hasFormat("code")) {
            formattedPortion = `\`${formattedPortion}\``;
          }
          if (node.hasFormat("underline")) {
            formattedPortion = `__${formattedPortion}__`;
          }

          selectedText += formattedPortion;
          selectionEnd = currentOffset + endOffset;
        }

        currentOffset += nodeLength;
      } else if ($isLinkNode(node)) {
        const url = node.getURL();
        const linkChildren = node.getChildren();
        let linkHasSelection = false;
        let linkSelectedText = "";

        // Check if any child is selected
        for (const child of linkChildren) {
          if ($isTextNode(child) && selectedNodes.has(child.getKey())) {
            linkHasSelection = true;
            const nodeText = child.getTextContent();
            const nodeKey = child.getKey();

            let startOffset = 0;
            let endOffset = nodeText.length;

            if (anchor.key === nodeKey) {
              startOffset = anchor.offset;
            }
            if (focus.key === nodeKey) {
              endOffset = focus.offset;
            }

            if (startOffset > endOffset) {
              [startOffset, endOffset] = [endOffset, startOffset];
            }

            if (selectionStart === -1) {
              selectionStart = currentOffset + startOffset;
            }

            const selectedPortion = nodeText.substring(startOffset, endOffset);
            let formattedPortion = selectedPortion;

            // Apply text formatting
            if (child.hasFormat("bold")) {
              formattedPortion = `**${formattedPortion}**`;
            }
            if (child.hasFormat("italic")) {
              formattedPortion = `*${formattedPortion}*`;
            }
            if (child.hasFormat("strikethrough")) {
              formattedPortion = `~~${formattedPortion}~~`;
            }
            if (child.hasFormat("code")) {
              formattedPortion = `\`${formattedPortion}\``;
            }
            if (child.hasFormat("underline")) {
              formattedPortion = `__${formattedPortion}__`;
            }

            linkSelectedText += formattedPortion;
            selectionEnd = currentOffset + endOffset;
          }

          if ($isTextNode(child)) {
            currentOffset += child.getTextContent().length;
          }
        }

        if (linkHasSelection) {
          selectedText += `[${linkSelectedText}](${url})`;
        }
      } else if ($isElementNode(node)) {
        node.getChildren().forEach(extractSelected);
      }
    };

    block.getChildren().forEach(extractSelected);

    // Ensure we have valid selection bounds
    if (selectionStart === -1) selectionStart = 0;
    if (selectionEnd === -1) selectionEnd = completeTextPlain.length;

    blocks.push({
      blockKey,
      block,
      text: completeTextPlain, // Full block text in plain text (no markdown)
      selectedText, // Only the selected portion with markdown
      selectionStart,
      selectionEnd,
    });
  }

  return blocks;
};
