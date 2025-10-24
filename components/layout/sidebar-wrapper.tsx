"use client"

import { useActiveProject } from "@/hooks/use-active-project"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AppSidebar } from "./sidebar"

interface User {
  id: string
  name: string
  email: string
  image?: string | null
}

interface Project {
  id: string
  name: string
  slug: string
}

interface AppSidebarWrapperProps {
  user: User
  projects: Project[]
  currentProject?: Project | null
}

export const AppSidebarWrapper = ({ user, projects, currentProject }: AppSidebarWrapperProps) => {
  const router = useRouter()
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  
  const { activeProject, setActiveProject, createProjectUrl } = useActiveProject({
    projects,
    currentProject
  })

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/login")
        },
      },
    })
  }

  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (project) {
      setActiveProject(project)
    }
  }

  const handleCreateProject = () => {
    setIsCreatingProject(true)
    router.push(createProjectUrl())
  }

  return (
    <AppSidebar
      user={user}
      projects={projects}
      activeProject={activeProject}
      onProjectChange={handleProjectChange}
      onCreateProject={handleCreateProject}
      onLogout={handleLogout}
      isCreatingProject={isCreatingProject}
    />
  )
}
