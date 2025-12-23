"use client";

import { PageLayout } from "@/components/layout/page-layout";
import { TagCreateDialog } from "@/components/tags/tag-create-dialog";
import { useTagsColumns } from "@/components/tags/tags-columns";
import { TagsDataTable } from "@/components/tags/tags-data-table";
import type { TagWithMetadata } from "@/lib/actions/tags";
import { Button } from "@simplist/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@simplist/ui/components/empty";
import { Kbd } from "@simplist/ui/components/kbd";
import { Plus, Tag } from "lucide-react";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

type TagsClientPageProps = {
  tags: TagWithMetadata[];
  project: {
    id: string;
    name: string;
    slug: string;
    subscriptionTier: string;
    subscriptionExpiresAt: Date | null;
  };
  canManageTags: boolean;
};

export const TagsClientPage = ({
  tags,
  project,
  canManageTags,
}: TagsClientPageProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const columns = useTagsColumns({ canManageTags });

  // Keyboard shortcut: N to create new tag
  useHotkeys("n", () => setShowCreateDialog(true), {
    enabled: canManageTags,
    enableOnFormTags: false,
  });

  if (tags.length === 0) {
    return (
      <>
        <div className="flex min-h-[calc(90vh-4rem)] items-center justify-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Tag />
              </EmptyMedia>
              <EmptyTitle>No tags yet</EmptyTitle>
              <EmptyDescription>
                Create your first tag to organize and categorize your articles.
              </EmptyDescription>
            </EmptyHeader>
            {canManageTags && (
              <EmptyContent>
                <Button
                  variant="default"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus />
                  New tag
                  <Kbd>N</Kbd>
                </Button>
              </EmptyContent>
            )}
          </Empty>
        </div>

        <TagCreateDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          projectId={project.id}
        />
      </>
    );
  }

  return (
    <>
      <PageLayout
        title="Tags"
        description="Manage tags to organize and categorize your articles."
        actions={
          canManageTags && (
            <Button variant="default" onClick={() => setShowCreateDialog(true)}>
              <Plus />
              New tag
              <Kbd>N</Kbd>
            </Button>
          )
        }
      >
        <TagsDataTable
          columns={columns}
          data={tags}
          projectId={project.id}
          canManageTags={canManageTags}
          isPro={
            project.subscriptionTier === "PRO" &&
            project.subscriptionExpiresAt !== null &&
            new Date(project.subscriptionExpiresAt) > new Date()
          }
        />
      </PageLayout>

      <TagCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        projectId={project.id}
      />
    </>
  );
};
