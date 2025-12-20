"use client";

import { Badge } from "@simplist/ui/components/badge";
import { buttonVariants } from "@simplist/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@simplist/ui/components/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "@simplist/ui/components/item";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export const RecentArticlesCard = ({
  articles,
  projectSlug,
}: RecentArticlesCardProps) => {
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
          <div className="text-muted-foreground py-8 text-center">
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
                        Updated{" "}
                        {formatDistanceToNow(new Date(article.updatedAt), {
                          addSuffix: true,
                        })}
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Badge
                        variant={getStatusVariant(article.status)}
                        className="capitalize"
                      >
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
