"use client";

import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from "@lexical/markdown";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import type { EditorState, LexicalEditor } from "lexical";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { HorizontalRuleNode } from "@lexical/extension";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";

import { EditorFooter } from "./editor-footer";
import { EditorToolbar } from "./editor-toolbar";
import { ImageNode } from "./nodes/image-node";
import { ComponentPickerMenuPlugin } from "./plugins/component-picker-plugin";
import { EmojiPickerPlugin } from "./plugins/emoji-picker-plugin";
import { FloatingLinkEditorPlugin } from "./plugins/floating-link-editor-plugin";
import { FloatingTextFormatToolbarPlugin } from "./plugins/floating-text-format-plugin";
import { ImagePlugin } from "./plugins/image-plugin";
import { LinkInsertDialog } from "./plugins/link-insert-dialog";
import { editorTheme } from "./theme/editor-theme";
import { ContentEditable } from "./ui/content-editable";
import { TRANSFORMERS } from "./utils/markdown-transformers";

import type { ProjectSubscription } from "@/lib/subscription/quota-check";
import { Card, CardContent } from "@simplist/ui/components/card";
import { Textarea } from "@simplist/ui/components/textarea";
import { cn } from "@simplist/ui/lib/utils";

// Plugin to sync content from props to editor
// Tracks the last known content to detect external changes (e.g., variant switch)
const ContentSyncPlugin = ({ content }: { content: string }) => {
  const [editor] = useLexicalComposerContext();
  const lastContentRef = useRef<string | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // On first render, load the initial content
    if (isFirstRender.current) {
      isFirstRender.current = false;
      lastContentRef.current = content;
      editor.update(() => {
        $convertFromMarkdownString(content, TRANSFORMERS);
      });
      return;
    }

    // If content changed from outside (e.g., variant switch), update editor
    if (content !== lastContentRef.current) {
      lastContentRef.current = content;
      editor.update(() => {
        // Clear editor and load new content
        $convertFromMarkdownString(content, TRANSFORMERS);
      });
    }
  }, [editor, content]);

  // Update lastContentRef when user types (called by MarkdownSyncPlugin)
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const markdown = $convertToMarkdownString(TRANSFORMERS);
        lastContentRef.current = markdown;
      });
    });
  }, [editor]);

  return null;
};

// Plugin to sync editor state back to markdown
const MarkdownSyncPlugin = ({
  onContentChange,
}: {
  onContentChange: (markdown: string) => void;
}) => {
  const handleChange = useCallback(
    (editorState: EditorState, _editor: LexicalEditor) => {
      editorState.read(() => {
        const markdown = $convertToMarkdownString(TRANSFORMERS);
        onContentChange(markdown);
      });
    },
    [onContentChange],
  );

  return <OnChangePlugin onChange={handleChange} ignoreSelectionChange />;
};

export type RichTextEditorProps = {
  content: string;
  onContentChange: (markdown: string) => void;
  placeholder?: string;
  projectId?: string;
  className?: string;
  /** Callback triggered when user clicks insert image button */
  onInsertImage?: () => void;
  /** AI-related props */
  subscription?: ProjectSubscription;
  language?: string;
};

export const RichTextEditor = ({
  content,
  onContentChange,
  placeholder = "Start writing your article...",
  projectId,
  className,
  onInsertImage,
  subscription,
  language,
}: RichTextEditorProps) => {
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  const [markdownContent, setMarkdownContent] = useState(content);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Handle floating anchor ref
  const onRef = useCallback((floatingAnchorElem: HTMLDivElement | null) => {
    if (floatingAnchorElem !== null) {
      setFloatingAnchorElem(floatingAnchorElem);
    }
  }, []);

  // Sync content prop to markdown state
  useEffect(() => {
    setMarkdownContent(content);
  }, [content]);

  // Toggle between markdown and WYSIWYG
  const handleToggleMarkdownMode = useCallback(() => {
    setIsMarkdownMode((prev) => !prev);
  }, []);

  // Handle markdown textarea change
  const handleMarkdownChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setMarkdownContent(newContent);
      onContentChange(newContent);
    },
    [onContentChange],
  );

  // Handle WYSIWYG content change
  const handleWysiwygChange = useCallback(
    (markdown: string) => {
      setMarkdownContent(markdown);
      onContentChange(markdown);
    },
    [onContentChange],
  );

  // Handle link insertion for slash commands (opens dialog when no text selected)
  const handleInsertLink = useCallback(() => {
    setIsLinkDialogOpen(true);
  }, []);

  const initialConfig = {
    namespace: "ArticleEditor",
    theme: editorTheme,
    onError: (error: Error) => {
      console.error("Lexical editor error:", error);
    },
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      AutoLinkNode,
      CodeNode,
      CodeHighlightNode,
      HorizontalRuleNode,
      ImageNode,
    ],
  };

  // Markdown mode
  if (isMarkdownMode) {
    return (
      <Card
        ref={editorContainerRef}
        className={cn("flex flex-col overflow-hidden p-0", className)}
      >
        <CardContent className="p-0">
          <EditorToolbar
            onInsertImage={onInsertImage}
            setIsLinkEditMode={setIsLinkEditMode}
            isMarkdownMode={isMarkdownMode}
          />

          <Textarea
            value={markdownContent}
            onChange={handleMarkdownChange}
            placeholder={placeholder}
            className="min-h-[450px] flex-1 resize-none rounded-none border-0 border-t px-4 py-3 font-mono text-sm focus-visible:ring-0"
          />

          <EditorFooter
            content={markdownContent}
            isMarkdownMode={isMarkdownMode}
            onToggleMarkdownMode={handleToggleMarkdownMode}
          />
        </CardContent>
      </Card>
    );
  }

  // WYSIWYG mode
  return (
    <Card
      ref={editorContainerRef}
      className={cn("flex flex-col overflow-hidden p-0", className)}
    >
      <CardContent className="p-0">
        <LexicalComposer initialConfig={initialConfig}>
          <ImagePlugin projectId={projectId}>
            <EditorToolbar
              onInsertImage={onInsertImage}
              onInsertLink={handleInsertLink}
              setIsLinkEditMode={setIsLinkEditMode}
              isMarkdownMode={isMarkdownMode}
            />

            <div className="relative flex-1">
              <RichTextPlugin
                contentEditable={
                  <div className="relative" ref={onRef}>
                    <ContentEditable placeholder={placeholder} />
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />

              {/* Core plugins */}
              <HistoryPlugin />
              <ListPlugin />
              <LinkPlugin />
              <CheckListPlugin />
              <HorizontalRulePlugin />
              <TabIndentationPlugin />
              <MarkdownShortcutPlugin transformers={TRANSFORMERS} />

              {/* Custom plugins */}
              <ContentSyncPlugin content={content} />
              <MarkdownSyncPlugin onContentChange={handleWysiwygChange} />

              <ComponentPickerMenuPlugin
                onInsertImage={onInsertImage}
                onInsertLink={handleInsertLink}
              />

              <EmojiPickerPlugin />

              {/* Floating toolbars */}
              <FloatingTextFormatToolbarPlugin
                anchorElem={floatingAnchorElem}
                setIsLinkEditMode={setIsLinkEditMode}
                projectId={projectId}
                subscription={subscription}
                language={language}
              />

              <FloatingLinkEditorPlugin
                anchorElem={floatingAnchorElem}
                isLinkEditMode={isLinkEditMode}
                setIsLinkEditMode={setIsLinkEditMode}
              />

              {/* Link insertion dialog (for inserting links without selection) */}
              <LinkInsertDialog
                open={isLinkDialogOpen}
                onOpenChange={setIsLinkDialogOpen}
              />
            </div>

            <EditorFooterWrapper
              content={markdownContent}
              isMarkdownMode={isMarkdownMode}
              onToggleMarkdownMode={handleToggleMarkdownMode}
            />
          </ImagePlugin>
        </LexicalComposer>
      </CardContent>
    </Card>
  );
};

// Wrapper to access editor context for footer
const EditorFooterWrapper = ({
  content,
  isMarkdownMode,
  onToggleMarkdownMode,
}: {
  content: string;
  isMarkdownMode: boolean;
  onToggleMarkdownMode: () => void;
}) => {
  return (
    <EditorFooter
      content={content}
      isMarkdownMode={isMarkdownMode}
      onToggleMarkdownMode={onToggleMarkdownMode}
    />
  );
};
