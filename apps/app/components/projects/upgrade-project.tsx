"use client";

import { Button } from "@simplist/ui/components/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@simplist/ui/components/empty";
import { ArrowRightIcon, FolderIcon } from "lucide-react";

export const UpgradeProject = () => {
  return (
    <div className="flex min-h-[calc(90vh-4rem)] items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderIcon />
          </EmptyMedia>
          <EmptyTitle>Upgrade Your Project</EmptyTitle>
          <EmptyDescription>
            Upgrade your project to the Pro plan to unlock all features and continue using the app.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button size="sm">Upgrade Plan</Button>
          </div>
        </EmptyContent>

        <Button
          variant="link"
          asChild
          className="text-muted-foreground"
          size="sm"
        >
          <a href="#">
            Learn More <ArrowRightIcon />
          </a>
        </Button>
      </Empty>
    </div>
  )
}