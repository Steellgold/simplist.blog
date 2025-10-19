import { CreateArticleForm } from "@/components/create-article-form";
import { getUserProjects } from "@/lib/actions/projects";
import { PageHeader } from "@/components/page-header";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Article",
  robots: { index: false, follow: false }
};

const NewArticlePage = async () => {
  const projects = await getUserProjects();
  const project = projects[0];

  if (!project) redirect("/create-project");

  return (
    <div className="container max-w-7xl mx-auto">
      <PageHeader
        title="Create a new article"
        description="Write and publish a new article for your blog"
      >
        <CreateArticleForm projectId={project.id} />
      </PageHeader>
    </div>
  );
}

export default NewArticlePage;
