"use client";

import { CreateApiKeyForm } from "@/components/api-keys/create-form";
import { ApiKeysList } from "@/components/api-keys/list";
import { PageLayout } from "@/components/layout/page-layout";
import { Key } from "@gravity-ui/icons";
import type { ApiKey } from "@simplist/db/types";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@simplist/ui/components/empty";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

type ApiKeySelect = Pick<
  ApiKey,
  | "id"
  | "name"
  | "key"
  | "permissions"
  | "lastUsedAt"
  | "expiresAt"
  | "status"
  | "createdAt"
>;

type ApiKeysClientPageProps = {
  apiKeys: ApiKeySelect[];
  project: {
    id: string;
    name: string;
    slug: string;
  };
};

export const ApiKeysClientPage = ({
  apiKeys,
  project,
}: ApiKeysClientPageProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Keyboard shortcut: N to create new API key
  useHotkeys("n", () => setDialogOpen(true), { enableOnFormTags: false });

  if (apiKeys.length === 0) {
    return (
      <div className="flex min-h-[calc(90vh-4rem)] items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Key />
            </EmptyMedia>
            <EmptyTitle>No API keys yet</EmptyTitle>
            <EmptyDescription>
              Create an API key to start authenticating requests.
            </EmptyDescription>
          </EmptyHeader>

          <EmptyContent>
            <CreateApiKeyForm
              projectId={project.id}
              open={dialogOpen}
              onOpenChange={setDialogOpen}
            />
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <PageLayout
      title="API Keys"
      description={`Manage API keys for your ${project.name} project`}
      actions={
        <CreateApiKeyForm
          projectId={project.id}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      }
    >
      <ApiKeysList apiKeys={apiKeys} />
    </PageLayout>
  );
};
