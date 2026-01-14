"use client";

import { TagFilter } from "@/components/blog/tag-filter";

type Tag = {
  id: string;
  name: string;
  articleCount: number;
  color: string;
  icon: string;
};

type PostsFiltersProps = {
  tags: Tag[];
  selectedTag: string;
  onTagChange: (tag: string) => void;
};

export const PostsFiltersSection = ({
  tags,
  selectedTag,
  onTagChange,
}: PostsFiltersProps) => {
  if (!tags || tags.length === 0) return null;

  return (
    <section className="px-4 py-4">
      <div className="mx-auto max-w-7xl">
        <TagFilter
          tags={tags}
          selectedTag={selectedTag}
          onTagChange={onTagChange}
        />
      </div>
    </section>
  );
};
