import { TagBadge } from "@/components/blog/tag-badge";
import { Clock, Minus } from "@gravity-ui/icons";
import { Tag, Article } from "@simplist.blog/sdk";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@simplist/ui/components/avatar";
import { FC } from "react";

export const ArticleHeaderSection: FC<Article> = ({
  title,
  excerpt,
  author,
  publishedAt,
  createdAt,
  readTimeMinutes,
  tags,
}) => {
  return (
    <header className="px-4">
      <div className="mx-auto max-w-4xl space-y-2 py-8">
        <div className="mb-5.5">
          {tags.length > 0 && (
            <div className="mb-5.5 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <TagBadge key={tag.name} tag={tag} size="default" />
              ))}
            </div>
          )}

          <h1
            className="text-4xl leading-tight font-semibold tracking-tight text-balance md:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            {title}
          </h1>

          {excerpt && (
            <p className="text-muted-foreground md:text-1xl text-xl leading-relaxed text-pretty">
              {excerpt}
            </p>
          )}
        </div>

        <div className="border-border/50 bg-secondary/10 flex flex-wrap items-center gap-2.5 rounded-xl border px-4 py-3 text-sm backdrop-blur-sm">
          <div className="flex items-center gap-2">
            {author.image ? (
              <Avatar className="size-6 rounded-md">
                <AvatarImage
                  src={author.image}
                  alt={author.name}
                  width={22}
                  height={22}
                  className="rounded-md"
                />

                <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : (
              <Avatar>
                <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <span className="font-medium">{author.name}</span>
          </div>

          <Minus className="text-muted-foreground size-3.5 -rotate-45" />

          <div className="text-muted-foreground flex items-center gap-1.5">
            <Clock className="size-3.5" />

            <time dateTime={publishedAt || createdAt}>
              {new Date(publishedAt || createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </div>

          {readTimeMinutes > 0 && (
            <>
              <Minus className="text-muted-foreground size-3.5 -rotate-45" />

              <span className="text-muted-foreground">
                {readTimeMinutes} min read
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
