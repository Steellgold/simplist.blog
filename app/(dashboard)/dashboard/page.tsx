import { getUserProjects } from "@/lib/actions/projects";
import { getCurrentUser } from "@/lib/auth-helper";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const projects = await getUserProjects();

  // Redirect to create-project if no projects
  if (projects.length === 0) {
    redirect("/create-project");
  }

  // Redirect to first project's dashboard
  redirect(`/${projects[0].slug}`);
};

export default DashboardPage;
