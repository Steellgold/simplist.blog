import { ArticleContent } from "@/components/blog/article-content";
import { Article, ArticleVariant } from "@simplist.blog/sdk";
import Image from "next/image";
import { FC } from "react";

export const ArticleContentSection: FC<Article | ArticleVariant> = ({
  content,
  coverImage,
  title,
}) => {
  return (
    <div className="space-y-12 px-4">
      <div className="mx-auto max-w-4xl">
        {coverImage && (
          <div className="relative h-96 w-full overflow-hidden rounded-2xl">
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className={coverImage ? "mt-12" : ""}>
          <ArticleContent content={content} />
        </div>
      </div>
    </div>
  );
};
