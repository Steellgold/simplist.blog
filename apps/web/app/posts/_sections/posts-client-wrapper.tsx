"use client";

import { useState } from "react";
import { PostsFiltersSection } from "./posts-filters-section";
import { PostsListSection } from "./posts-list-section";

type Tag = {
  id: string;
  name: string;
  articleCount: number;
  color: string;
  icon: string;
};

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  tags: any[];
  createdAt: string | Date;
};

type PostsClientWrapperProps = {
  tags: Tag[];
  articles: Article[];
};

export const PostsClientWrapper = ({
  tags,
  articles,
}: PostsClientWrapperProps) => {
  const [selectedTag, setSelectedTag] = useState("");

  return (
    <>
      {tags && tags.length > 0 && (
        <PostsFiltersSection
          tags={tags}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
        />
      )}

      <PostsListSection articles={articles} selectedTag={selectedTag} />
    </>
  );
};
