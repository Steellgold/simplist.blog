import type { Article, Tag } from "@simplist.blog/sdk";

export type { Article, Tag };

export type BlogPageProps = {
  searchParams: Promise<{
    page?: string;
    tag?: string;
    q?: string;
  }>;
};

export type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};
