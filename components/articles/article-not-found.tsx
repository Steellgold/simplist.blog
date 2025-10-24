"use client";

import { Button, buttonVariants } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ArrowRightIcon, File, PlusIcon } from "lucide-react"
import Link from "next/link";

type Props = {
  slug: string
}

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
          <div className="flex gap-2">
            <Link className={buttonVariants({ variant: "default" })} href={`/${slug}/articles/new`}>
              Create New Article
              <PlusIcon />
            </Link>
          </div>
        </EmptyContent>

        <Button
          variant="link"
          asChild
          className="text-muted-foreground"
          size="sm"
        >
          <a href="/">
            Learn More <ArrowRightIcon />
          </a>
        </Button>
      </Empty>
    </div>
  )
}