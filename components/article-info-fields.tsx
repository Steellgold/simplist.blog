"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
        <CardDescription>
          {cardDescription}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="How to use GitHub: The basics"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <p className="text-sm text-muted-foreground">
            A brief description of the post.
          </p>
          <Textarea
            id="excerpt"
            placeholder="This article guides you through using GitHub, the essential tool for developers."
            value={excerpt}
            onChange={(e) => onExcerptChange(e.target.value)}
            rows={3}
            required
          />
        </div>
      </CardContent>
    </Card>
  );
}


