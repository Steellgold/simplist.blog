"use client";

import { MediaCommand } from "@/components/media/media-command";
import {
  Bold,
  Code, Ellipsis,
  FolderArrowDown,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Italic,
  Link as LinkIcon,
  ListOl,
  ListUl,
  Picture,
  QuoteOpen as Quote
} from "@gravity-ui/icons";
import { Button } from "@simplist/ui/components/button";
import { ButtonGroup } from "@simplist/ui/components/button-group";
import { Card, CardContent } from "@simplist/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@simplist/ui/components/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@simplist/ui/components/input-group";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type ArticleContentEditorProps = {
  content: string;
  onContentChange: (value: string) => void;
  textareaId?: string;
  placeholder?: string;
  projectId?: string;
};

export const ArticleContentEditor = ({
  content,
  onContentChange,
  textareaId = "content",
  placeholder = "Write your article here... tell your idea, your story, or share an interesting piece of information.",
  projectId,
}: ArticleContentEditorProps) => {
  const [isMediaCommandOpen, setIsMediaCommandOpen] = useState(false);

  // Keyboard shortcut to open MediaCommand (Cmd+Shift+I or Ctrl+Shift+I)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "i") {
        e.preventDefault();
        if (projectId) {
          setIsMediaCommandOpen(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [projectId]);

  const insertMarkdown = useCallback(
    (before: string, after: string = "") => {
      const textarea = document.getElementById(
        textareaId,
      ) as HTMLTextAreaElement | null;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      const newText =
        content.substring(0, start) +
        before +
        selectedText +
        after +
        content.substring(end);
      onContentChange(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + before.length,
          start + before.length + selectedText.length,
        );
      }, 0);
    },
    [textareaId, onContentChange, content],
  );

  // Handler for inserting image from media picker
  const handleImageSelect = useCallback(
    (url: string) => {
      const textarea = document.getElementById(
        textareaId,
      ) as HTMLTextAreaElement | null;

      if (!textarea) return;

      // Get selected text to use as alt text
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);

      // Save scroll positions before insertion
      const textareaScrollTop = textarea.scrollTop;
      const textareaScrollLeft = textarea.scrollLeft;
      const pageScrollY = window.scrollY;
      const pageScrollX = window.scrollX;

      // Insert image with selected text as alt text
      const imageMarkdown = `![${selectedText}](${url})`;
      const newText =
        content.substring(0, start) + imageMarkdown + content.substring(end);
      onContentChange(newText);

      // Restore scroll positions and set cursor after the image
      setTimeout(() => {
        textarea.focus({ preventScroll: true });
        const newCursorPos = start + imageMarkdown.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.scrollTop = textareaScrollTop;
        textarea.scrollLeft = textareaScrollLeft;
        window.scrollTo(pageScrollX, pageScrollY);
      }, 0);

      toast.success("Image link inserted!");
    },
    [textareaId, content, onContentChange],
  );

  const markdownActions = useMemo(
    () => ({
      formatting: [
        { icon: Bold, label: "Bold", action: () => insertMarkdown("**", "**") },
        {
          icon: Italic,
          label: "Italic",
          action: () => insertMarkdown("*", "*"),
        },
      ],
      lists: [
        { icon: ListUl, label: "List", action: () => insertMarkdown("- ", "") },
        {
          icon: ListOl,
          label: "Numbered List",
          action: () => insertMarkdown("1. ", ""),
        },
      ],
      blocks: [
        { icon: Quote, label: "Quote", action: () => insertMarkdown("> ", "") },
        { icon: Code, label: "Code", action: () => insertMarkdown("`", "`") },
        {
          icon: Code,
          label: "Code Block",
          action: () => insertMarkdown("\n```\n", "\n```\n"),
        },
      ],
      media: [
        {
          icon: LinkIcon,
          label: "Link",
          action: () => insertMarkdown("[", "](url)"),
        },
        {
          icon: Picture,
          label: "Image",
          action: () => insertMarkdown("![alt](", ")"),
        },
      ],
    }),
    [insertMarkdown],
  );

  const contentStats = useMemo(
    () => ({
      characters: content.length,
      words: content.trim() ? content.trim().split(/\s+/).length : 0,
      lines: content.split("\n").length,
    }),
    [content],
  );

  // Actions principales pour mobile (les plus utilisées)
  const primaryActions = useMemo(
    () => [
      markdownActions.formatting[0], // Bold
      markdownActions.formatting[1], // Italic
      markdownActions.lists[0], // List
    ],
    [markdownActions],
  );

  // Actions secondaires regroupées dans le menu "More"
  const secondaryActions = useMemo(
    () => [
      ...markdownActions.lists.slice(1),
      ...markdownActions.blocks,
      ...markdownActions.media,
    ],
    [markdownActions],
  );

  return (
    <>
      <Card className="p-0.5">
        <CardContent className="p-1">
          <div className="space-y-2">
            <InputGroup className="min-w-0 overflow-hidden">
              <InputGroupAddon align="block-start" className="w-full">
                {/* Desktop: affiche tous les boutons */}
                <ButtonGroup className="hidden flex-wrap gap-2 sm:flex">
                  {Object.entries(markdownActions).map(
                    ([groupName, actions]) => (
                      <ButtonGroup key={groupName}>
                        {groupName === "media" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className="h-8 px-2"
                                title="Heading"
                              >
                                <Heading2 className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              {[1, 2, 3, 4, 5, 6].map((level) => (
                                <DropdownMenuItem
                                  key={level}
                                  onClick={() =>
                                    insertMarkdown("#".repeat(level) + " ", "")
                                  }
                                  className="cursor-pointer"
                                >
                                  <span className="font-semibold">
                                    H{level}
                                  </span>
                                  <span className="text-muted-foreground ml-2 text-xs">
                                    Heading {level}
                                  </span>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}

                        {actions.map((action, index) => (
                          <Button
                            key={index}
                            type="button"
                            variant="outline"
                            onClick={action.action}
                            title={action.label}
                            className="h-8 px-2"
                          >
                            <action.icon className="h-4 w-4" />
                          </Button>
                        ))}

                        {groupName === "media" && projectId && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsMediaCommandOpen(true)}
                            title="Insert from library"
                            className="h-8 px-2"
                          >
                            <FolderArrowDown className="h-4 w-4" />
                          </Button>
                        )}
                      </ButtonGroup>
                    ),
                  )}
                </ButtonGroup>

                <ButtonGroup className="flex sm:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 px-2"
                        title="Heading"
                      >
                        <Heading2 className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {[1, 2, 3, 4, 5, 6].map((level) => (
                        <DropdownMenuItem
                          key={level}
                          onClick={() =>
                            insertMarkdown("#".repeat(level) + " ", "")
                          }
                          className="cursor-pointer"
                        >
                          {
                            level === 1 ? <Heading1 className="h-4 w-4" /> :
                            level === 2 ? <Heading2 className="h-4 w-4" /> :
                            level === 3 ? <Heading3 className="h-4 w-4" /> :
                            level === 4 ? <Heading4 className="h-4 w-4" /> :
                            level === 5 ? <Heading5 className="h-4 w-4" /> :
                            <Heading6 className="h-4 w-4" />
                          }
                          <span className="text-muted-foreground ml-2 text-xs">
                            Heading {level}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {primaryActions.map((action, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      onClick={action.action}
                      title={action.label}
                    >
                      <action.icon />
                    </Button>
                  ))}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        title="More options"
                      >
                        <Ellipsis />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-48">
                      {secondaryActions.map((action, index) => (
                        <DropdownMenuItem
                          key={index}
                          onClick={action.action}
                          className="cursor-pointer"
                        >
                          <action.icon className="mr-2 h-4 w-4" />
                          <span>{action.label}</span>
                        </DropdownMenuItem>
                      ))}

                      {projectId && (
                        <DropdownMenuItem
                          onClick={() => setIsMediaCommandOpen(true)}
                          className="cursor-pointer"
                        >
                          <FolderArrowDown className="mr-2 h-4 w-4" />
                          <span>Insert from library</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ButtonGroup>
              </InputGroupAddon>

              <InputGroupTextarea
                id={textareaId}
                placeholder={placeholder}
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                required
                className="min-h-[450px] min-w-0 resize-none font-mono text-sm sm:min-h-[450px]"
              />

              <InputGroupAddon align="block-end" className="w-full">
                <div className="flex w-full flex-col items-start justify-between gap-1 text-xs sm:flex-row sm:items-center sm:gap-0">
                  <div className="*:bg-muted flex flex-wrap items-center">
                    <span className="text-muted-foreground rounded-l-sm border-t border-b border-l px-1.5 py-0.5">
                      {contentStats.words}{" "}
                      {contentStats.words === 1 ? "word" : "words"}
                    </span>

                    <span className="text-muted-foreground border px-1.5 py-0.5">
                      {contentStats.characters}{" "}
                      {contentStats.characters === 1
                        ? "character"
                        : "characters"}
                    </span>

                    <span className="text-muted-foreground rounded-r-sm border-t border-r border-b px-1.5 py-0.5">
                      {contentStats.lines}{" "}
                      {contentStats.lines === 1 ? "line" : "lines"}
                    </span>
                  </div>
                  <span className="text-muted-foreground/60">
                    ~{Math.ceil(contentStats.words / 200)} min read
                  </span>
                </div>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </CardContent>
      </Card>

      {/* Media Command - only render if projectId is provided */}
      {projectId && (
        <MediaCommand
          open={isMediaCommandOpen}
          onOpenChange={setIsMediaCommandOpen}
          projectId={projectId}
          onSelect={handleImageSelect}
        />
      )}
    </>
  );
};
