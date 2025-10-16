"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createArticle, updateArticleCoverImage } from "@/lib/actions/articles";
import {
  Bold,
  Code, FileCode2,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Trash2,
  Upload
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "./ui/spinner";

type ArticleStatus = "draft" | "published";

export function CreateArticleForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<ArticleStatus>("draft");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Calculate content statistics
  const contentStats = {
    characters: content.length,
    words: content.trim() ? content.trim().split(/\s+/).length : 0,
    lines: content.split('\n').length,
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    // Reset file input
    const input = document.getElementById("image-upload") as HTMLInputElement;
    if (input) input.value = "";
  };

  // Insert markdown at cursor position
  const insertMarkdown = (before: string, after: string = "") => {
    // Target specifically the content textarea by ID
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
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

    setContent(newText);

    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  // Markdown toolbar actions (grouped)
  const markdownActions = {
    formatting: [
      {
        icon: Bold,
        label: "Bold",
        action: () => insertMarkdown("**", "**"),
      },
      {
        icon: Italic,
        label: "Italic",
        action: () => insertMarkdown("*", "*"),
      },
    ],
    lists: [
      {
        icon: List,
        label: "List",
        action: () => insertMarkdown("- ", ""),
      },
      {
        icon: ListOrdered,
        label: "Numbered List",
        action: () => insertMarkdown("1. ", ""),
      },
    ],
    blocks: [
      {
        icon: Quote,
        label: "Quote",
        action: () => insertMarkdown("> ", ""),
      },
      {
        icon: Code,
        label: "Code",
        action: () => insertMarkdown("`", "`"),
      },
      {
        icon: FileCode2,
        label: "Code Block",
        action: () => insertMarkdown("\n```\n", "\n```\n"),
      }
    ],
    media: [
      {
        icon: LinkIcon,
        label: "Link",
        action: () => insertMarkdown("[", "](url)"),
      },
      {
        icon: ImageIcon,
        label: "Image",
        action: () => insertMarkdown("![alt](", ")"),
      }
    ],
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create article first
      const article = await createArticle({
        title,
        excerpt,
        content,
        status,
        coverImage: undefined,
      });

      // If an image is selected, upload via server API (avoid CORS) then set cover
      if (imageFile && article) {
        const form = new FormData()
        form.append("file", imageFile)
        form.append("projectId", article.projectId)
        form.append("postId", article.id)

        const res = await fetch("/api/uploads/banner", {
          method: "POST",
          body: form,
        })

        if (!res.ok) {
          throw new Error("Failed to upload image to storage")
        }

        const data = await res.json()

        await updateArticleCoverImage({
          articleId: article.id,
          objectKey: data.key,
        })
      }

      // Redirect to articles page
      router.push("/articles");
      router.refresh();
    } catch (error) {
      console.error("Error creating article:", error);
      alert("Failed to create article. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Post Information */}
          <Card>
            <CardHeader>
              <CardTitle>Post</CardTitle>
              <CardDescription>
                This is the main information of the post.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="How to use GitHub: The basics"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <p className="text-sm text-muted-foreground">
                  A brief description of the post.
                </p>
                <Textarea
                  id="excerpt"
                  placeholder="This article guides you through using GitHub, the essential tool for developers."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <InputGroup>
                  {/* Markdown Toolbar */}
                  <InputGroupAddon align="block-start" className="w-full">
                    <ButtonGroup>
                      {/* Action Groups */}
                      {Object.entries(markdownActions).map(([groupName, actions]) => (
                        <ButtonGroup key={groupName}>
                          {/* Add Heading Dropdown before media group */}
                          {groupName === "media" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
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
                                    onClick={() => insertMarkdown("#".repeat(level) + " ", "")}
                                    className="cursor-pointer"
                                  >
                                    <span className="font-semibold">H{level}</span>
                                    <span className="ml-2 text-muted-foreground text-xs">
                                      Heading {level}
                                    </span>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}

                          {/* Regular action buttons */}
                          {actions.map((action, index) => (
                            <Button
                              key={index}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={action.action}
                              title={action.label}
                              className="h-8 px-2"
                            >
                              <action.icon className="h-4 w-4" />
                            </Button>
                          ))}
                        </ButtonGroup>
                      ))}
                    </ButtonGroup>
                  </InputGroupAddon>

                  {/* Textarea */}
                  <InputGroupTextarea
                    id="content"
                    placeholder="Write your new article here... tell your idea, your story, or share an interesting piece of information."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={20}
                    className="font-mono text-sm resize-y min-h-[400px] resize-none"
                  />

                  {/* Content Statistics */}
                  <InputGroupAddon align="block-end" className="w-full">
                    <div className="flex items-center justify-between w-full text-xs">
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">
                          {contentStats.words} {contentStats.words === 1 ? 'word' : 'words'}
                        </span>
                        <span className="text-muted-foreground">
                          {contentStats.characters} {contentStats.characters === 1 ? 'character' : 'characters'}
                        </span>
                        <span className="text-muted-foreground">
                          {contentStats.lines} {contentStats.lines === 1 ? 'line' : 'lines'}
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
        </div>

        {/* Right Column - Sidebar (1/3 width on desktop) */}
        <div className="lg:col-span-1 space-y-4">
          {/* Visibility */}
          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
              <CardDescription>
                Do you want to publish or draft this post?
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as ArticleStatus)}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link
                  href="/articles"
                  className={buttonVariants({
                    variant: "outlineDestructive",
                    size: "sm",
                  })}
                >
                  <Trash2 />
                  Delete
                </Link>

                <Button type="submit" disabled={isSubmitting} size="sm">
                  {isSubmitting ? <Spinner /> : "Publish"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Post Banner */}
          <Card>
            <CardHeader>
              <CardTitle>Post Banner</CardTitle>
              <CardDescription>
                On the response API it will return the URL of the image.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!imagePreview ? (
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center py-6">
                      <Upload className="w-4.5 h-4.5 mb-2 text-muted-foreground" />
                      <p className="mb-1 text-sm text-muted-foreground text-center px-2">
                        <span className="font-semibold">Upload Image</span>
                      </p>
                    </div>

                    <input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                    <Image
                      src={imagePreview}
                      alt="Post banner preview"
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outlineDestructive"
                      size="sm"
                      className="flex-1"
                      onClick={handleRemoveImage}
                    >
                      <Trash2 />
                      Remove Image
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        document.getElementById("image-upload")?.click()
                      }
                    >
                      <Upload />
                      Upload Image
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
