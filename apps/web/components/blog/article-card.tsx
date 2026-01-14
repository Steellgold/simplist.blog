import Link from "next/link";
import Image from "next/image";
import { FC } from "react";
import { Article } from "@simplist.blog/sdk";
import { cn } from "@simplist/ui/lib/utils";

type Props = {
  article: Article;
  className?: string;
};

export const ArticleCard: FC<Props> = ({ article, className }) => {
  return (
    <Link
      href={`/posts/${article.slug}`}
      className={cn(
        "group relative h-[550px] overflow-hidden rounded-2xl transition-transform duration-500",
        className,
      )}
    >
      <div className="absolute inset-0">
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="from-muted to-background h-full w-full bg-linear-to-br" />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/20 transition-opacity duration-500 group-hover:from-black/90 group-hover:via-black/50 dark:from-black/80 dark:via-black/40 dark:to-black/20" />
      </div>

      <div className="relative flex h-full flex-col justify-between p-8">
        <p></p>

        <div className="space-y-4">
          <h2 className="font-serif text-5xl leading-tight font-light tracking-tight text-white">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="line-clamp-2 text-lg text-white/80">
              {article.excerpt}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};
