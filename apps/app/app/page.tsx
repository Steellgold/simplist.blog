import { getUserProjects } from "@/lib/actions/projects";
import { getCurrentUser } from "@/lib/auth-helper";
import { redirectIfPendingDeletion } from "@/lib/auth/deletion-guard";
import { redirect } from "next/navigation";

const RootPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  redirectIfPendingDeletion(user, "/");

  const projects = await getUserProjects();

  if (projects.length === 0) {
    redirect("/create-project");
  }

  redirect(`/${projects[0].slug}`);
};

export default RootPage;
