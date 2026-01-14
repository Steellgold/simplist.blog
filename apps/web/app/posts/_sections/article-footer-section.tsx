import { Article } from "@simplist.blog/sdk";
import Image from "next/image";
import { FC } from "react";

export const ArticleFooterSection: FC<Article> = ({ author, publishedAt, createdAt }) => {
  return (
    <footer className="px-4">
      <div className="mx-auto max-w-4xl border-t pt-8">
        <div className="flex items-center gap-4">
          {author?.image && (
            <Image
              src={author.image}
              alt={author.name}
              width={42}
              height={42}
              className="rounded-md"
            />
          )}

          <div>
            <p className="text-lg font-medium">{author.name}</p>
            <p className="text-muted-foreground text-sm">
              Published on{" "}
              {new Date(publishedAt || createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};