"use client";

import { useRouter } from "next/navigation";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Item, ItemContent, ItemTitle, ItemDescription, ItemActions, ItemGroup, ItemSeparator } from "@/components/ui/item";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import React from "react";

interface Article {
  id: string;
  title: string;
  status: string;
  updatedAt: Date;
  slug: string;
}

interface RecentArticlesCardProps {
  articles: Article[];
  projectSlug: string;
}

export const RecentArticlesCard = ({ articles, projectSlug }: RecentArticlesCardProps) => {
  const router = useRouter();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "published":
        return "default";
      case "draft":
        return "secondary";
      case "scheduled":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Articles</CardTitle>
        <CardDescription>
          View your recent articles and manage them.
        </CardDescription>

        <CardAction>
          <Link
            href={`/${projectSlug}/articles`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            All articles
            <ArrowUpRight />
          </Link>
        </CardAction>
      </CardHeader>

      <CardContent>
        {articles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No articles yet</p>
          </div>
        ) : (
          <ItemGroup>
            {articles.map((article, index) => (
              <React.Fragment key={article.id}>
                <Item variant="muted" size="sm" asChild>
                  <Link href={`/${projectSlug}/articles/${article.slug}/edit`}>
                    <ItemContent>
                      <ItemTitle>{article.title}</ItemTitle>
                      <ItemDescription>
                        Updated {formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true })}
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Badge variant={getStatusVariant(article.status)} className="capitalize">
                        {article.status}
                      </Badge>
                    </ItemActions>
                  </Link>
                </Item>
                {index < articles.length - 1 && <ItemSeparator />}
              </React.Fragment>
            ))}
          </ItemGroup>
        )}
      </CardContent>
    </Card>
  );
};
