import type { LexicalEditor, ElementNode } from "lexical";
import type { ProjectSubscription } from "@/lib/subscription/quota-check";
import type { RewriteStyle } from "@/lib/ai/constants";

export type AiActionKind =
  | "correct-global"
  | "correct-ortho"
  | "correct-gram"
  | "correct-tone"
  | "rewrite";

export interface AiVersionControlPanelProps {
  versions: string[];
  currentIndex: number;
  isLoading: boolean;
  onVersionChange: (index: number) => void;
  onCancel: () => void;
  onApply: () => void;
  anchorElem: HTMLElement;
  editor: LexicalEditor;
}

export interface FloatingTextFormatToolbarProps {
  editor: LexicalEditor;
  anchorElem: HTMLElement;
  isBold: boolean;
  isCode: boolean;
  isItalic: boolean;
  isLink: boolean;
  isStrikethrough: boolean;
  isUnderline: boolean;
  setIsLinkEditMode: (isEditMode: boolean) => void;
  projectId?: string;
  subscription?: ProjectSubscription;
  isAiLoading: boolean;
  onAiAction: (action: AiActionKind, style?: RewriteStyle) => void;
  isMultiBlock: boolean;
}

export interface BlockInfo {
  blockKey: string;
  block: ElementNode;
  text: string; // Text COMPLETE of the block (context)
  selectedText: string; // Selected text only
  selectionStart: number; // Selection start offset in the block
  selectionEnd: number; // Selection end offset in the block
}

export interface BlockReplacement {
  blockKey: string;
  newText: string; // New text (only for the selected part)
  selectionStart: number; // Selection start offset in the block
  selectionEnd: number; // Selection end offset in the block
}

export interface AiBlockState {
  blockKey: string;
  originalText: string;
  selectionStart: number;
  selectionEnd: number;
}
