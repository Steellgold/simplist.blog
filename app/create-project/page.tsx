import { AppSidebarWrapper } from "@/components/layout/sidebar-wrapper"
import { CreateProjectForm } from "@/components/projects/create-form"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"
import { getUserProjects } from "@/lib/actions/projects"
import { getCurrentUser } from "@/lib/auth-helper"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Create Project",
  robots: { index: false, follow: false },
}

const CreateProjectContent = async () => {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const projects = await getUserProjects()

  // Check if user has reached the project limit
  if (projects.length >= 2) {
    redirect("/dashboard")
  }

  return (
    <SidebarProvider>
      <AppSidebarWrapper user={user} projects={projects} />
      <div className="flex-1">
        {/* Backdrop blur */}
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" />
        
        {/* Dialog container */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <CreateProjectForm />
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

const CreateProjectPage = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
      <CreateProjectContent />
    </Suspense>
  )
}

export default CreateProjectPage
