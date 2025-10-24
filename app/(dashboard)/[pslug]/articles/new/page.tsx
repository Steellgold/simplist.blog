"use client"

import { CreateArticleForm } from "@/components/articles/create-form";
import { PageLayout } from "@/components/layout/page-layout";
import { EmptyProject } from "@/components/projects/empty-project";
import { useProject } from "@/hooks/use-project-context";

const NewArticlePage = () => {
  const { currentProject } = useProject();
  if (!currentProject) return <EmptyProject />

  return (
    <div className="container max-w-7xl mx-auto">
      <PageLayout
        title="Create a new article"
        description={`Write and publish a new article for your ${currentProject.name} blog`}
      >
        <CreateArticleForm projectId={currentProject.id} />
      </PageLayout>
    </div>
  );
}

export default NewArticlePage;
