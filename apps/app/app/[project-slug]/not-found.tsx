"use client";

import type { ReactNode } from "react";
import { useProject } from "@/hooks/use-project-context";
import { ArrowLeft, EnvelopeOpenXmark } from "@gravity-ui/icons";
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
  actions?: ReactNode[];
};

export function NotFound({ actions }: Props) {
  const { currentProject } = useProject();

  return (
    <Empty className="flex h-full min-h-[calc(90vh-4rem)] items-center justify-center">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <EnvelopeOpenXmark />
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
          <ArrowLeft />
          Back to Project
        </Link>
      </EmptyContent>
    </Empty>
  );
}

export default NotFound;
