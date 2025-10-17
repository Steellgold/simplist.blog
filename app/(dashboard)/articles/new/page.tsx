import { CreateArticleForm } from "@/components/create-article-form";
import { getUserProjects } from "@/lib/actions/projects";
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
    <div className="container max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Create a new article
        </h1>
        <p className="text-muted-foreground mt-2">
          Write and publish a new article for your blog
        </p>
      </div>

      <CreateArticleForm projectId={project.id} />
    </div>
  );
}

export default NewArticlePage;
