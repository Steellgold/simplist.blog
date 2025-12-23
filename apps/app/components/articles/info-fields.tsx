"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@simplist/ui/components/card";
import { Input } from "@simplist/ui/components/input";
import { Label } from "@simplist/ui/components/label";
import { Textarea } from "@simplist/ui/components/textarea";

type ArticleInfoFieldsProps = {
  title: string;
  excerpt: string;
  onTitleChange: (value: string) => void;
  onExcerptChange: (value: string) => void;
  cardDescription?: string;
};

export const ArticleInfoFields = ({
  title,
  excerpt,
  onTitleChange,
  onExcerptChange,
  cardDescription = "This is the main information of the post.",
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
          <Input
            id="title"
            placeholder="My Recent Project"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            required
          />
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
