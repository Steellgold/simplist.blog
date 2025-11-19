import { getCurrentUser } from "@/lib/auth-helper";
import { redirect } from "next/navigation";
import { getUserProjects } from "@/lib/actions/projects";

const RootPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const projects = await getUserProjects();

  if (projects.length === 0) {
    redirect("/create-project");
  }

  redirect(`/${projects[0].slug}`);
}

export default RootPage;
