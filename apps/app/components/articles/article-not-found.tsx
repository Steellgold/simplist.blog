"use client";

import { File, Plus } from "@gravity-ui/icons";
import { buttonVariants } from "@simplist/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@simplist/ui/components/empty";
import Link from "next/link";

type Props = {
  slug: string;
};

export const ArticleNotFound = ({ slug }: Props) => {
  return (
    <div className="flex min-h-[calc(90vh-4rem)] items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <File />
          </EmptyMedia>
          <EmptyTitle>Article Not Found</EmptyTitle>
          <EmptyDescription>
            The article you are looking for does not exist.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link
            className={buttonVariants({ variant: "default" })}
            href={`/${slug}/articles`}
          >
            Back to Articles
            <Plus />
          </Link>
        </EmptyContent>
      </Empty>
    </div>
  );
};
