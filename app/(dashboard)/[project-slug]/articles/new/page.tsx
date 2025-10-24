"use client"

import { CreateArticleForm } from "@/components/articles/create-form";
import { PageHeader } from "@/components/layout/page-header";
import { useProject } from "@/hooks/use-project-context";

const NewArticlePage = () => {
  const { currentProject } = useProject();

  if (!currentProject) {
    return (
      <div className="container max-w-7xl mx-auto">
        <PageHeader
          title="Create a new article"
          description="No project selected. Please select a project first."
        />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto">
      <PageHeader
        title="Create a new article"
        description={`Write and publish a new article for your ${currentProject.name} blog`}
      >
        <CreateArticleForm projectId={currentProject.id} />
      </PageHeader>
    </div>
  );
}

export default NewArticlePage;
