"use client";

import { Lock, LockOpen } from "@gravity-ui/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@simplist/ui/components/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupToggle,
} from "@simplist/ui/components/input-group";
import { Label } from "@simplist/ui/components/label";
import { Textarea } from "@simplist/ui/components/textarea";

type ArticleInfoFieldsProps = {
  title: string;
  excerpt: string;
  onTitleChange: (value: string) => void;
  onExcerptChange: (value: string) => void;
  cardDescription?: string;
  // Slug control props (optional - only for edit mode with non-draft slug)
  showSlugControl?: boolean;
  shouldRegenerateSlug?: boolean;
  onSlugRegenerateChange?: (value: boolean) => void;
  currentSlug?: string;
};

export const ArticleInfoFields = ({
  title,
  excerpt,
  onTitleChange,
  onExcerptChange,
  cardDescription = "This is the main information of the post.",
  showSlugControl = false,
  shouldRegenerateSlug = false,
  onSlugRegenerateChange,
  currentSlug,
}: ArticleInfoFieldsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Post</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>

          {showSlugControl ? (
            <InputGroup>
              <InputGroupInput
                id="title"
                placeholder="My Recent Project"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                required
              />
              <InputGroupAddon align="inline-end">
                <InputGroupToggle
                  type="button"
                  pressed={shouldRegenerateSlug}
                  onPressedChange={onSlugRegenerateChange}
                  size="xs"
                  variant="outline"
                  aria-label="Toggle slug regeneration"
                >
                  {shouldRegenerateSlug ? (
                    <>
                      <LockOpen />
                      <span>Regenerate slug</span>
                    </>
                  ) : (
                    <>
                      <Lock />
                      <span>Keep slug</span>
                    </>
                  )}
                </InputGroupToggle>
              </InputGroupAddon>
            </InputGroup>
          ) : (
            <InputGroup>
              <InputGroupInput
                id="title"
                placeholder="My Recent Project"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                required
              />
            </InputGroup>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <p className="text-muted-foreground text-sm">
            A brief description of the article.
          </p>

          <Textarea
            id="excerpt"
            placeholder="Since last week, I've been working on a new project..."
            value={excerpt}
            onChange={(e) => onExcerptChange(e.target.value)}
            rows={3}
            required
          />
        </div>
      </CardContent>
    </Card>
  );
};
