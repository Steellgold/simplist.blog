import { simplistClient } from "@/lib/blog/simplist-client";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ArticlePageProps } from "@/lib/types/blog";
import { getBestMatchingVariant } from "@simplist.blog/sdk";
import { ArticlePageClient } from "./page-client";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const { data: article } = await simplistClient.articles.get(slug);

    if (!article) return {};

    const variant = getBestMatchingVariant(article, "en");
    const lang = "lang" in variant ? variant.lang : "en";

    return {
      title: variant.title,
      description: variant.excerpt || undefined,
      openGraph: {
        title: variant.title,
        description: variant.excerpt || undefined,
        images: variant.coverImage ? [variant.coverImage] : [],
        type: "article",
        publishedTime: article.publishedAt || article.createdAt,
        authors: [article.author.name],
        tags: article.tags.map((t) => t.name),
        locale: lang,
      },
      twitter: {
        card: "summary_large_image",
        title: variant.title,
        description: variant.excerpt || undefined,
        images: variant.coverImage ? [variant.coverImage] : [],
      },
    };
  } catch {
    return {};
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  try {
    const { data: article } = await simplistClient.articles.get(slug);

    if (!article || !article.published) notFound();

    return <ArticlePageClient article={article} slug={slug} />;
  } catch (error) {
    console.error("Error fetching article:", error);
    notFound();
  }
}
