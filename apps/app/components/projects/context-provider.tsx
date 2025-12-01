"use client"

import { ProjectMember } from "@simplist/db"
import type { Project } from "@simplist/db/types"
import { useRouter } from "next/navigation"
import { createContext, ReactNode, useContext, useState, useTransition } from "react"

interface ProjectContextType {
  currentProject: Project | null
  projects: Project[]
  currentMember: ProjectMember | null
  currentMemberId: string | null
  refreshProjects: () => void
  isRefreshing: boolean
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

interface ProjectContextProviderProps {
  children: ReactNode
  projects: Project[]
  currentProject: Project | null
  currentMember: ProjectMember | null
  currentMemberId: string | null
}

export const ProjectContextProvider = ({ children, projects: initialProjects, currentProject: initialCurrentProject, currentMember, currentMemberId }: ProjectContextProviderProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [projects, setProjects] = useState(initialProjects)
  const [currentProject, setCurrentProject] = useState(initialCurrentProject)

  const refreshProjects = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  if (initialProjects !== projects) {
    setProjects(initialProjects)
  }

  if (initialCurrentProject?.id !== currentProject?.id ||
      initialCurrentProject?.name !== currentProject?.name ||
      initialCurrentProject?.icon !== currentProject?.icon ||
      initialCurrentProject?.color !== currentProject?.color ||
      initialCurrentProject?.slug !== currentProject?.slug) {
    setCurrentProject(initialCurrentProject)
  }

  return (
    <ProjectContext.Provider value={{
      currentProject,
      projects,
      currentMember,
      currentMemberId,
      refreshProjects,
      isRefreshing: isPending
    }}>
      {children}
    </ProjectContext.Provider>
  )
}

export const useProjectContext = () => {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProjectContext must be used within a ProjectContextProvider")
  }
  return context
}
