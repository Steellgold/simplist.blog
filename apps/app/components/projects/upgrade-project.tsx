"use client";

import { ArrowRight, Folder } from "@gravity-ui/icons";
import { Button } from "@simplist/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@simplist/ui/components/empty";

export const UpgradeProject = () => {
  return (
    <div className="flex min-h-[calc(90vh-4rem)] items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Folder />
          </EmptyMedia>
          <EmptyTitle>Upgrade Your Project</EmptyTitle>
          <EmptyDescription>
            Upgrade your project to the Pro plan to unlock all features and
            continue using the app.
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
            Learn More <ArrowRight />
          </a>
        </Button>
      </Empty>
    </div>
  );
};
