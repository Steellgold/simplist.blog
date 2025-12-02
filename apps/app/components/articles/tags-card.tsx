"use client";

import { type Tag } from "@simplist/db";
import { ArticleTagsInput } from "@simplist/ui/components/article-tags-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@simplist/ui/components/card";
import { FC } from "react";

type ArticleTagsCardProps = {
  tags: Tag[];
  availableTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  onCreateTag: (name: string) => Promise<Tag | null>;
};

export const ArticleTagsCard: FC<ArticleTagsCardProps> = ({
  tags,
  availableTags,
  onTagsChange,
  onCreateTag
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tags</CardTitle>
        <CardDescription>
          Add tags to help organize and categorize your content.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ArticleTagsInput
          value={tags}
          onChange={onTagsChange}
          availableTags={availableTags}
          placeholder="Add tag..."
          onCreateTag={onCreateTag}
        />
      </CardContent>
    </Card>
  );
};
