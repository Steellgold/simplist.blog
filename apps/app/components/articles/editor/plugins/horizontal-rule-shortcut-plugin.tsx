"use client";

import { $createHorizontalRuleNode } from "@lexical/extension";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  KEY_ENTER_COMMAND,
  type LexicalCommand,
} from "lexical";
import { useEffect } from "react";

/**
 * Plugin to handle markdown shortcuts for horizontal rules
 * Converts ---, ***, or ___ followed by Enter into a horizontal rule
 */
export const HorizontalRuleShortcutPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND as LexicalCommand<KeyboardEvent>,
      (event: KeyboardEvent | null) => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        const anchorNode = selection.anchor.getNode();
        const textContent = anchorNode.getTextContent().trim();

        // Check if the text matches ---, ***, or ___
        if (
          textContent === "---" ||
          textContent === "***" ||
          textContent === "___"
        ) {
          event?.preventDefault();

          // Get the parent element
          const element = anchorNode.getTopLevelElement();
          if (!element) {
            return false;
          }

          // Create horizontal rule
          const hrNode = $createHorizontalRuleNode();

          // Create a new paragraph after the HR
          const newParagraph = $createParagraphNode();

          // Replace the current element with HR and add a new paragraph
          element.replace(hrNode);
          hrNode.insertAfter(newParagraph);

          // Move cursor to the new paragraph
          newParagraph.select();

          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  return null;
};
