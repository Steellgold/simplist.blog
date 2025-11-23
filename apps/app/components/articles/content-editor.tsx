"use client";

import { Button } from "@simplist/ui/components/button";
import { ButtonGroup } from "@simplist/ui/components/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "@simplist/ui/components/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@simplist/ui/components/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupTextarea } from "@simplist/ui/components/input-group";
import { Bold, Code, FileCode2, Heading2, Image as ImageIcon, Italic, Link as LinkIcon, List, ListOrdered, Quote } from "lucide-react";
import { useCallback, useMemo } from "react";

type ArticleContentEditorProps = {
  content: string;
  onContentChange: (value: string) => void;
  textareaId?: string;
  placeholder?: string;
};

export const ArticleContentEditor = ({ content, onContentChange, textareaId = "content", placeholder = "Write your article here... tell your idea, your story, or share an interesting piece of information." }: ArticleContentEditorProps) => {
  const insertMarkdown = useCallback((before: string, after: string = "") => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    onContentChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  }, [textareaId, onContentChange, content]);

  const markdownActions = useMemo(() => ({
    formatting: [
      { icon: Bold, label: "Bold", action: () => insertMarkdown("**", "**") },
      { icon: Italic, label: "Italic", action: () => insertMarkdown("*", "*") },
    ],
    lists: [
      { icon: List, label: "List", action: () => insertMarkdown("- ", "") },
      { icon: ListOrdered, label: "Numbered List", action: () => insertMarkdown("1. ", "") },
    ],
    blocks: [
      { icon: Quote, label: "Quote", action: () => insertMarkdown("> ", "") },
      { icon: Code, label: "Code", action: () => insertMarkdown("`", "`") },
      { icon: FileCode2, label: "Code Block", action: () => insertMarkdown("\n```\n", "\n```\n") },
    ],
    media: [
      { icon: LinkIcon, label: "Link", action: () => insertMarkdown("[", "](url)") },
      { icon: ImageIcon, label: "Image", action: () => insertMarkdown("![alt](", ")") },
    ],
  }), [insertMarkdown]);

  const contentStats = useMemo(() => ({
    characters: content.length,
    words: content.trim() ? content.trim().split(/\s+/).length : 0,
    lines: content.split("\n").length,
  }), [content]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <InputGroup className="min-w-0 overflow-hidden">
            <InputGroupAddon align="block-start" className="w-full">
              <ButtonGroup className="flex-wrap gap-2">
                {Object.entries(markdownActions).map(([groupName, actions]) => (
                  <ButtonGroup key={groupName}>
                    {groupName === "media" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" variant="outline" size="sm" className="h-8 px-2" title="Heading">
                            <Heading2 className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {[1, 2, 3, 4, 5, 6].map((level) => (
                            <DropdownMenuItem key={level} onClick={() => insertMarkdown("#".repeat(level) + " ", "")} className="cursor-pointer">
                              <span className="font-semibold">H{level}</span>
                              <span className="ml-2 text-muted-foreground text-xs">Heading {level}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    {actions.map((action, index) => (
                      <Button key={index} type="button" variant="outline" size="sm" onClick={action.action} title={action.label} className="h-8 px-2">
                        <action.icon className="h-4 w-4" />
                      </Button>
                    ))}

                  </ButtonGroup>
                ))}
              </ButtonGroup>
            </InputGroupAddon>

            <InputGroupTextarea
              id={textareaId}
              placeholder={placeholder}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              required
              rows={20}
              className="font-mono text-sm resize-y min-h-[400px] min-w-0"
            />

            <InputGroupAddon align="block-end" className="w-full">
              <div className="flex items-center justify-between w-full text-xs">
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">{contentStats.words} {contentStats.words === 1 ? "word" : "words"}</span>
                  <span className="text-muted-foreground">{contentStats.characters} {contentStats.characters === 1 ? "character" : "characters"}</span>
                  <span className="text-muted-foreground">{contentStats.lines} {contentStats.lines === 1 ? "line" : "lines"}</span>
                </div>
                <span className="text-muted-foreground/60">~{Math.ceil(contentStats.words / 200)} min read</span>
              </div>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </CardContent>
    </Card>
  );
}


