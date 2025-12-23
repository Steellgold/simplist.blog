"use client";

import { ArrowLeftIcon, SearchX } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@simplist/ui/components/empty";
import Link from "next/link";
import { buttonVariants } from "@simplist/ui/components/button";
import { useProject } from "@/hooks/use-project-context";

type Props = {
  actions?: React.ReactNode[];
};

export function NotFound({ actions }: Props) {
  const { currentProject } = useProject();

  return (
    <Empty className="flex h-full min-h-[calc(90vh-4rem)] items-center justify-center">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle>Page Not Found</EmptyTitle>
        <EmptyDescription>
          It seems you&apos;ve lost your compass...
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <Link
          href={`/${currentProject?.slug}`}
          className={buttonVariants({
            size: "sm",
          })}
        >
          <ArrowLeftIcon />
          Back to Project
        </Link>
      </EmptyContent>
    </Empty>
  );
}

export default NotFound;
