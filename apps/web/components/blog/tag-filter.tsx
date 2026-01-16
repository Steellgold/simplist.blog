"use client";

import { Button } from "@simplist/ui/components/button";

type Tag = {
  id: string;
  name: string;
  articleCount: number;
  color?: string;
  icon?: string;
};

type TagFilterProps = {
  tags: Tag[];
  selectedTag: string;
  onTagChange: (tag: string) => void;
};

export const TagFilter = ({
  tags,
  selectedTag,
  onTagChange,
}: TagFilterProps) => {
  const tagsWithArticles = tags.filter((tag) => tag.articleCount > 0);

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedTag === "" ? "default" : "outline"}
        size="sm"
        onClick={() => onTagChange("")}
        className="rounded-full"
      >
        All
      </Button>

      {tagsWithArticles.map((tag) => (
        <Button
          key={tag.id}
          variant={selectedTag === tag.name ? "default" : "outline"}
          size="sm"
          onClick={() => onTagChange(tag.name)}
          className="rounded-full"
        >
          {tag.name}
        </Button>
      ))}
    </div>
  );
};
