"use client";

import { SectionWrapper } from "@/components/layout/section-wrapper";
import { ArticleHeaderSection } from "../_sections/article-header-section";
import { ArticleContentSection } from "../_sections/article-content-section";
import { ArticleFooterSection } from "../_sections/article-footer-section";
import type { Article } from "@simplist.blog/sdk";
import { detectUserLanguage, getBestMatchingVariant } from "@simplist.blog/sdk";
import { FC, useMemo } from "react";
import Script from "next/script";

type ArticlePageClientProps = {
  article: Article;
  slug: string;
};

export const ArticlePageClient: FC<ArticlePageClientProps> = ({
  article,
  slug,
}) => {
  const variant = useMemo(
    () => getBestMatchingVariant(article, detectUserLanguage()),
    [article],
  );

  return (
    <>
      <Script
        src="https://cdn.simplist.blog/analytics.js"
        data-api-key={process.env.NEXT_PUBLIC_SIMPLIST_API_KEY}
        data-slug={slug}
        strategy="afterInteractive"
      />

      <article className="space-y-12 py-8" lang={variant.lang}>
        <SectionWrapper>
          <ArticleHeaderSection {...article} {...variant} />
        </SectionWrapper>

        <SectionWrapper>
          <ArticleContentSection {...variant} />
        </SectionWrapper>

        <SectionWrapper>
          <ArticleFooterSection {...article} />
        </SectionWrapper>
      </article>
    </>
  );
};
