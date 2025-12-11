"use client";

import { type Tag } from "@simplist/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@simplist/ui/components/card";
import { FC } from "react";
import { ArticleTagsInput } from "./article-tags-input";

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
