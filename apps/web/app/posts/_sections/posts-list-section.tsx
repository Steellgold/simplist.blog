"use client";

import { ArticleCard } from "@/components/blog/article-card";
import { detectUserLanguage, getBestMatchingVariant } from "@simplist.blog/sdk";
import { useMemo } from "react";

type Tag = {
  name: string;
  color?: string | null;
  icon?: string | null;
};

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  tags: Tag[];
  createdAt: string | Date;
};

type PostsListSectionProps = {
  articles: Article[];
  selectedTag?: string;
};

export const PostsListSection = ({
  articles,
  selectedTag = "",
}: PostsListSectionProps) => {
  // Detect user language once
  const userLang = useMemo(() => detectUserLanguage(), []);

  // Filter articles by selected tag (client-side)
  const filteredArticles = useMemo(() => {
    if (!selectedTag) return articles;
    return articles.filter((article) =>
      article.tags.some((tag) => tag.name === selectedTag),
    );
  }, [articles, selectedTag]);

  // Apply language detection to filtered articles
  const localizedArticles = useMemo(() => {
    return filteredArticles.map((article: any) => {
      const variant = getBestMatchingVariant(article, userLang);
      return {
        ...article,
        title: variant.title,
        excerpt: variant.excerpt,
        coverImage: variant.coverImage,
      };
    });
  }, [filteredArticles, userLang]);

  return (
    <section className="space-y-8 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Articles Grid - 2 columns on desktop */}
        {localizedArticles && localizedArticles.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {localizedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground py-12 text-center">
            No articles found for this tag.
          </p>
        )}
      </div>
    </section>
  );
};
