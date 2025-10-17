import { CreateProjectForm } from "@/components/create-project-form"
import { getUserProjects } from "@/lib/actions/projects"
import { getCurrentUser } from "@/lib/auth-helper"
import { redirect } from "next/navigation"

const CreateProjectPage = async () => {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const projects = await getUserProjects()

  // If user already has a project, redirect to dashboard
  if (projects.length > 0) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <CreateProjectForm />
      </div>
    </div>
  )
}

export default CreateProjectPage
