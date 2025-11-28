"use client"

import { ProjectMember } from "@simplist/db"
import type { Project } from "@simplist/db/types"
import { createContext, ReactNode, useContext } from "react"

interface ProjectContextType {
  currentProject: Project | null
  projects: Project[]
  currentMember: ProjectMember | null
  currentMemberId: string | null
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

interface ProjectContextProviderProps {
  children: ReactNode
  projects: Project[]
  currentProject: Project | null
  currentMember: ProjectMember | null
  currentMemberId: string | null
}

export const ProjectContextProvider = ({ children, projects, currentProject, currentMember, currentMemberId }: ProjectContextProviderProps) => {
  return (
    <ProjectContext.Provider value={{ currentProject, projects, currentMember, currentMemberId }}>
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
