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

export const EmptyProject = () => {
  return (
    <div className="flex min-h-[calc(90vh-4rem)] items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Folder />
          </EmptyMedia>
          <EmptyTitle>No Projects Yet</EmptyTitle>
          <EmptyDescription>
            You haven&apos;t created any projects yet. Get started by creating
            your first project.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button>Create Project</Button>
          </div>
        </EmptyContent>

        <Button variant="link" asChild className="text-muted-foreground">
          <a href="#">
            Learn More <ArrowRight />
          </a>
        </Button>
      </Empty>
    </div>
  );
};
